"use client";

import { useState, type FormEvent } from "react";
import { PlusIcon } from "@/components/icons";
import { Button } from "@/components/ui/Button";
import { MAX_WORKSPACE_NAME } from "../utils";

/** One line to create a workspace. */
export function WorkspaceForm({ onCreate }: { onCreate: (name: string) => Promise<string | null> }) {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    const message = await onCreate(name);
    setBusy(false);
    setError(message);
    if (!message) setName("");
  }

  return (
    <form onSubmit={submit} className="space-y-2">
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={MAX_WORKSPACE_NAME + 20}
          placeholder="New workspace, for example “Tax 2025”"
          aria-label="Workspace name"
          aria-invalid={error ? true : undefined}
          className="min-w-0 flex-1 rounded-lg border border-brand-200 bg-white px-3.5 py-2.5 text-sm text-brand-900 outline-none transition placeholder:text-brand-500 focus:border-accent-600 focus:ring-4 focus:ring-accent-600/15 dark:border-brand-700 dark:bg-brand-900 dark:text-white dark:placeholder:text-brand-400"
        />
        <Button type="submit" loading={busy}>
          <PlusIcon className="h-4 w-4" />
          Create workspace
        </Button>
      </div>
      {error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-300">
          {error}
        </p>
      )}
    </form>
  );
}
