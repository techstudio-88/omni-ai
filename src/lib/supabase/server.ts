import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { config, hasSupabaseConfig } from "../config";
import type { Database } from "./database.types";

export async function createSupabaseServerClient() {
  if (!hasSupabaseConfig()) return null;
  const cookieStore = await cookies();
  return createServerClient<Database>(config.supabaseUrl!, config.supabasePublishableKey!, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (values) => {
        try { values.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch { /* Server components cannot mutate cookies. */ }
      },
    },
  });
}
