import { NextResponse } from "next/server";
import { brainRequestSchema } from "@/lib/api/validation";
import { guardApi, apiError } from "@/lib/api/guard";
import { runBrain } from "@/lib/brain/run-brain";
import { modelRegistry } from "@/lib/brain/model-selector";

export async function POST(request: Request) {
  const body = brainRequestSchema.safeParse(await request.json().catch(() => null));
  if (!body.success) return apiError("The comparison request is not valid.");
  const guard = await guardApi("brain.compare");
  if ("response" in guard) return guard.response;
  const models = modelRegistry.filter((model) => model.enabled);
  const results = await Promise.all(models.map(async (model) => {
    const result = await runBrain({ ...body.data, selectedModel: model.id, selectedMode: "compare", userId: guard.auth.userId, workspaceId: guard.workspaceId, conversationId: crypto.randomUUID(), userPlan: "free" });
    return { ...result, model: model.displayName };
  }));
  return NextResponse.json({ results, demoMode: results.every((result) => result.executionStatus === "demo") }, { headers: { "Cache-Control": "no-store" } });
}
