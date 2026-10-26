import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { DocumentsPanel } from "@/features/documents/components/DocumentsPanel";

export default function Home() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="Library"
        title="Documents"
        description="Upload PDFs to build your library. Once a document is processed you can ask questions and get answers with page citations."
      />
      <PageContainer>
        <DocumentsPanel />
      </PageContainer>
    </AppShell>
  );
}
