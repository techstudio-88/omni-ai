import { describe, expect, it } from "vitest";
import { analyseRequest } from "../../src/lib/brain/request-analyser";
import type { BrainInput } from "../../src/lib/brain/types";

function input(overrides: Partial<BrainInput> = {}): BrainInput {
  return {
    userId: "user", workspaceId: "workspace", conversationId: "conversation", message: "Hello there",
    attachments: [], selectedModel: "auto", selectedMode: "chat", userPlan: "free",
    webSearchEnabled: false, memoryEnabled: false, ...overrides,
  };
}
describe("analyseRequest", () => {
  it("routes a current information question to research when search is enabled", () => {
    const result = analyseRequest(input({ message: "Research recent battery storage developments", selectedMode: "research", webSearchEnabled: true }));
    expect(result.intent).toBe("research");
    expect(result.needsWebSearch).toBe(true);
    expect(result.workflow).toBe("research");
  });
  it("detects uploaded documents and keeps their search in the document workflow", () => {
    const result = analyseRequest(input({ attachments: [{ id: "file-id", name: "report.pdf" }] }));
    expect(result.intent).toBe("document_question");
    expect(result.needsDocumentSearch).toBe(true);
  });
  it("asks for confirmation before an external action", () => {
    const result = analyseRequest(input({ message: "Send this email to my team" }));
    expect(result.requiresConfirmation).toBe(true);
  });
  it("never marks optional memory as needed unless the user enabled it", () => {
    expect(analyseRequest(input()).needsMemory).toBe(false);
    expect(analyseRequest(input({ memoryEnabled: true })).needsMemory).toBe(true);
  });
});
