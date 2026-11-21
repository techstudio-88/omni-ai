export const intents = [
  "general_chat", "research", "coding", "writing", "summarization", "translation",
  "document_question", "data_analysis", "image_analysis", "comparison", "planning",
  "structured_extraction", "task_execution",
] as const;
export type Intent = (typeof intents)[number];
export type BrainMode = "chat" | "research" | "compare" | "documents" | "coding" | "writing";
export type Complexity = "low" | "medium" | "high";
export type SafetyLevel = "safe" | "sensitive" | "blocked";
export type Workflow = "general-chat" | "research" | "document-qa" | "coding" | "comparison" | "structured-extraction" | "planning";

export interface AttachmentRef { id: string; name: string; mimeType?: string; }
export interface BrainInput {
  userId: string;
  workspaceId: string;
  conversationId: string;
  message: string;
  attachments: AttachmentRef[];
  selectedModel: string;
  selectedMode: BrainMode;
  userPlan: "free" | "pro" | "team" | "enterprise";
  webSearchEnabled: boolean;
  memoryEnabled: boolean;
  projectId?: string;
}
export interface RequestAnalysis {
  intent: Intent;
  language: string;
  complexity: Complexity;
  workflow: Workflow;
  needsWebSearch: boolean;
  needsDocumentSearch: boolean;
  needsMemory: boolean;
  needsTools: boolean;
  requiredCapabilities: string[];
  requiresConfirmation: boolean;
  safetyLevel: SafetyLevel;
  responseFormat: "markdown" | "json";
}
export interface Citation { id: string; title: string; url?: string; pageNumber?: number; sectionTitle?: string; sourceType: "web" | "document" | "demo"; retrievedAt: string; }
export interface UsageInfo { inputTokens: number | null; outputTokens: number | null; totalTokens: number | null; estimatedCostUsd: number | null; durationMs: number; }
export interface BrainResponse {
  responseText: string;
  provider: string;
  model: string;
  workflow: Workflow;
  citations: Citation[];
  filesUsed: string[];
  toolsUsed: string[];
  usage: UsageInfo;
  warnings: string[];
  executionStatus: "completed" | "demo" | "failed" | "confirmation_required";
}
