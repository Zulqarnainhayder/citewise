type Props = {
  label: string;
  used: number;
  limit: number;
};

/** A labelled bar: how much of a rolling daily allowance has been used. */
export function UsageMeter({ label, used, limit }: Props) {
  const percent = Math.min(100, Math.round((used / limit) * 100));
  const full = used >= limit;

  return (
    <div>
      <div className="flex items-baseline justify-between text-sm">
        <span className="font-medium text-brand-800 dark:text-brand-100">{label}</span>
        <span className="tabular-nums text-brand-600 dark:text-brand-300">
          {used} of {limit}
        </span>
      </div>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={limit}
        aria-valuenow={Math.min(used, limit)}
        className="mt-2 h-2 overflow-hidden rounded-full bg-brand-200 dark:bg-brand-800"
      >
        <div
          className={`h-full rounded-full transition-[width] ${full ? "bg-red-500" : "bg-accent-600"}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
