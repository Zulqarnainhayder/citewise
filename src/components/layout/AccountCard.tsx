import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { SignOutButton } from "@/features/auth/components/SignOutButton";
import { createClient } from "@/lib/supabase/server";

export async function AccountCard() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const email = data?.claims?.email ?? "";

  return (
    <div className="space-y-3 border-t border-brand-200/80 p-3 dark:border-brand-800">
      <div className="flex items-center gap-2.5 px-1">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-700 text-sm font-semibold uppercase text-white">
          {email.charAt(0) || "?"}
        </span>
        <p className="min-w-0 flex-1 truncate text-[13px] font-medium text-brand-800 dark:text-brand-100" title={email}>
          {email}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle className="w-[6.75rem] shrink-0" />
        <div className="min-w-0 flex-1">
          <SignOutButton fullWidth />
        </div>
      </div>
    </div>
  );
}
