import { NextResponse } from "next/server";
import { z } from "zod";
import { guardApi } from "@/lib/api/guard";

const schema = z.object({ title: z.string().trim().max(120).optional(), mode: z.enum(["chat", "research", "compare", "documents", "coding", "writing"]).default("chat"), projectId: z.string().uuid().optional() });
const sampleId = "a8cda50b-b5cf-4a09-85c3-b672787e6e28";
export async function GET() {
  const guard = await guardApi("conversations.read");
  if ("response" in guard) return guard.response;
  if (guard.auth.isDemo) return NextResponse.json({ demo: true, conversations: [{ id: sampleId, title: "A sample conversation", mode: "chat", updated_at: "2026-11-01T09:00:00.000Z", sample: true }] });
  const { data, error } = await guard.supabase!.from("conversations").select("id,title,mode,model,updated_at,created_at")
    .eq("workspace_id", guard.workspaceId).eq("user_id", guard.auth.userId).is("deleted_at", null).order("updated_at", { ascending: false }).limit(50);
  if (error) return NextResponse.json({ error: "Conversation history is temporarily unavailable." }, { status: 503 });
  return NextResponse.json({ conversations: data ?? [], demo: false }, { headers: { "Cache-Control": "no-store" } });
}
export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "The conversation details are not valid." }, { status: 400 });
  const guard = await guardApi("conversations.create");
  if ("response" in guard) return guard.response;
  const title = parsed.data.title || "New conversation";
  if (guard.auth.isDemo) return NextResponse.json({ conversation: { id: crypto.randomUUID(), title, mode: parsed.data.mode, updated_at: new Date().toISOString() }, demo: true }, { status: 201 });
  const { data, error } = await guard.supabase!.from("conversations").insert({
    workspace_id: guard.workspaceId, user_id: guard.auth.userId, title, mode: parsed.data.mode, project_id: parsed.data.projectId ?? null,
  }).select("id,title,mode,model,updated_at,created_at").single();
  if (error || !data) return NextResponse.json({ error: "A new conversation could not be created." }, { status: 503 });
  return NextResponse.json({ conversation: data, demo: false }, { status: 201 });
}
