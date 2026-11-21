import { NextResponse } from "next/server";
import { idSchema } from "@/lib/api/validation";
import { guardApi } from "@/lib/api/guard";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (!idSchema.safeParse(id).success) return NextResponse.json({ error: "The conversation could not be found." }, { status: 404 });
  const guard = await guardApi("conversations.read");
  if ("response" in guard) return guard.response;
  if (guard.auth.isDemo) return NextResponse.json({ demo: true, conversation: { id, title: "A sample conversation", mode: "chat" }, messages: [{ id: "sample-user-message", role: "user", content: "What can OmniBrain help with?" }, { id: "sample-assistant-message", role: "assistant", content: "This is a sample conversation. Start a chat to try the demo workspace." }] });
  const { data: conversation, error } = await guard.supabase!.from("conversations").select("id,title,mode,model,created_at,updated_at").eq("id", id).eq("workspace_id", guard.workspaceId).eq("user_id", guard.auth.userId).is("deleted_at", null).maybeSingle();
  if (error || !conversation) return NextResponse.json({ error: "The conversation could not be found." }, { status: 404 });
  const { data: messages, error: messageError } = await guard.supabase!.from("messages").select("id,role,content,model,provider,created_at").eq("conversation_id", id).eq("workspace_id", guard.workspaceId).eq("user_id", guard.auth.userId).is("deleted_at", null).order("created_at", { ascending: true }).limit(200);
  if (messageError) return NextResponse.json({ error: "This conversation could not be opened." }, { status: 503 });
  return NextResponse.json({ conversation, messages: messages ?? [], demo: false }, { headers: { "Cache-Control": "no-store" } });
}
export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (!idSchema.safeParse(id).success) return NextResponse.json({ error: "The conversation could not be found." }, { status: 404 });
  const guard = await guardApi("conversations.delete");
  if ("response" in guard) return guard.response;
  if (guard.auth.isDemo) return NextResponse.json({ error: "Demo conversations are examples and cannot be deleted." }, { status: 409 });
  const { data, error } = await guard.supabase!.from("conversations").update({ deleted_at: new Date().toISOString() }).eq("id", id).eq("user_id", guard.auth.userId).is("deleted_at", null).select("id").maybeSingle();
  if (error || !data) return NextResponse.json({ error: "The conversation could not be found." }, { status: 404 });
  return NextResponse.json({ deleted: true });
}
