/** What to show in the PDF viewer. */
export type ViewerTarget = {
  documentId: string;
  title: string;
  /** 1-based page to open. */
  page: number;
  /** The cited passage to highlight on that page. */
  passage: string;
};
