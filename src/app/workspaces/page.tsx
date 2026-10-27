import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { WorkspacesPanel } from "@/features/workspaces/components/WorkspacesPanel";

export default function WorkspacesPage() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="Organize"
        title="Workspaces"
        description="Group related documents, then chat with one workspace at a time so answers only come from the right sources."
      />
      <PageContainer>
        <WorkspacesPanel />
      </PageContainer>
    </AppShell>
  );
}
