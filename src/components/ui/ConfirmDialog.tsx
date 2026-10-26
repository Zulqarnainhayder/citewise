"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { TrashIcon } from "@/components/icons";
import { Button } from "./Button";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Spinner on the confirm button; closing is blocked while true. */
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

/** Modal confirmation for destructive actions, built on the native <dialog>. */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const requestClose = () => {
    if (!loading) onCancel();
  };

  return (
    <dialog
      ref={ref}
      aria-labelledby="confirm-title"
      aria-describedby="confirm-description"
      onCancel={(e) => {
        // Escape key: let state close it instead of the browser.
        e.preventDefault();
        requestClose();
      }}
      onClick={(e) => {
        // A click on the backdrop targets the dialog element itself.
        if (e.target === e.currentTarget) requestClose();
      }}
      className="citewise-dialog m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-brand-200 bg-white p-0 text-brand-900 shadow-2xl backdrop:bg-brand-950/60 backdrop:backdrop-blur-sm dark:border-brand-700 dark:bg-brand-900 dark:text-white"
    >
      <div className="p-6">
        <div className="flex items-start gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-300">
            <TrashIcon className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h2 id="confirm-title" className="text-lg font-semibold">
              {title}
            </h2>
            <p
              id="confirm-description"
              className="mt-1.5 text-sm leading-relaxed text-brand-600 dark:text-brand-300"
            >
              {description}
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            variant="secondary"
            onClick={requestClose}
            disabled={loading}
            autoFocus
          >
            {cancelLabel}
          </Button>
          <Button variant="danger" onClick={onConfirm} loading={loading}>
            {loading ? "Deleting…" : confirmLabel}
          </Button>
        </div>
      </div>
    </dialog>
  );
}
