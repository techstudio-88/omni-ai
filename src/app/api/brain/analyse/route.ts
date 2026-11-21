import { NextResponse } from "next/server";
import { analyseRequest } from "@/lib/brain/request-analyser";
import { planTools } from "@/lib/brain/tool-planner";
import { brainRequestSchema } from "@/lib/api/validation";
import { guardApi, apiError } from "@/lib/api/guard";

export async function POST(request: Request) {
  const body = brainRequestSchema.safeParse(await request.json().catch(() => null));
  if (!body.success) return apiError("The request is not valid.");
  const guard = await guardApi("brain.analyse");
  if ("response" in guard) return guard.response;
  const analysis = analyseRequest(body.data);
  return NextResponse.json({ analysis, tools: planTools(analysis), warnings: [] }, { headers: { "Cache-Control": "no-store" } });
}
