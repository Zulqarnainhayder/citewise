"use client";

import { useState, useTransition } from "react";
import { LogOutIcon } from "@/components/icons";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { signOut } from "../actions";

type Props = {
  size?: "sm" | "md";
  fullWidth?: boolean;
};

/** Sign out button that asks for confirmation first. */
export function SignOutButton({ size = "sm", fullWidth }: Props) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <>
      <Button variant="secondary" size={size} fullWidth={fullWidth} onClick={() => setOpen(true)}>
        Sign out
      </Button>
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
        onCancel={() => setOpen(false)}
      />
    </>
  );
}
