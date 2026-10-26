"use client";

import { useCallback, useState } from "react";
import { useSupabase } from "@/lib/supabase/useSupabase";
import {
  DOCUMENTS_BUCKET,
  DOCUMENT_COLUMNS,
  MAX_FILES_PER_DROP,
} from "../constants";
import type { DocumentRow, UploadItem } from "../types";
import { titleFromFileName, validateFile } from "../utils";

/**
 * Uploads PDFs to private storage, then records each one in the documents
 * table. Calls `onUploaded` with every document that was saved.
 */
export function useUploader(onUploaded: (doc: DocumentRow) => void) {
  const supabase = useSupabase();
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [notice, setNotice] = useState<string | null>(null);

  const finish = useCallback((key: string) => {
    setUploads((prev) => prev.filter((u) => u.key !== key));
  }, []);

  const fail = useCallback((key: string, error: string) => {
    setUploads((prev) =>
      prev.map((u) => (u.key === key ? { ...u, state: "error", error } : u)),
    );
  }, []);

  const uploadOne = useCallback(
    async (file: File, userId: string) => {
      const id = crypto.randomUUID();
      const path = `${userId}/${id}.pdf`;

      const { error: uploadError } = await supabase.storage
        .from(DOCUMENTS_BUCKET)
        .upload(path, file, { contentType: "application/pdf" });
      if (uploadError) throw new Error(uploadError.message);

      const { data, error: insertError } = await supabase
        .from("documents")
        .insert({
          id,
          user_id: userId,
          title: titleFromFileName(file.name),
          storage_path: path,
        })
        .select(DOCUMENT_COLUMNS)
        .single();
      if (insertError) {
        await supabase.storage.from(DOCUMENTS_BUCKET).remove([path]);
        throw new Error(insertError.message);
      }
      return data as DocumentRow;
    },
    [supabase],
  );

  const upload = useCallback(
    async (fileList: FileList | File[]) => {
      const files = Array.from(fileList);
      if (files.length === 0) return;

      setNotice(
        files.length > MAX_FILES_PER_DROP
          ? `You can upload up to ${MAX_FILES_PER_DROP} files at once. The first ${MAX_FILES_PER_DROP} were used.`
          : null,
      );

      const { data } = await supabase.auth.getUser();
      const userId = data.user?.id;
      if (!userId) {
        setNotice("Your session has expired. Please sign in again.");
        return;
      }

      const items = files.slice(0, MAX_FILES_PER_DROP).map((file) => ({
        file,
        key: crypto.randomUUID(),
        problem: validateFile(file),
      }));

      setUploads((prev) => [
        ...items.map(
          ({ file, key, problem }): UploadItem => ({
            key,
            name: file.name,
            state: problem ? "error" : "uploading",
            error: problem ?? undefined,
          }),
        ),
        ...prev,
      ]);

      await Promise.all(
        items
          .filter((item) => !item.problem)
          .map(async ({ file, key }) => {
            try {
              onUploaded(await uploadOne(file, userId));
              finish(key);
            } catch (err) {
              fail(key, err instanceof Error ? err.message : "Upload failed.");
            }
          }),
      );
    },
    [supabase, uploadOne, onUploaded, finish, fail],
  );

  return { uploads, notice, upload, dismiss: finish };
}
