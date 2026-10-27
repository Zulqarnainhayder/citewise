/**
 * Reciprocal rank fusion: merges several ranked lists into one. An item scores
 * 1 / (k + rank) in every list it appears in, and the scores add up, so items
 * that rank well in more than one list (found by meaning AND by keyword) rise to
 * the top. It needs only ranks, so lists with unrelated scores can be combined.
 */
export function reciprocalRankFusion<T>(lists: T[][], keyOf: (item: T) => string, k = 60): T[] {
  const scores = new Map<string, { item: T; score: number }>();

  for (const list of lists) {
    list.forEach((item, index) => {
      const key = keyOf(item);
      const entry = scores.get(key) ?? { item, score: 0 };
      entry.score += 1 / (k + index + 1);
      scores.set(key, entry);
    });
  }

  return [...scores.values()].sort((a, b) => b.score - a.score).map((entry) => entry.item);
}
