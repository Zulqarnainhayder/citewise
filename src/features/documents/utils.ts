import { MAX_FILE_BYTES } from "./constants";

/** Returns an error message, or null when the file is acceptable. */
export function validateFile(file: File): string | null {
  const isPdf =
    file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  if (!isPdf) return "Only PDF files are supported.";
  if (file.size === 0) return "File is empty.";
  if (file.size > MAX_FILE_BYTES) return "File is larger than 10 MB.";
  return null;
}

export function titleFromFileName(name: string) {
  return name.replace(/\.pdf$/i, "");
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
