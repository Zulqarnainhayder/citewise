import type { Source } from "../types";

type Props = {
  n: number;
  source?: Source;
  /** Makes the badge a button that opens the cited passage. */
  onOpen?: (n: number) => void;
};

const look =
  "mx-0.5 inline-flex h-[1.1rem] min-w-[1.1rem] items-center justify-center rounded-md bg-accent-100 px-1 align-baseline text-[0.65rem] font-semibold leading-none text-accent-700 dark:bg-accent-700/25 dark:text-accent-300";

/** The small [1] marker inside an answer. */
export function CitationBadge({ n, source, onOpen }: Props) {
  const label = source ? `${source.title}, page ${source.page}` : `Source ${n}`;

  if (!onOpen) {
    return (
      <sup title={label} className={look}>
        {n}
      </sup>
    );
  }

  return (
    <sup className="align-baseline">
      <button
        type="button"
        onClick={() => onOpen(n)}
        title={`${label}. Click to show the passage.`}
        aria-label={`Source ${n}: ${label}. Show passage.`}
        className={`${look} cursor-pointer transition hover:bg-accent-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 dark:hover:bg-accent-700/50`}
      >
        {n}
      </button>
    </sup>
  );
}
