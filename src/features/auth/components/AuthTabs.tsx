export type AuthMode = "signin" | "signup";

const tabs: { mode: AuthMode; label: string }[] = [
  { mode: "signin", label: "Sign in" },
  { mode: "signup", label: "Sign up" },
];

export function AuthTabs({
  mode,
  onChange,
}: {
  mode: AuthMode;
  onChange: (mode: AuthMode) => void;
}) {
  return (
    <div className="grid grid-cols-2 rounded-xl bg-brand-100 p-1 text-sm font-medium dark:bg-brand-950">
      {tabs.map((tab) => (
        <button
          key={tab.mode}
          type="button"
          onClick={() => onChange(tab.mode)}
          aria-pressed={mode === tab.mode}
          className={`rounded-lg py-2 transition ${
            mode === tab.mode
              ? "bg-white text-brand-900 shadow-sm dark:bg-brand-700 dark:text-white"
              : "text-brand-600 hover:text-brand-900 dark:text-brand-300 dark:hover:text-white"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
