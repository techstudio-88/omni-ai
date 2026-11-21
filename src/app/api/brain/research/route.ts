import { NextResponse } from "next/server";
import { brainRequestSchema } from "@/lib/api/validation";
import { guardApi, apiError } from "@/lib/api/guard";
import { runBrain } from "@/lib/brain/run-brain";

export async function POST(request: Request) {
  const body = brainRequestSchema.extend({ selectedMode: brainRequestSchema.shape.selectedMode.default("research"), webSearchEnabled: brainRequestSchema.shape.webSearchEnabled.default(true) }).safeParse(await request.json().catch(() => null));
  if (!body.success) return apiError("The research request is not valid.");
  const guard = await guardApi("brain.research");
  if ("response" in guard) return guard.response;
  const result = await runBrain({ ...body.data, selectedMode: "research", webSearchEnabled: true, userId: guard.auth.userId, workspaceId: guard.workspaceId, conversationId: crypto.randomUUID(), userPlan: "free" });
  return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
}
