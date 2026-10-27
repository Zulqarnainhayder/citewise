import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { ChatPanel } from "@/features/chat/components/ChatPanel";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function SavedChat({ params }: { params: PageProps<"/chat/[chatId]">["params"] }) {
  const { chatId } = await params;
  if (!UUID.test(chatId)) notFound();
  return <ChatPanel chatId={chatId} />;
}

export default function SavedChatPage(props: PageProps<"/chat/[chatId]">) {
  return (
    <AppShell>
      <Suspense fallback={<div className="h-dvh" />}>
        <SavedChat params={props.params} />
      </Suspense>
    </AppShell>
  );
}
