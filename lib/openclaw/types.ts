export type AgentStatusData = {
  uptime: string;
  model: string;
  tokensToday: number;
  costToday: number;
  activeChannels: string[];
  lastActivity: string;
  status: "online" | "offline" | "degraded";
};

export type TaskStatus = "success" | "failed" | "running";

export type TaskData = {
  name: string;
  status: TaskStatus;
  startedAt: string;
  duration: number;
  result?: string;
};

export type SkillData = {
  name: string;
  description: string;
  enabled: boolean;
  lastUsed?: string;
};

export type MemoryData = {
  key: string;
  summary: string;
  timestamp: string;
  relevance: number;
};

export type WebhookEventData = {
  source: string;
  payloadSummary: string;
  timestamp: string;
  actionTaken: string;
};

export type ErrorSeverity = "critical" | "warning" | "info";

export type ErrorData = {
  message: string;
  skill: string;
  timestamp: string;
  severity: ErrorSeverity;
  resolved: boolean;
};

export type CronJobData = {
  id: string;
  name: string;
  schedule: string;
  enabled: boolean;
  lastRun?: string;
  nextRun?: string;
  message?: string;
  skill: string;
};

export type SessionInfo = {
  key: string;
  channel: string;
  displayName: string;
  model: string;
  totalTokens: number;
  contextTokens: number;
  updatedAt: number;
  lastChannel: string;
};

export type SessionMessage = {
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
};

export type DebugInfo = {
  gatewayUrl: string;
  connected: boolean;
  statusText: string;
  sessionCount: number;
  timestamp: string;
};

export type CostDataPoint = {
  date: string;
  tokens: number;
  cost: number;
  model: string;
};
