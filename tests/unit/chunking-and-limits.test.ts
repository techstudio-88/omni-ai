import { describe, expect, it } from "vitest";
import { chunkText } from "../../src/lib/documents/chunking";
import { FREE_DAILY_MESSAGE_LIMIT } from "../../src/lib/usage-limits";

describe("document chunking", () => {
  it("returns non-empty chunks within the configured maximum", () => {
    const chunks = chunkText(("A careful sentence with useful context. ").repeat(180), 300, 30);
    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks.every((chunk) => chunk.text.length <= 300)).toBe(true);
    expect(chunks.every((chunk) => chunk.text.trim().length > 0)).toBe(true);
  });
  it("returns no chunks for empty content", () => {
    expect(chunkText("  \n ")).toEqual([]);
  });
});
describe("free usage limits", () => {
  it("sets a small daily free message allowance", () => {
    expect(FREE_DAILY_MESSAGE_LIMIT).toBe(20);
  });
});
