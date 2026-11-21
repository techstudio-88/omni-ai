import { NextResponse } from "next/server";
import { z } from "zod";
import { guardApi } from "@/lib/api/guard";

const schema = z.object({ name: z.string().trim().min(1).max(80), description: z.string().max(500).default(""), instructions: z.string().trim().min(1).max(8000), model: z.string().max(100).optional() });
export async function GET() {
  const guard = await guardApi("assistants.read");
  if ("response" in guard) return guard.response;
  if (guard.auth.isDemo) return NextResponse.json({ demo: true, assistants: [{ id: "demo-assistant", name: "Project companion", description: "A sample assistant for thoughtful planning.", instructions: "Help break a goal into clear next steps." }] });
  const { data, error } = await guard.supabase!.from("custom_assistants").select("id,name,description,instructions,model,tools,visibility,created_at,updated_at").eq("workspace_id", guard.workspaceId).eq("user_id", guard.auth.userId).is("deleted_at", null).order("updated_at", { ascending: false });
  if (error) return NextResponse.json({ error: "Assistants are temporarily unavailable." }, { status: 503 });
  return NextResponse.json({ assistants: data ?? [], demo: false });
}
export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Add an assistant name and clear instructions." }, { status: 400 });
  const guard = await guardApi("assistants.create");
  if ("response" in guard) return guard.response;
  if (guard.auth.isDemo) return NextResponse.json({ assistant: { ...parsed.data, id: `demo-${crypto.randomUUID()}` }, demo: true }, { status: 201 });
  const { data, error } = await guard.supabase!.from("custom_assistants").insert({ ...parsed.data, workspace_id: guard.workspaceId, user_id: guard.auth.userId, tools: [], visibility: "private" }).select("id,name,description,instructions,model,tools,visibility,created_at").single();
  if (error || !data) return NextResponse.json({ error: "The assistant could not be saved." }, { status: 503 });
  return NextResponse.json({ assistant: data, demo: false }, { status: 201 });
}
