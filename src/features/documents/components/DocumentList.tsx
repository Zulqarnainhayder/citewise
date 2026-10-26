import { Alert } from "@/components/ui/Alert";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import type { DocumentRow } from "../types";
import { DocumentItem } from "./DocumentItem";

type Props = {
  documents: DocumentRow[];
  loading: boolean;
  error: string | null;
  uploading: boolean;
  /** The active search text, used for the "no matches" message. */
  query: string;
  onDelete: (doc: DocumentRow) => void;
};

export function DocumentList({ documents, loading, error, uploading, query, onDelete }: Props) {
  if (loading) {
    return (
      <Card className="flex items-center justify-center gap-2 py-12 text-sm text-brand-600 dark:text-brand-300">
        <Spinner /> Loading your documents…
      </Card>
    );
  }

  if (error) {
    return <Alert variant="error">Could not load your documents: {error}</Alert>;
  }

  if (documents.length === 0) {
    if (uploading) return null;
    return (
      <Card className="px-6 py-12 text-center">
        <p className="font-semibold text-brand-900 dark:text-white">
          {query ? "No matching documents" : "No documents yet"}
        </p>
        <p className="mt-1 text-sm text-brand-600 dark:text-brand-300">
          {query
            ? `Nothing in your library matches "${query}".`
            : "Upload your first PDF above to get started."}
        </p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div
        aria-hidden="true"
        className="hidden grid-cols-[1fr_8rem_9rem_2.5rem] gap-4 border-b border-brand-200 bg-brand-50 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-brand-600 sm:grid dark:border-brand-800 dark:bg-brand-950/60 dark:text-brand-300"
      >
        <span>Name</span>
        <span>Added</span>
        <span>Status</span>
        <span />
      </div>
      <ul className="divide-y divide-brand-200 dark:divide-brand-800">
        {documents.map((doc) => (
          <DocumentItem key={doc.id} doc={doc} onDelete={onDelete} />
        ))}
      </ul>
    </Card>
  );
}
