import { NextResponse } from "next/server";
import { idSchema } from "@/lib/api/validation";
import { guardApi } from "@/lib/api/guard";

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (!idSchema.safeParse(id).success) return NextResponse.json({ error: "The document could not be found." }, { status: 404 });
  const guard = await guardApi("documents.delete");
  if ("response" in guard) return guard.response;
  if (guard.auth.isDemo || !guard.supabase) return NextResponse.json({ error: "Demo documents are examples and cannot be deleted." }, { status: 409 });
  const { data: doc, error } = await guard.supabase.from("documents").select("id,storage_path").eq("id", id).eq("user_id", guard.auth.userId).is("deleted_at", null).maybeSingle();
  if (error || !doc) return NextResponse.json({ error: "The document could not be found." }, { status: 404 });
  const removed = await guard.supabase.storage.from("omnibrain-documents").remove([doc.storage_path]);
  if (removed.error) return NextResponse.json({ error: "The private file could not be removed. Try again." }, { status: 503 });
  const { error: updateError } = await guard.supabase.from("documents").update({ deleted_at: new Date().toISOString(), status: "deleted" }).eq("id", id).eq("user_id", guard.auth.userId);
  if (updateError) return NextResponse.json({ error: "The document record could not be updated." }, { status: 503 });
  return NextResponse.json({ deleted: true });
}
