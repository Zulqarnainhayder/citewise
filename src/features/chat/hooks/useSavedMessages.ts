"use client";

import { useEffect, useState } from "react";
import { useSupabase } from "@/lib/supabase/useSupabase";
import type { ChatMessage, Source } from "../types";

type State = { loading: boolean; notFound: boolean; title?: string; messages: ChatMessage[] };

type Row = { id: string; role: "user" | "assistant"; content: string; sources: Source[] | null };

/** Loads a saved chat's messages. Does nothing for a new chat (no id). */
export function useSavedMessages(chatId?: string): State {
  const supabase = useSupabase();
  const [state, setState] = useState<State>({ loading: !!chatId, notFound: false, messages: [] });

  useEffect(() => {
    if (!chatId) return;
    let cancelled = false;

    (async () => {
      const { data: chat } = await supabase.from("chats").select("id, title").eq("id", chatId).maybeSingle();
      if (!chat) {
        if (!cancelled) setState({ loading: false, notFound: true, messages: [] });
        return;
      }

      const { data } = await supabase
        .from("messages")
        .select("id, role, content, sources")
        .eq("chat_id", chatId)
        .order("created_at", { ascending: true });
      if (cancelled) return;

      setState({
        loading: false,
        notFound: false,
        title: chat.title as string,
        messages: ((data ?? []) as Row[]).map((row) => ({
          id: row.id,
          role: row.role,
          content: row.content,
          sources: row.sources ?? [],
          status: "done",
        })),
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [chatId, supabase]);

  return state;
}
