import type {
  GatewaySettings,
  SessionHistoryDetails,
  SessionsListDetails,
} from "./core";
import { invokeTool } from "./core";
import type { SessionInfo, SessionMessage } from "./types";

export const getSessionsList = async (
  cfg?: GatewaySettings
): Promise<SessionInfo[]> => {
  try {
    const details = await invokeTool<SessionsListDetails>(
      "sessions_list",
      {},
      cfg
    );
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
  sessionKey: string,
  cfg?: GatewaySettings
): Promise<SessionMessage[]> => {
  try {
    const details = await invokeTool<SessionHistoryDetails>(
      "sessions_history",
      { sessionKey },
      cfg
    );
    return details.messages;
  } catch {
    return [];
  }
};
