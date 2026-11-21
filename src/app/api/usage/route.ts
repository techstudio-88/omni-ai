import { NextResponse } from "next/server";
import { guardApi } from "@/lib/api/guard";
import { config } from "@/lib/config";

export async function GET() {
  const guard = await guardApi("usage.read");
  if ("response" in guard) return guard.response;
  if (guard.auth.isDemo) return NextResponse.json({ plan: "free", messagesUsed: 3, messageLimit: 20, storageUsedBytes: 0, storageLimitBytes: 100_000_000, demo: true });
  const since = new Date(); since.setHours(0, 0, 0, 0);
  const { count } = await guard.supabase!.from("usage_events").select("id", { count: "exact", head: true }).eq("user_id", guard.auth.userId).gte("created_at", since.toISOString());
  return NextResponse.json({ plan: "free", messagesUsed: count ?? 0, messageLimit: 20, storageUsedBytes: 0, storageLimitBytes: 100_000_000, demo: config.demoMode });
}
