import type * as PdfJs from "pdfjs-dist";

let loading: Promise<typeof PdfJs> | null = null;

/** Loads PDF.js on first use, so it never weighs on pages that don't show a PDF. */
export function loadPdfjs() {
  loading ??= import("pdfjs-dist").then((pdfjs) => {
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/build/pdf.worker.min.mjs",
      import.meta.url,
    ).toString();
    return pdfjs;
  });
  return loading;
}
