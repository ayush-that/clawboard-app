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
  source: string;
  path?: string;
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

export type CostDataPoint = {
  date: string;
  tokens: number;
  cost: number;
  model: string;
};

export type UsageBySession = {
  sessionKey: string;
  displayName: string;
  channel: string;
  totalTokens: number;
  contextTokens: number;
  updatedAt: number;
};

export type ModelBreakdown = {
  model: string;
  tokens: number;
  cost: number;
};

export type UsageSummary = {
  totalTokens: number;
  totalCost: number;
  modelBreakdown: ModelBreakdown[];
  dailyCosts: CostDataPoint[];
  sessions: UsageBySession[];
};

export type OpenClawConfig = {
  agent?: {
    defaults?: {
      model?: { primary?: string };
    };
  };
  gateway?: { auth?: { mode?: string } };
  channels?: Record<string, unknown>;
  raw: string;
  hash: string;
};

export type LogEntry = {
  timestamp: string;
  level: "info" | "warn" | "error" | "debug";
  source: string;
  content: string;
};

export type ExecApprovalRequest = {
  id: string;
  sessionKey: string;
  tool: string;
  args: Record<string, unknown>;
  requestedAt: string;
};

export type ChannelConfig = {
  name: string;
  type: string;
  enabled: boolean;
  settings: Record<string, unknown>;
};
