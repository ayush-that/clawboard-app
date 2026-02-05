import type {
  LanguageModelV3Prompt,
  LanguageModelV3StreamPart,
} from "@ai-sdk/provider";

const defaultUsage = {
  inputTokens: { total: 10, noCache: 10, cacheRead: 0, cacheWrite: 0 },
  outputTokens: { total: 20, text: 20, reasoning: 0 },
};

export const getResponseChunksByPrompt = (
  _prompt: LanguageModelV3Prompt,
  reasoning = false
): LanguageModelV3StreamPart[] => {
  const chunks: LanguageModelV3StreamPart[] = [
    { id: "1", type: "text-start" },
    { id: "1", type: "text-delta", delta: "Hello, world!" },
    { id: "1", type: "text-end" },
  ];

  if (reasoning) {
    chunks.unshift(
      { id: "r1", type: "reasoning-start" },
      { id: "r1", type: "reasoning-delta", delta: "Thinking..." },
      { id: "r1", type: "reasoning-end" }
    );
  }

  chunks.push({
    type: "finish",
    finishReason: { unified: "stop" as const, raw: undefined },
    usage: defaultUsage,
  });

  return chunks;
};
