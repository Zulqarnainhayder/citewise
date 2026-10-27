"use client";

import { useId, type ReactNode } from "react";
import { TrashIcon } from "@/components/icons";
import { Button } from "./Button";
import { Modal } from "./Modal";

type Tone = "danger" | "primary";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: ReactNode;
  /** Red for destructive actions, green for everything else. */
  tone?: Tone;
  icon?: ReactNode;
  confirmLabel?: string;
  loadingLabel?: string;
  cancelLabel?: string;
  /** Spinner on the confirm button; closing is blocked while true. */
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

const iconTones: Record<Tone, string> = {
  danger: "bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-300",
  primary: "bg-accent-100 text-accent-700 dark:bg-accent-700/25 dark:text-accent-300",
};

/** Confirmation for destructive or hard-to-undo actions. */
export function ConfirmDialog({
  open,
  title,
  description,
  tone = "danger",
  icon = <TrashIcon className="h-5 w-5" />,
  confirmLabel = "Confirm",
  loadingLabel = "Working…",
  cancelLabel = "Cancel",
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const titleId = useId();
  const descriptionId = useId();

  return (
    <Modal
      open={open}
      onClose={() => !loading && onCancel()}
      labelledBy={titleId}
      describedBy={descriptionId}
    >
      <div className="p-6">
        <div className="flex items-start gap-4">
          <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${iconTones[tone]}`}>
            {icon}
          </span>
          <div className="min-w-0">
            <h2 id={titleId} className="text-lg font-semibold">
              {title}
            </h2>
            <p id={descriptionId} className="mt-1.5 text-sm leading-relaxed text-brand-600 dark:text-brand-300">
              {description}
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onCancel} disabled={loading} autoFocus>
            {cancelLabel}
          </Button>
          <Button variant={tone === "danger" ? "danger" : "primary"} onClick={onConfirm} loading={loading}>
            {loading ? loadingLabel : confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
