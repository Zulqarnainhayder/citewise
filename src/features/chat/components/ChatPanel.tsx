"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Spinner } from "@/components/ui/Spinner";
import { useSavedMessages } from "../hooks/useSavedMessages";
import { ChatSession } from "./ChatSession";

/** Loads a saved chat when given an id, then shows the conversation. */
export function ChatPanel({ chatId }: { chatId?: string }) {
  const saved = useSavedMessages(chatId);

  // A new chat rewrites its own address to /chat/<id> without a real navigation, so
  // Next keeps this page mounted. When the address returns to /chat (the New chat
  // button), start over with a fresh conversation.
  const pathname = usePathname();
  const [lastPath, setLastPath] = useState(pathname);
  const [freshChats, setFreshChats] = useState(0);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    if (pathname === "/chat") setFreshChats((n) => n + 1);
  }

  if (chatId && saved.loading) {
    return (
      <div className="flex h-[calc(100dvh-6.5rem)] items-center justify-center gap-2 text-sm text-brand-600 lg:h-dvh dark:text-brand-300">
        <Spinner /> Loading chat…
      </div>
    );
  }

  if (chatId && saved.notFound) {
    return (
      <div className="flex h-[calc(100dvh-6.5rem)] flex-col items-center justify-center px-6 text-center lg:h-dvh">
        <h1 className="text-xl font-semibold text-brand-900 dark:text-white">Chat not found</h1>
        <p className="mt-2 max-w-sm text-sm text-brand-600 dark:text-brand-300">
          This chat doesn&apos;t exist or was deleted.
        </p>
        <Link
          href="/chat"
          className="mt-6 inline-flex rounded-xl bg-accent-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-600 focus:outline-none focus-visible:ring-4 focus-visible:ring-accent-600/30"
        >
          Start a new chat
        </Link>
      </div>
    );
  }

  return (
    <ChatSession
      key={chatId ?? `new-${freshChats}`}
      chatId={chatId}
      initialTitle={saved.title}
      initialMessages={saved.messages}
    />
  );
}
