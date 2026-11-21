import type { RequestAnalysis, Workflow } from "./types";

export function buildWorkflowSteps(analysis: RequestAnalysis): string[] {
  const steps = ["Understanding request", "Selecting the best model"];
  if (analysis.needsMemory) steps.push("Retrieving enabled memory");
  if (analysis.needsDocumentSearch) steps.push("Searching documents");
  if (analysis.needsWebSearch) steps.push("Searching the web");
  steps.push("Preparing response", "Checking answer");
  return steps;
}

export function workflowLabel(workflow: Workflow): string {
  const labels: Record<Workflow, string> = {
    "general-chat": "General chat", research: "Research", "document-qa": "Document intelligence",
    coding: "Coding", comparison: "Model comparison", "structured-extraction": "Structured extraction", planning: "Planning",
  };
  return labels[workflow];
}
