"use client";

import { useEffect, useRef, type ReactNode } from "react";

type ModalProps = {
  open: boolean;
  /** Called for Escape and backdrop clicks; the parent decides whether to close. */
  onClose: () => void;
  labelledBy: string;
  describedBy?: string;
  children: ReactNode;
  className?: string;
};

/** Centered modal on the native <dialog>: focus trap, Escape and backdrop close. */
export function Modal({ open, onClose, labelledBy, describedBy, children, className = "max-w-md" }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      onCancel={(e) => {
        // Escape: let state close it instead of the browser.
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        // A click on the backdrop targets the dialog element itself.
        if (e.target === e.currentTarget) onClose();
      }}
      className={`citewise-dialog m-auto w-[calc(100%-2rem)] rounded-2xl border border-brand-200 bg-white p-0 text-brand-900 shadow-2xl backdrop:bg-brand-950/60 backdrop:backdrop-blur-sm dark:border-brand-700 dark:bg-brand-900 dark:text-white ${className}`}
    >
      {children}
    </dialog>
  );
}
