import { NextResponse } from "next/server";
import { generateTitle } from "@/features/chat/server/generateTitle";
import {
  chatExists,
  createChat,
  loadHistory,
  saveAnswer,
  saveUserMessage,
  updateChatTitle,
} from "@/features/chat/server/persist";
import { retrieveSources } from "@/features/chat/server/retrieve";
import { streamAnswer } from "@/features/chat/server/streamAnswer";
import { ChatRequestError, parseChatRequest } from "@/features/chat/server/validate";
import type { ChatEvent, ChatTurn } from "@/features/chat/types";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 60;

function friendlyMessage(err: unknown) {
  const status = (err as { status?: number }).status;
  if (status === 429) return "The AI service is busy right now. Please try again in a minute.";
  return "Something went wrong while answering. Please try again.";
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

  if (body.chatId && !(await chatExists(supabase, body.chatId))) {
    return NextResponse.json({ error: "Chat not found." }, { status: 404 });
  }

  // Retrieve first, so a failure leaves nothing half-saved.
  let sources;
  try {
    sources = await retrieveSources(supabase, body.question, body.documentIds);
  } catch (err) {
    console.error("Chat retrieval failed:", err);
    return NextResponse.json(
      { error: friendlyMessage(err) },
      { status: (err as { status?: number }).status === 429 ? 429 : 500 },
    );
  }

  let chatId = body.chatId;
  let newTitle: string | undefined;
  let history: ChatTurn[] = [];
  try {
    if (chatId) {
      history = await loadHistory(supabase, chatId);
      const last = history.at(-1);
      if (last?.role === "user" && last.content === body.question) {
        // A retry of a question that was already saved: don't store it twice.
        history = history.slice(0, -1);
      } else {
        await saveUserMessage(supabase, user.id, chatId, body.question);
      }
    } else {
      const chat = await createChat(supabase, user.id, body.question);
      chatId = chat.id;
      newTitle = chat.title;
      await saveUserMessage(supabase, user.id, chat.id, body.question);
    }
  } catch (err) {
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
      try {
        if (newTitle) send({ type: "chat", chatId: savedChatId, title: newTitle });
        send({ type: "sources", sources });
        for await (const text of streamAnswer(body.question, sources, history, request.signal)) {
          answer += text;
          send({ type: "delta", text });
        }
        send({ type: "done" });
      } catch (err) {
        if (!request.signal.aborted) {
          console.error("Chat generation failed:", err);
          send({ type: "error", message: friendlyMessage(err) });
        }
      } finally {
        // Save what was written, even a partial answer after Stop.
        if (answer.trim()) {
          try {
            await saveAnswer(supabase, user.id, savedChatId, answer, sources);
          } catch (err) {
            console.error("Saving the answer failed:", err);
          }

          // A new chat gets a short descriptive title once it has an answer.
          if (newTitle && !request.signal.aborted) {
            const title = await generateTitle(body.question, answer, [
              ...new Set(sources.map((s) => s.title)),
            ]);
            try {
              await updateChatTitle(supabase, savedChatId, title);
              send({ type: "title", title });
            } catch (err) {
              console.error("Saving the chat title failed:", err);
            }
          }
        }
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
