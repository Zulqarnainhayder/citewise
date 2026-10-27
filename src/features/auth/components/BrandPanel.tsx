import { Logo } from "@/components/Logo";
import { CitationPreview } from "./CitationPreview";
import { FeatureList } from "./FeatureList";

const gridStyle = {
  backgroundImage:
    "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
  backgroundSize: "44px 44px",
};

export function BrandPanel() {
  return (
    <aside className="relative hidden flex-1 overflow-hidden bg-gradient-to-br from-brand-950 to-brand-900 p-12 text-white lg:flex lg:flex-col lg:justify-between">
      <div className="pointer-events-none absolute inset-0 opacity-[0.07]" style={gridStyle} />

      <Logo className="relative" />

      <div className="relative max-w-lg">
        <h2 className="text-balance font-serif text-4xl font-semibold leading-[1.15] tracking-tight xl:text-[3.25rem]">
          Chat with your documents.
          <span className="block text-accent-400">Every answer cites its page.</span>
        </h2>
        <p className="mt-5 text-base leading-relaxed text-brand-100">
          Upload your PDFs, ask questions in English or German, and jump
          straight to the passage behind every answer.
        </p>
        <CitationPreview />
      </div>

      <FeatureList />
    </aside>
  );
}
