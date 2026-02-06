"use client";

import { useChat } from "@ai-sdk/react";
import { type TamboThreadMessage, useTamboThread } from "@tambo-ai/react";
import { DefaultChatTransport } from "ai";
import { useRouter, useSearchParams } from "next/navigation";
import {
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import { useSWRConfig } from "swr";
import { unstable_serialize } from "swr/infinite";
import { ChatHeader } from "@/components/chat/chat-header";
import { useArtifactSelector } from "@/hooks/use-artifact";
import { useAutoResume } from "@/hooks/use-auto-resume";
import { useChatVisibility } from "@/hooks/use-chat-visibility";
import { ChatSDKError } from "@/lib/errors";
import { shouldRenderTamboForMessage } from "@/lib/tambo/intent-gate";
import type { Attachment, ChatMessage } from "@/lib/types";
import {
  fetchWithErrorHandlers,
  generateUUID,
  getTextFromMessage,
} from "@/lib/utils";
import { Artifact } from "../artifact/artifact";
import { useDataStreamSetter } from "../data-stream-provider";
import { getChatHistoryPaginationKey } from "../sidebar/sidebar-history";
import { useTamboRuntime } from "../tambo-wrapper";
import { toast } from "../toast";
import type { VisibilityType } from "../visibility-selector";
import { Messages } from "./messages";
import { MultimodalInput } from "./multimodal-input";

export function Chat({
  id,
  initialMessages,
  initialChatModel,
  initialVisibilityType,
  isReadonly,
  autoResume,
  openclawSessionKey,
}: {
  id: string;
  initialMessages: ChatMessage[];
  initialChatModel: string;
  initialVisibilityType: VisibilityType;
  isReadonly: boolean;
  autoResume: boolean;
  openclawSessionKey?: string | null;
}) {
  const router = useRouter();

  const { visibilityType } = useChatVisibility({
    chatId: id,
    initialVisibilityType,
  });

  const { mutate } = useSWRConfig();

  useEffect(() => {
    const handlePopState = () => {
      router.refresh();
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [router]);

  const setDataStream = useDataStreamSetter();

  const [input, setInput] = useState<string>("");
  const currentModelIdRef = useRef(initialChatModel);

  const {
    messages,
    setMessages,
    sendMessage,
    status,
    stop,
    regenerate,
    resumeStream,
    addToolApprovalResponse,
  } = useChat<ChatMessage>({
    id,
    messages: initialMessages,
    generateId: generateUUID,
    sendAutomaticallyWhen: ({ messages: currentMessages }) => {
      const lastMessage = currentMessages.at(-1);
      const shouldContinue =
        lastMessage?.parts?.some(
          (part) =>
            "state" in part &&
            part.state === "approval-responded" &&
            "approval" in part &&
            (part.approval as { approved?: boolean })?.approved === true
        ) ?? false;
      return shouldContinue;
    },
    transport: new DefaultChatTransport({
      api: "/api/chat",
      fetch: fetchWithErrorHandlers,
      prepareSendMessagesRequest(request) {
        const lastMessage = request.messages.at(-1);
        const isToolApprovalContinuation =
          lastMessage?.role !== "user" ||
          request.messages.some((msg) =>
            msg.parts?.some((part) => {
              const state = (part as { state?: string }).state;
              return (
                state === "approval-responded" || state === "output-denied"
              );
            })
          );

        return {
          body: {
            id: request.id,
            ...(isToolApprovalContinuation
              ? { messages: request.messages }
              : { message: lastMessage }),
            selectedChatModel: currentModelIdRef.current,
            selectedVisibilityType: visibilityType,
            ...request.body,
          },
        };
      },
    }),
    onData: (dataPart) => {
      setDataStream((ds) => (ds ? [...ds, dataPart] : []));
    },
    onFinish: () => {
      mutate(unstable_serialize(getChatHistoryPaginationKey));
    },
    onError: (error) => {
      if (error instanceof ChatSDKError) {
        toast({
          type: "error",
          description: error.message,
        });
      }
    },
  });

  const searchParams = useSearchParams();
  const query = searchParams.get("query");
  const [hasAppendedQuery, setHasAppendedQuery] = useState(false);

  useEffect(() => {
    if (query && !hasAppendedQuery) {
      sendMessage({
        role: "user" as const,
        parts: [{ type: "text", text: query }],
      });
      setHasAppendedQuery(true);
      window.history.replaceState({}, "", `/chat/${id}`);
    }
  }, [query, sendMessage, hasAppendedQuery, id]);

  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [tamboRenderedByUserMessageId, setTamboRenderedByUserMessageId] =
    useState<Record<string, ReactNode>>({});
  const isArtifactVisible = useArtifactSelector((state) => state.isVisible);

  useAutoResume({
    autoResume,
    initialMessages,
    resumeStream,
    setMessages,
  });

  return (
    <>
      <div className="overscroll-behavior-contain flex h-dvh min-w-0 touch-pan-y flex-col bg-background">
        <ChatHeader
          chatId={id}
          isReadonly={isReadonly}
          openclawSessionKey={openclawSessionKey}
          selectedVisibilityType={initialVisibilityType}
        />

        <Messages
          addToolApprovalResponse={addToolApprovalResponse}
          chatId={id}
          isArtifactVisible={isArtifactVisible}
          isReadonly={isReadonly}
          messages={messages}
          regenerate={regenerate}
          selectedModelId={initialChatModel}
          setMessages={setMessages}
          status={status}
          tamboRenderedByUserMessageId={tamboRenderedByUserMessageId}
        />

        {!isReadonly && (
          <div className="sticky bottom-0 z-1 mx-auto flex w-full max-w-4xl gap-2 border-t-0 bg-background px-2 pb-3 md:px-4 md:pb-4">
            <MultimodalInput
              attachments={attachments}
              chatId={id}
              input={input}
              messages={messages}
              selectedModelId={initialChatModel}
              selectedVisibilityType={visibilityType}
              sendMessage={sendMessage}
              setAttachments={setAttachments}
              setInput={setInput}
              setMessages={setMessages}
              status={status}
              stop={stop}
            />
          </div>
        )}
      </div>

      <Artifact
        addToolApprovalResponse={addToolApprovalResponse}
        attachments={attachments}
        chatId={id}
        input={input}
        isReadonly={isReadonly}
        messages={messages}
        regenerate={regenerate}
        selectedModelId={initialChatModel}
        selectedVisibilityType={visibilityType}
        sendMessage={sendMessage}
        setAttachments={setAttachments}
        setInput={setInput}
        setMessages={setMessages}
        status={status}
        stop={stop}
      />

      <TamboInlineBridge
        chatId={id}
        messages={messages}
        onRenderedComponentsChange={setTamboRenderedByUserMessageId}
      />
    </>
  );
}

type TamboInlineBridgeProps = {
  chatId: string;
  messages: ChatMessage[];
  onRenderedComponentsChange: Dispatch<
    SetStateAction<Record<string, ReactNode>>
  >;
};

function TamboInlineBridge({
  chatId,
  messages,
  onRenderedComponentsChange,
}: TamboInlineBridgeProps) {
  const { enabled } = useTamboRuntime();

  useEffect(() => {
    if (!enabled) {
      onRenderedComponentsChange((previous) =>
        Object.keys(previous).length === 0 ? previous : {}
      );
    }
  }, [enabled, onRenderedComponentsChange]);

  if (!enabled) {
    return null;
  }

  return (
    <TamboInlineBridgeEnabled
      chatId={chatId}
      messages={messages}
      onRenderedComponentsChange={onRenderedComponentsChange}
    />
  );
}

function TamboInlineBridgeEnabled({
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
