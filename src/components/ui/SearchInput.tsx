import type { InputHTMLAttributes } from "react";
import { SearchIcon } from "@/components/icons";

export function SearchInput({
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={`relative ${className}`}>
      <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-500 dark:text-brand-400" />
      <input
        type="search"
        className="w-full rounded-lg border border-brand-200 bg-white py-2 pl-9 pr-3 text-sm text-brand-900 outline-none transition placeholder:text-brand-500 focus:border-accent-600 focus:ring-4 focus:ring-accent-600/15 dark:border-brand-700 dark:bg-brand-900 dark:text-white dark:placeholder:text-brand-400 dark:focus:border-accent-400 dark:focus:ring-accent-400/20"
        {...props}
      />
    </div>
  );
}
