import { Spinner } from "@/components/ui/Spinner";
import type { UploadItem } from "../types";

export function UploadQueue({
  uploads,
  onDismiss,
}: {
  uploads: UploadItem[];
  onDismiss: (key: string) => void;
}) {
  if (uploads.length === 0) return null;

  return (
    <ul className="space-y-2" aria-live="polite">
      {uploads.map((u) => {
        const isError = u.state === "error";
        return (
          <li
            key={u.key}
            className={`overflow-hidden rounded-xl border text-sm shadow-sm ${
              isError
                ? "border-red-200 bg-red-50 text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200"
                : "border-brand-200 bg-white text-brand-800 dark:border-brand-700 dark:bg-brand-900/60 dark:text-brand-100"
            }`}
          >
            <div className="flex items-center gap-3 px-4 py-3">
              {isError ? (
                <span aria-hidden="true">⚠</span>
              ) : (
                <Spinner className="h-4 w-4 text-accent-600" />
              )}
              <span className="min-w-0 flex-1 truncate font-medium">{u.name}</span>
              <span className="shrink-0">{isError ? u.error : "Uploading…"}</span>
              {isError && (
                <button
                  type="button"
                  onClick={() => onDismiss(u.key)}
                  className="shrink-0 rounded px-1.5 text-xs font-semibold underline"
                >
                  Dismiss
                </button>
              )}
            </div>
            {!isError && (
              <div className="h-1 w-full overflow-hidden bg-brand-100 dark:bg-brand-800">
                <div className="citewise-indeterminate h-full w-1/4 rounded-full bg-accent-600" />
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
