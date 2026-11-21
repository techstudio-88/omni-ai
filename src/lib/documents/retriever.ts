import { createSupabaseServerClient } from "../supabase/server";
import type { Citation } from "../brain/types";

export interface RetrievedChunk { documentId: string; documentName: string; pageNumber: number | null; sectionTitle: string | null; text: string; score: number; }
function terms(text: string): string[] { return [...new Set(text.toLowerCase().match(/[\p{L}\p{N}]{3,}/gu) ?? [])].slice(0, 40); }

export async function retrieveDocumentChunks(userId: string, query: string, documentIds: string[] = [], limit = 5): Promise<{ chunks: RetrievedChunk[]; citations: Citation[] }> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { chunks: [], citations: [] };
  let request = supabase.from("document_chunks").select("id,document_id,page_number,section_title,text,documents!inner(name,status,user_id)").eq("user_id", userId).eq("documents.status", "ready").limit(250);
  if (documentIds.length) request = request.in("document_id", documentIds);
  const { data, error } = await request;
  if (error || !data) return { chunks: [], citations: [] };
  const queryTerms = terms(query);
  const ranked = data.map((row) => {
    const record = row as unknown as { id: string; document_id: string; page_number: number | null; section_title: string | null; text: string; documents: { name: string } };
    const haystack = record.text.toLowerCase();
    const hits = queryTerms.reduce((count, term) => count + (haystack.includes(term) ? 1 : 0), 0);
    return { documentId: record.document_id, documentName: record.documents.name, pageNumber: record.page_number, sectionTitle: record.section_title, text: record.text, score: queryTerms.length ? hits / queryTerms.length : 0 };
  }).filter((chunk) => chunk.score > 0).sort((a, b) => b.score - a.score).slice(0, limit);
  const citations = ranked.map((chunk, index) => ({ id: `doc-${index + 1}`, title: chunk.documentName, pageNumber: chunk.pageNumber ?? undefined, sectionTitle: chunk.sectionTitle ?? undefined, sourceType: "document" as const, retrievedAt: new Date().toISOString() }));
  return { chunks: ranked, citations };
}
