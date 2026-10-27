import type { Usage } from "../server/getUsage";
import { SettingsSection } from "./SettingsSection";
import { UsageMeter } from "./UsageMeter";

export function UsageSection({ usage }: { usage: Usage }) {
  const { totals } = usage;
  const stats = [
    { label: "Documents", value: totals.documents },
    { label: "Chats", value: totals.chats },
    { label: "Workspaces", value: totals.workspaces },
  ];

  return (
    <SettingsSection
      title="Usage"
      description="Daily limits keep the free AI quota fair for everyone. They count the last 24 hours."
    >
      <div className="space-y-5">
        <UsageMeter label="Questions asked" used={usage.questionsToday} limit={usage.limits.questionsPerDay} />
        <UsageMeter label="Documents processed" used={usage.documentsToday} limit={usage.limits.documentsPerDay} />
      </div>
      <dl className="mt-6 grid grid-cols-3 gap-3 border-t border-brand-100 pt-5 dark:border-brand-800">
        {stats.map((s) => (
          <div key={s.label}>
            <dd className="font-serif text-2xl font-semibold tabular-nums text-brand-900 dark:text-white">
              {s.value}
            </dd>
            <dt className="text-xs text-brand-600 dark:text-brand-300">{s.label}</dt>
          </div>
        ))}
      </dl>
    </SettingsSection>
  );
}
