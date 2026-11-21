import { NextResponse } from "next/server";
import { guardApi } from "@/lib/api/guard";
import { config } from "@/lib/config";
import { getDailyUsage, FREE_DAILY_MESSAGE_LIMIT } from "@/lib/usage-limits";

export async function GET() {
  const guard = await guardApi("usage.read");
  if ("response" in guard) return guard.response;
  if (guard.auth.isDemo) return NextResponse.json({ plan: "free", messagesUsed: 3, messageLimit: FREE_DAILY_MESSAGE_LIMIT, storageUsedBytes: 248_000, storageLimitBytes: 100_000_000, demo: true });
  const usage = await getDailyUsage(guard.supabase!, guard.auth.userId);
  if (usage.error) return NextResponse.json({ error: "Usage details are temporarily unavailable." }, { status: 503 });
  const { data: docs } = await guard.supabase!.from("documents").select("size_bytes").eq("user_id", guard.auth.userId).is("deleted_at", null).limit(1000);
  const storageUsedBytes = (docs ?? []).reduce((total, item) => total + Number(item.size_bytes ?? 0), 0);
  return NextResponse.json({ plan: "free", messagesUsed: usage.used, messageLimit: FREE_DAILY_MESSAGE_LIMIT, storageUsedBytes, storageLimitBytes: 100_000_000, demo: config.demoMode }, { headers: { "Cache-Control": "no-store" } });
}
