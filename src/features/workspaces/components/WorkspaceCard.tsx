"use client";

import Link from "next/link";
import { memo, useState, type FormEvent } from "react";
import { ChatIcon, CheckIcon, CloseIcon, LayersIcon, TrashIcon } from "@/components/icons";
import { Card } from "@/components/ui/Card";
import type { DocumentRow } from "@/features/documents/types";
import type { WorkspaceRow } from "../types";
import { MAX_WORKSPACE_NAME } from "../utils";

type Props = {
  workspace: WorkspaceRow;
  documents: DocumentRow[];
  onRename: (id: string, name: string) => Promise<string | null>;
  onDelete: (workspace: WorkspaceRow) => void;
};

const action =
  "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-600";

export const WorkspaceCard = memo(function WorkspaceCard({ workspace, documents, onRename, onDelete }: Props) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(workspace.name);
  const [error, setError] = useState<string | null>(null);

  const ready = documents.filter((d) => d.status === "ready").length;

  async function save(e: FormEvent) {
    e.preventDefault();
    const message = await onRename(workspace.id, name);
    setError(message);
    if (!message) setEditing(false);
  }

  function cancel() {
    setName(workspace.name);
    setError(null);
    setEditing(false);
  }

  return (
    <Card className="flex flex-col gap-4 p-5" data-testid="workspace-card">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-50 text-accent-700 ring-1 ring-accent-100 dark:bg-accent-700/20 dark:text-accent-300 dark:ring-accent-700/30">
          <LayersIcon className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          {editing ? (
            <form onSubmit={save} className="space-y-1">
              <div className="flex items-center gap-1">
                <input
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={MAX_WORKSPACE_NAME + 20}
                  aria-label="Workspace name"
                  className="min-w-0 flex-1 rounded-md border border-brand-300 bg-white px-2 py-1 text-sm font-semibold text-brand-900 outline-none focus:border-accent-600 focus:ring-2 focus:ring-accent-600/20 dark:border-brand-600 dark:bg-brand-900 dark:text-white"
                />
                <button type="submit" aria-label="Save name" className={`${action} text-accent-700 hover:bg-accent-50 dark:text-accent-300 dark:hover:bg-accent-700/20`}>
                  <CheckIcon className="h-4 w-4" />
                </button>
                <button type="button" onClick={cancel} aria-label="Cancel renaming" className={`${action} text-brand-500 hover:bg-brand-100 dark:hover:bg-brand-800`}>
                  <CloseIcon className="h-4 w-4" />
                </button>
              </div>
              {error && (
                <p role="alert" className="text-xs text-red-600 dark:text-red-300">
                  {error}
                </p>
              )}
            </form>
          ) : (
            <h3 className="truncate text-base font-semibold text-brand-900 dark:text-white" title={workspace.name}>
              {workspace.name}
            </h3>
          )}
          <p className="mt-0.5 text-xs text-brand-600 dark:text-brand-300">
            {documents.length} {documents.length === 1 ? "document" : "documents"}
            {documents.length > 0 && ` · ${ready} ready`}
          </p>
        </div>
      </div>

      {documents.length > 0 ? (
        <ul className="space-y-1 text-sm text-brand-700 dark:text-brand-200">
          {documents.slice(0, 4).map((d) => (
            <li key={d.id} className="truncate">
              {d.title}
            </li>
          ))}
          {documents.length > 4 && (
            <li className="text-xs text-brand-500 dark:text-brand-400">+{documents.length - 4} more</li>
          )}
        </ul>
      ) : (
        <p className="text-sm text-brand-600 dark:text-brand-300">
          Empty. Put documents here from the Documents page.
        </p>
      )}

      <div className="mt-auto flex flex-wrap items-center gap-1 border-t border-brand-100 pt-3 dark:border-brand-800">
        {ready > 0 ? (
          <Link
            href={`/chat?workspace=${workspace.id}`}
            className={`${action} bg-accent-700 text-white hover:bg-accent-600`}
          >
            <ChatIcon className="h-3.5 w-3.5" />
            Chat with workspace
          </Link>
        ) : (
          <span className={`${action} cursor-not-allowed bg-brand-100 text-brand-400 dark:bg-brand-800 dark:text-brand-500`}>
            <ChatIcon className="h-3.5 w-3.5" />
            Chat with workspace
          </span>
        )}
        <button type="button" onClick={() => setEditing(true)} className={`${action} text-brand-700 hover:bg-brand-100 dark:text-brand-200 dark:hover:bg-brand-800`}>
          Rename
        </button>
        <button
          type="button"
          onClick={() => onDelete(workspace)}
          aria-label={`Delete workspace ${workspace.name}`}
          className={`${action} ml-auto text-brand-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-300`}
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      </div>
    </Card>
  );
});
