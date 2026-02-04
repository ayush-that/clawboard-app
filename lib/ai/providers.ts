import { gateway } from "@ai-sdk/gateway";
import { createOpenAI } from "@ai-sdk/openai";
import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from "ai";
import { isTestEnvironment } from "../constants";

export type ProviderSettings = {
  gatewayUrl?: string;
  gatewayToken?: string;
};

const THINKING_SUFFIX_REGEX = /-thinking$/;

export const myProvider = isTestEnvironment
  ? (() => {
      const {
        artifactModel,
        chatModel,
        reasoningModel,
        titleModel,
      } = require("./models.mock");
      return customProvider({
        languageModels: {
          "chat-model": chatModel,
          "chat-model-reasoning": reasoningModel,
          "title-model": titleModel,
          "artifact-model": artifactModel,
        },
      });
    })()
  : null;

export function getLanguageModel(modelId: string, settings?: ProviderSettings) {
  if (isTestEnvironment && myProvider) {
    return myProvider.languageModel(modelId);
  }

  if (modelId === "openclaw") {
    return getOpenClawChat(settings);
  }

  const isReasoningModel =
    modelId.includes("reasoning") || modelId.endsWith("-thinking");

  if (isReasoningModel) {
    const gatewayModelId = modelId.replace(THINKING_SUFFIX_REGEX, "");

    return wrapLanguageModel({
      model: gateway.languageModel(gatewayModelId),
      middleware: extractReasoningMiddleware({ tagName: "thinking" }),
    });
  }

  return gateway.languageModel(modelId);
}

function getOpenClawChat(settings?: ProviderSettings) {
  const url =
    settings?.gatewayUrl ||
    process.env.OPENCLAW_GATEWAY_URL ||
    "http://localhost:18789";
  const token =
    settings?.gatewayToken || process.env.OPENCLAW_GATEWAY_TOKEN || "dummy";

  const openclaw = createOpenAI({
    baseURL: `${url}/v1`,
    apiKey: token,
  });
  return openclaw.chat("openclaw:main");
}

export function getTitleModel(settings?: ProviderSettings) {
  if (isTestEnvironment && myProvider) {
    return myProvider.languageModel("title-model");
  }
  return getOpenClawChat(settings);
}

export function getArtifactModel(settings?: ProviderSettings) {
  if (isTestEnvironment && myProvider) {
    return myProvider.languageModel("artifact-model");
  }
  return getOpenClawChat(settings);
}
