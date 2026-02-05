import type { GatewaySettings, SessionHistoryDetails } from "./core";
import { getPrimarySessionKey, invokeTool } from "./core";
import type { TaskData } from "./types";

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

export const getRecentTasks = async (
  _timeRange: string,
  cfg?: GatewaySettings
): Promise<TaskData[]> => {
  try {
    const sessionKey = await getPrimarySessionKey(cfg);
    const details = await invokeTool<SessionHistoryDetails>(
      "sessions_history",
      { sessionKey },
      cfg
    );
    return historyToTasks(details);
  } catch {
    return [];
  }
};
