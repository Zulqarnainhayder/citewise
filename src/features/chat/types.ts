export type ChatTurn = { role: "user" | "assistant"; content: string };

/** A passage the answer may cite as [n]. */
export type Source = {
  n: number;
  documentId: string;
  title: string;
  page: number;
  snippet: string;
};

export type ChatRequest = {
  question: string;
  /** Continue this saved chat; omit to start a new one. */
  chatId?: string;
  /** Limit the search to these documents; omit to search all of them. */
  documentIds?: string[];
};

/** A saved chat as listed in the sidebar. */
export type ChatSummary = {
  id: string;
  title: string;
  updated_at: string;
};

/** One line of the streamed (newline-delimited JSON) response. */
export type ChatEvent =
  | { type: "chat"; chatId: string; title: string }
  | { type: "sources"; sources: Source[] }
  | { type: "delta"; text: string }
  | { type: "done" }
  | { type: "title"; title: string }
  | { type: "error"; message: string };

/** A message as shown in the chat screen. */
export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources: Source[];
  status: "streaming" | "done" | "error";
  error?: string;
};
