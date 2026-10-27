"use client";

import { useEffect, useRef, useState } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import type { TextItem } from "pdfjs-dist/types/src/display/api";
import { locateHighlight } from "../lib/findHighlight";
import { loadPdfjs } from "../lib/pdfjs";

type Rect = { left: number; top: number; width: number; height: number };

type Props = {
  pdf: PDFDocumentProxy;
  pageNumber: number;
  /** CSS pixel width to draw the page at. */
  width: number;
  /** Passage to highlight on this page; empty for none. */
  passage: string;
  /** Called with the top offset of the highlight, so the panel can scroll to it. */
  onHighlight?: (top: number) => void;
};

/** One PDF page on a canvas, with the cited passage highlighted on top. */
export function PdfPage({ pdf, pageNumber, width, passage, onHighlight }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [size, setSize] = useState({ width, height: 0 });
  const [rects, setRects] = useState<Rect[]>([]);

  useEffect(() => {
    let cancelled = false;
    let cancelRender: (() => void) | undefined;

    (async () => {
      const pdfjs = await loadPdfjs();
      const page = await pdf.getPage(pageNumber);
      const canvas = canvasRef.current;
      if (!canvas || cancelled) return;

      const scale = width / page.getViewport({ scale: 1 }).width;
      const viewport = page.getViewport({ scale });
      const ratio = window.devicePixelRatio || 1;

      canvas.width = Math.floor(viewport.width * ratio);
      canvas.height = Math.floor(viewport.height * ratio);
      setSize({ width: viewport.width, height: viewport.height });
      setRects([]);

      const task = page.render({
        canvas,
        viewport,
        transform: ratio === 1 ? undefined : [ratio, 0, 0, ratio, 0, 0],
      });
      cancelRender = () => task.cancel();
      try {
        await task.promise;
      } catch {
        return; // cancelled by a newer render
      }
      if (cancelled || !passage) return;

      const content = await page.getTextContent();
      const items = content.items.filter((item): item is TextItem => "str" in item);
      const found = locateHighlight(items, passage);
      if (cancelled) return;

      const boxes = found.map((index) => {
        const item = items[index];
        const t = pdfjs.Util.transform(viewport.transform, item.transform);
        const height = Math.hypot(t[2], t[3]);
        return { left: t[4] - 2, top: t[5] - height - 1, width: item.width * viewport.scale + 4, height: height + 3 };
      });
      setRects(boxes);
      if (boxes.length > 0) onHighlight?.(Math.min(...boxes.map((b) => b.top)));
    })();

    return () => {
      cancelled = true;
      cancelRender?.();
    };
  }, [pdf, pageNumber, width, passage, onHighlight]);

  return (
    <div className="relative mx-auto bg-white shadow-md" style={{ width: size.width, height: size.height || undefined }}>
      <canvas ref={canvasRef} style={{ width: size.width, height: size.height }} className="block" />
      {rects.map((rect, i) => (
        <span
          key={i}
          data-highlight
          className="pointer-events-none absolute rounded-sm bg-accent-400/40 mix-blend-multiply"
          style={rect}
        />
      ))}
    </div>
  );
}
