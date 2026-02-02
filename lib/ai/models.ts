// Curated list of top models from Vercel AI Gateway
export const DEFAULT_CHAT_MODEL = "openclaw";

export type ChatModel = {
  id: string;
  name: string;
  provider: string;
  description: string;
};

export const chatModels: ChatModel[] = [
  // OpenClaw — primary
  {
    id: "openclaw",
    name: "OpenClaw Agent",
    provider: "openclaw",
    description: "Autonomous OpenClaw agent via gateway",
  },
];

// Group models by provider for UI
export const modelsByProvider = chatModels.reduce(
  (acc, model) => {
    if (!acc[model.provider]) {
      acc[model.provider] = [];
    }
    acc[model.provider].push(model);
    return acc;
  },
  {} as Record<string, ChatModel[]>
);
