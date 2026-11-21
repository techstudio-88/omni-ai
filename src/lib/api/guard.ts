import { NextResponse } from "next/server";
import { getAuthContext } from "../supabase/auth";
import { createSupabaseServerClient } from "../supabase/server";
import { enforceRateLimit } from "../rate-limit";

export async function guardApi(route: string) {
  const auth = await getAuthContext();
  if (!auth) return { response: NextResponse.json({ error: "Sign in to continue." }, { status: 401 }) } as const;
  const supabase = auth.isDemo ? null : await createSupabaseServerClient();
  const rate = await enforceRateLimit(auth.userId, route, supabase);
  if (!rate.allowed) {
    const status = rate.mode === "missing" ? 503 : 429;
    return { response: NextResponse.json({ error: rate.mode === "missing" ? "Shared rate limiting is unavailable. Try again shortly." : "Too many requests. Please wait and try again.", retryAfterSeconds: rate.retryAfterSeconds }, { status, headers: { "Retry-After": String(rate.retryAfterSeconds) } }) } as const;
  }
  return { auth, workspaceId: auth.workspaceId, supabase, rate } as const;
}
