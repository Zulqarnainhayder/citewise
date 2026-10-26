import { signOut } from "@/features/auth/actions";
import { Logo } from "@/components/Logo";
import { ThemeButton } from "@/components/theme/ThemeButton";
import { Button } from "@/components/ui/Button";

/** Top bar for small screens, where the sidebar is hidden. */
export function MobileHeader() {
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-brand-200 bg-white/90 px-4 backdrop-blur lg:hidden dark:border-brand-800 dark:bg-brand-950/90">
      <Logo size={30} />
      <div className="flex items-center gap-2">
        <ThemeButton />
        <form action={signOut}>
          <Button variant="secondary" size="sm">
            Sign out
          </Button>
        </form>
      </div>
    </header>
  );
}
