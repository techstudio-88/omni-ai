import { NextResponse } from "next/server";
import { z } from "zod";
import { guardApi } from "@/lib/api/guard";
import { isSupportedDocument } from "@/lib/documents/extract";

export const runtime = "nodejs";
const maxBytes = 50 * 1024 * 1024;
const inputSchema = z.object({
  name: z.string().min(1).max(150),
  mimeType: z.string().max(120),
  size: z.number().int().positive().max(maxBytes),
});

function safeName(name: string) {
  return name.normalize("NFKC").replace(/[\\/:*?"<>|\u0000-\u001f]/g, "_").slice(0, 150) || "document";
}

export async function POST(request: Request) {
  const guard = await guardApi("documents.upload-url");
  if ("response" in guard) return guard.response;
  if (guard.auth.isDemo || !guard.supabase) return NextResponse.json({ error: "Sign in to a live workspace to upload files." }, { status: 409 });
  const parsed = inputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Choose a supported file up to 50 MB." }, { status: 400 });
  const { name: rawName, mimeType, size } = parsed.data;
  const name = safeName(rawName);
  if (!isSupportedDocument(mimeType, name)) return NextResponse.json({ error: "Supported files: PDF, DOCX, TXT, Markdown, CSV, PNG, JPG, and WebP." }, { status: 415 });
  const id = crypto.randomUUID();
  const storagePath = `${guard.auth.userId}/${guard.workspaceId}/${id}/${name}`;
  const signed = await guard.supabase.storage.from("omnibrain-documents").createSignedUploadUrl(storagePath, { upsert: false });
  if (signed.error || !signed.data?.token) return NextResponse.json({ error: "A secure upload link could not be created. Check private storage policies." }, { status: 503 });
  return NextResponse.json({ id, name, mimeType, size, storagePath, token: signed.data.token }, { headers: { "Cache-Control": "no-store" } });
}
