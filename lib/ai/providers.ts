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

export function getLanguageModel(
  modelId: string,
  settings?: ProviderSettings,
  sessionKey?: string
) {
  if (isTestEnvironment && myProvider) {
    return myProvider.languageModel(modelId);
  }

  if (modelId === "openclaw") {
    return getOpenClawChat(settings, sessionKey);
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

function getOpenClawChat(settings?: ProviderSettings, sessionKey?: string) {
  const url = settings?.gatewayUrl?.trim() || "";

  if (!url) {
    throw new Error("OpenClaw gateway URL is not configured.");
  }

  const token = settings?.gatewayToken || "";

  const openclaw = createOpenAI({
    baseURL: `${url}/v1`,
    apiKey: token,
  });
  return openclaw.chat(`openclaw:${sessionKey ?? "main"}`);
}

export function getArtifactModel(
  settings?: ProviderSettings,
  sessionKey?: string
) {
  if (isTestEnvironment && myProvider) {
    return myProvider.languageModel("artifact-model");
  }
  return getOpenClawChat(settings, sessionKey);
}
