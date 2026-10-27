"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { DOCUMENTS_BUCKET } from "@/features/documents/constants";
import { useSupabase } from "@/lib/supabase/useSupabase";
import { SettingsSection } from "./SettingsSection";

type Kind = "chats" | "documents";

const copy: Record<Kind, { button: string; title: string; description: string }> = {
  chats: {
    button: "Delete all chats",
    title: "Delete all chats?",
    description: "Every saved conversation and its answers will be permanently removed. Your documents are kept.",
  },
  documents: {
    button: "Delete all documents",
    title: "Delete all documents?",
    description:
      "Every uploaded PDF and everything extracted from it will be permanently removed. Your chats are kept, but their citations will no longer open.",
  },
};

/** Bulk deletes. Everything runs as the signed-in user, so only their own data can be touched. */
export function DataSection({ documents, chats }: { documents: number; chats: number }) {
  const supabase = useSupabase();
  const router = useRouter();
  const [pending, setPending] = useState<Kind | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);

  async function deleteAll(kind: Kind): Promise<string | null> {
    if (kind === "chats") {
      const { error } = await supabase.from("chats").delete().not("id", "is", null);
      return error?.message ?? null;
    }
    const { data, error: listError } = await supabase.from("documents").select("storage_path");
    if (listError) return listError.message;
    const { error } = await supabase.from("documents").delete().not("id", "is", null);
    if (error) return error.message;
    const paths = (data ?? []).map((d) => d.storage_path as string);
    if (paths.length > 0) await supabase.storage.from(DOCUMENTS_BUCKET).remove(paths);
    return null;
  }

  async function confirm() {
    if (!pending) return;
    setBusy(true);
    const message = await deleteAll(pending);
    setBusy(false);
    setResult(
      message
        ? { ok: false, text: `Could not delete: ${message}` }
        : { ok: true, text: pending === "chats" ? "All chats were deleted." : "All documents were deleted." },
    );
    setPending(null);
    router.refresh();
  }

  const rows: { kind: Kind; count: number; noun: string }[] = [
    { kind: "chats", count: chats, noun: chats === 1 ? "chat" : "chats" },
    { kind: "documents", count: documents, noun: documents === 1 ? "document" : "documents" },
  ];

  return (
    <SettingsSection title="Your data" description="Remove what CiteWise has stored for you. This cannot be undone.">
      {result && (
        <div className="mb-4">
          <Alert variant={result.ok ? "success" : "error"}>{result.text}</Alert>
        </div>
      )}
      <ul className="divide-y divide-brand-100 dark:divide-brand-800">
        {rows.map(({ kind, count, noun }) => (
          <li key={kind} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
            <p className="text-sm text-brand-700 dark:text-brand-200">
              <span className="font-semibold tabular-nums text-brand-900 dark:text-white">{count}</span> {noun} stored
            </p>
            <Button
              variant="secondary"
              size="sm"
              disabled={count === 0}
              onClick={() => {
                setResult(null);
                setPending(kind);
              }}
            >
              {copy[kind].button}
            </Button>
          </li>
        ))}
      </ul>

      <ConfirmDialog
        open={pending !== null}
        title={pending ? copy[pending].title : ""}
        description={pending ? copy[pending].description : ""}
        confirmLabel="Delete"
        loadingLabel="Deleting…"
        loading={busy}
        onConfirm={confirm}
        onCancel={() => setPending(null)}
      />
    </SettingsSection>
  );
}
