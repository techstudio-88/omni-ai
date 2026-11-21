"use server";

import { redirect } from "next/navigation";
import { config } from "@/lib/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type LoginState = { error?: string; sentTo?: string };
export async function sendMagicLink(_previous: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Enter a valid email address." };
  if (config.demoMode) redirect("/studio");
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { error: "Sign-in is not configured yet. Set up Supabase in the server environment." };
  const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: config.appUrl + "/auth/callback" } });
  if (error) return { error: "We could not send a sign-in link. Check the Supabase email settings and try again." };
  return { sentTo: email };
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase?.auth.signOut();
  redirect("/login");
}
