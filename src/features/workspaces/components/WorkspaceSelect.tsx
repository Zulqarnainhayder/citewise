"use client";

import { memo } from "react";
import type { WorkspaceRow } from "../types";

type Props = {
  workspaces: WorkspaceRow[];
  value: string | null;
  label: string;
  onChange: (workspaceId: string | null) => void;
  /** Text for the "none" option. */
  allLabel?: string;
  className?: string;
};

/** A compact picker for the workspace a document belongs to. */
export const WorkspaceSelect = memo(function WorkspaceSelect({
  workspaces,
  value,
  label,
  onChange,
  allLabel = "No workspace",
  className = "",
}: Props) {
  return (
    <select
      aria-label={label}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value || null)}
      className={`max-w-full rounded-md border border-brand-200 bg-white px-1.5 py-0.5 text-xs text-brand-700 outline-none transition focus:border-accent-600 focus:ring-2 focus:ring-accent-600/20 dark:border-brand-700 dark:bg-brand-900 dark:text-brand-200 ${className}`}
    >
      <option value="">{allLabel}</option>
      {workspaces.map((w) => (
        <option key={w.id} value={w.id}>
          {w.name}
        </option>
      ))}
    </select>
  );
});
