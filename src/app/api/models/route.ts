import { NextResponse } from "next/server";
import { modelRegistry } from "@/lib/brain/model-selector";
import { config, hasGeminiConfig } from "@/lib/config";

export async function GET() {
  const models = modelRegistry.map((model) => ({ ...model, enabled: config.demoMode || hasGeminiConfig() }));
  return NextResponse.json({ models, demoMode: config.demoMode }, { headers: { "Cache-Control": "no-store" } });
}
