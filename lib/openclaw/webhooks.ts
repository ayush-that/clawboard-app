import type { GatewaySettings } from "./core";
import { chatCompletions } from "./core";
import type { ErrorData, WebhookEventData } from "./types";

export const triggerWebhook = async (
  message: string,
  cfg?: GatewaySettings
): Promise<{ success: boolean; response: string }> => {
  try {
    return await chatCompletions(message, cfg);
  } catch {
    return { success: false, response: "Gateway unreachable" };
  }
};

// No dedicated error or webhook-event API on OpenClaw gateway.
export const getErrors = (_cfg?: GatewaySettings): Promise<ErrorData[]> =>
  Promise.resolve([]);

export const getWebhookEvents = (
  _cfg?: GatewaySettings
): Promise<WebhookEventData[]> => Promise.resolve([]);
