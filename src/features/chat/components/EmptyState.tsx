import Link from "next/link";
import { SparklesIcon } from "@/components/icons";

const suggestions = [
  "Summarize the key points of this document",
  "What deadlines or dates are mentioned?",
  "What are the main obligations or risks?",
];

type Props = {
  hasReadyDocuments: boolean;
  loading: boolean;
  onPick: (question: string) => void;
};

export function EmptyState({ hasReadyDocuments, loading, onPick }: Props) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-10 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-100 text-accent-700 ring-1 ring-accent-200 dark:bg-accent-700/20 dark:text-accent-300 dark:ring-accent-700/40">
        <SparklesIcon className="h-7 w-7" />
      </span>

      {loading ? (
        <p className="mt-5 text-sm text-brand-600 dark:text-brand-300">Loading your documents…</p>
      ) : hasReadyDocuments ? (
        <>
          <h2 className="mt-5 text-xl font-semibold text-brand-900 dark:text-white">
            Ask anything about your documents
          </h2>
          <p className="mt-2 max-w-md text-sm text-brand-600 dark:text-brand-300">
            Every answer shows the exact pages it came from. You can ask in English or German.
          </p>
          <div className="mt-6 flex max-w-xl flex-wrap justify-center gap-2">
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onPick(s)}
                className="rounded-full border border-brand-200 bg-white px-3.5 py-2 text-sm text-brand-700 transition hover:border-accent-600 hover:text-accent-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 dark:border-brand-700 dark:bg-brand-900 dark:text-brand-200 dark:hover:border-accent-400 dark:hover:text-accent-300"
              >
                {s}
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <h2 className="mt-5 text-xl font-semibold text-brand-900 dark:text-white">
            No documents are ready yet
          </h2>
          <p className="mt-2 max-w-md text-sm text-brand-600 dark:text-brand-300">
            Upload a PDF and wait for it to show <strong>Ready</strong>, then come back to ask
            questions about it.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex rounded-xl bg-accent-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-600 focus:outline-none focus-visible:ring-4 focus-visible:ring-accent-600/30"
          >
            Go to Documents
          </Link>
        </>
      )}
    </div>
  );
}
