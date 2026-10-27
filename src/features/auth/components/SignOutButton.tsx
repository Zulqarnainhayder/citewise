"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { SignOutDialog } from "./SignOutDialog";

type Props = {
  size?: "sm" | "md";
  fullWidth?: boolean;
};

/** Sign out button that asks for confirmation first. */
export function SignOutButton({ size = "sm", fullWidth }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="secondary" size={size} fullWidth={fullWidth} onClick={() => setOpen(true)}>
        Sign out
      </Button>
      <SignOutDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
}
