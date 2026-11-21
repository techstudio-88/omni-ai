import { NextResponse } from "next/server";
import { z } from "zod";
import { guardApi } from "@/lib/api/guard";

const createSchema = z.object({ type: z.string().min(1).max(40).default("preference"), key: z.string().trim().min(1).max(100), value: z.string().trim().min(1).max(1000) });
const demoMemories = [
  { id: "demo-memory-style", type: "preference", key: "Writing style", value: "Clear, direct explanations with examples.", source: "sample", confidence: 1, enabled: true, created_at: "2026-11-01T09:00:00.000Z" },
  { id: "demo-memory-work", type: "preference", key: "Work focus", value: "I use this space to plan projects and learn.", source: "sample", confidence: 1, enabled: true, created_at: "2026-11-01T09:00:00.000Z" },
];

export async function GET() {
  const guard = await guardApi("memories.read");
  if ("response" in guard) return guard.response;
  if (guard.auth.isDemo) return NextResponse.json({ memories: demoMemories, demo: true });
  const { data, error } = await guard.supabase!.from("memories").select("id,type,key,value,source,confidence,enabled,created_at")
    .eq("user_id", guard.auth.userId).is("deleted_at", null).order("created_at", { ascending: false }).limit(100);
  if (error) return NextResponse.json({ error: "Memories are temporarily unavailable." }, { status: 503 });
  return NextResponse.json({ memories: data ?? [], demo: false }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Enter a short name and value for this memory." }, { status: 400 });
  const guard = await guardApi("memories.create");
  if ("response" in guard) return guard.response;
  if (guard.auth.isDemo) return NextResponse.json({ memory: { ...parsed.data, id: `demo-${crypto.randomUUID()}`, source: "sample", enabled: true }, demo: true }, { status: 201 });
  const { data, error } = await guard.supabase!.from("memories").insert({ ...parsed.data, workspace_id: guard.workspaceId, user_id: guard.auth.userId, source: "user" })
    .select("id,type,key,value,source,confidence,enabled,created_at").single();
  if (error || !data) return NextResponse.json({ error: "This memory could not be saved." }, { status: 503 });
  return NextResponse.json({ memory: data, demo: false }, { status: 201 });
}
