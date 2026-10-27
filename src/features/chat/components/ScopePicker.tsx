"use client";

import type { DocumentRow } from "@/features/documents/types";

type Props = {
  documents: DocumentRow[];
  value: string;
  onChange: (value: string) => void;
};

export const ALL_DOCUMENTS = "all";

/** Choose whether to search every ready document or just one. */
export function ScopePicker({ documents, value, onChange }: Props) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="hidden text-brand-600 sm:inline dark:text-brand-300">Searching in</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Documents to search"
        className="max-w-[14rem] truncate rounded-lg border border-brand-200 bg-white py-2 pl-3 pr-8 text-sm font-medium text-brand-900 outline-none transition focus:border-accent-600 focus:ring-4 focus:ring-accent-600/15 sm:max-w-xs dark:border-brand-700 dark:bg-brand-900 dark:text-white dark:focus:border-accent-400 dark:focus:ring-accent-400/20"
      >
        <option value={ALL_DOCUMENTS}>All documents ({documents.length})</option>
        {documents.map((doc) => (
          <option key={doc.id} value={doc.id}>
            {doc.title}
          </option>
        ))}
      </select>
    </label>
  );
}
