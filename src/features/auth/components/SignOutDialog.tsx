"use client";

import { useTransition } from "react";
import { LogOutIcon } from "@/components/icons";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { signOut } from "../actions";

type Props = { open: boolean; onClose: () => void };

/** Asks for confirmation, then signs out. */
export function SignOutDialog({ open, onClose }: Props) {
  const [pending, startTransition] = useTransition();

  return (
    <ConfirmDialog
      open={open}
      tone="primary"
      icon={<LogOutIcon className="h-5 w-5" />}
      title="Sign out of CiteWise?"
      description="You will need to sign in again to see your documents."
      confirmLabel="Sign out"
      loadingLabel="Signing out…"
      loading={pending}
      onConfirm={() =>
        startTransition(async () => {
          await signOut();
        })
      }
      onCancel={onClose}
    />
  );
}
