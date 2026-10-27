import type { ChatSummary } from "../types";

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

/** Groups chats (newest first) under Today, Yesterday, Previous 7 days and Older. */
export function groupByRecency(chats: ChatSummary[], now = new Date()) {
  const today = startOfDay(now);
  const groups: { label: string; chats: ChatSummary[] }[] = [
    { label: "Today", chats: [] },
    { label: "Yesterday", chats: [] },
    { label: "Previous 7 days", chats: [] },
    { label: "Older", chats: [] },
  ];

  for (const chat of chats) {
    const days = Math.round((today - startOfDay(new Date(chat.updated_at))) / DAY_MS);
    groups[days <= 0 ? 0 : days === 1 ? 1 : days <= 7 ? 2 : 3].chats.push(chat);
  }
  return groups.filter((g) => g.chats.length > 0);
}
