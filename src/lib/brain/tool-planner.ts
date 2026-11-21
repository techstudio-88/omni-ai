import type { RequestAnalysis } from "./types";

export interface PlannedTool { name: string; requiresConfirmation: boolean; available: boolean; reason?: string; }
export function planTools(analysis: RequestAnalysis): PlannedTool[] {
  const tools: PlannedTool[] = [];
  if (analysis.needsWebSearch) tools.push({ name: "web-search", requiresConfirmation: false, available: true });
  if (analysis.needsDocumentSearch) tools.push({ name: "file-search", requiresConfirmation: false, available: true });
  if (analysis.requiresConfirmation) tools.push({ name: "external-action", requiresConfirmation: true, available: false, reason: "No external action connector is configured." });
  return tools;
}
