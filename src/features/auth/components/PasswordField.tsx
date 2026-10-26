"use client";

import { useState } from "react";
import { LockIcon } from "@/components/icons";
import { PasswordStrength } from "./PasswordStrength";
import { TextField } from "./TextField";

type Props = {
  isSignIn: boolean;
  value: string;
  onChange: (value: string) => void;
};

export function PasswordField({ isSignIn, value, onChange }: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <TextField
      label="Password"
      name="password"
      icon={<LockIcon className="h-[18px] w-[18px]" />}
      type={visible ? "text" : "password"}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required
      minLength={6}
      autoComplete={isSignIn ? "current-password" : "new-password"}
      placeholder={isSignIn ? "Your password" : "At least 6 characters"}
      trailing={
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs font-medium text-brand-600 hover:text-brand-900 dark:text-brand-300 dark:hover:text-white"
        >
          {visible ? "Hide" : "Show"}
        </button>
      }
      footer={!isSignIn && <PasswordStrength password={value} />}
    />
  );
}
