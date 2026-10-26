import type { DocumentStatus } from "../types";

const statuses: Record<
  DocumentStatus,
  { label: string; hint: string; badge: string; dot: string }
> = {
  pending: {
    label: "Uploaded",
    hint: "Uploaded and waiting to be processed",
    badge: "bg-brand-100 text-brand-700 dark:bg-brand-800 dark:text-brand-200",
    dot: "bg-brand-500",
  },
  processing: {
    label: "Processing",
    hint: "Reading and indexing the document",
    badge: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300",
    dot: "bg-amber-500 animate-pulse",
  },
  ready: {
    label: "Ready",
    hint: "Ready for questions",
    badge: "bg-accent-100 text-accent-700 dark:bg-accent-700/25 dark:text-accent-200",
    dot: "bg-accent-600",
  },
  failed: {
    label: "Failed",
    hint: "Processing failed",
    badge: "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300",
    dot: "bg-red-500",
  },
};

export function StatusBadge({ status }: { status: DocumentStatus }) {
  const { label, hint, badge, dot } = statuses[status];
  return (
    <span
      title={hint}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${badge}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}
