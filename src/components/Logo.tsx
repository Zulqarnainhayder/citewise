type LogoProps = {
  className?: string;
  /** Pixel size of the square mark. */
  size?: number;
  showWordmark?: boolean;
};

/** CiteWise mark: a document page holding a quotation mark (a cited source). */
export function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <span
      className="relative inline-flex shrink-0 items-center justify-center bg-gradient-to-br from-accent-500 to-accent-700 shadow-lg shadow-accent-600/25 ring-1 ring-white/20"
      style={{ width: size, height: size, borderRadius: size * 0.28 }}
    >
      <svg
        viewBox="0 0 32 32"
        width={size * 0.72}
        height={size * 0.72}
        aria-hidden="true"
      >
        <path
          d="M10 5h8l7 7v12a3 3 0 0 1-3 3H10a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3z"
          fill="#fff"
        />
        <path
          d="M18 5v5a2 2 0 0 0 2 2h5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
          strokeLinecap="round"
          className="text-brand-300"
        />
        <g className="text-accent-700">
          <circle cx="11.6" cy="21" r="2.7" fill="currentColor" />
          <circle cx="19.6" cy="21" r="2.7" fill="currentColor" />
          <path
            d="M14 19.4c.5-2.6 2-4.2 4-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <path
            d="M18 19.4c.5-2.6 2-4.2 4-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        </g>
      </svg>
    </span>
  );
}

export function Logo({ className = "", size = 36, showWordmark = true }: LogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <LogoMark size={size} />
      {showWordmark && (
        <span
          className="font-semibold tracking-tight"
          style={{ fontSize: size * 0.52 }}
        >
          CiteWise
        </span>
      )}
    </div>
  );
}
