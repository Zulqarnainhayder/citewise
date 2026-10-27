import { AppShell } from "@/components/layout/AppShell";
import { ChatPanel } from "@/features/chat/components/ChatPanel";

export default function ChatPage() {
  return (
    <AppShell>
      <ChatPanel />
    </AppShell>
  );
}
