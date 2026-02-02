"use server";

import type { UIMessage } from "ai";
import { cookies } from "next/headers";
import type { VisibilityType } from "@/components/visibility-selector";
import {
  deleteMessagesByChatIdAfterTimestamp,
  getMessageById,
  updateChatVisibilityById,
} from "@/lib/db/queries";
import { getTextFromMessage } from "@/lib/utils";

export async function saveChatModelAsCookie(model: string) {
  const cookieStore = await cookies();
  cookieStore.set("chat-model", model);
}

// biome-ignore lint/suspicious/useAwait: Server Actions must be async
export async function generateTitleFromUserMessage({
  message,
}: {
  message: UIMessage;
}) {
  const text = getTextFromMessage(message).trim();
  if (!text) {
    return "New Conversation";
  }
  const words = text.split(/\s+/).slice(0, 5).join(" ");
  return words.length > 50 ? `${words.slice(0, 50)}...` : words;
}

export async function deleteTrailingMessages({ id }: { id: string }) {
  const [message] = await getMessageById({ id });

  await deleteMessagesByChatIdAfterTimestamp({
    chatId: message.chatId,
    timestamp: message.createdAt,
  });
}

export async function updateChatVisibility({
  chatId,
  visibility,
}: {
  chatId: string;
  visibility: VisibilityType;
}) {
  await updateChatVisibilityById({ chatId, visibility });
}
