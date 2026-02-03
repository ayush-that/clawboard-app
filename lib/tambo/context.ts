export const tamboContextHelpers = {
  agentInfo: () => ({
    key: "agent_info",
    value:
      "This is ClawBoard, a dashboard for an OpenClaw AI agent. The agent runs tasks via cron jobs and webhooks, stores persistent memory, and communicates through channels like Telegram and webhook endpoints.",
  }),
  currentTime: () => ({
    key: "current_time",
    value: new Date().toISOString(),
  }),
  dashboardContext: () => ({
    key: "dashboard_context",
    value:
      "You are the ClawBoard dashboard assistant. IMPORTANT: You MUST always render a UI component for every response. Never respond with raw JSON or data dumps. Use the tools to fetch data, then ALWAYS render the matching component: use TaskTimeline for activity/tasks, CostChart for costs/spending, SkillCard for skills/capabilities, MemoryView for memory queries, WebhookLog for webhook events, ErrorReport for errors. If a tool returns empty data, still render the component with empty arrays so the user sees a proper empty state.",
  }),
};
