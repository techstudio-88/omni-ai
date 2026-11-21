import type { SupabaseClient } from "@supabase/supabase-js";

export const FREE_DAILY_MESSAGE_LIMIT = 20;

export async function getDailyUsage(supabase: SupabaseClient, userId: string) {
  const start = new Date(); start.setUTCHours(0, 0, 0, 0);
  const { count, error } = await supabase.from("usage_events").select("id", { count: "exact", head: true })
    .eq("user_id", userId).gte("created_at", start.toISOString()).is("deleted_at", null);
  return { used: count ?? 0, limit: FREE_DAILY_MESSAGE_LIMIT, error };
}
