"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ensureUserWorkspace } from "@/lib/supabase/auth";

export type LoginState = { error?: string; message?: string };

function validEmail(email: string) {
  return /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email);
}

export async function passwordAuth(_previous: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const mode = String(formData.get("mode") ?? "login");

  if (!validEmail(email)) return { error: "Enter a valid email address." };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { error: "Sign-in is not configured. Check the Supabase environment settings." };

  if (mode === "signup") {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { error: error.message };
    if (data.session && data.user) {
      const name = email.split("@")[0] || "Workspace member";
      await ensureUserWorkspace(data.user.id, name);
      redirect("/studio");
    }
    return { message: "Account created. If email confirmation is enabled in Supabase, you'll need to confirm it before signing in. Disable Confirm email in Supabase Auth settings for immediate access." };
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message === "Invalid login credentials" ? "Incorrect email or password." : error.message };
  if (data.user) {
    const name = typeof data.user.user_metadata?.name === "string" ? data.user.user_metadata.name : email.split("@")[0] || "Workspace member";
    await ensureUserWorkspace(data.user.id, name);
  }
  redirect("/studio");
}

export async function continueWithGoogle() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/login?error=setup");
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000") + "/auth/callback" },
  });
  if (error || !data.url) redirect("/login?error=google");
  redirect(data.url);
}
