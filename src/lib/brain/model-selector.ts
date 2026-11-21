import { config, hasGeminiConfig } from "../config";
import type { BrainInput, RequestAnalysis } from "./types";

export interface ModelDefinition {
  id: string; provider: string; displayName: string; capabilities: string[];
  contextWindow: number; supportsVision: boolean; supportsTools: boolean; supportsStreaming: boolean;
  inputCost: number | null; outputCost: number | null; speedLevel: "fast" | "balanced" | "deep";
  qualityLevel: "standard" | "high"; enabled: boolean; fallbackModel: string | null;
}

export const modelRegistry: ModelDefinition[] = [
  { id: "gemini-3.5-flash-lite", provider: "google", displayName: "Gemini 3.5 Flash-Lite", capabilities: ["text-generation", "tools", "streaming"], contextWindow: 1_000_000, supportsVision: true, supportsTools: true, supportsStreaming: true, inputCost: null, outputCost: null, speedLevel: "fast", qualityLevel: "standard", enabled: true, fallbackModel: "gemini-3-flash-preview" },
  { id: "gemini-3-flash-preview", provider: "google", displayName: "Gemini 3 Flash", capabilities: ["text-generation", "vision", "tools", "streaming", "search"], contextWindow: 1_000_000, supportsVision: true, supportsTools: true, supportsStreaming: true, inputCost: null, outputCost: null, speedLevel: "balanced", qualityLevel: "high", enabled: true, fallbackModel: "gemini-3.5-flash-lite" },
  { id: "gemini-3.1-pro-preview", provider: "google", displayName: "Gemini 3.1 Pro", capabilities: ["text-generation", "vision", "tools", "streaming", "search", "reasoning"], contextWindow: 1_000_000, supportsVision: true, supportsTools: true, supportsStreaming: true, inputCost: null, outputCost: null, speedLevel: "deep", qualityLevel: "high", enabled: true, fallbackModel: "gemini-3.5-flash-lite" },
];

export function selectModel(input: BrainInput, analysis: RequestAnalysis): ModelDefinition {
  if (input.selectedModel && input.selectedModel !== "auto") {
    const manual = modelRegistry.find((model) => model.id === input.selectedModel);
    if (manual && (hasGeminiConfig() || config.demoMode)) return manual;
  }
  const preferred = analysis.complexity === "high" || analysis.intent === "coding" || analysis.intent === "comparison"
    ? config.reasoningModel
    : analysis.intent === "image_analysis" ? config.visionModel : config.fastModel;
  const selected = modelRegistry.find((model) => model.id === preferred) ?? modelRegistry[0];
  return selected;
}
