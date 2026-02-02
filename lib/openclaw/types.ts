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
  name: string;
  schedule: string;
  enabled: boolean;
  lastRun?: string;
  nextRun?: string;
  skill: string;
};

export type CostDataPoint = {
  date: string;
  tokens: number;
  cost: number;
  model: string;
};
