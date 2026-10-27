type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function PageHeader({ eyebrow, title, description }: PageHeaderProps) {
  return (
    <div className="border-b border-brand-200/80 bg-brand-50 dark:border-brand-800 dark:bg-brand-950">
      <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-accent-700 dark:text-accent-400">
          {eyebrow}
        </p>
        <h1 className="mt-1.5 font-serif text-3xl font-semibold tracking-tight text-brand-900 sm:text-4xl dark:text-white">
          {title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-brand-600 sm:text-base dark:text-brand-300">
          {description}
        </p>
      </div>
    </div>
  );
}
