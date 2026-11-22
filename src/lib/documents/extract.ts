import Papa from "papaparse";
import mammoth from "mammoth";

export interface ExtractedPage { pageNumber: number | null; sectionTitle: string | null; text: string; }
const allowedTypes = new Set(["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain", "text/markdown", "text/csv", "image/png", "image/jpeg", "image/webp", "application/json", "text/html", "application/xml", "text/xml", "text/x-log"]);
export function isSupportedDocument(mimeType: string, name: string): boolean {
  const ext = name.toLowerCase().split(".").pop();
  return allowedTypes.has(mimeType) || ["pdf", "docx", "txt", "md", "csv", "png", "jpg", "jpeg", "webp", "json", "html", "xml", "log"].includes(ext ?? "");
}

export async function extractDocument(buffer: Buffer, mimeType: string, name: string): Promise<ExtractedPage[]> {
  const ext = name.toLowerCase().split(".").pop();
  if (mimeType === "application/pdf" || ext === "pdf") {
    const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
    const pdf = await pdfjs.getDocument({ data: new Uint8Array(buffer) }).promise;
    const pages: ExtractedPage[] = [];
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
      const page = await pdf.getPage(pageNumber);
      const content = await page.getTextContent();
      const text = content.items.flatMap((item) => "str" in item ? [item.str] : []).join(" ").trim();
      if (text) pages.push({ pageNumber, sectionTitle: null, text });
    }
    return pages;
  }
  if (ext === "docx" || mimeType.includes("wordprocessingml")) {
    const result = await mammoth.extractRawText({ buffer });
    return [{ pageNumber: null, sectionTitle: null, text: result.value }];
  }
  if (ext === "csv" || mimeType === "text/csv") {
    const parsed = Papa.parse<string[]>(buffer.toString("utf8"), { skipEmptyLines: true });
    const text = parsed.data.map((row) => row.map((cell) => cell.trim()).join(" | ")).join("\n");
    return [{ pageNumber: null, sectionTitle: null, text }];
  }
  if (mimeType.startsWith("image/") || ["png", "jpg", "jpeg", "webp"].includes(ext ?? "")) {
    return [{ pageNumber: null, sectionTitle: "Image", text: "" }];
  }
  return [{ pageNumber: null, sectionTitle: null, text: buffer.toString("utf8") }];
}
