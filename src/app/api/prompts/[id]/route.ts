import { NextResponse } from "next/server";
import { guardApi } from "@/lib/api/guard";
import { idSchema } from "@/lib/api/validation";

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (!idSchema.safeParse(id).success) return NextResponse.json({ error: "The prompt could not be found." }, { status: 404 });
  const guard = await guardApi("prompts.delete");
  if ("response" in guard) return guard.response;
  if (guard.auth.isDemo) return NextResponse.json({ deleted: true, demo: true });
  const { data, error } = await guard.supabase!.from("prompt_templates").update({ deleted_at: new Date().toISOString() }).eq("id", id).eq("user_id", guard.auth.userId).is("deleted_at", null).select("id").maybeSingle();
  if (error || !data) return NextResponse.json({ error: "The prompt could not be found." }, { status: 404 });
  return NextResponse.json({ deleted: true, demo: false });
}
