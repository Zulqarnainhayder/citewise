/** An error whose message is safe to show to the user. */
export class ProcessingError extends Error {
  constructor(
    message: string,
    readonly status: number = 500,
  ) {
    super(message);
    this.name = "ProcessingError";
  }
}

/** Turns a rate-limit failure from the AI service into a clear, user-facing error. */
export function toProcessingError(err: unknown): unknown {
  if (err instanceof ProcessingError) return err;
  const message = err instanceof Error ? err.message : String(err);
  if (/\b429\b|too many requests|resource_exhausted|quota/i.test(message)) {
    return new ProcessingError(
      "The AI service is rate-limited right now. Please try again in a minute.",
      429,
    );
  }
  return err;
}
