import { describe, expect, it } from "vitest";
import type { ChatSummary } from "../types";
import { groupByRecency } from "./groupChats";

const now = new Date(2026, 9, 27, 15, 0, 0); // 27 Oct 2026, 15:00 local time
const chat = (id: string, daysAgo: number, hour = 10): ChatSummary => ({
  id,
  title: id,
  updated_at: new Date(2026, 9, 27 - daysAgo, hour).toISOString(),
});

describe("groupByRecency", () => {
  it("groups chats into Today, Yesterday, Previous 7 days and Older", () => {
    const groups = groupByRecency(
      [chat("a", 0), chat("b", 1), chat("c", 5), chat("d", 8), chat("e", 40)],
      now,
    );
    expect(groups.map((g) => g.label)).toEqual(["Today", "Yesterday", "Previous 7 days", "Older"]);
    expect(groups.map((g) => g.chats.map((c) => c.id))).toEqual([["a"], ["b"], ["c"], ["d", "e"]]);
  });

  it("leaves out groups that are empty and keeps the given order", () => {
    const groups = groupByRecency([chat("late", 0, 14), chat("early", 0, 8)], now);
    expect(groups).toHaveLength(1);
    expect(groups[0].chats.map((c) => c.id)).toEqual(["late", "early"]);
  });

  it("returns no groups for no chats", () => {
    expect(groupByRecency([], now)).toEqual([]);
  });
});
