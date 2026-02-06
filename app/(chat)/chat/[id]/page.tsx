import { notFound } from "next/navigation";
import { Suspense } from "react";

import { auth } from "@/app/(auth)/auth";
import { Chat } from "@/components/chat/chat";
import { PublicChatView } from "@/components/chat/public-chat-view";
import { DataStreamHandler } from "@/components/data-stream-handler";
import { DEFAULT_CHAT_MODEL } from "@/lib/ai/models";
import { getChatById, getMessagesByChatId } from "@/lib/db/queries";
import { convertToUIMessages } from "@/lib/utils";

export default function Page(props: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={null}>
      <ChatPage params={props.params} />
    </Suspense>
  );
}

async function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const chat = await getChatById({ id });

  if (!chat) {
    return notFound();
  }

  const session = await auth();

  // Unauthenticated user viewing a public chat — read-only, no interactive components
  if (!session) {
    if (chat.visibility === "private") {
      return notFound();
    }

    const messagesFromDb = await getMessagesByChatId({ id });
    const uiMessages = convertToUIMessages(messagesFromDb);

    return <PublicChatView chatTitle={chat.title} messages={uiMessages} />;
  }

  // Authenticated user viewing a private chat they don't own — 404
  if (chat.visibility === "private" && session.user?.id !== chat.userId) {
    return notFound();
  }

  const messagesFromDb = await getMessagesByChatId({ id });
  const uiMessages = convertToUIMessages(messagesFromDb);

  return (
    <>
      <Chat
        autoResume={true}
        id={chat.id}
        initialChatModel={DEFAULT_CHAT_MODEL}
        initialMessages={uiMessages}
        initialVisibilityType={chat.visibility}
        isReadonly={session.user?.id !== chat.userId}
        openclawSessionKey={chat.openclawSessionKey}
      />
      <DataStreamHandler />
    </>
  );
}
