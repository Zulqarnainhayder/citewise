"use client";

import { useActionState, useState } from "react";
import { MailIcon } from "@/components/icons";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { signIn, signUp, type AuthState } from "../actions";
import { AuthTabs, type AuthMode } from "./AuthTabs";
import { PasswordField } from "./PasswordField";
import { TextField } from "./TextField";

export function AuthForm() {
  const [mode, setMode] = useState<AuthMode>("signin");
  const [password, setPassword] = useState("");
  const isSignIn = mode === "signin";

  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    isSignIn ? signIn : signUp,
    {},
  );

  return (
    <>
      <h1 className="text-3xl font-semibold tracking-tight text-brand-900 dark:text-white">
        {isSignIn ? "Welcome back" : "Create your account"}
      </h1>
      <p className="mt-2 text-sm text-brand-600 dark:text-brand-300">
        {isSignIn
          ? "Sign in to continue to your documents."
          : "Start chatting with your documents in minutes."}
      </p>

      <div className="mt-8">
        <AuthTabs mode={mode} onChange={setMode} />
      </div>

      <form action={formAction} className="mt-6 space-y-4">
        <TextField
          label="Email"
          name="email"
          type="email"
          icon={<MailIcon className="h-[18px] w-[18px]" />}
          required
          autoComplete="email"
          placeholder="you@example.com"
        />
        <PasswordField isSignIn={isSignIn} value={password} onChange={setPassword} />

        {state.error && <Alert variant="error">{state.error}</Alert>}
        {state.message && <Alert variant="success">{state.message}</Alert>}

        <Button type="submit" loading={pending} fullWidth>
          {pending ? "Please wait…" : isSignIn ? "Sign in" : "Create account"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-brand-600 dark:text-brand-300">
        {isSignIn ? "New to CiteWise?" : "Already have an account?"}{" "}
        <button
          type="button"
          onClick={() => setMode(isSignIn ? "signup" : "signin")}
          className="font-medium text-accent-700 hover:underline dark:text-accent-400"
        >
          {isSignIn ? "Create an account" : "Sign in"}
        </button>
      </p>
    </>
  );
}
