"use client";

import { useActionState, useState } from "react";
import { Logo } from "@/components/Logo";
import { signIn, signUp, type AuthState } from "./actions";

type Mode = "signin" | "signup";

const inputClass =
  "w-full rounded-xl border border-zinc-200 bg-white/70 py-3 pl-11 pr-4 text-sm outline-none transition placeholder:text-zinc-500 dark:placeholder:text-zinc-400 focus:border-accent-600 focus:ring-4 focus:ring-accent-600/15 dark:border-zinc-800 dark:bg-zinc-900/60 dark:focus:border-accent-400 dark:focus:ring-accent-400/20";

const features = [
  {
    title: "Page-level citations",
    text: "Every answer links to the exact page it came from.",
    icon: (
      <>
        <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
        <path d="M14 3v5h5M9 13h6M9 17h4" />
      </>
    ),
  },
  {
    title: "Private to your account",
    text: "Your documents are only visible to you.",
    icon: (
      <>
        <rect x="4" y="11" width="16" height="10" rx="2" />
        <path d="M8 11V7a4 4 0 0 1 8 0v4" />
      </>
    ),
  },
  {
    title: "English & German",
    text: "Ask in one language, read the other.",
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3c3 3.2 3 14.8 0 18M12 3c-3 3.2-3 14.8 0 18" />
      </>
    ),
  },
];

function BrandPanel() {
  return (
    <aside className="relative hidden flex-1 overflow-hidden bg-gradient-to-br from-brand-950 to-brand-900 p-12 text-white lg:flex lg:flex-col lg:justify-between">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />

      <Logo className="relative" />

      <div className="relative max-w-lg">
        <h2 className="text-balance text-4xl font-semibold leading-tight tracking-tight xl:text-5xl">
          Chat with your documents.
          <span className="block text-accent-400">
            Every answer cites its page.
          </span>
        </h2>
        <p className="mt-5 text-base leading-relaxed text-brand-100">
          Upload your PDFs, ask questions in English or German, and jump
          straight to the passage behind every answer.
        </p>

        <div className="citewise-float mt-10 rounded-2xl border border-white/15 bg-white/10 p-5 shadow-2xl shadow-black/25 backdrop-blur-md">
          <p className="text-xs font-medium uppercase tracking-wider text-brand-200">
            You asked
          </p>
          <p className="mt-1 text-sm">What is the notice period for termination?</p>
          <div className="my-4 h-px bg-white/10" />
          <p className="text-sm leading-relaxed text-white">
            Either party may terminate the agreement with{" "}
            <span className="rounded bg-accent-400/30 px-1 font-medium text-accent-100">
              30 days&apos; written notice
            </span>
            .
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {["p. 14", "p. 15"].map((page) => (
              <span
                key={page}
                className="inline-flex items-center gap-1.5 rounded-full border border-accent-400/40 bg-accent-400/15 px-2.5 py-1 text-xs font-medium text-accent-100"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-accent-400" />
                contract.pdf · {page}
              </span>
            ))}
          </div>
        </div>
      </div>

      <ul className="relative grid max-w-2xl grid-cols-1 gap-4 xl:grid-cols-3">
        {features.map((f) => (
          <li key={f.title} className="flex flex-col gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-400/15 text-accent-300 ring-1 ring-accent-400/30">
              <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                {f.icon}
              </svg>
            </span>
            <span className="text-sm font-semibold">{f.title}</span>
            <span className="text-xs leading-relaxed text-brand-200">{f.text}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const strength = [
    password.length >= 8,
    /[A-Z]/.test(password) && /[a-z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    mode === "signin" ? signIn : signUp,
    {},
  );

  const isSignIn = mode === "signin";

  return (
    <div className="flex min-h-screen flex-1">
      <BrandPanel />

      <main className="relative flex flex-1 items-center justify-center overflow-hidden bg-brand-50 px-6 py-12 dark:bg-brand-950 lg:w-[36rem] lg:flex-none xl:w-[40rem]">

        <div className="citewise-fade-up relative w-full max-w-md rounded-2xl border border-brand-200 bg-white shadow-xl shadow-brand-900/5 dark:border-brand-800 dark:bg-brand-900/60">
         <div className="p-8 sm:p-10">
          <Logo className="mb-8 lg:hidden" />

          <h1 className="text-3xl font-semibold tracking-tight text-brand-900 dark:text-white">
            {isSignIn ? "Welcome back" : "Create your account"}
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            {isSignIn
              ? "Sign in to continue to your documents."
              : "Start chatting with your documents in minutes."}
          </p>

          <div className="mt-8 grid grid-cols-2 rounded-xl bg-zinc-100 p-1 text-sm font-medium dark:bg-zinc-900">
            {(["signin", "signup"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`rounded-lg py-2 transition ${
                  mode === m
                    ? "bg-white text-brand-900 shadow-sm dark:bg-brand-700 dark:text-white"
                    : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                }`}
              >
                {m === "signin" ? "Sign in" : "Sign up"}
              </button>
            ))}
          </div>

          <form action={formAction} className="mt-6 space-y-4">
            <label className="group block">
              <span className="mb-1.5 block text-sm font-medium">Email</span>
              <div className="relative">
                <svg viewBox="0 0 24 24" className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-zinc-400 transition-colors group-focus-within:text-accent-600" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="m3 7 9 6 9-6" />
                </svg>
                <input
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  className={inputClass}
                />
              </div>
            </label>

            <label className="group block">
              <span className="mb-1.5 block text-sm font-medium">Password</span>
              <div className="relative">
                <svg viewBox="0 0 24 24" className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-zinc-400 transition-colors group-focus-within:text-accent-600" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="4" y="11" width="16" height="10" rx="2" />
                  <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                </svg>
                <input
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  autoComplete={isSignIn ? "current-password" : "new-password"}
                  placeholder={isSignIn ? "Your password" : "At least 6 characters"}
                  className={`${inputClass} pr-16`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              {!isSignIn && password.length > 0 && (
                <div className="mt-2.5">
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4].map((i) => (
                      <span
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          i <= strength
                            ? ["bg-red-400", "bg-amber-400", "bg-lime-400", "bg-emerald-400"][strength - 1]
                            : "bg-zinc-200 dark:bg-zinc-800"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                    Password strength: {["Too weak", "Weak", "Okay", "Strong"][Math.max(strength - 1, 0)]}
                  </p>
                </div>
              )}
            </label>

            {state.error && (
              <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
                {state.error}
              </p>
            )}
            {state.message && (
              <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
                {state.message}
              </p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent-700 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-600 focus:outline-none focus:ring-4 focus:ring-accent-600/30 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending && (
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                  <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
              )}
              {pending ? "Please wait…" : isSignIn ? "Sign in" : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
            {isSignIn ? "New to CiteWise?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => setMode(isSignIn ? "signup" : "signin")}
              className="font-medium text-accent-700 hover:underline dark:text-accent-400"
            >
              {isSignIn ? "Create an account" : "Sign in"}
            </button>
          </p>

          <p className="mt-6 flex items-center justify-center gap-1.5 border-t border-zinc-200 pt-5 text-xs text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
            Your documents stay private to your account
          </p>
         </div>
        </div>
      </main>
    </div>
  );
}
