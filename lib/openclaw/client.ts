import type {
  AgentStatusData,
  CostDataPoint,
  CronJobData,
  DebugInfo,
  ErrorData,
  MemoryData,
  SessionInfo,
  SessionMessage,
  SkillData,
  TaskData,
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

type SessionStatusDetails = {
  ok: boolean;
  sessionKey: string;
  statusText: string;
};

const parseStatusText = (details: SessionStatusDetails): AgentStatusData => {
  const text = details.statusText ?? "";
  const modelMatch = text.match(/Model:\s*(.+)/i);
  const tokensMatch = text.match(/Tokens?.*?:\s*([\d,]+)/i);

  const channels: string[] = [];
  if (text.toLowerCase().includes("telegram")) {
    channels.push("telegram");
  }
  if (text.toLowerCase().includes("webhook")) {
    channels.push("webhook");
  }
  if (text.toLowerCase().includes("cron")) {
    channels.push("cron");
  }
  if (channels.length === 0) {
    channels.push("gateway");
  }

  return {
    uptime: extractFromStatus(text, /uptime|time.*?:\s*(.+)/i) ?? "unknown",
    model: modelMatch?.at(1)?.trim() ?? "unknown",
    tokensToday: Number.parseInt(
      (tokensMatch?.at(1) ?? "0").replace(/,/g, ""),
      10
    ),
    costToday: 0,
    activeChannels: channels,
    lastActivity: new Date().toISOString(),
    status: details.ok ? "online" : "degraded",
  };
};

const extractFromStatus = (
  text: string,
  pattern: RegExp
): string | undefined => {
  const match = text.match(pattern);
  return match?.at(1)?.trim();
};

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

export const getAgentStatus = async (): Promise<AgentStatusData> => {
  try {
    const details = await invokeTool<SessionStatusDetails>(
      "session_status",
      {}
    );
    return parseStatusText(details);
  } catch {
    return {
      uptime: "N/A",
      model: "unknown",
      tokensToday: 0,
      costToday: 0,
      activeChannels: [],
      lastActivity: new Date().toISOString(),
      status: "offline",
    };
  }
};

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

// skills_list does NOT exist on the OpenClaw HTTP API.
export const getInstalledSkills = (): Promise<SkillData[]> =>
  Promise.resolve([]);

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

// --- Debug ---

export const getDebugInfo = async (): Promise<DebugInfo> => {
  const gatewayUrl = GATEWAY_URL;
  try {
    const [statusDetails, sessionsDetails] = await Promise.all([
      invokeTool<SessionStatusDetails>("session_status", {}),
      invokeTool<SessionsListDetails>("sessions_list", {}),
    ]);
    return {
      gatewayUrl,
      connected: statusDetails.ok,
      statusText: statusDetails.statusText ?? "",
      sessionCount: sessionsDetails.count ?? sessionsDetails.sessions.length,
      timestamp: new Date().toISOString(),
    };
  } catch {
    return {
      gatewayUrl,
      connected: false,
      statusText: "Gateway unreachable",
      sessionCount: 0,
      timestamp: new Date().toISOString(),
    };
  }
};
