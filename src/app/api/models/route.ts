import { NextResponse } from "next/server";
import { publicModelCatalog } from "@/lib/brain/public-models";
import { config, hasGeminiConfig } from "@/lib/config";

export async function GET() {
  const models = publicModelCatalog.map((model) => ({ ...model, enabled: config.demoMode || hasGeminiConfig() }));
  return NextResponse.json({ models, demoMode: config.demoMode }, { headers: { "Cache-Control": "no-store" } });
}
