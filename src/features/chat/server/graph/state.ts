import { Annotation } from "@langchain/langgraph";
import type { ChatTurn, Source } from "../../types";

/** Everything the question-answering workflow reads and writes. */
export const ChatState = Annotation.Root({
  question: Annotation<string>(),
  history: Annotation<ChatTurn[]>(),
  /** Limit the search to these documents; undefined searches all of them. */
  documentIds: Annotation<string[] | undefined>(),
  /** True for the first question of a new chat, which gets a generated title. */
  needsTitle: Annotation<boolean>(),
  sources: Annotation<Source[]>(),
  answer: Annotation<string>(),
  title: Annotation<string | undefined>(),
});

export type ChatGraphState = typeof ChatState.State;
