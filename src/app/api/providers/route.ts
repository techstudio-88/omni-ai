import { NextResponse } from "next/server";
import { config } from "@/lib/config";
import { getProviderReadiness } from "@/lib/providers/gemini";

const futureProviders = [
  { id: "openai", name: "OpenAI", status: "adapter_pending" },
  { id: "anthropic", name: "Anthropic", status: "adapter_pending" },
  { id: "deepseek", name: "DeepSeek", status: "adapter_pending" },
  { id: "xai", name: "xAI", status: "adapter_pending" },
  { id: "mistral", name: "Mistral", status: "adapter_pending" },
  { id: "perplexity", name: "Perplexity", status: "adapter_pending" },
  { id: "local", name: "OpenAI-compatible local model", status: "adapter_pending" },
];
export async function GET() {
  return NextResponse.json({ providers: [getProviderReadiness(), ...futureProviders], demoMode: config.demoMode }, { headers: { "Cache-Control": "no-store" } });
}
