import { NextResponse } from "next/server";
import { z } from "zod";
import { guardApi } from "@/lib/api/guard";
import { retrieveDocumentChunks } from "@/lib/documents/retriever";

const schema = z.object({ query: z.string().trim().min(1).max(4000), documentIds: z.array(z.string().uuid()).max(50).default([]) });
export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Enter a question to search your documents." }, { status: 400 });
  const guard = await guardApi("documents.query");
  if ("response" in guard) return guard.response;
  if (guard.auth.isDemo) return NextResponse.json({ chunks: [], citations: [], demo: true, message: "Demo document content is sample data and is not searchable." });
  const result = await retrieveDocumentChunks(guard.auth.userId, parsed.data.query, parsed.data.documentIds);
  return NextResponse.json({ ...result, demo: false }, { headers: { "Cache-Control": "no-store" } });
}
