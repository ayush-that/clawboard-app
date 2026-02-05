import type { GatewaySettings } from "./core";
import { chatCompletions, invokeTool } from "./core";
import type { MemoryData } from "./types";

type MemorySearchDetails = {
  results: Array<{
    path?: string;
    text?: string;
    score?: number;
    metadata?: Record<string, unknown>;
  }>;
};

const memoryToView = (details: MemorySearchDetails): MemoryData[] =>
  details.results.map((r) => ({
    key: r.path ?? "memory",
    summary: r.text ?? "No content",
    timestamp: (r.metadata?.timestamp as string) ?? "",
    relevance: r.score ?? 0.5,
  }));

export const queryMemory = async (
  query: string,
  cfg?: GatewaySettings
): Promise<MemoryData[]> => {
  try {
    const details = await invokeTool<MemorySearchDetails>(
      "memory_search",
      { query },
      cfg
    );
    return memoryToView(details);
  } catch {
    return [];
  }
};

export const addMemory = async (
  text: string,
  cfg?: GatewaySettings
): Promise<{ success: boolean; response: string }> => {
  try {
    return await chatCompletions(`Remember this permanently: ${text}`, cfg);
  } catch {
    return { success: false, response: "Failed to add memory" };
  }
};
