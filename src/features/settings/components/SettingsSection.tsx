import type { ReactNode } from "react";
import { Card } from "@/components/ui/Card";

type Props = {
  title: string;
  description: string;
  children: ReactNode;
};

/** A titled card; every group on the Settings page uses it. */
export function SettingsSection({ title, description, children }: Props) {
  return (
    <Card className="p-5 sm:p-6">
      <h2 className="text-base font-semibold text-brand-900 dark:text-white">{title}</h2>
      <p className="mt-0.5 text-sm text-brand-600 dark:text-brand-300">{description}</p>
      <div className="mt-5">{children}</div>
    </Card>
  );
}
