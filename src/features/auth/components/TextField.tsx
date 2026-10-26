import type { InputHTMLAttributes, ReactNode } from "react";

const inputClass =
  "w-full rounded-xl border border-brand-200 bg-white/70 py-3 pl-11 pr-4 text-sm outline-none transition placeholder:text-brand-500 focus:border-accent-600 focus:ring-4 focus:ring-accent-600/15 dark:border-brand-700 dark:bg-brand-950/60 dark:placeholder:text-brand-400 dark:focus:border-accent-400 dark:focus:ring-accent-400/20";

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  icon: ReactNode;
  /** Element rendered inside the input on the right, e.g. a show/hide button. */
  trailing?: ReactNode;
  /** Content rendered under the input, e.g. a strength meter. */
  footer?: ReactNode;
};

export function TextField({ label, icon, trailing, footer, className = "", ...input }: TextFieldProps) {
  return (
    <label className="group block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      <div className="relative">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-400 transition-colors group-focus-within:text-accent-600">
          {icon}
        </span>
        <input className={`${inputClass} ${trailing ? "pr-16" : ""} ${className}`} {...input} />
        {trailing}
      </div>
      {footer}
    </label>
  );
}
