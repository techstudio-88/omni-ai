import type { BrainInput, RequestAnalysis } from "./types";

const includes = (text: string, patterns: RegExp) => patterns.test(text);

export function analyseRequest(input: Pick<BrainInput, "message" | "attachments" | "selectedMode" | "webSearchEnabled" | "memoryEnabled">): RequestAnalysis {
  const text = input.message.trim();
  const normalized = text.toLowerCase();
  const hasFile = input.attachments.length > 0;
  let intent: RequestAnalysis["intent"] = "general_chat";

  if (input.selectedMode === "compare" || includes(normalized, /\b(compare|comparison|versus|\bvs\.?\b)\b/)) intent = "comparison";
  else if (hasFile || includes(normalized, /\b(pdf|document|file|attachment|contract|resume|spreadsheet)\b/)) intent = "document_question";
  else if (input.selectedMode === "research" || includes(normalized, /\b(latest|current|today|this week|recent|research|sources|citations|look up)\b/)) intent = "research";
  else if (input.selectedMode === "coding" || includes(normalized, /\b(code|typescript|javascript|python|react|next\.js|debug|function|component|api route)\b/)) intent = "coding";
  else if (input.selectedMode === "writing" || includes(normalized, /\b(write|draft|rewrite|email|story|post|essay)\b/)) intent = "writing";
  else if (includes(normalized, /\b(translate|translation|in hindi|in french|in spanish)\b/)) intent = "translation";
  else if (includes(normalized, /\b(summarize|summary|key points|tl;dr)\b/)) intent = "summarization";
  else if (includes(normalized, /\b(json|extract fields|structured output|schema)\b/)) intent = "structured_extraction";
  else if (includes(normalized, /\b(plan|roadmap|schedule|steps)\b/)) intent = "planning";
  else if (includes(normalized, /\b(chart|analyze data|analyse data|dataset|csv)\b/)) intent = "data_analysis";

  const needsDocumentSearch = hasFile || intent === "document_question";
  const needsWebSearch = input.webSearchEnabled && (intent === "research" || includes(normalized, /https?:\/\//));
  const needsTools = needsWebSearch || needsDocumentSearch || /\d\s*[+*/%-]\s*\d|\b\d+(?:\.\d+)?\s*%\s*of\s*\d+/i.test(text);
  const requiresConfirmation = includes(normalized, /\b(send|publish|delete|pay|purchase|book|create event|message someone|update database)\b/);
  const safetyLevel = includes(normalized, /\b(suicide|self-harm|weapon construction|steal credentials)\b/) ? "blocked" : includes(normalized, /\b(medical|diagnosis|legal advice|investment|tax advice|financial advice)\b/) ? "sensitive" : "safe";
  const complexity: RequestAnalysis["complexity"] = text.length > 900 || (text.match(/\?/g)?.length ?? 0) > 3 ? "high" : text.length < 120 ? "low" : "medium";
  const language = /[\u0900-\u097f]/.test(text) ? "hi" : /[\u4e00-\u9fff]/.test(text) ? "zh" : "en";
  const workflow = intent === "research" ? "research" : intent === "document_question" ? "document-qa" : intent === "coding" ? "coding" : intent === "comparison" ? "comparison" : intent === "structured_extraction" ? "structured-extraction" : intent === "planning" ? "planning" : "general-chat";

  return {
    intent, language, complexity, workflow, needsWebSearch,
    needsDocumentSearch, needsMemory: input.memoryEnabled,
    needsTools, requiredCapabilities: [needsDocumentSearch ? "document-retrieval" : "text-generation"],
    requiresConfirmation, safetyLevel, responseFormat: /\b(json|valid json)\b/i.test(text) ? "json" : "markdown",
  };
}
