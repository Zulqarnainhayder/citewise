import { FileTextIcon, GlobeIcon, LockIcon } from "@/components/icons";

const features = [
  {
    title: "Page-level citations",
    text: "Every answer links to the exact page it came from.",
    Icon: FileTextIcon,
  },
  {
    title: "Private to your account",
    text: "Your documents are only visible to you.",
    Icon: LockIcon,
  },
  {
    title: "English, German & scans",
    text: "Ask in one language, read the other. Scanned PDFs are read too.",
    Icon: GlobeIcon,
  },
];

export function FeatureList() {
  return (
    <ul className="relative grid max-w-2xl grid-cols-1 gap-4 xl:grid-cols-3">
      {features.map(({ title, text, Icon }) => (
        <li key={title} className="flex flex-col gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-400/15 text-accent-300 ring-1 ring-accent-400/30">
            <Icon className="h-[18px] w-[18px]" />
          </span>
          <span className="text-sm font-semibold">{title}</span>
          <span className="text-xs leading-relaxed text-brand-200">{text}</span>
        </li>
      ))}
    </ul>
  );
}
