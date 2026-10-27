"use client";

import { CheckIcon } from "@/components/icons";
import type { DocumentRow } from "@/features/documents/types";
import { WorkspaceSelect } from "@/features/workspaces/components/WorkspaceSelect";
import type { WorkspaceRow } from "@/features/workspaces/types";

type Props = {
  documents: DocumentRow[];
  selected: string[];
  onToggle: (id: string) => void;
  onSelectAll: () => void;
  workspaces: WorkspaceRow[];
  workspaceId: string | null;
  onWorkspaceChange: (workspaceId: string | null) => void;
};

/** The documents the chat reads, as toggles. Sits at the top of the composer. */
export function ScopeChips({
  documents,
  selected,
  onToggle,
  onSelectAll,
  workspaces,
  workspaceId,
  onWorkspaceChange,
}: Props) {
  const allSelected = selected.length === documents.length;

  return (
    <div className="flex max-h-24 flex-wrap items-center gap-1.5 overflow-y-auto px-4 pt-3">
      {workspaces.length > 0 && (
        <WorkspaceSelect
          workspaces={workspaces}
          value={workspaceId}
          label="Workspace to search"
          onChange={onWorkspaceChange}
          allLabel="All documents"
          className="mr-1.5 py-[3px]"
        />
      )}
      <span className="mr-0.5 text-xs font-medium text-brand-500 dark:text-brand-400">
        {allSelected ? "Searching in" : `Searching in ${selected.length} of ${documents.length}`}
      </span>

      {documents.map((doc) => {
        const on = selected.includes(doc.id);
        return (
          <button
            key={doc.id}
            type="button"
            aria-pressed={on}
            onClick={() => onToggle(doc.id)}
            title={on ? `Searching in ${doc.title}. Click to exclude.` : `Not searched. Click to include ${doc.title}.`}
            className={`inline-flex max-w-[12rem] items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 ${
              on
                ? "border-accent-600/30 bg-accent-50 text-accent-700 dark:border-accent-400/30 dark:bg-accent-700/20 dark:text-accent-200"
                : "border-brand-200 bg-transparent text-brand-500 line-through hover:text-brand-700 dark:border-brand-700 dark:text-brand-400"
            }`}
          >
            {on && <CheckIcon className="h-3 w-3 shrink-0" />}
            <span className="truncate">{doc.title}</span>
          </button>
        );
      })}

      {!allSelected && (
        <button
          type="button"
          onClick={onSelectAll}
          className="text-xs font-medium text-accent-700 underline underline-offset-2 dark:text-accent-400"
        >
          Select all
        </button>
      )}
    </div>
  );
}
