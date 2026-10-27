import { Suspense } from "react";
import { Logo } from "@/components/Logo";
import { ThemeButton } from "@/components/theme/ThemeButton";
import { SignOutButton } from "@/features/auth/components/SignOutButton";
import { MobileNav } from "./MobileNav";

/** Top bar and page tabs for small screens, where the sidebar is hidden. */
export function MobileHeader() {
  return (
    <div className="sticky top-0 z-10 lg:hidden">
      <header className="flex h-14 items-center justify-between border-b border-brand-200 bg-brand-50/95 px-4 backdrop-blur dark:border-brand-800 dark:bg-brand-950/95">
        <Logo size={30} />
        <div className="flex items-center gap-2">
          <ThemeButton />
          <SignOutButton />
        </div>
      </header>
      <Suspense fallback={<div className="h-12 border-b border-brand-200 bg-white/90 dark:border-brand-800 dark:bg-brand-950/90" />}>
        <MobileNav />
      </Suspense>
    </div>
  );
}
