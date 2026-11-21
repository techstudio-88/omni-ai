import { config } from "../config";
import { createSupabaseServerClient } from "./server";

export interface AuthContext { userId: string; email: string | null; displayName: string; isDemo: boolean; }
export const demoUser: AuthContext = { userId: "demo-user", email: null, displayName: "Demo workspace", isDemo: true };

export async function getAuthContext(): Promise<AuthContext | null> {
  if (config.demoMode) return demoUser;
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  const displayName = typeof data.user.user_metadata?.name === "string" ? data.user.user_metadata.name : data.user.email?.split("@")[0] ?? "Workspace member";
  return { userId: data.user.id, email: data.user.email ?? null, displayName, isDemo: false };
}

export async function ensureUserWorkspace(userId: string, displayName: string): Promise<void> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return;
  await supabase.from("profiles").upsert({ id: userId, display_name: displayName }, { onConflict: "id", ignoreDuplicates: true });
  const { data: workspace } = await supabase.from("workspaces").select("id").eq("owner_id", userId).limit(1).maybeSingle();
  if (workspace?.id) return;
  const { data: created } = await supabase.from("workspaces").insert({ owner_id: userId, name: "My workspace" }).select("id").single();
  if (created?.id) await supabase.from("workspace_members").upsert({ workspace_id: created.id, user_id: userId, role: "owner" }, { onConflict: "workspace_id,user_id" });
}
