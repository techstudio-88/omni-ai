import type { Citation } from "./types";
import { containsCredential } from "./safety-manager";

export interface EvaluationResult { approved: boolean; needsRetry: boolean; score: number; warnings: string[]; missingRequirements: string[]; }
export function evaluateResponse(text: string, requiredFormat: "markdown" | "json", citations: Citation[] = []): EvaluationResult {
  const warnings: string[] = [];
  const missingRequirements: string[] = [];
  if (!text.trim()) missingRequirements.push("response text");
  if (requiredFormat === "json") {
    try { JSON.parse(text); } catch { missingRequirements.push("valid JSON"); }
  }
  if (containsCredential(text)) warnings.push("A credential-like string was removed from the displayed answer.");
  if (citations.length > 0 && citations.some((citation) => citation.sourceType === "web" && !citation.url)) warnings.push("A citation could not be verified.");
  const score = Math.max(0, 1 - missingRequirements.length * 0.35 - warnings.length * 0.15);
  return { approved: missingRequirements.length === 0 && warnings.length === 0, needsRetry: missingRequirements.length > 0, score, warnings, missingRequirements };
}
