import { NextResponse } from "next/server";
import { getAuthContext } from "../supabase/auth";
import { createSupabaseServerClient } from "../supabase/server";
import { enforceRateLimit } from "../rate-limit";

export async function guardApi(route: string) {
  const auth = await getAuthContext();
  if (!auth) return { response: NextResponse.json({ error: "Sign in to continue." }, { status: 401 }) } as const;
  const rate = await enforceRateLimit(auth.userId, route);
  if (!rate.allowed) {
    const status = rate.mode === "missing" ? 503 : 429;
    return { response: NextResponse.json({ error: rate.mode === "missing" ? "Production rate limiting is not configured." : "Too many requests. Please wait and try again.", retryAfterSeconds: rate.retryAfterSeconds }, { status, headers: { "Retry-After": String(rate.retryAfterSeconds) } }) } as const;
  }
  const supabase = auth.isDemo ? null : await createSupabaseServerClient();
  return { auth, workspaceId: auth.workspaceId, supabase, rate } as const;
}
export function apiError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } });
}
