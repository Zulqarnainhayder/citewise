import { Suspense } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { ChatPanel } from "@/features/chat/components/ChatPanel";

export default function ChatPage() {
  return (
    <AppShell>
      {/* ChatSession reads ?workspace=, which is runtime data. */}
      <Suspense fallback={<div className="h-dvh" />}>
        <ChatPanel />
      </Suspense>
    </AppShell>
  );
}
