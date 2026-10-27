import { getGemini } from "@/lib/gemini";
import { ProcessingError } from "./errors";

export const EMBEDDING_MODEL = "gemini-embedding-001";
/** Must match the vector(768) column in the chunks table. */
export const EMBEDDING_DIMENSIONS = 768;

const BATCH_SIZE = 50;
const MAX_ATTEMPTS = 4;

type TaskType = "RETRIEVAL_DOCUMENT" | "RETRIEVAL_QUERY";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Retries rate-limit and temporary server errors with a growing delay. */
async function withRetry<T>(run: () => Promise<T>): Promise<T> {
  for (let attempt = 1; ; attempt++) {
    try {
      return await run();
    } catch (err) {
      const status = (err as { status?: number }).status;
      const retryable = status === 429 || (status !== undefined && status >= 500);
      if (!retryable || attempt >= MAX_ATTEMPTS) {
        if (status === 429) {
          throw new ProcessingError(
            "The AI service is rate-limited right now. Please try again in a minute.",
            429,
          );
        }
        throw err;
      }
      await sleep(1000 * 2 ** (attempt - 1));
    }
  }
}

/** Embeds texts in batches. Returns one 768-dimension vector per text. */
export async function embedTexts(
  texts: string[],
  taskType: TaskType = "RETRIEVAL_DOCUMENT",
): Promise<number[][]> {
  const vectors: number[][] = [];

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);
    const response = await withRetry(() =>
      getGemini().models.embedContent({
        model: EMBEDDING_MODEL,
        contents: batch,
        config: { outputDimensionality: EMBEDDING_DIMENSIONS, taskType },
      }),
    );

    const batchVectors = (response.embeddings ?? []).map((e) => e.values ?? []);
    if (batchVectors.length !== batch.length) {
      throw new ProcessingError("The AI service returned an unexpected response.", 502);
    }
    vectors.push(...batchVectors);
  }

  return vectors;
}
