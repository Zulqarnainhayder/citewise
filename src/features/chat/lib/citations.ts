/** Matches [1], [1, 6], [1,2,3] and [2-4]. Models often group citations. */
const GROUP = /\[(\d+(?:\s*[,–-]\s*\d+)*)\]/g;
const MAX_RANGE = 10;

function expand(group: string): number[] {
  const numbers: number[] = [];
  for (const part of group.split(",")) {
    const [from, to] = part.split(/[–-]/).map((n) => Number(n.trim()));
    if (to === undefined || Number.isNaN(to)) {
      numbers.push(from);
    } else if (to >= from && to - from <= MAX_RANGE) {
      for (let n = from; n <= to; n++) numbers.push(n);
    } else {
      numbers.push(from, to);
    }
  }
  return numbers;
}

/** Every source number the text cites, however the citation is written. */
export function citedNumbers(text: string): Set<number> {
  const cited = new Set<number>();
  for (const match of text.matchAll(GROUP)) expand(match[1]).forEach((n) => cited.add(n));
  return cited;
}

/**
 * Rewrites each citation group as one markdown link per source, so that
 * "[1, 6]" becomes "[1](cite:1)[6](cite:6)" and renders as two badges.
 */
export function linkCitations(text: string, prefix: string): string {
  return text.replace(GROUP, (_, group: string) =>
    expand(group)
      .map((n) => `[${n}](${prefix}${n})`)
      .join(""),
  );
}
