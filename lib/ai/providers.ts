import { gateway } from "@ai-sdk/gateway";
import { createOpenAI } from "@ai-sdk/openai";
import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from "ai";
import { isTestEnvironment } from "../constants";

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

export function getLanguageModel(modelId: string) {
  if (isTestEnvironment && myProvider) {
    return myProvider.languageModel(modelId);
  }

  if (modelId === "openclaw") {
    const openclaw = createOpenAI({
      baseURL: `${process.env.OPENCLAW_GATEWAY_URL ?? "http://localhost:18789"}/v1`,
      apiKey: process.env.OPENCLAW_GATEWAY_TOKEN ?? "dummy",
    });
    return openclaw.chat("openclaw:main");
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

function getOpenClawChat() {
  const openclaw = createOpenAI({
    baseURL: `${process.env.OPENCLAW_GATEWAY_URL ?? "http://localhost:18789"}/v1`,
    apiKey: process.env.OPENCLAW_GATEWAY_TOKEN ?? "dummy",
  });
  return openclaw.chat("openclaw:main");
}

export function getTitleModel() {
  if (isTestEnvironment && myProvider) {
    return myProvider.languageModel("title-model");
  }
  return getOpenClawChat();
}

export function getArtifactModel() {
  if (isTestEnvironment && myProvider) {
    return myProvider.languageModel("artifact-model");
  }
  return getOpenClawChat();
}
