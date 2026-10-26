import type { ReactNode } from "react";
import { MobileHeader } from "./MobileHeader";
import { Sidebar } from "./Sidebar";

/** Sidebar on large screens, a top bar on small ones. */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-1">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileHeader />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
