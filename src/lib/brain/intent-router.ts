import type { Intent, Workflow } from "./types";

const workflowByIntent: Record<Intent, Workflow> = {
  general_chat: "general-chat", research: "research", coding: "coding", writing: "general-chat",
  summarization: "general-chat", translation: "general-chat", document_question: "document-qa",
  data_analysis: "general-chat", image_analysis: "document-qa", comparison: "comparison",
  planning: "planning", structured_extraction: "structured-extraction", task_execution: "general-chat",
};

export function routeIntent(intent: Intent): Workflow {
  return workflowByIntent[intent] ?? "general-chat";
}
