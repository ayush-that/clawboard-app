"use client";

import { memo } from "react";
import { SparklesIcon } from "@/lib/icons";
import type { ChatMessage } from "@/lib/types";
import { cn, sanitizeText } from "@/lib/utils";
import { MessageContent } from "../elements/message";
import { Response } from "../elements/response";

type PublicChatViewProps = {
  chatTitle: string;
  messages: ChatMessage[];
};

function PurePublicMessage({
  message,
  isGroupedWithPrevious,
}: {
  message: ChatMessage;
  isGroupedWithPrevious: boolean;
}) {
  const textParts = message.parts.filter(
    (p): p is { type: "text"; text: string } =>
      p.type === "text" && Boolean((p as { text?: string }).text?.trim())
  );

  if (textParts.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "group/message w-full",
        isGroupedWithPrevious && "-mt-3 md:-mt-5"
      )}
      data-role={message.role}
    >
      <div
        className={cn("flex w-full items-start gap-2 md:gap-3", {
          "justify-end": message.role === "user",
        })}
      >
        {message.role === "assistant" && (
          <div
            className={cn(
              "-mt-1 flex size-8 shrink-0 items-center justify-center rounded-full",
              isGroupedWithPrevious
                ? "bg-transparent"
                : "bg-background ring-1 ring-border"
            )}
          >
            {!isGroupedWithPrevious && <SparklesIcon size={14} />}
          </div>
        )}

        <div
          className={cn("relative flex min-w-0 flex-col", {
            "w-full": message.role === "assistant",
            "max-w-[calc(100%-2.5rem)] sm:max-w-[min(fit-content,80%)]":
              message.role === "user",
          })}
        >
          {textParts.map((part, i) => (
            <div key={`${message.id}-text-${i}`}>
              <MessageContent
                className={cn({
                  "wrap-break-word w-fit rounded-2xl bg-primary px-3 py-2 text-left text-primary-foreground":
                    message.role === "user",
                  "bg-transparent px-0 py-0 text-left":
                    message.role === "assistant",
                })}
              >
                {message.role === "user" ? (
                  <span className="whitespace-pre-wrap">
                    {sanitizeText(part.text)}
                  </span>
                ) : (
                  <Response>{sanitizeText(part.text)}</Response>
                )}
              </MessageContent>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const PublicMessage = memo(PurePublicMessage);

function hasVisibleText(msg: ChatMessage): boolean {
  return msg.parts.some(
    (p) => p.type === "text" && (p as { text?: string }).text?.trim()
  );
}

export function PublicChatView({ chatTitle, messages }: PublicChatViewProps) {
  const visibleMessages = messages.filter(hasVisibleText);

  return (
    <div className="flex h-dvh flex-col">
      <header className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <SparklesIcon size={16} />
          <h1 className="truncate text-sm font-medium">{chatTitle}</h1>
        </div>
        <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
          Shared Chat
        </span>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto flex min-w-0 max-w-4xl flex-col gap-4 px-2 py-4 md:gap-6 md:px-4">
          {visibleMessages.map((message, index) => (
            <PublicMessage
              isGroupedWithPrevious={
                index > 0 && visibleMessages[index - 1].role === message.role
              }
              key={message.id}
              message={message}
            />
          ))}

          {visibleMessages.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              This chat has no messages yet.
            </p>
          )}

          <div className="min-h-[24px] shrink-0" />
        </div>
      </div>
    </div>
  );
}
