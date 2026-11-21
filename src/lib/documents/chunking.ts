export interface TextChunk { text: string; index: number; }
export function chunkText(source: string, maxChars = 2800, overlap = 280): TextChunk[] {
  const text = source.replace(/\r/g, "").replace(/[ \t]+\n/g, "\n").trim();
  if (!text) return [];
  const chunks: TextChunk[] = [];
  let start = 0;
  while (start < text.length) {
    let end = Math.min(text.length, start + maxChars);
    if (end < text.length) {
      const boundary = Math.max(text.lastIndexOf("\n", end), text.lastIndexOf(". ", end), text.lastIndexOf(" ", end - 200));
      if (boundary > start + Math.floor(maxChars * 0.55)) end = boundary + 1;
    }
    const value = text.slice(start, end).trim();
    if (value) chunks.push({ text: value, index: chunks.length });
    if (end >= text.length) break;
    start = Math.max(start + 1, end - overlap);
  }
  return chunks;
}
