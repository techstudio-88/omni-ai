"use client";
import { createBrowserClient } from "@supabase/ssr";
import { config, hasSupabaseConfig } from "../config";

export function createSupabaseBrowserClient() {
  if (!hasSupabaseConfig()) return null;
  return createBrowserClient(config.supabaseUrl!, config.supabasePublishableKey!);
}
