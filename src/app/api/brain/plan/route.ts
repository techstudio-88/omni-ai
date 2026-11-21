import { NextResponse } from "next/server";
import { analyseRequest } from "@/lib/brain/request-analyser";
import { buildWorkflowSteps } from "@/lib/brain/workflow-engine";
import { selectModel } from "@/lib/brain/model-selector";
import { planTools } from "@/lib/brain/tool-planner";
import { brainRequestSchema } from "@/lib/api/validation";
import { guardApi, apiError } from "@/lib/api/guard";

export async function POST(request: Request) {
  const body = brainRequestSchema.safeParse(await request.json().catch(() => null));
  if (!body.success) return apiError("The request is not valid.");
  const guard = await guardApi("brain.plan");
  if ("response" in guard) return guard.response;
  const input = { ...body.data, userId: guard.auth.userId, workspaceId: guard.workspaceId, conversationId: "plan", userPlan: "free" as const, attachments: body.data.attachments };
  const analysis = analyseRequest(input);
  return NextResponse.json({ analysis, selectedModel: selectModel(input, analysis), steps: buildWorkflowSteps(analysis), tools: planTools(analysis) });
}
