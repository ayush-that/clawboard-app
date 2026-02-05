export type GatewaySettings = {
  gatewayUrl?: string;
  gatewayToken?: string;
};

export const resolveUrl = (cfg?: GatewaySettings) => cfg?.gatewayUrl || "";

export const resolveToken = (cfg?: GatewaySettings) => cfg?.gatewayToken || "";

// --- SSRF Protection ---

const PRIVATE_IPV4_RANGES = [
  { prefix: "10.", mask: null },
  { prefix: "127.", mask: null },
  { prefix: "0.", mask: null },
  { prefix: "169.254.", mask: null },
  { prefix: "192.168.", mask: null },
] as const;

const isPrivate172 = (ip: string): boolean => {
  const parts = ip.split(".");
  if (parts.at(0) !== "172") {
    return false;
  }
  const second = Number.parseInt(parts.at(1) ?? "", 10);
  return second >= 16 && second <= 31;
};

export const isPrivateUrl = (url: string): boolean => {
  let hostname: string;
  try {
    hostname = new URL(url).hostname;
  } catch {
    return true; // malformed URLs are blocked
  }

  // Block IPv6 loopback and private
  if (hostname === "::1" || hostname === "[::1]") {
    return true;
  }
  const bare = hostname.replace(/^\[|\]$/g, "");
  if (bare.startsWith("fd") || bare.startsWith("fc") || bare === "::1") {
    return true;
  }

  // Block 0.0.0.0
  if (hostname === "0.0.0.0") {
    return true;
  }

  // Block private IPv4 ranges
  for (const range of PRIVATE_IPV4_RANGES) {
    if (hostname.startsWith(range.prefix)) {
      return true;
    }
  }

  // 172.16.0.0/12
  if (isPrivate172(hostname)) {
    return true;
  }

  return false;
};

const assertNotPrivateUrl = (url: string): void => {
  if (isPrivateUrl(url)) {
    throw new Error("Gateway URL resolves to a private/internal address");
  }
};

// --- Gateway Transport ---

export const invokeTool = async <T>(
  tool: string,
  args: Record<string, unknown>,
  cfg?: GatewaySettings,
  sessionKey = "main"
): Promise<T> => {
  const url = resolveUrl(cfg);
  assertNotPrivateUrl(url);
  const token = resolveToken(cfg);

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${url}/tools/invoke`, {
    method: "POST",
    headers,
    body: JSON.stringify({ tool, args, sessionKey }),
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

export const chatCompletions = async (
  message: string,
  cfg?: GatewaySettings,
  sessionKey = "main"
): Promise<{ success: boolean; response: string }> => {
  const url = resolveUrl(cfg);
  assertNotPrivateUrl(url);
  const token = resolveToken(cfg);

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${url}/v1/chat/completions`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: `openclaw:${sessionKey}`,
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

// --- Internal: get primary session key from sessions_list ---

export type SessionsListDetails = {
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

let cachedSessionKey: string | undefined;

export const getPrimarySessionKey = async (
  cfg?: GatewaySettings
): Promise<string> => {
  if (cachedSessionKey) {
    return cachedSessionKey;
  }
  const details = await invokeTool<SessionsListDetails>(
    "sessions_list",
    {},
    cfg
  );
  if (details.sessions.length > 0) {
    cachedSessionKey = details.sessions.at(0)?.key;
  }
  return cachedSessionKey ?? "agent:main:main";
};

export type SessionHistoryDetails = {
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
