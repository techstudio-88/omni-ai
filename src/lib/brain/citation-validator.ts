import type { Citation } from "./types";

export function validateCitations(citations: Citation[]): { citations: Citation[]; warning?: string } {
  const unique = new Map<string, Citation>();
  for (const citation of citations) {
    if (!citation.id || !citation.title) continue;
    if (citation.sourceType === "web" && (!citation.url || !/^https?:\/\//i.test(citation.url))) continue;
    unique.set(citation.id, citation);
  }
  const result = [...unique.values()];
  return { citations: result, warning: result.length === citations.length ? undefined : "Some source references were removed because they could not be verified." };
}
