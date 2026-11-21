import { describe, expect, it } from "vitest";
import { containsCredential, safetyWarning } from "../../src/lib/brain/safety-manager";
import { validateCitations } from "../../src/lib/brain/citation-validator";

describe("safety checks", () => {
  it("detects a credential-shaped test value", () => {
    expect(containsCredential("key=AIza" + "A".repeat(28))).toBe(true);
    expect(containsCredential("ordinary text only")).toBe(false);
  });
  it("adds a caution for high-stakes subjects", () => {
    expect(safetyWarning("Can you explain this medical diagnosis?").length).toBe(1);
    expect(safetyWarning("Help me organize my reading list.")).toEqual([]);
  });
});
describe("citation validation", () => {
  it("removes malformed web links and keeps document citations", () => {
    const result = validateCitations([
      { id: "web-good", title: "Official page", url: "https://example.org", sourceType: "web", retrievedAt: "2026-01-01" },
      { id: "web-bad", title: "Bad link", url: "javascript:alert(1)", sourceType: "web", retrievedAt: "2026-01-01" },
      { id: "doc-1", title: "Private report", pageNumber: 2, sourceType: "document", retrievedAt: "2026-01-01" },
    ]);
    expect(result.citations.map((item) => item.id)).toEqual(["web-good", "doc-1"]);
    expect(result.warning).toMatch(/removed/i);
  });
});
