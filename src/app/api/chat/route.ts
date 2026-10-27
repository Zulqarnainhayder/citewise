import { NextResponse } from "next/server";
import { runChatGraph } from "@/features/chat/server/graph";
import {
  chatExists,
  createChat,
  loadHistory,
  saveAnswer,
  saveUserMessage,
  updateChatTitle,
} from "@/features/chat/server/persist";
import { ChatRequestError, parseChatRequest } from "@/features/chat/server/validate";
import type { ChatEvent, ChatTurn, Source } from "@/features/chat/types";
import { checkChatLimit } from "@/lib/limits/limits";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 60;

function isRateLimit(err: unknown) {
  const status = (err as { status?: number }).status;
  const message = err instanceof Error ? err.message : "";
  return status === 429 || /\b429\b|too many requests|resource_exhausted/i.test(message);
}

function friendlyMessage(err: unknown) {
  return isRateLimit(err)
    ? "The AI service is busy right now. Please try again in a minute."
    : "Something went wrong while answering. Please try again.";
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) {
    return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  }

  let body;
  try {
    body = parseChatRequest(await request.json());
  } catch (err) {
    const message = err instanceof ChatRequestError ? err.message : "Invalid request.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const limit = await checkChatLimit(supabase, user.id);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: limit.message },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  if (body.chatId && !(await chatExists(supabase, body.chatId))) {
    return NextResponse.json({ error: "Chat not found." }, { status: 404 });
  }

  // For an existing chat, the conversation so far comes from the database.
  let history: ChatTurn[] = [];
  let alreadySaved = false;
  if (body.chatId) {
    history = await loadHistory(supabase, body.chatId);
    const last = history.at(-1);
    if (last?.role === "user" && last.content === body.question) {
      // A retry of a question that was already saved: don't store it twice.
      history = history.slice(0, -1);
      alreadySaved = true;
    }
  }

  // Run the LangGraph workflow (retrieve -> generate -> title). Stopping the
  // request, or failing before anything is saved, also stops the workflow.
  const graphAbort = new AbortController();
  const stopGraph = () => graphAbort.abort();
  request.signal.addEventListener("abort", stopGraph);

  const events = runChatGraph(
    { question: body.question, history, documentIds: body.documentIds, needsTitle: !body.chatId },
    { supabase, signal: graphAbort.signal },
  );

  // Wait for retrieval first, so a failure can still return a real status code
  // and leaves nothing half-saved.
  let sources: Source[];
  try {
    const first = await events.next();
    if (first.done || first.value.kind !== "retrieved") throw new Error("Retrieval did not run.");
    sources = first.value.sources;
  } catch (err) {
    stopGraph();
    request.signal.removeEventListener("abort", stopGraph);
    console.error("Chat retrieval failed:", err);
    return NextResponse.json(
      { error: friendlyMessage(err) },
      { status: isRateLimit(err) ? 429 : 500 },
    );
  }

  let chatId = body.chatId;
  let newTitle: string | undefined;
  try {
    if (!chatId) {
      const chat = await createChat(supabase, user.id, body.question);
      chatId = chat.id;
      newTitle = chat.title;
    }
    if (!alreadySaved) await saveUserMessage(supabase, user.id, chatId, body.question);
  } catch (err) {
    stopGraph();
    request.signal.removeEventListener("abort", stopGraph);
    console.error("Saving the chat failed:", err);
    return NextResponse.json(
      { error: "Could not save your chat. Please try again." },
      { status: 500 },
    );
  }

  const savedChatId = chatId;
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: ChatEvent) => {
        try {
          controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
        } catch {
          // The reader went away (Stop or closed tab); keep going so we can save.
        }
      };

      let answer = "";
      let saved = false;
      const saveOnce = async () => {
        if (saved || !answer.trim()) return;
        saved = true;
        try {
          await saveAnswer(supabase, user.id, savedChatId, answer, sources);
        } catch (err) {
          console.error("Saving the answer failed:", err);
        }
      };

      try {
        if (newTitle) send({ type: "chat", chatId: savedChatId, title: newTitle });
        send({ type: "sources", sources });

        for await (const event of events) {
          if (event.kind === "token") {
            answer += event.text;
            send({ type: "delta", text: event.text });
          } else if (event.kind === "answered") {
            send({ type: "done" });
            await saveOnce();
          } else if (event.kind === "titled") {
            try {
              await updateChatTitle(supabase, savedChatId, event.title);
              send({ type: "title", title: event.title });
            } catch (err) {
              console.error("Saving the chat title failed:", err);
            }
          }
        }
      } catch (err) {
        if (!request.signal.aborted) {
          console.error("Chat generation failed:", err);
          send({ type: "error", message: friendlyMessage(err) });
        }
      } finally {
        // Save what was written, even a partial answer after Stop.
        await saveOnce();
        request.signal.removeEventListener("abort", stopGraph);
        try {
          controller.close();
        } catch {
          // Already closed.
        }
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
