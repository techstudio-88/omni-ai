import { NextResponse } from "next/server";
import { z } from "zod";
import { guardApi } from "@/lib/api/guard";

const schema = z.object({ toolCallId: z.string().uuid(), confirmed: z.literal(true) });
export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Confirm the pending tool request explicitly." }, { status: 400 });
  const guard = await guardApi("tools.confirm");
  if ("response" in guard) return guard.response;
  if (guard.auth.isDemo || !guard.supabase) return NextResponse.json({ confirmed: false, message: "Demo tool requests are examples and are never executed." }, { status: 409 });
  const { data, error } = await guard.supabase.from("tool_calls").update({ status: "confirmed_not_executed", confirmed_at: new Date().toISOString() })
    .eq("id", parsed.data.toolCallId).eq("user_id", guard.auth.userId).eq("workspace_id", guard.workspaceId).eq("status", "pending")
    .select("id,tool_id").maybeSingle();
  if (error || !data) return NextResponse.json({ error: "The pending request could not be found." }, { status: 404 });
  return NextResponse.json({ confirmed: true, executed: false, message: "Your confirmation was recorded. This workspace has no connected external action provider, so nothing was sent or changed." });
}
