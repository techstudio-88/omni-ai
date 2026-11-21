import { NextResponse } from "next/server";
import { z } from "zod";
import { guardApi } from "@/lib/api/guard";
import { extractDocument, isSupportedDocument } from "@/lib/documents/extract";
import { chunkText } from "@/lib/documents/chunking";
import { embedMany } from "ai";
import { hasGeminiConfig } from "@/lib/config";
import { getGeminiProvider } from "@/lib/providers/gemini";

export const runtime = "nodejs";
export const maxDuration = 60;
const maxBytes = 50 * 1024 * 1024;
const schema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(150),
  mimeType: z.string().max(120),
  size: z.number().int().positive().max(maxBytes),
  storagePath: z.string().min(1).max(500),
});

export async function POST(request: Request) {
  const guard = await guardApi("documents.finalize");
  if ("response" in guard) return guard.response;
  if (guard.auth.isDemo || !guard.supabase) return NextResponse.json({ error: "Sign in to a live workspace to save files." }, { status: 409 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "The upload details are invalid." }, { status: 400 });
  const { id, name, mimeType, size, storagePath } = parsed.data;
  const expectedPath = `${guard.auth.userId}/${guard.workspaceId}/${id}/${name}`;
  if (storagePath !== expectedPath || !isSupportedDocument(mimeType, name)) return NextResponse.json({ error: "The uploaded file does not belong to this workspace." }, { status: 403 });

  const existing = await guard.supabase.from("documents").select("id").eq("id", id).eq("user_id", guard.auth.userId).maybeSingle();
  if (existing.data) return NextResponse.json({ error: "This file has already been added." }, { status: 409 });
  const downloaded = await guard.supabase.storage.from("omnibrain-documents").download(storagePath);
  if (downloaded.error || !downloaded.data) return NextResponse.json({ error: "The uploaded file could not be verified in private storage." }, { status: 422 });
  if (downloaded.data.size !== size || downloaded.data.size > maxBytes) {
    await guard.supabase.storage.from("omnibrain-documents").remove([storagePath]);
    return NextResponse.json({ error: "The uploaded file size did not match the requested size." }, { status: 413 });
  }

  const inserted = await guard.supabase.from("documents").insert({
    id, workspace_id: guard.workspaceId, user_id: guard.auth.userId, name, mime_type: mimeType,
    size_bytes: size, storage_path: storagePath, status: "processing",
  }).select("id,name,mime_type,size_bytes,status,created_at").single();
  if (inserted.error || !inserted.data) {
    await guard.supabase.storage.from("omnibrain-documents").remove([storagePath]);
    return NextResponse.json({ error: "The upload could not be added to your document library." }, { status: 503 });
  }

  try {
    const bytes = Buffer.from(await downloaded.data.arrayBuffer());
    const pages = await extractDocument(bytes, mimeType, name);
    let chunkIndex = 0;
    const rows = pages.flatMap((page) => chunkText(page.text).map((chunk) => ({
      workspace_id: guard.workspaceId, user_id: guard.auth.userId, document_id: id, chunk_index: chunkIndex++,
      page_number: page.pageNumber, section_title: page.sectionTitle, text: chunk.text,
    })));
    let bounded = rows.slice(0, 300);
    if (bounded.length && hasGeminiConfig()) {
      try {
        const count = Math.min(100, bounded.length);
        const { embeddings } = await embedMany({
          model: getGeminiProvider().embedding("gemini-embedding-001"),
          values: bounded.slice(0, count).map((row) => row.text),
          providerOptions: { google: { outputDimensionality: 768 } },
        });
        bounded = bounded.map((row, index) => ({ ...row, embedding: index < count && embeddings[index] ? "[" + embeddings[index].join(",") + "]" : null }));
      } catch { /* Lexical retrieval remains available when embeddings are unavailable. */ }
    }
    if (bounded.length) {
      const { error } = await guard.supabase.from("document_chunks").insert(bounded);
      if (error) throw new Error("indexing");
    }
    const { error } = await guard.supabase.from("documents").update({
      status: "ready", page_count: pages.length, metadata: { indexed_chunks: bounded.length, text_extracted: bounded.length > 0, vision_ready: mimeType.startsWith("image/") },
    }).eq("id", id).eq("user_id", guard.auth.userId);
    if (error) throw new Error("update");
    return NextResponse.json({ document: { ...inserted.data, status: "ready", indexed_chunks: bounded.length } }, { status: 201 });
  } catch {
    await guard.supabase.from("documents").update({ status: "failed", error_message: "Text extraction or indexing failed." }).eq("id", id).eq("user_id", guard.auth.userId);
    return NextResponse.json({ error: "The file was stored, but its text could not be indexed. You can remove it from Documents and retry." }, { status: 422 });
  }
}
