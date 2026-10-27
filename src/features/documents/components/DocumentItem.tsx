"use client";

import { memo } from "react";
import { FileTextIcon, RefreshIcon, TrashIcon } from "@/components/icons";
import { WorkspaceSelect } from "@/features/workspaces/components/WorkspaceSelect";
import type { WorkspaceRow } from "@/features/workspaces/types";
import type { DocumentRow } from "../types";
import { formatDate } from "../utils";
import { StatusBadge } from "./StatusBadge";

type Props = {
  doc: DocumentRow;
  /** Asks the parent to confirm and delete this document. */
  onDelete: (doc: DocumentRow) => void;
  onProcess: (doc: DocumentRow) => void;
  workspaces: WorkspaceRow[];
  onMove: (doc: DocumentRow, workspaceId: string | null) => void;
};

const iconButton =
  "rounded-lg p-2 text-brand-500 transition focus:outline-none focus-visible:ring-2 dark:text-brand-300";

function pageLabel(count: number | null) {
  if (!count) return "PDF document";
  return `${count} ${count === 1 ? "page" : "pages"}`;
}

export const DocumentItem = memo(function DocumentItem({ doc, onDelete, onProcess, workspaces, onMove }: Props) {
  const canProcess = doc.status === "pending" || doc.status === "failed";

  return (
    <li className="grid grid-cols-[1fr_auto_auto] items-center gap-3 px-4 py-3.5 transition-colors hover:bg-brand-50 dark:hover:bg-brand-800/40 sm:grid-cols-[1fr_8rem_9rem_5.5rem] sm:gap-4 sm:px-5">
      <div className="flex min-w-0 items-center gap-3.5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600 ring-1 ring-red-100 dark:bg-red-950/40 dark:text-red-300 dark:ring-red-900/50">
          <FileTextIcon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-brand-900 dark:text-white">
            {doc.title}
          </p>
          <p className="text-xs text-brand-600 dark:text-brand-300">
            <span className="sm:hidden">{formatDate(doc.created_at)} · </span>
            {pageLabel(doc.page_count)}
          </p>
          {workspaces.length > 0 && (
            <WorkspaceSelect
              workspaces={workspaces}
              value={doc.workspace_id}
              label={`Workspace for ${doc.title}`}
              onChange={(id) => onMove(doc, id)}
              className="mt-1.5"
            />
          )}
        </div>
      </div>

      <span className="hidden text-sm text-brand-700 sm:block dark:text-brand-200">
        {formatDate(doc.created_at)}
      </span>

      <div>
        <StatusBadge status={doc.status} />
      </div>

      <div className="flex items-center justify-end gap-0.5">
        {canProcess && (
          <button
            type="button"
            onClick={() => onProcess(doc)}
            aria-label={`${doc.status === "failed" ? "Try again" : "Process"}: ${doc.title}`}
            title={doc.status === "failed" ? "Try again" : "Process now"}
            className={`${iconButton} hover:bg-accent-50 hover:text-accent-700 focus-visible:ring-accent-600 dark:hover:bg-accent-700/20 dark:hover:text-accent-300`}
          >
            <RefreshIcon className="h-[18px] w-[18px]" />
          </button>
        )}
        <button
          type="button"
          onClick={() => onDelete(doc)}
          aria-label={`Delete ${doc.title}`}
          title="Delete"
          className={`${iconButton} hover:bg-red-50 hover:text-red-600 focus-visible:ring-red-500 dark:hover:bg-red-950/40 dark:hover:text-red-300`}
        >
          <TrashIcon className="h-[18px] w-[18px]" />
        </button>
      </div>
    </li>
  );
});
