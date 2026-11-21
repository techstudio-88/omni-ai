import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { config } from "./config";

interface RateResult { allowed: boolean; retryAfterSeconds: number; mode: "redis" | "database" | "local" | "demo" | "missing"; }
type RateLimitRpcClient = {
  rpc: (name: string, args: { p_route: string; p_window_seconds: number; p_max_requests: number }) => Promise<{
    data: { allowed: boolean; retry_after_seconds: number }[] | null;
    error: unknown;
  }>;
};
const globalStore = globalThis as typeof globalThis & { __omniRateLimits?: Map<string, number[]> };
const localWindows = globalStore.__omniRateLimits ??= new Map<string, number[]>();
let limiter: Ratelimit | null = null;
if (config.redisUrl && config.redisToken) {
  limiter = new Ratelimit({ redis: new Redis({ url: config.redisUrl, token: config.redisToken }), limiter: Ratelimit.slidingWindow(30, "1 m"), analytics: false, prefix: "omnibrain:rate" });
}

export async function enforceRateLimit(userId: string, route: string, supabase?: unknown): Promise<RateResult> {
  if (config.demoMode) return { allowed: true, retryAfterSeconds: 0, mode: "demo" };
  if (limiter) {
    try {
      const result = await limiter.limit(`${route}:${userId}`);
      return { allowed: result.success, retryAfterSeconds: result.success ? 0 : Math.max(1, Math.ceil((result.reset - Date.now()) / 1000)), mode: "redis" };
    } catch {
      // Fall through to the database limiter if Redis is temporarily unavailable.
    }
  }
  if (supabase) {
    try {
      const client = supabase as RateLimitRpcClient;
      const { data, error } = await client.rpc("consume_rate_limit", { p_route: route, p_window_seconds: 60, p_max_requests: 30 });
      const result = data?.[0];
      if (!error && result) return { allowed: result.allowed, retryAfterSeconds: result.retry_after_seconds, mode: "database" };
    } catch {
      // Fail closed below if the shared database limiter is unavailable.
    }
  }
  if (process.env.VERCEL || process.env.NODE_ENV === "production") return { allowed: false, retryAfterSeconds: 60, mode: "missing" };
  const key = `${route}:${userId}`, now = Date.now(), windowStart = now - 60_000;
  const recent = (localWindows.get(key) ?? []).filter((timestamp) => timestamp > windowStart);
  if (recent.length >= 12) { localWindows.set(key, recent); return { allowed: false, retryAfterSeconds: 60, mode: "local" }; }
  recent.push(now); localWindows.set(key, recent);
  return { allowed: true, retryAfterSeconds: 0, mode: "local" };
}
