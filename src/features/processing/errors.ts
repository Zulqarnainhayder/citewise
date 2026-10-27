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
