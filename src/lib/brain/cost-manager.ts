import type { UsageInfo } from "./types";

export function usageInfo(inputTokens?: number | null, outputTokens?: number | null, durationMs = 0): UsageInfo {
  const input = Number.isFinite(inputTokens) ? inputTokens ?? null : null;
  const output = Number.isFinite(outputTokens) ? outputTokens ?? null : null;
  return { inputTokens: input, outputTokens: output, totalTokens: input !== null && output !== null ? input + output : null, estimatedCostUsd: null, durationMs };
}
