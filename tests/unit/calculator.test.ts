import { describe, expect, it } from "vitest";
import { calculate, calculateFromRequest } from "../../src/lib/tools/calculator";

describe("safe calculator", () => {
  it("uses mathematical precedence and parentheses", () => {
    expect(calculate("2 + 3 * (4 - 1)")).toBe(11);
  });
  it("returns a deterministic result for a supported chat question", () => {
    expect(calculateFromRequest("What is 17 * 6?")).toBe("102");
  });
  it("rejects division by zero and unsupported expressions", () => {
    expect(() => calculate("4/0")).toThrow(/zero/i);
    expect(() => calculate("2 + alert(1)")).toThrow();
  });
});
