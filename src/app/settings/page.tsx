import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Spinner } from "@/components/ui/Spinner";
import { AccountSection } from "@/features/settings/components/AccountSection";
import { DataSection } from "@/features/settings/components/DataSection";
import { UsageSection } from "@/features/settings/components/UsageSection";
import { getUsage } from "@/features/settings/server/getUsage";
import { createClient } from "@/lib/supabase/server";

async function SettingsContent() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) redirect("/login");

  const usage = await getUsage(supabase, user.id);

  return (
    <div className="space-y-6">
      <AccountSection email={user.email ?? ""} createdAt={user.created_at ?? null} />
      <UsageSection usage={usage} />
      <DataSection documents={usage.totals.documents} chats={usage.totals.chats} />
    </div>
  );
}

export default function SettingsPage() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="Account"
        title="Settings"
        description="Your account, appearance, daily usage and stored data."
      />
      <PageContainer>
        <Suspense
          fallback={
            <div className="flex items-center gap-2 text-sm text-brand-600 dark:text-brand-300">
              <Spinner /> Loading settings…
            </div>
          }
        >
          <SettingsContent />
        </Suspense>
      </PageContainer>
    </AppShell>
  );
}
