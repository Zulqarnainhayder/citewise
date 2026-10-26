const pages = ["p. 14", "p. 15"];

/** Static sample answer that shows what a cited response looks like. */
export function CitationPreview() {
  return (
    <div className="citewise-float mt-10 rounded-2xl border border-white/15 bg-white/10 p-5 shadow-2xl shadow-black/25 backdrop-blur-md">
      <p className="text-xs font-medium uppercase tracking-wider text-brand-200">
        You asked
      </p>
      <p className="mt-1 text-sm">What is the notice period for termination?</p>
      <div className="my-4 h-px bg-white/10" />
      <p className="text-sm leading-relaxed text-white">
        Either party may terminate the agreement with{" "}
        <span className="rounded bg-accent-400/30 px-1 font-medium text-accent-100">
          30 days&apos; written notice
        </span>
        .
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {pages.map((page) => (
          <span
            key={page}
            className="inline-flex items-center gap-1.5 rounded-full border border-accent-400/40 bg-accent-400/15 px-2.5 py-1 text-xs font-medium text-accent-100"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-accent-400" />
            contract.pdf · {page}
          </span>
        ))}
      </div>
    </div>
  );
}
