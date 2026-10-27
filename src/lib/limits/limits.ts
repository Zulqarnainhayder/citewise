import type { SupabaseClient } from "@supabase/supabase-js";

const number = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

/** Per-user caps that protect the shared AI quota. Override with environment variables. */
export const LIMITS = {
  chatPerMinute: number(process.env.CHAT_LIMIT_PER_MINUTE, 6),
  chatPerDay: number(process.env.CHAT_LIMIT_PER_DAY, 50),
  documentsPerDay: number(process.env.DOCUMENT_LIMIT_PER_DAY, 10),
};

export type LimitResult =
  | { allowed: true }
  | { allowed: false; message: string; retryAfterSeconds: number };

export const MINUTE_MS = 60_000;
export const DAY_MS = 24 * 60 * 60 * 1000;

/** Decides whether another question is allowed, given how many were asked recently. */
export function evaluateChatLimit(
  lastMinute: number,
  lastDay: number,
  limits: Pick<typeof LIMITS, "chatPerMinute" | "chatPerDay"> = LIMITS,
): LimitResult {
  if (lastDay >= limits.chatPerDay) {
    return {
      allowed: false,
      message: `You have reached today's limit of ${limits.chatPerDay} questions. Please try again tomorrow.`,
      retryAfterSeconds: 60 * 60,
    };
  }
  if (lastMinute >= limits.chatPerMinute) {
    return {
      allowed: false,
      message: "You are asking questions too quickly. Please wait a moment and try again.",
      retryAfterSeconds: 30,
    };
  }
  return { allowed: true };
}

/** Decides whether another document may be processed today. */
export function evaluateDocumentLimit(
  lastDay: number,
  limits: Pick<typeof LIMITS, "documentsPerDay"> = LIMITS,
): LimitResult {
  if (lastDay > limits.documentsPerDay) {
    return {
      allowed: false,
      message: `You can process up to ${limits.documentsPerDay} new documents per day. This one will be available to process tomorrow.`,
      retryAfterSeconds: 60 * 60,
    };
  }
  return { allowed: true };
}

export async function countSince(
  supabase: SupabaseClient,
  table: "messages" | "documents",
  userId: string,
  since: Date,
  role?: "user",
) {
  let query = supabase
    .from(table)
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", since.toISOString());
  if (role) query = query.eq("role", role);
  const { count } = await query;
  return count ?? 0;
}

/**
 * Counts the user's recent questions (row level security applies, so this
 * needs no special access) and applies the per-minute and per-day caps.
 */
export async function checkChatLimit(supabase: SupabaseClient, userId: string): Promise<LimitResult> {
  const now = Date.now();
  const [lastMinute, lastDay] = await Promise.all([
    countSince(supabase, "messages", userId, new Date(now - MINUTE_MS), "user"),
    countSince(supabase, "messages", userId, new Date(now - DAY_MS), "user"),
  ]);
  return evaluateChatLimit(lastMinute, lastDay);
}

export async function checkDocumentLimit(supabase: SupabaseClient, userId: string): Promise<LimitResult> {
  const lastDay = await countSince(supabase, "documents", userId, new Date(Date.now() - DAY_MS));
  return evaluateDocumentLimit(lastDay);
}
