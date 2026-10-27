/** The part of a PDF.js text item that matters for matching. */
export type TextItemLike = { str: string };

const squeeze = (text: string) => text.replace(/\s+/g, "");
const PROBE_SIZES = [120, 60, 30];

/**
 * Finds which text items on a page hold a cited passage. The passage was cut
 * from the same page text, but spacing differs between extractors, so matching
 * ignores all whitespace. Returns item indexes in reading order, or [] when
 * the passage cannot be located.
 */
export function locateHighlight(items: TextItemLike[], passage: string): number[] {
  const target = squeeze(passage);
  if (!target) return [];

  let page = "";
  const owner: number[] = [];
  items.forEach((item, index) => {
    const text = squeeze(item.str);
    page += text;
    for (let i = 0; i < text.length; i++) owner.push(index);
  });

  let start = page.indexOf(target);
  let end = start >= 0 ? start + target.length : -1;

  if (start < 0) {
    // The passage may begin or end beyond what we can match exactly: anchor on its edges.
    for (const size of PROBE_SIZES) {
      if (target.length <= size) continue;
      start = page.indexOf(target.slice(0, size));
      if (start >= 0) break;
    }
    if (start < 0) return [];

    for (const size of PROBE_SIZES) {
      if (target.length <= size) continue;
      const found = page.indexOf(target.slice(-size), start);
      if (found >= 0) {
        end = found + size;
        break;
      }
    }
    if (end < 0) end = Math.min(page.length, start + target.length);
  }

  const indexes = new Set<number>();
  for (let i = start; i < end; i++) indexes.add(owner[i]);
  return [...indexes].sort((a, b) => a - b);
}
