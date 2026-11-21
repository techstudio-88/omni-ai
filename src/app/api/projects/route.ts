import { NextResponse } from "next/server";
import { z } from "zod";
import { guardApi } from "@/lib/api/guard";

const schema = z.object({ name: z.string().trim().min(1).max(100), description: z.string().max(800).default(""), instructions: z.string().max(4000).default("") });
export async function GET() {
  const guard = await guardApi("projects.read");
  if ("response" in guard) return guard.response;
  if (guard.auth.isDemo) return NextResponse.json({ demo: true, projects: [{ id: "demo-project", name: "First steps", description: "A sample project space to explore OmniBrain.", created_at: new Date().toISOString() }] });
  const { data, error } = await guard.supabase!.from("projects").select("id,name,description,instructions,status,created_at,updated_at").eq("workspace_id", guard.workspaceId).eq("user_id", guard.auth.userId).is("deleted_at", null).order("updated_at", { ascending: false });
  if (error) return NextResponse.json({ error: "Projects are temporarily unavailable." }, { status: 503 });
  return NextResponse.json({ projects: data ?? [], demo: false });
}
export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Add a name for the project." }, { status: 400 });
  const guard = await guardApi("projects.create");
  if ("response" in guard) return guard.response;
  if (guard.auth.isDemo) return NextResponse.json({ project: { ...parsed.data, id: `demo-${crypto.randomUUID()}`, created_at: new Date().toISOString() }, demo: true }, { status: 201 });
  const { data, error } = await guard.supabase!.from("projects").insert({ ...parsed.data, workspace_id: guard.workspaceId, user_id: guard.auth.userId }).select("id,name,description,instructions,status,created_at").single();
  if (error || !data) return NextResponse.json({ error: "The project could not be saved." }, { status: 503 });
  return NextResponse.json({ project: data, demo: false }, { status: 201 });
}
