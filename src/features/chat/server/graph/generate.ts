import { AIMessage, HumanMessage } from "@langchain/core/messages";
import type { RunnableConfig } from "@langchain/core/runnables";
import { createChatModel } from "@/lib/langchain/models";
import { answerPrompt, formatExcerpts } from "../prompt";
import type { ChatGraphState } from "./state";
import { contentText } from "./text";

/**
 * Graph node: writes the answer from the excerpts. Passing `config` lets
 * LangGraph stream the model's tokens to whoever is listening.
 */
export async function generateNode(
  state: ChatGraphState,
  config: RunnableConfig,
): Promise<Partial<ChatGraphState>> {
  const history = state.history.map((turn) =>
    turn.role === "assistant" ? new AIMessage(turn.content) : new HumanMessage(turn.content),
  );

  const message = await answerPrompt.pipe(createChatModel()).invoke(
    { history, excerpts: formatExcerpts(state.sources), question: state.question },
    config,
  );
  return { answer: contentText(message.content) };
}
