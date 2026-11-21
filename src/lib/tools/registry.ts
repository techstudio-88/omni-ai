export const toolRegistry = [
  { name: "calculator", description: "Evaluate safe arithmetic expressions.", requiresConfirmation: false, available: true },
  { name: "web-search", description: "Search the web using Gemini Google Search grounding.", requiresConfirmation: false, available: true },
  { name: "file-search", description: "Search documents available in the signed-in workspace.", requiresConfirmation: false, available: true },
  { name: "url-reader", description: "Read a user-provided public URL through provider URL context.", requiresConfirmation: false, available: true },
  { name: "date-time", description: "Resolve the current date and time.", requiresConfirmation: false, available: true },
  { name: "image-analysis", description: "Analyze an uploaded image with a vision-capable model.", requiresConfirmation: false, available: true },
  { name: "code-execution", description: "Run code in an isolated sandbox.", requiresConfirmation: false, available: false, reason: "Sandbox not configured." },
  { name: "send-email", description: "Send an email.", requiresConfirmation: true, available: false, reason: "External actions are disabled." },
  { name: "publish-content", description: "Publish content to an external service.", requiresConfirmation: true, available: false, reason: "External actions are disabled." },
] as const;
