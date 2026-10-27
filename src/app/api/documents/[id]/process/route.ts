import { NextResponse } from "next/server";
import { processDocument } from "@/features/processing/processDocument";
import { ProcessingError } from "@/features/processing/errors";
import { checkDocumentLimit } from "@/lib/limits/limits";
import { createClient } from "@/lib/supabase/server";

// Embedding a long PDF can take a while; allow the platform maximum.
export const maxDuration = 60;

export async function POST(
  _request: Request,
  ctx: RouteContext<"/api/documents/[id]/process">,
) {
  const { id } = await ctx.params;

  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  }

  const limit = await checkDocumentLimit(supabase, data.user.id);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: limit.message },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  try {
    const result = await processDocument(supabase, id, data.user.id);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof ProcessingError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("Document processing failed:", err);
    return NextResponse.json(
      { error: "Processing failed. Please try again." },
      { status: 500 },
    );
  }
}
