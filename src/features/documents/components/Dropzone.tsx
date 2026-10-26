"use client";

import { useRef, useState } from "react";
import { UploadIcon } from "@/components/icons";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { MAX_FILES_PER_DROP } from "../constants";

const limits = `PDF only · up to 10 MB each · up to ${MAX_FILES_PER_DROP} files at once`;

type Props = {
  onFiles: (files: FileList) => void;
  /** A slim strip, used once the library already has documents. */
  compact?: boolean;
};

export function Dropzone({ onFiles, compact = false }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  return (
    <Card className="p-2.5">
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          onFiles(e.dataTransfer.files);
        }}
        className={`flex cursor-pointer items-center rounded-xl border-2 border-dashed text-center transition ${
          compact
            ? "flex-col gap-4 px-5 py-4 sm:flex-row sm:text-left"
            : "flex-col px-6 py-14"
        } ${
          dragging
            ? "border-accent-600 bg-accent-50 dark:border-accent-400 dark:bg-accent-700/10"
            : "border-brand-300 bg-brand-50 hover:border-accent-600 hover:bg-accent-50/60 dark:border-brand-700 dark:bg-brand-950/50 dark:hover:border-accent-400 dark:hover:bg-accent-700/10"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          multiple
          className="sr-only"
          tabIndex={-1}
          aria-label="Choose PDF files"
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => {
            if (e.target.files) onFiles(e.target.files);
            e.target.value = "";
          }}
        />

        <span
          className={`flex shrink-0 items-center justify-center rounded-xl bg-accent-100 text-accent-700 ring-1 ring-accent-200 transition dark:bg-accent-700/20 dark:text-accent-300 dark:ring-accent-700/40 ${
            compact ? "h-11 w-11" : "h-14 w-14"
          } ${dragging ? "scale-110" : ""}`}
        >
          <UploadIcon className={compact ? "h-5 w-5" : "h-7 w-7"} />
        </span>

        <div className={compact ? "min-w-0 flex-1" : "mt-5"}>
          <p className="font-semibold text-brand-900 dark:text-white">
            {dragging ? "Drop to upload" : compact ? "Add more PDFs" : "Upload your PDFs"}
          </p>
          <p className="mt-1 text-sm text-brand-600 dark:text-brand-300">
            {compact
              ? limits
              : "Drag and drop files here, or choose them from your computer."}
          </p>
        </div>

        <Button type="button" className={compact ? "shrink-0 px-5" : "mt-6 px-6"}>
          Choose PDF files
        </Button>

        {!compact && (
          <p className="mt-4 text-xs text-brand-600 dark:text-brand-300">{limits}</p>
        )}
      </div>
    </Card>
  );
}
