"use client";

import { useMemo, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Spinner } from "@/components/ui/Spinner";
import { useDocuments } from "@/features/documents/hooks/useDocuments";
import { useWorkspaces } from "../hooks/useWorkspaces";
import type { WorkspaceRow } from "../types";
import { WorkspaceCard } from "./WorkspaceCard";
import { WorkspaceForm } from "./WorkspaceForm";

export function WorkspacesPanel() {
  const { workspaces, loading, error, create, rename, remove } = useWorkspaces();
  const { documents } = useDocuments();
  const [pendingDelete, setPendingDelete] = useState<WorkspaceRow | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const byWorkspace = useMemo(() => {
    const map = new Map<string, typeof documents>();
    for (const doc of documents) {
      if (!doc.workspace_id) continue;
      map.set(doc.workspace_id, [...(map.get(doc.workspace_id) ?? []), doc]);
    }
    return map;
  }, [documents]);

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    const message = await remove(pendingDelete.id);
    setDeleteError(message ? `Could not delete "${pendingDelete.name}": ${message}` : null);
    setDeleting(false);
    setPendingDelete(null);
  }

  return (
    <div className="space-y-6">
      <WorkspaceForm onCreate={create} />
      {(error || deleteError) && <Alert variant="warning">{error ?? deleteError}</Alert>}

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-brand-600 dark:text-brand-300">
          <Spinner /> Loading workspaces…
        </div>
      ) : workspaces.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-brand-300 px-6 py-12 text-center dark:border-brand-700">
          <p className="font-serif text-lg font-semibold text-brand-900 dark:text-white">No workspaces yet</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-brand-600 dark:text-brand-300">
            A workspace groups documents that belong together, such as one project or one client. Create one
            above, then file documents into it from the Documents page.
          </p>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {workspaces.map((w) => (
            <li key={w.id} className="flex [&>*]:w-full">
              <WorkspaceCard
                workspace={w}
                documents={byWorkspace.get(w.id) ?? []}
                onRename={rename}
                onDelete={setPendingDelete}
              />
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete this workspace?"
        description={
          <>
            <strong className="font-semibold text-brand-900 dark:text-white">{pendingDelete?.name}</strong> will be
            removed. The documents inside it are kept and become unfiled.
          </>
        }
        confirmLabel="Delete workspace"
        loadingLabel="Deleting…"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
