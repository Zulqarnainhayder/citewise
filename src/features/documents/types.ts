export type DocumentStatus = "pending" | "processing" | "ready" | "failed";

export type DocumentRow = {
  id: string;
  title: string;
  status: DocumentStatus;
  storage_path: string;
  created_at: string;
};

export type UploadItem = {
  key: string;
  name: string;
  state: "uploading" | "error";
  error?: string;
};
