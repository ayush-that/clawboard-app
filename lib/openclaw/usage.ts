import type { GatewaySettings, SessionHistoryDetails } from "./core";
import { getPrimarySessionKey, invokeTool } from "./core";
import { getSessionsList } from "./sessions";
import type { CostDataPoint, ModelBreakdown, UsageSummary } from "./types";

const historyToCosts = (details: SessionHistoryDetails): CostDataPoint[] => {
  const byDate = new Map<
    string,
    { tokens: number; cost: number; model: string }
  >();

  for (const m of details.messages) {
    if (!m.timestamp || !m.usage) {
      continue;
    }
    const date = new Date(m.timestamp).toISOString().split("T").at(0) ?? "";
    const existing = byDate.get(date) ?? { tokens: 0, cost: 0, model: "" };
    existing.tokens += m.usage.totalTokens ?? 0;
    existing.cost += m.usage.cost?.total ?? 0;
    existing.model = m.model ?? existing.model ?? "unknown";
    byDate.set(date, existing);
  }

  return [...byDate.entries()].map(([date, data]) => ({
    date,
    tokens: data.tokens,
    cost: Number.parseFloat(data.cost.toFixed(4)),
    model: data.model,
  }));
};

export const getCostData = async (
  cfg?: GatewaySettings
): Promise<CostDataPoint[]> => {
  try {
    const sessionKey = await getPrimarySessionKey(cfg);
    const details = await invokeTool<SessionHistoryDetails>(
      "sessions_history",
      { sessionKey },
      cfg
    );
    return historyToCosts(details);
  } catch {
    return [];
  }
};

export const getUsageSummary = async (
  cfg?: GatewaySettings
): Promise<UsageSummary> => {
  try {
    const [sessions, dailyCosts] = await Promise.all([
      getSessionsList(cfg),
      getCostData(cfg),
    ]);

    // Aggregate totals from sessions
    const totalTokens = sessions.reduce((sum, s) => sum + s.totalTokens, 0);
    const totalCost = dailyCosts.reduce((sum, d) => sum + d.cost, 0);

    // Build model breakdown from daily costs
    const modelMap = new Map<string, { tokens: number; cost: number }>();
    for (const d of dailyCosts) {
      const model = d.model || "unknown";
      const existing = modelMap.get(model) ?? { tokens: 0, cost: 0 };
      existing.tokens += d.tokens;
      existing.cost += d.cost;
      modelMap.set(model, existing);
    }
    const modelBreakdown: ModelBreakdown[] = [...modelMap.entries()].map(
      ([model, data]) => ({
        model,
        tokens: data.tokens,
        cost: Number.parseFloat(data.cost.toFixed(4)),
      })
    );

    // Map sessions to usage
    const sessionUsage = sessions.map((s) => ({
      sessionKey: s.key,
      displayName: s.displayName,
      channel: s.channel || s.lastChannel,
      totalTokens: s.totalTokens,
      contextTokens: s.contextTokens,
      updatedAt: s.updatedAt,
    }));

    return {
      totalTokens,
      totalCost: Number.parseFloat(totalCost.toFixed(4)),
      modelBreakdown,
      dailyCosts,
      sessions: sessionUsage,
    };
  } catch {
    return {
      totalTokens: 0,
      totalCost: 0,
      modelBreakdown: [],
      dailyCosts: [],
      sessions: [],
    };
  }
};
