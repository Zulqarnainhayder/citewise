"use client";

import { useCallback, useMemo, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { SearchInput } from "@/components/ui/SearchInput";
import { useDocuments } from "../hooks/useDocuments";
import { useProcessing } from "../hooks/useProcessing";
import { useUploader } from "../hooks/useUploader";
import type { DocumentRow } from "../types";
import { DocumentList } from "./DocumentList";
import { DocumentStats } from "./DocumentStats";
import { Dropzone } from "./Dropzone";
import { UploadQueue } from "./UploadQueue";

export function DocumentsPanel() {
  const { documents, loading, error, add, update, remove } = useDocuments();
  const { process, error: processError } = useProcessing(update);

  // Every new upload is processed straight away.
  const handleUploaded = useCallback(
    (doc: DocumentRow) => {
      add(doc);
      void process(doc);
    },
    [add, process],
  );
  const { uploads, notice, upload, dismiss } = useUploader(handleUploaded);
  const [query, setQuery] = useState("");
  const [pendingDelete, setPendingDelete] = useState<DocumentRow | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const requestDelete = useCallback((doc: DocumentRow) => {
    setDeleteError(null);
    setPendingDelete(doc);
  }, []);

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    const message = await remove(pendingDelete);
    if (message) {
      setDeleteError(`Could not delete "${pendingDelete.title}": ${message}`);
    }
    setDeleting(false);
    setPendingDelete(null);
  }

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return needle
      ? documents.filter((d) => d.title.toLowerCase().includes(needle))
      : documents;
  }, [documents, query]);

  const message = notice ?? deleteError ?? processError;
  const uploading = uploads.some((u) => u.state === "uploading");

  return (
    <div className="space-y-6">
      {!loading && !error && <DocumentStats documents={documents} />}

      <div className="space-y-3">
        <Dropzone onFiles={upload} compact={documents.length > 0} />
        {message && <Alert variant="warning">{message}</Alert>}
        <UploadQueue uploads={uploads} onDismiss={dismiss} />
      </div>

      <section aria-labelledby="documents-heading">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-baseline gap-2">
            <h2
              id="documents-heading"
              className="text-lg font-semibold text-brand-900 dark:text-white"
            >
              Your library
            </h2>
            {!loading && !error && documents.length > 0 && (
              <span className="text-sm text-brand-600 dark:text-brand-300">
                {visible.length === documents.length
                  ? documents.length
                  : `${visible.length} of ${documents.length}`}
              </span>
            )}
          </div>
          {documents.length > 0 && (
            <SearchInput
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search documents"
              aria-label="Search documents"
              className="w-full sm:w-64"
            />
          )}
        </div>
        <DocumentList
          documents={visible}
          query={query.trim()}
          loading={loading}
          error={error}
          uploading={uploading}
          onDelete={requestDelete}
          onProcess={process}
        />
      </section>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete this document?"
        description={
          <>
            <strong className="font-semibold text-brand-900 dark:text-white">
              {pendingDelete?.title}
            </strong>{" "}
            and everything extracted from it will be permanently removed. This
            cannot be undone.
          </>
        }
        confirmLabel="Delete document"
        loadingLabel="Deleting…"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
