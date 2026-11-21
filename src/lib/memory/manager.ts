import { createSupabaseServerClient } from "../supabase/server";

export interface MemoryItem { id: string; type: string; key: string; value: string; source: string; confidence: number; created_at: string; }
export async function retrieveMemories(userId: string, query: string, limit = 5): Promise<MemoryItem[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];
  const { data } = await supabase.from("memories").select("id,type,key,value,source,confidence,created_at").eq("user_id", userId).eq("enabled", true).order("created_at", { ascending: false }).limit(50);
  if (!data) return [];
  const words = new Set(query.toLowerCase().split(/\W+/).filter((word) => word.length > 2));
  return (data as MemoryItem[]).map((item) => ({ item, score: [...words].filter((word) => `${item.key} ${item.value}`.toLowerCase().includes(word)).length })).filter((entry) => entry.score > 0).sort((a, b) => b.score - a.score).slice(0, limit).map(({ item }) => item);
}
export function formatMemories(memories: MemoryItem[]): string {
  return memories.length ? memories.map((memory) => `- ${memory.key}: ${memory.value}`).join("\n") : "";
}
