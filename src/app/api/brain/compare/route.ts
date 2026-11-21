import { NextResponse } from "next/server";
import { brainRequestSchema } from "@/lib/api/validation";
import { guardApi, apiError } from "@/lib/api/guard";
import { runBrain } from "@/lib/brain/run-brain";

export async function POST(request: Request) {
  const body = brainRequestSchema.safeParse(await request.json().catch(() => null));
  if (!body.success) return apiError("The comparison request is not valid.");
  const guard = await guardApi("brain.compare");
  if ("response" in guard) return guard.response;
  const models = ["gemini-3.5-flash-lite", "gemini-3-flash-preview", "gemini-3.1-pro-preview"];
  const results = await Promise.all(models.map((selectedModel) => runBrain({ ...body.data, selectedModel, selectedMode: "compare", userId: guard.auth.userId, workspaceId: "default", conversationId: crypto.randomUUID(), userPlan: "free" })));
  return NextResponse.json({ results, demoMode: results.every((result) => result.executionStatus === "demo") }, { headers: { "Cache-Control": "no-store" } });
}
