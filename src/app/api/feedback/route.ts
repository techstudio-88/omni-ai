import { NextResponse } from "next/server";
import { z } from "zod";
import { guardApi } from "@/lib/api/guard";

const schema = z.object({ rating: z.number().int().min(1).max(5), comment: z.string().max(2000).optional(), category: z.string().max(60).optional(), messageId: z.string().uuid().optional() });
export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Choose a rating from one to five." }, { status: 400 });
  const guard = await guardApi("feedback.create");
  if ("response" in guard) return guard.response;
  if (guard.auth.isDemo) return NextResponse.json({ saved: true, demo: true }, { status: 201 });
  const { messageId, ...values } = parsed.data;
  const { error } = await guard.supabase!.from("feedback").insert({ ...values, message_id: messageId ?? null, workspace_id: guard.workspaceId, user_id: guard.auth.userId });
  if (error) return NextResponse.json({ error: "Feedback could not be saved." }, { status: 503 });
  return NextResponse.json({ saved: true, demo: false }, { status: 201 });
}
