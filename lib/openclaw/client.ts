import type {
  ChannelConfig,
  CostDataPoint,
  CronJobData,
  ErrorData,
  ExecApprovalRequest,
  LogEntry,
  MemoryData,
  ModelBreakdown,
  OpenClawConfig,
  SessionInfo,
  SessionMessage,
  SkillData,
  TaskData,
  UsageSummary,
  WebhookEventData,
} from "./types";

const GATEWAY_URL =
  process.env.OPENCLAW_GATEWAY_URL ?? "http://localhost:18789";
const GATEWAY_TOKEN = process.env.OPENCLAW_GATEWAY_TOKEN ?? "";

// --- Gateway Transport ---

const invokeTool = async <T>(
  tool: string,
  args: Record<string, unknown>
): Promise<T> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (GATEWAY_TOKEN) {
    headers.Authorization = `Bearer ${GATEWAY_TOKEN}`;
  }

  const response = await fetch(`${GATEWAY_URL}/tools/invoke`, {
    method: "POST",
    headers,
    body: JSON.stringify({ tool, args, sessionKey: "main" }),
    signal: AbortSignal.timeout(8000),
  });

  if (!response.ok) {
    throw new Error(`Gateway returned ${response.status}`);
  }

  const data = (await response.json()) as {
    ok: boolean;
    result?: { details?: T };
  };
  if (!data.ok || !data.result?.details) {
    throw new Error("Gateway tool invocation failed or empty details");
  }
  return data.result.details;
};

