import { NextResponse } from "next/server";
import { z } from "zod";
import { idSchema } from "@/lib/api/validation";
import { guardApi } from "@/lib/api/guard";

const patchSchema = z.object({ key: z.string().trim().min(1).max(100).optional(), value: z.string().trim().min(1).max(1000).optional(), enabled: z.boolean().optional() }).refine((body) => Object.keys(body).length > 0);
export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (!idSchema.safeParse(id).success) return NextResponse.json({ error: "The memory could not be found." }, { status: 404 });
  const parsed = patchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "The memory update is not valid." }, { status: 400 });
  const guard = await guardApi("memories.update");
  if ("response" in guard) return guard.response;
  if (guard.auth.isDemo) return NextResponse.json({ updated: true, demo: true });
  const { data, error } = await guard.supabase!.from("memories").update(parsed.data).eq("id", id).eq("user_id", guard.auth.userId).is("deleted_at", null).select("id").maybeSingle();
  if (error || !data) return NextResponse.json({ error: "The memory could not be found." }, { status: 404 });
  return NextResponse.json({ updated: true, demo: false });
}
export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (!idSchema.safeParse(id).success) return NextResponse.json({ error: "The memory could not be found." }, { status: 404 });
  const guard = await guardApi("memories.delete");
  if ("response" in guard) return guard.response;
  if (guard.auth.isDemo) return NextResponse.json({ deleted: true, demo: true });
  const { data, error } = await guard.supabase!.from("memories").update({ enabled: false, deleted_at: new Date().toISOString() }).eq("id", id).eq("user_id", guard.auth.userId).is("deleted_at", null).select("id").maybeSingle();
  if (error || !data) return NextResponse.json({ error: "The memory could not be found." }, { status: 404 });
  return NextResponse.json({ deleted: true, demo: false });
}
