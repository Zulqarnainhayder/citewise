import { signOut } from "@/features/auth/actions";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/server";

export async function AccountCard() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const email = data?.claims?.email ?? "";

  return (
    <div className="space-y-3 border-t border-brand-200 p-3 dark:border-brand-800">
      <div className="flex items-center gap-3 px-1">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-700 text-sm font-semibold uppercase text-white">
          {email.charAt(0) || "?"}
        </span>
        <div className="min-w-0">
          <p className="text-xs text-brand-600 dark:text-brand-300">Signed in as</p>
          <p className="truncate text-sm font-medium text-brand-900 dark:text-white">{email}</p>
        </div>
      </div>
      <form action={signOut}>
        <Button variant="secondary" size="sm" fullWidth>
          Sign out
        </Button>
      </form>
    </div>
  );
}
