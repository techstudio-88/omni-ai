import { NextResponse } from "next/server";
import { z } from "zod";
import { guardApi } from "@/lib/api/guard";

const samplePrompts = [
  { id: "starter-summary", title: "Clear summary", body: "Summarize the following in plain language. Keep the key details and next steps.\n\n{{text}}", category: "Writing", is_shared: true },
  { id: "starter-plan", title: "Turn a goal into a plan", body: "Help me turn this goal into manageable steps. Ask one clarifying question if needed.\n\n{{goal}}", category: "Planning", is_shared: true },
  { id: "starter-research", title: "Research with sources", body: "Research this question using current sources. Separate confirmed facts from uncertainty.\n\n{{question}}", category: "Research", is_shared: true },
];
const schema = z.object({ title: z.string().trim().min(1).max(100), body: z.string().trim().min(1).max(8000), category: z.string().max(60).default("General") });
export async function GET() {
  const guard = await guardApi("prompts.read");
  if ("response" in guard) return guard.response;
  if (guard.auth.isDemo) return NextResponse.json({ prompts: samplePrompts, demo: true });
  const { data, error } = await guard.supabase!.from("prompt_templates").select("id,title,body,category,is_shared,created_at,updated_at").eq("workspace_id", guard.workspaceId).eq("user_id", guard.auth.userId).is("deleted_at", null).order("updated_at", { ascending: false });
  if (error) return NextResponse.json({ error: "Prompts are temporarily unavailable." }, { status: 503 });
  return NextResponse.json({ prompts: [...samplePrompts, ...(data ?? [])], demo: false });
}
export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Add a title and prompt text." }, { status: 400 });
  const guard = await guardApi("prompts.create");
  if ("response" in guard) return guard.response;
  if (guard.auth.isDemo) return NextResponse.json({ prompt: { ...parsed.data, id: `demo-${crypto.randomUUID()}`, is_shared: false }, demo: true }, { status: 201 });
  const { data, error } = await guard.supabase!.from("prompt_templates").insert({ ...parsed.data, workspace_id: guard.workspaceId, user_id: guard.auth.userId, is_shared: false }).select("id,title,body,category,is_shared,created_at").single();
  if (error || !data) return NextResponse.json({ error: "This prompt could not be saved." }, { status: 503 });
  return NextResponse.json({ prompt: data, demo: false }, { status: 201 });
}
