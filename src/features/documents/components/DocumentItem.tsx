"use client";

import { memo } from "react";
import { FileTextIcon, TrashIcon } from "@/components/icons";
import type { DocumentRow } from "../types";
import { formatDate } from "../utils";
import { StatusBadge } from "./StatusBadge";

type Props = {
  doc: DocumentRow;
  /** Asks the parent to confirm and delete this document. */
  onDelete: (doc: DocumentRow) => void;
};

export const DocumentItem = memo(function DocumentItem({ doc, onDelete }: Props) {
  return (
    <li className="grid grid-cols-[1fr_auto_2.25rem] items-center gap-3 px-4 py-3.5 transition-colors hover:bg-brand-50 dark:hover:bg-brand-800/40 sm:grid-cols-[1fr_8rem_9rem_2.5rem] sm:gap-4 sm:px-5">
      <div className="flex min-w-0 items-center gap-3.5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600 ring-1 ring-red-100 dark:bg-red-950/40 dark:text-red-300 dark:ring-red-900/50">
          <FileTextIcon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-brand-900 dark:text-white">
            {doc.title}
          </p>
          <p className="text-xs text-brand-600 sm:hidden dark:text-brand-300">
            {formatDate(doc.created_at)}
          </p>
          <p className="hidden text-xs text-brand-600 sm:block dark:text-brand-300">PDF document</p>
        </div>
      </div>

      <span className="hidden text-sm text-brand-700 sm:block dark:text-brand-200">
        {formatDate(doc.created_at)}
      </span>

      <div>
        <StatusBadge status={doc.status} />
      </div>

      <button
        type="button"
        onClick={() => onDelete(doc)}
        aria-label={`Delete ${doc.title}`}
        title="Delete"
        className="shrink-0 justify-self-end rounded-lg p-2 text-brand-500 transition hover:bg-red-50 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 dark:text-brand-300 dark:hover:bg-red-950/40 dark:hover:text-red-300"
      >
        <TrashIcon className="h-[18px] w-[18px]" />
      </button>
    </li>
  );
});
