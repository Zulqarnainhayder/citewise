import type { SupabaseClient } from "@supabase/supabase-js";
import { DAY_MS, LIMITS, countSince } from "@/lib/limits/limits";

export type Usage = {
  questionsToday: number;
  documentsToday: number;
  limits: { questionsPerDay: number; documentsPerDay: number };
  totals: { documents: number; chats: number; workspaces: number };
};

async function total(supabase: SupabaseClient, table: "documents" | "chats" | "workspaces") {
  const { count } = await supabase.from(table).select("id", { count: "exact", head: true });
  return count ?? 0;
}

/** The numbers shown on the Settings page, counted from the user's own rows (RLS applies). */
export async function getUsage(supabase: SupabaseClient, userId: string): Promise<Usage> {
  const since = new Date(Date.now() - DAY_MS);
  const [questionsToday, documentsToday, documents, chats, workspaces] = await Promise.all([
    countSince(supabase, "messages", userId, since, "user"),
    countSince(supabase, "documents", userId, since),
    total(supabase, "documents"),
    total(supabase, "chats"),
    total(supabase, "workspaces"),
  ]);
  return {
    questionsToday,
    documentsToday,
    limits: { questionsPerDay: LIMITS.chatPerDay, documentsPerDay: LIMITS.documentsPerDay },
    totals: { documents, chats, workspaces },
  };
}
