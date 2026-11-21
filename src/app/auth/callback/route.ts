import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ensureUserWorkspace } from "@/lib/supabase/auth";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const supabase = await createSupabaseServerClient();
  if (code && supabase) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.user) {
      const name = typeof data.user.user_metadata?.name === "string" ? data.user.user_metadata.name : data.user.email?.split("@")[0] ?? "Workspace member";
      await ensureUserWorkspace(data.user.id, name);
      return NextResponse.redirect(new URL("/studio", url.origin));
    }
  }
  return NextResponse.redirect(new URL("/login?error=auth", url.origin));
}
