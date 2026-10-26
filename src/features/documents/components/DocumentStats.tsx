import type { ReactNode } from "react";
import { CheckCircleIcon, ClockIcon, FileTextIcon } from "@/components/icons";
import { Card } from "@/components/ui/Card";
import type { DocumentRow } from "../types";

function Stat({
  icon,
  label,
  value,
  tone,
}: {
  icon: ReactNode;
  label: string;
  value: number;
  tone: string;
}) {
  return (
    <div className="flex items-center gap-4 px-5 py-4">
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${tone}`}>
        {icon}
      </span>
      <div>
        <p className="text-2xl font-semibold leading-none tabular-nums text-brand-900 dark:text-white">
          {value}
        </p>
        <p className="mt-1.5 text-sm text-brand-600 dark:text-brand-300">{label}</p>
      </div>
    </div>
  );
}

export function DocumentStats({ documents }: { documents: DocumentRow[] }) {
  const ready = documents.filter((d) => d.status === "ready").length;
  const waiting = documents.filter(
    (d) => d.status === "pending" || d.status === "processing",
  ).length;

  return (
    <Card className="grid divide-y divide-brand-200 sm:grid-cols-3 sm:divide-x sm:divide-y-0 dark:divide-brand-800">
      <Stat
        icon={<FileTextIcon />}
        label="Total documents"
        value={documents.length}
        tone="bg-brand-100 text-brand-700 dark:bg-brand-800 dark:text-brand-200"
      />
      <Stat
        icon={<CheckCircleIcon />}
        label="Ready to chat"
        value={ready}
        tone="bg-accent-100 text-accent-700 dark:bg-accent-700/25 dark:text-accent-300"
      />
      <Stat
        icon={<ClockIcon />}
        label="Waiting to process"
        value={waiting}
        tone="bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
      />
    </Card>
  );
}
