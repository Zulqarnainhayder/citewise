import Link from "next/link";
import { PlusIcon } from "@/components/icons";

/** The main action in the sidebar: start a fresh conversation. */
export function NewChatLink() {
  return (
    <Link
      href="/chat"
      className="group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-brand-900 transition hover:bg-brand-200/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 dark:text-white dark:hover:bg-brand-800"
    >
      <span className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-accent-700 text-white shadow-sm transition group-hover:bg-accent-600">
        <PlusIcon className="h-3.5 w-3.5" />
      </span>
      New chat
    </Link>
  );
}
