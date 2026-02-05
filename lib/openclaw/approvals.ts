import type { GatewaySettings } from "./core";
import { invokeTool } from "./core";
import type { ExecApprovalRequest } from "./types";

type ExecPendingDetails = {
  approvals: Array<{
    id: string;
    sessionKey: string;
    tool: string;
    args: Record<string, unknown>;
    requestedAt: string;
  }>;
};

export const getPendingApprovals = async (
  cfg?: GatewaySettings
): Promise<ExecApprovalRequest[]> => {
  try {
    const details = await invokeTool<ExecPendingDetails>(
      "exec_pending",
      {},
      cfg
    );
    return (details.approvals ?? []).map((a) => ({
      id: a.id,
      sessionKey: a.sessionKey,
      tool: a.tool,
      args: a.args ?? {},
      requestedAt: a.requestedAt ?? new Date().toISOString(),
    }));
  } catch {
    return [];
  }
};

export const resolveApproval = async (
  id: string,
  action: "allow-once" | "allow-always" | "deny",
  cfg?: GatewaySettings
): Promise<{ success: boolean }> => {
  try {
    await invokeTool("exec_resolve", { id, action }, cfg);
    return { success: true };
  } catch {
    return { success: false };
  }
};