const chatCompletions = async (
  message: string
): Promise<{ success: boolean; response: string }> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (GATEWAY_TOKEN) {
    headers.Authorization = `Bearer ${GATEWAY_TOKEN}`;
  }

  const response = await fetch(`${GATEWAY_URL}/v1/chat/completions`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: "openclaw:main",
      messages: [{ role: "user", content: message }],
      stream: false,
    }),
    signal: AbortSignal.timeout(30_000),
  });

  if (!response.ok) {
    throw new Error(`Gateway returned ${response.status}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.at(0)?.message?.content ?? "No response";

  return { success: true, response: content };
};

// --- Response Transformers ---

type SessionsListDetails = {
  count: number;
  sessions: Array<{
    key: string;
    channel: string;
    displayName: string;
    model: string;
    totalTokens: number;
    contextTokens: number;
    updatedAt: number;
    lastChannel: string;
  }>;
};

type SessionHistoryDetails = {
  sessionKey: string;
  messages: Array<{
    role: string;
    content: Array<{ type: string; text?: string; thinking?: string }>;
    model?: string;
    usage?: {
      input: number;
      output: number;
      totalTokens: number;
      cost?: { total?: number };
    };
    timestamp: number;
  }>;
};

const historyToTasks = (details: SessionHistoryDetails): TaskData[] =>
  details.messages
    .filter((m) => m.role === "assistant" && m.timestamp)
    .slice(-20)
    .map((m) => {
      const textPart = m.content?.find((c) => c.type === "text");
      const summary = textPart?.text?.slice(0, 120) ?? "Agent response";
      return {
        name: m.model ?? "agent-response",
        status: "success" as const,
        startedAt: new Date(m.timestamp).toISOString(),
        duration: (m.usage?.totalTokens ?? 0) * 2,
        result: summary,
      };
    })
    .reverse();

const historyToCosts = (details: SessionHistoryDetails): CostDataPoint[] => {
  const byDate = new Map<
    string,
    { tokens: number; cost: number; model: string }
  >();

  for (const m of details.messages) {
    if (!m.timestamp || !m.usage) {
      continue;
    }
    const date = new Date(m.timestamp).toISOString().split("T").at(0) ?? "";
    const existing = byDate.get(date) ?? { tokens: 0, cost: 0, model: "" };
    existing.tokens += m.usage.totalTokens ?? 0;
    existing.cost += m.usage.cost?.total ?? 0;
    existing.model = m.model ?? existing.model ?? "unknown";
    byDate.set(date, existing);
  }

  return [...byDate.entries()].map(([date, data]) => ({
    date,
    tokens: data.tokens,
    cost: Number.parseFloat(data.cost.toFixed(4)),
    model: data.model,
  }));
};

type MemorySearchDetails = {
  results: Array<{
    path?: string;
    text?: string;
    score?: number;
    metadata?: Record<string, unknown>;
  }>;
};

const memoryToView = (details: MemorySearchDetails): MemoryData[] =>
  details.results.map((r) => ({
    key: r.path ?? "memory",
    summary: r.text ?? "No content",
    timestamp: new Date().toISOString(),
    relevance: r.score ?? 0.5,
  }));

type CronDetails = {
  jobs: Array<{
    id?: string;
    name?: string;
    schedule?: string;
    enabled?: boolean;
    lastRun?: string;
    nextRun?: string;
    message?: string;
  }>;
};

const cronToJobs = (details: CronDetails): CronJobData[] =>
  details.jobs.map((j) => ({
    id: j.id ?? j.name ?? "unknown",
    name: j.name ?? j.id ?? "unnamed",
    schedule: j.schedule ?? "* * * * *",
    enabled: j.enabled ?? true,
    lastRun: j.lastRun,
    nextRun: j.nextRun,
    message: j.message,
    skill: "cron",
  }));

// --- Internal: get primary session key from sessions_list ---

let cachedSessionKey: string | undefined;

const getPrimarySessionKey = async (): Promise<string> => {
  if (cachedSessionKey) {
    return cachedSessionKey;
  }
  const details = await invokeTool<SessionsListDetails>("sessions_list", {});
  if (details.sessions.length > 0) {
    cachedSessionKey = details.sessions.at(0)?.key;
  }
  return cachedSessionKey ?? "agent:main:main";
};

// --- Public API ---
// Each function tries the real OpenClaw gateway via POST /tools/invoke.
// If unreachable, returns empty/error state — no mock data.

export const getRecentTasks = async (
  _timeRange: string
): Promise<TaskData[]> => {
  try {
    const sessionKey = await getPrimarySessionKey();
    const details = await invokeTool<SessionHistoryDetails>(
      "sessions_history",
      { sessionKey }
    );
    return historyToTasks(details);
  } catch {
    return [];
  }
};

// Skills are extracted from the config object
export const getInstalledSkills = async (): Promise<SkillData[]> => {
  try {
    const config = await getConfig();
    return extractSkillsFromConfig(config);
  } catch {
    return [];
  }
};

export const queryMemory = async (query: string): Promise<MemoryData[]> => {
  try {
    const details = await invokeTool<MemorySearchDetails>("memory_search", {
      query,
    });
    return memoryToView(details);
  } catch {
    return [];
  }
};

export const triggerWebhook = async (
  message: string
): Promise<{ success: boolean; response: string }> => {
  try {
    return await chatCompletions(message);
  } catch {
    return { success: false, response: "Gateway unreachable" };
  }
};

export const getCronJobs = async (): Promise<CronJobData[]> => {
  try {
    const details = await invokeTool<CronDetails>("cron", { action: "list" });
    return cronToJobs(details);
  } catch {
    return [];
  }
};

// No dedicated error or webhook-event API on OpenClaw gateway.
export const getErrors = (): Promise<ErrorData[]> => Promise.resolve([]);

export const getWebhookEvents = (): Promise<WebhookEventData[]> =>
  Promise.resolve([]);

export const getCostData = async (): Promise<CostDataPoint[]> => {
  try {
    const sessionKey = await getPrimarySessionKey();
    const details = await invokeTool<SessionHistoryDetails>(
      "sessions_history",
      { sessionKey }
    );
    return historyToCosts(details);
  } catch {
    return [];
  }
};

// --- Cron CRUD ---

export const addCronJob = async (data: {
  name: string;
  schedule: string;
  message?: string;
}): Promise<{ success: boolean }> => {
  await invokeTool("cron", { action: "add", ...data });
  return { success: true };
};

export const updateCronJob = async (
  id: string,
  patch: {
    name?: string;
    schedule?: string;
    message?: string;
    enabled?: boolean;
  }
): Promise<{ success: boolean }> => {
  await invokeTool("cron", { action: "update", id, ...patch });
  return { success: true };
};

export const removeCronJob = async (
  id: string
): Promise<{ success: boolean }> => {
  await invokeTool("cron", { action: "remove", id });
  return { success: true };
};

// --- Sessions ---

export const getSessionsList = async (): Promise<SessionInfo[]> => {
  try {
    const details = await invokeTool<SessionsListDetails>("sessions_list", {});
    return details.sessions.map((s) => ({
      key: s.key,
      channel: s.channel,
      displayName: s.displayName,
      model: s.model,
      totalTokens: s.totalTokens,
      contextTokens: s.contextTokens,
      updatedAt: s.updatedAt,
      lastChannel: s.lastChannel,
    }));
  } catch {
    return [];
  }
};

export const getSessionMessages = async (
  sessionKey: string
): Promise<SessionMessage[]> => {
  try {
    const details = await invokeTool<SessionHistoryDetails>(
      "sessions_history",
      { sessionKey }
    );
    return details.messages;
  } catch {
    return [];
  }
};

// --- Memory ---

export const addMemory = async (
  text: string
): Promise<{ success: boolean; response: string }> => {
  try {
    return await chatCompletions(`Remember this permanently: ${text}`);
  } catch {
    return { success: false, response: "Failed to add memory" };
  }
};

// --- Config ---

type ConfigGetResult = {
  config: Record<string, unknown>;
  hash: string;
};

export const getConfig = async (): Promise<OpenClawConfig> => {
  try {
    const result = await invokeTool<ConfigGetResult>("config_get", {
      action: "json",
    });
    const raw = JSON.stringify(result.config ?? {}, null, 2);
    const cfg = result.config ?? {};
    return {
      agent: cfg.agent as OpenClawConfig["agent"],
      gateway: cfg.gateway as OpenClawConfig["gateway"],
      channels: cfg.channels as OpenClawConfig["channels"],
      raw,
      hash: result.hash ?? "",
    };
  } catch {
    return { raw: "{}", hash: "" };
  }
};

export const patchConfig = async (
  patch: Record<string, unknown>,
  hash: string
): Promise<{ success: boolean }> => {
  await invokeTool("config_patch", { patch, hash });
  return { success: true };
};

const extractSkillsFromConfig = (config: OpenClawConfig): SkillData[] => {
  const skills: SkillData[] = [];
  try {
    const raw = JSON.parse(config.raw) as Record<string, unknown>;

    // Extract from skills section if present
    const skillsSection = raw.skills as Record<string, unknown> | undefined;
    if (skillsSection && typeof skillsSection === "object") {
      for (const [name, value] of Object.entries(skillsSection)) {
        const skill = value as Record<string, unknown>;
        skills.push({
          name,
          description: (skill.description as string) ?? "",
          enabled: (skill.enabled as boolean) ?? true,
          source: (skill.source as string) ?? "installed",
          path: skill.path as string | undefined,
        });
      }
    }

    // Extract from tools section as fallback
    const toolsSection = raw.tools as Record<string, unknown> | undefined;
    if (
      toolsSection &&
      typeof toolsSection === "object" &&
      skills.length === 0
    ) {
      for (const [name, value] of Object.entries(toolsSection)) {
        if (typeof value === "object" && value !== null) {
          skills.push({
            name,
            description: "",
            enabled: true,
            source: "config",
          });
        }
      }
    }
  } catch {
    // parse error — return empty
  }
  return skills;
};

// --- Usage ---

export const getUsageSummary = async (): Promise<UsageSummary> => {
  try {
    const [sessions, dailyCosts] = await Promise.all([
      getSessionsList(),
      getCostData(),
    ]);

    // Aggregate totals from sessions
    const totalTokens = sessions.reduce((sum, s) => sum + s.totalTokens, 0);
    const totalCost = dailyCosts.reduce((sum, d) => sum + d.cost, 0);

    // Build model breakdown from daily costs
    const modelMap = new Map<string, { tokens: number; cost: number }>();
    for (const d of dailyCosts) {
      const model = d.model || "unknown";
      const existing = modelMap.get(model) ?? { tokens: 0, cost: 0 };
      existing.tokens += d.tokens;
      existing.cost += d.cost;
      modelMap.set(model, existing);
    }
    const modelBreakdown: ModelBreakdown[] = [...modelMap.entries()].map(
      ([model, data]) => ({
        model,
        tokens: data.tokens,
        cost: Number.parseFloat(data.cost.toFixed(4)),
      })
    );

    // Map sessions to usage
    const sessionUsage = sessions.map((s) => ({
      sessionKey: s.key,
      displayName: s.displayName,
      channel: s.channel || s.lastChannel,
      totalTokens: s.totalTokens,
      contextTokens: s.contextTokens,
      updatedAt: s.updatedAt,
    }));

    return {
      totalTokens,
      totalCost: Number.parseFloat(totalCost.toFixed(4)),
      modelBreakdown,
      dailyCosts,
      sessions: sessionUsage,
    };
  } catch {
    return {
      totalTokens: 0,
      totalCost: 0,
      modelBreakdown: [],
      dailyCosts: [],
      sessions: [],
    };
  }
};

// --- Logs ---

export const getRecentLogs = async (): Promise<LogEntry[]> => {
  try {
    const sessionKey = await getPrimarySessionKey();
    const details = await invokeTool<SessionHistoryDetails>(
      "sessions_history",
      { sessionKey }
    );

    const logs: LogEntry[] = [];
    for (const m of details.messages) {
      if (!m.timestamp) {
        continue;
      }
      const textPart = m.content?.find((c) => c.type === "text");
      const thinkPart = m.content?.find((c) => c.type === "thinking");
      const toolPart = m.content?.find((c) => c.type === "tool_use");

      if (textPart?.text) {
        logs.push({
          timestamp: new Date(m.timestamp).toISOString(),
          level: m.role === "assistant" ? "info" : "debug",
          source: m.role === "assistant" ? (m.model ?? "agent") : "user",
          content: textPart.text.slice(0, 500),
        });
      }

      if (thinkPart?.thinking) {
        logs.push({
          timestamp: new Date(m.timestamp).toISOString(),
          level: "debug",
          source: "thinking",
          content: thinkPart.thinking.slice(0, 300),
        });
      }

      if (toolPart) {
        logs.push({
          timestamp: new Date(m.timestamp).toISOString(),
          level: "info",
          source: "tool",
          content: `Tool call: ${(toolPart as Record<string, unknown>).name ?? "unknown"}`,
        });
      }
    }

    return logs
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      .slice(0, 100);
  } catch {
    return [];
  }
};

// --- Exec Approvals ---

type ExecPendingDetails = {
  approvals: Array<{
    id: string;
    sessionKey: string;
    tool: string;
    args: Record<string, unknown>;
    requestedAt: string;
  }>;
};

export const getPendingApprovals = async (): Promise<ExecApprovalRequest[]> => {
  try {
    const details = await invokeTool<ExecPendingDetails>("exec_pending", {});
    return (details.approvals ?? []).map((a) => ({
      id: a.id,
      sessionKey: a.sessionKey,
      tool: a.tool,
      args: a.args ?? {},
      requestedAt: a.requestedAt ?? new Date().toISOString(),
    }));
  } catch {
    return [];
  }
};

export const resolveApproval = async (
  id: string,
  action: "allow-once" | "allow-always" | "deny"
): Promise<{ success: boolean }> => {
  try {
    await invokeTool("exec_resolve", { id, action });
    return { success: true };
  } catch {
    return { success: false };
  }
};

// --- Channels ---

export const getChannels = async (): Promise<ChannelConfig[]> => {
  try {
    const config = await getConfig();
    return extractChannelsFromConfig(config);
  } catch {
    return [];
  }
};

export const updateChannel = async (
  name: string,
  settings: Record<string, unknown>,
  hash: string
): Promise<{ success: boolean }> => {
  try {
    await patchConfig({ channels: { [name]: settings } }, hash);
    return { success: true };
  } catch {
    return { success: false };
  }
};

const extractChannelsFromConfig = (config: OpenClawConfig): ChannelConfig[] => {
  const channels: ChannelConfig[] = [];
  try {
    const raw = JSON.parse(config.raw) as Record<string, unknown>;
    const channelsSection = raw.channels as Record<string, unknown> | undefined;
    if (channelsSection && typeof channelsSection === "object") {
      for (const [name, value] of Object.entries(channelsSection)) {
        if (typeof value === "object" && value !== null) {
          const ch = value as Record<string, unknown>;
          channels.push({
            name,
            type: (ch.type as string) ?? name,
            enabled: (ch.enabled as boolean) ?? true,
            settings: ch,
          });
        } else {
          channels.push({
            name,
            type: name,
            enabled: true,
            settings: { value },
          });
        }
      }
    }
  } catch {
    // parse error
  }
  return channels;
};
