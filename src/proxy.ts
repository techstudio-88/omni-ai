import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { config, hasSupabaseConfig } from "./lib/config";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  if (config.demoMode || !hasSupabaseConfig()) return response;
  const supabase = createServerClient(config.supabaseUrl!, config.supabasePublishableKey!, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(values) {
        values.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        values.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });
  await supabase.auth.getClaims();
  return response;
}
export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"] };
