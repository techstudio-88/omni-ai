"use client";
import { createBrowserClient } from "@supabase/ssr";
import { config, hasSupabaseConfig } from "../config";
import type { Database } from "./database.types";

export function createSupabaseBrowserClient() {
  if (!hasSupabaseConfig()) return null;
  return createBrowserClient<Database>(config.supabaseUrl!, config.supabasePublishableKey!);
}
