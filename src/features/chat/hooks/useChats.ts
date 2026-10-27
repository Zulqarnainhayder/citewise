"use client";

import { useCallback, useEffect, useState } from "react";
import { useSupabase } from "@/lib/supabase/useSupabase";
import { CHATS_CHANGED, notifyChatsChanged } from "../lib/chatsChanged";
import type { ChatSummary } from "../types";

const LIST_LIMIT = 40;

/** The signed-in user's saved chats, newest first, kept fresh across components. */
export function useChats() {
  const supabase = useSupabase();
  const [chats, setChats] = useState<ChatSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const { data } = await supabase
        .from("chats")
        .select("id, title, updated_at")
        .order("updated_at", { ascending: false })
        .limit(LIST_LIMIT);
      if (cancelled) return;
      setChats((data ?? []) as ChatSummary[]);
      setLoading(false);
    }

    void load();
    window.addEventListener(CHATS_CHANGED, load);
    return () => {
      cancelled = true;
      window.removeEventListener(CHATS_CHANGED, load);
    };
  }, [supabase]);

  /** Resolves to an error message, or null on success. */
  const remove = useCallback(
    async (id: string): Promise<string | null> => {
      const { error } = await supabase.from("chats").delete().eq("id", id);
      if (error) return error.message;
      setChats((prev) => prev.filter((c) => c.id !== id));
      notifyChatsChanged();
      return null;
    },
    [supabase],
  );

  return { chats, loading, remove };
}
