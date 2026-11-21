import { NextResponse } from "next/server";
import { guardApi } from "@/lib/api/guard";
import { extractDocument, isSupportedDocument } from "@/lib/documents/extract";
import { chunkText } from "@/lib/documents/chunking";
import { embedMany } from "ai";
import { hasGeminiConfig } from "@/lib/config";
import { getGeminiProvider } from "@/lib/providers/gemini";

export const runtime = "nodejs";
export const maxDuration = 60;
const maxBytes = 20 * 1024 * 1024;

function safeName(name: string) { return name.normalize("NFKC").replace(/[\\/:*?"<>|\u0000-\u001f]/g, "_").slice(0, 150) || "document"; }

export async function POST(request: Request) {
  const guard = await guardApi("documents.upload");
  if ("response" in guard) return guard.response;
  if (guard.auth.isDemo || !guard.supabase) return NextResponse.json({ error: "File uploads need an authenticated workspace. Demo documents are examples and are not stored." }, { status: 409 });
  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Choose a file to upload." }, { status: 400 });
  if (file.size === 0 || file.size > maxBytes) return NextResponse.json({ error: "Files must be between 1 byte and 20 MB." }, { status: 413 });
  const mimeType = file.type || "application/octet-stream";
  if (!isSupportedDocument(mimeType, file.name)) return NextResponse.json({ error: "Choose a PDF, DOCX, TXT, Markdown, CSV, PNG, JPG, or WebP file." }, { status: 415 });

  const id = crypto.randomUUID();
  const name = safeName(file.name);
  const storagePath = `${guard.auth.userId}/${guard.workspaceId}/${id}/${name}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  const uploaded = await guard.supabase.storage.from("omnibrain-documents").upload(storagePath, bytes, { contentType: mimeType, upsert: false });
  if (uploaded.error) return NextResponse.json({ error: "The private document store rejected this upload. Check the workspace storage setup." }, { status: 503 });

  const { data: document, error: insertError } = await guard.supabase.from("documents").insert({
    id, workspace_id: guard.workspaceId, user_id: guard.auth.userId, name, mime_type: mimeType, size_bytes: file.size, storage_path: storagePath, status: "processing",
  }).select("id,name,mime_type,size_bytes,status,created_at").single();
  if (insertError || !document) {
    await guard.supabase.storage.from("omnibrain-documents").remove([storagePath]);
    return NextResponse.json({ error: "The upload could not be added to your document library." }, { status: 503 });
  }

  try {
    const pages = await extractDocument(bytes, mimeType, name);
    let chunkIndex = 0;
    const rows = pages.flatMap((page) => chunkText(page.text).map((chunk) => ({
      workspace_id: guard.workspaceId, user_id: guard.auth.userId, document_id: id, chunk_index: chunkIndex++, page_number: page.pageNumber, section_title: page.sectionTitle, text: chunk.text,
    })));
    // Extremely long uploads are bounded to keep indexing requests small.
    let bounded = rows.slice(0, 300);
    if (bounded.length && hasGeminiConfig()) {
      try {
        const { embeddings } = await embedMany({
          model: getGeminiProvider().embedding("gemini-embedding-001"),
          values: bounded.slice(0, 100).map((row) => row.text),
          providerOptions: { google: { outputDimensionality: 768 } },
        });
        bounded = bounded.map((row, index) => ({ ...row, embedding: embeddings[index] ? "[" + embeddings[index].join(",") + "]" : null }));
      } catch {
        // Keep the extracted text searchable with lexical retrieval when embedding is unavailable.
      }
    }
    if (bounded.length) {
      const { error: chunkError } = await guard.supabase.from("document_chunks").insert(bounded);
      if (chunkError) throw new Error("indexing");
    }
    const { error: updateError } = await guard.supabase.from("documents").update({ status: "ready", page_count: pages.length, metadata: { indexed_chunks: bounded.length, text_extracted: bounded.length > 0 } }).eq("id", id).eq("user_id", guard.auth.userId);
    if (updateError) throw new Error("update");
    return NextResponse.json({ document: { ...document, status: "ready", indexed_chunks: bounded.length } }, { status: 201 });
  } catch {
    await guard.supabase.from("documents").update({ status: "failed", error_message: "Text extraction or indexing failed." }).eq("id", id).eq("user_id", guard.auth.userId);
    return NextResponse.json({ error: "The file was uploaded, but its text could not be indexed. You can remove it from Documents and try another file." }, { status: 422 });
  }
}
