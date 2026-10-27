import { END, START, StateGraph } from "@langchain/langgraph";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Source } from "../../types";
import { generateNode } from "./generate";
import { retrieveNode } from "./retrieve";
import { ChatState, type ChatGraphState } from "./state";
import { contentText } from "./text";
import { titleNode } from "./title";

/**
 * The question-answering workflow:
 *
 *   START -> retrieve -> generate -> (new chat? generateTitle) -> END
 */
export const chatGraph = new StateGraph(ChatState)
  .addNode("retrieve", retrieveNode)
  .addNode("generate", generateNode)
  .addNode("generateTitle", titleNode)
  .addEdge(START, "retrieve")
  .addEdge("retrieve", "generate")
  .addConditionalEdges("generate", (state) => (state.needsTitle ? "generateTitle" : END), ["generateTitle", END])
  .addEdge("generateTitle", END)
  .compile();

export type ChatGraphInput = Pick<ChatGraphState, "question" | "history" | "documentIds" | "needsTitle">;

/** What the workflow reports as it runs, in a form the API route can forward. */
export type GraphEvent =
  | { kind: "retrieved"; sources: Source[] }
  | { kind: "token"; text: string }
  | { kind: "answered" }
  | { kind: "titled"; title: string };

/** Runs the workflow and turns LangGraph's stream into simple events. */
export async function* runChatGraph(
  input: ChatGraphInput,
  context: { supabase: SupabaseClient; signal?: AbortSignal },
): AsyncGenerator<GraphEvent> {
  const stream = await chatGraph.stream(input, {
    streamMode: ["updates", "messages"],
    signal: context.signal,
    configurable: { supabase: context.supabase },
  });

  for await (const [mode, payload] of stream) {
    if (mode === "messages") {
      const [chunk, meta] = payload as [{ content: unknown }, { langgraph_node?: string }];
      // Only the answer's tokens go to the user, not the title model's.
      if (meta.langgraph_node === "generate") {
        const text = contentText(chunk.content);
        if (text) yield { kind: "token", text };
      }
    } else {
      const update = payload as Record<string, Partial<ChatGraphState>>;
      if (update.retrieve) yield { kind: "retrieved", sources: update.retrieve.sources ?? [] };
      if (update.generate) yield { kind: "answered" };
      if (update.generateTitle?.title) yield { kind: "titled", title: update.generateTitle.title };
    }
  }
}
