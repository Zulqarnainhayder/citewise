"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { TrashIcon } from "@/components/icons";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { SearchInput } from "@/components/ui/SearchInput";
import { useChats } from "../hooks/useChats";
import { groupByRecency } from "../lib/groupChats";
import type { ChatSummary } from "../types";

/** Search appears once there are enough chats to need it. */
const SEARCH_FROM = 4;

const note = "px-3 py-2 text-xs text-brand-500 dark:text-brand-400";

type Props = {
  /** Called when a chat is opened, e.g. to close the mobile history dialog. */
  onNavigate?: () => void;
};

/** Saved chats grouped by date, with search, open and delete. */
export function ChatHistoryPanel({ onNavigate }: Props) {
  const { chats, loading, remove } = useChats();
  const pathname = usePathname();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [pending, setPending] = useState<ChatSummary | null>(null);
  const [deleting, setDeleting] = useState(false);

  const activeId = pathname.startsWith("/chat/") ? pathname.split("/")[2] : null;

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return needle ? chats.filter((c) => c.title.toLowerCase().includes(needle)) : chats;
  }, [chats, query]);

  async function confirmDelete() {
    if (!pending) return;
    setDeleting(true);
    const error = await remove(pending.id);
    setDeleting(false);
    if (!error && pending.id === activeId) router.push("/chat");
    setPending(null);
  }

  if (loading) return <p className={note}>Loading chats…</p>;
  if (chats.length === 0) return <p className={note}>No saved chats yet.</p>;

  return (
    <>
      {chats.length >= SEARCH_FROM && (
        <SearchInput
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search chats"
          aria-label="Search chats"
          className="mb-3"
        />
      )}

      {visible.length === 0 && <p className={note}>No chats match “{query.trim()}”.</p>}

      <div className="space-y-4">
        {groupByRecency(visible).map((group) => (
          <section key={group.label}>
            <h3 className="px-3 pb-1 text-xs font-medium text-brand-500 dark:text-brand-400">
              {group.label}
            </h3>
            <ul className="space-y-0.5">
              {group.chats.map((chat) => {
                const active = chat.id === activeId;
                return (
                  <li key={chat.id} className="group relative">
                    <Link
                      href={`/chat/${chat.id}`}
                      onClick={onNavigate}
                      aria-current={active ? "page" : undefined}
                      title={chat.title}
                      className={`block truncate rounded-lg py-[7px] pl-3 pr-9 text-[13px] font-medium leading-5 tracking-[-0.006em] transition ${
                        active
                          ? "bg-brand-200/70 text-brand-900 dark:bg-brand-800 dark:text-white"
                          : "text-brand-600 hover:bg-brand-200/50 hover:text-brand-900 dark:text-brand-300 dark:hover:bg-brand-800/70 dark:hover:text-white"
                      }`}
                    >
                      {chat.title}
                    </Link>
                    <button
                      type="button"
                      onClick={() => setPending(chat)}
                      aria-label={`Delete chat: ${chat.title}`}
                      title="Delete chat"
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-brand-500 opacity-100 transition hover:bg-red-50 hover:text-red-600 focus:outline-none focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-red-500 lg:opacity-0 lg:group-hover:opacity-100 dark:text-brand-300 dark:hover:bg-red-950/40 dark:hover:text-red-300"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>

      <ConfirmDialog
        open={pending !== null}
        title="Delete this chat?"
        description={
          <>
            <strong className="font-semibold text-brand-900 dark:text-white">{pending?.title}</strong>{" "}
            and all of its messages will be permanently removed.
          </>
        }
        confirmLabel="Delete chat"
        loadingLabel="Deleting…"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setPending(null)}
      />
    </>
  );
}
