import { Suspense } from "react";
import { Logo } from "@/components/Logo";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "./login/actions";

async function UserSection() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const email = data?.claims?.email;

  return (
    <>
      <p className="text-brand-600 dark:text-brand-300">
        Signed in as {email}
      </p>
      <form action={signOut}>
        <button className="rounded-xl bg-accent-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-600">
          Sign out
        </button>
      </form>
    </>
  );
}

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-5">
      <Logo size={56} />
      <Suspense
        fallback={<p className="text-brand-600 dark:text-brand-300">Loading…</p>}
      >
        <UserSection />
      </Suspense>
    </main>
  );
}
