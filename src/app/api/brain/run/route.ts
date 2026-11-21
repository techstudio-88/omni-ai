import { NextResponse } from "next/server";
import { brainRequestSchema } from "@/lib/api/validation";
import { guardApi, apiError } from "@/lib/api/guard";
import { runBrain } from "@/lib/brain/run-brain";

export async function POST(request: Request) {
  const body = brainRequestSchema.safeParse(await request.json().catch(() => null));
  if (!body.success) return apiError("The request is not valid.");
  const guard = await guardApi("brain.run");
  if ("response" in guard) return guard.response;
  const input = { ...body.data, userId: guard.auth.userId, workspaceId: "default", conversationId: crypto.randomUUID(), userPlan: "free" as const };
  const result = await runBrain(input);
  return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
}
