import type { SupabaseClient } from "@supabase/supabase-js";
import { citedNumbers } from "../lib/citations";
import type { ChatTurn, Source } from "../types";

const HISTORY_TURNS = 6;
const TITLE_CHARS = 60;

export function titleFrom(question: string) {
  const oneLine = question.replace(/\s+/g, " ").trim();
  return oneLine.length > TITLE_CHARS ? `${oneLine.slice(0, TITLE_CHARS - 1).trimEnd()}…` : oneLine;
}

/** Whether the signed-in user owns this chat (row level security applies). */
export async function chatExists(supabase: SupabaseClient, chatId: string) {
  const { data } = await supabase.from("chats").select("id").eq("id", chatId).maybeSingle();
  return data !== null;
}

export async function createChat(supabase: SupabaseClient, userId: string, question: string) {
  const { data, error } = await supabase
    .from("chats")
    .insert({ user_id: userId, title: titleFrom(question) })
    .select("id, title")
    .single();
  if (error) throw new Error(error.message);
  return data as { id: string; title: string };
}

/** The most recent turns of a chat, oldest first, for follow-up questions. */
export async function loadHistory(supabase: SupabaseClient, chatId: string): Promise<ChatTurn[]> {
  const { data } = await supabase
    .from("messages")
    .select("role, content")
    .eq("chat_id", chatId)
    .order("created_at", { ascending: false })
    .limit(HISTORY_TURNS);
  return ((data ?? []) as ChatTurn[]).reverse();
}

export async function saveUserMessage(
  supabase: SupabaseClient,
  userId: string,
  chatId: string,
  content: string,
) {
  const { error } = await supabase
    .from("messages")
    .insert({ chat_id: chatId, user_id: userId, role: "user", content });
  if (error) throw new Error(error.message);
}

export async function updateChatTitle(supabase: SupabaseClient, chatId: string, title: string) {
  await supabase.from("chats").update({ title }).eq("id", chatId);
}

/** Saves the answer with only the sources it cites, then bumps the chat to the top. */
export async function saveAnswer(
  supabase: SupabaseClient,
  userId: string,
  chatId: string,
  content: string,
  sources: Source[],
) {
  const cited = citedNumbers(content);
  const { error } = await supabase.from("messages").insert({
    chat_id: chatId,
    user_id: userId,
    role: "assistant",
    content,
    sources: sources.filter((s) => cited.has(s.n)),
  });
  if (error) throw new Error(error.message);
  await supabase.from("chats").update({ updated_at: new Date().toISOString() }).eq("id", chatId);
}
