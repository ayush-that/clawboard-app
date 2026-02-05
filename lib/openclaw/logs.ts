import type { GatewaySettings, SessionHistoryDetails } from "./core";
import { getPrimarySessionKey, invokeTool } from "./core";
import type { LogEntry } from "./types";

export const getRecentLogs = async (
  cfg?: GatewaySettings
): Promise<LogEntry[]> => {
  try {
    const sessionKey = await getPrimarySessionKey(cfg);
    const details = await invokeTool<SessionHistoryDetails>(
      "sessions_history",
      { sessionKey },
      cfg
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
