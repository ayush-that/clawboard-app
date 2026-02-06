"use client";

import { type TamboThreadMessage, useTamboThread } from "@tambo-ai/react";
import type { Dispatch, ReactNode, SetStateAction } from "react";
import { useEffect, useRef } from "react";
import { shouldRenderTamboForMessage } from "@/lib/tambo/intent-gate";
import type { ChatMessage } from "@/lib/types";
import { getTextFromMessage } from "@/lib/utils";
import { toast } from "../toast";

type TamboInlineBridgeProps = {
  chatId: string;
  messages: ChatMessage[];
  onRenderedComponentsChange: Dispatch<
    SetStateAction<Record<string, ReactNode>>
  >;
};

export function TamboInlineBridgeEnabled({
  chatId,
  messages,
  onRenderedComponentsChange,
}: TamboInlineBridgeProps) {
  const { thread, sendThreadMessage } = useTamboThread();
  const initializedRef = useRef(false);
  const handledUserMessageIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!initializedRef.current) {
      for (const message of messages) {
        if (message.role === "user") {
          handledUserMessageIdsRef.current.add(message.id);
        }
      }
      initializedRef.current = true;
      return;
    }

    for (const message of messages) {
      if (message.role !== "user") {
        continue;
      }

      if (handledUserMessageIdsRef.current.has(message.id)) {
        continue;
      }

      handledUserMessageIdsRef.current.add(message.id);

      const text = getTextFromMessage(message).trim();

      if (!text || !shouldRenderTamboForMessage(text)) {
        continue;
      }

      sendThreadMessage(text, {
        streamResponse: true,
        contextKey: `openclaw-chat:${chatId}`,
        additionalContext: {
          openclawChatId: chatId,
          openclawUserMessageId: message.id,
        },
      }).catch((error) => {
        console.warn("Tambo component rendering failed", error);
        toast({
          type: "error",
          description:
            "Tambo component rendering failed for this message. OpenClaw text still works.",
        });
      });
    }
  }, [chatId, messages, sendThreadMessage]);

  useEffect(() => {
    const renderedComponentMap = buildRenderedComponentMap(
      thread?.messages ?? [],
      chatId
    );
    onRenderedComponentsChange((previous) =>
      areRenderedMapsEqual(previous, renderedComponentMap)
        ? previous
        : renderedComponentMap
    );
  }, [chatId, onRenderedComponentsChange, thread?.messages]);

  return null;
}

function buildRenderedComponentMap(
  threadMessages: TamboThreadMessage[],
  openClawChatId: string
): Record<string, ReactNode> {
  const renderedComponentMap: Record<string, ReactNode> = {};
  let currentOpenClawUserMessageId: string | null = null;
  let currentOpenClawChatContext: string | null = null;

  for (const threadMessage of threadMessages) {
    if (threadMessage.role === "user") {
      currentOpenClawUserMessageId = getAdditionalContextString(
        threadMessage,
        "openclawUserMessageId"
      );
      currentOpenClawChatContext = getAdditionalContextString(
        threadMessage,
        "openclawChatId"
      );
      continue;
    }

    if (
      threadMessage.role === "assistant" &&
      threadMessage.renderedComponent &&
      currentOpenClawUserMessageId &&
      currentOpenClawChatContext === openClawChatId
    ) {
      renderedComponentMap[currentOpenClawUserMessageId] =
        threadMessage.renderedComponent;
    }
  }

  return renderedComponentMap;
}

function getAdditionalContextString(
  threadMessage: TamboThreadMessage,
  key: string
): string | null {
  const value = threadMessage.additionalContext?.[key];
  return typeof value === "string" ? value : null;
}

function areRenderedMapsEqual(
  previous: Record<string, ReactNode>,
  next: Record<string, ReactNode>
): boolean {
  const previousKeys = Object.keys(previous);
  const nextKeys = Object.keys(next);

  if (previousKeys.length !== nextKeys.length) {
    return false;
  }

  for (const key of previousKeys) {
    if (previous[key] !== next[key]) {
      return false;
    }
  }

  return true;
}
