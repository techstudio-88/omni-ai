import { config, hasGeminiConfig } from "../config";
import type { BrainInput, RequestAnalysis } from "./types";

export interface ModelDefinition {
  id: string;
  providerModelId: string;
  provider: string;
  displayName: string;
  description: string;
  capabilities: string[];
  contextWindow: number;
  supportsVision: boolean;
  supportsTools: boolean;
  supportsStreaming: boolean;
  inputCost: number | null;
  outputCost: number | null;
  speedLevel: "fast" | "balanced" | "deep";
  qualityLevel: "standard" | "high";
  enabled: boolean;
  fallbackModel: string | null;
}

// Public-facing Dist names are mapped server-side to the actual Gemini API IDs.
export const modelRegistry: ModelDefinition[] = [
  { id: "dist-flash", providerModelId: "gemini-3.8-flash", provider: "google", displayName: "Dist Flash", description: "Fast everyday chat, writing and quick analysis", capabilities: ["text-generation", "vision", "tools", "streaming", "search"], contextWindow: 1_000_000, supportsVision: true, supportsTools: true, supportsStreaming: true, inputCost: null, outputCost: null, speedLevel: "fast", qualityLevel: "high", enabled: true, fallbackModel: "dist-flash-lite" },
  { id: "dist-pro", providerModelId: "gemini-4-hydrogen", provider: "google", displayName: "Dist Pro", description: "Deeper reasoning, coding and complex work", capabilities: ["text-generation", "vision", "tools", "streaming", "search", "reasoning"], contextWindow: 1_000_000, supportsVision: true, supportsTools: true, supportsStreaming: true, inputCost: null, outputCost: null, speedLevel: "deep", qualityLevel: "high", enabled: true, fallbackModel: "dist-flash" },
  { id: "dist-flash-lite", providerModelId: "gemini-3.5-flash-lite", provider: "google", displayName: "Dist Flash Lite", description: "Lightweight responses for simple tasks", capabilities: ["text-generation", "vision", "streaming"], contextWindow: 1_000_000, supportsVision: true, supportsTools: false, supportsStreaming: true, inputCost: null, outputCost: null, speedLevel: "fast", qualityLevel: "standard", enabled: true, fallbackModel: "dist-flash" },
];

export function selectModel(input: BrainInput, analysis: RequestAnalysis): ModelDefinition {
  if (input.selectedModel && input.selectedModel !== "auto") {
    const manual = modelRegistry.find((model) => model.id === input.selectedModel);
    if (manual && (hasGeminiConfig() || config.demoMode)) return manual;
  }
  const preferred = analysis.complexity === "high" || analysis.intent === "coding" || analysis.intent === "comparison"
    ? config.reasoningModel
    : analysis.intent === "image_analysis" ? config.visionModel : config.fastModel;
  return modelRegistry.find((model) => model.providerModelId === preferred) ?? modelRegistry[0];
}
