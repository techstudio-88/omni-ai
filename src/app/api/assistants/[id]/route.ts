import { NextResponse } from "next/server";
import { z } from "zod";
import { idSchema } from "@/lib/api/validation";
import { guardApi } from "@/lib/api/guard";

const schema = z.object({ name: z.string().trim().min(1).max(80).optional(), description: z.string().max(500).optional(), instructions: z.string().trim().min(1).max(8000).optional(), model: z.string().max(100).nullable().optional() }).refine((body) => Object.keys(body).length > 0);
export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (!idSchema.safeParse(id).success) return NextResponse.json({ error: "The assistant could not be found." }, { status: 404 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "The assistant update is not valid." }, { status: 400 });
  const guard = await guardApi("assistants.update");
  if ("response" in guard) return guard.response;
  if (guard.auth.isDemo) return NextResponse.json({ updated: true, demo: true });
  const { data, error } = await guard.supabase!.from("custom_assistants").update(parsed.data).eq("id", id).eq("user_id", guard.auth.userId).is("deleted_at", null).select("id").maybeSingle();
  if (error || !data) return NextResponse.json({ error: "The assistant could not be found." }, { status: 404 });
  return NextResponse.json({ updated: true, demo: false });
}
export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (!idSchema.safeParse(id).success) return NextResponse.json({ error: "The assistant could not be found." }, { status: 404 });
  const guard = await guardApi("assistants.delete");
  if ("response" in guard) return guard.response;
  if (guard.auth.isDemo) return NextResponse.json({ deleted: true, demo: true });
  const { data, error } = await guard.supabase!.from("custom_assistants").update({ deleted_at: new Date().toISOString() }).eq("id", id).eq("user_id", guard.auth.userId).is("deleted_at", null).select("id").maybeSingle();
  if (error || !data) return NextResponse.json({ error: "The assistant could not be found." }, { status: 404 });
  return NextResponse.json({ deleted: true, demo: false });
}
