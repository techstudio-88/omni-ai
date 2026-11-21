import { config } from "../config";
import { createSupabaseServerClient } from "./server";

export interface AuthContext { userId: string; email: string | null; displayName: string; isDemo: boolean; workspaceId: string; }
export const demoUser: AuthContext = { userId: "demo-user", email: null, displayName: "Demo workspace", isDemo: true, workspaceId: "demo-workspace" };

export async function getAuthContext(): Promise<AuthContext | null> {
  if (config.demoMode) return demoUser;
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  const displayName = typeof data.user.user_metadata?.name === "string" ? data.user.user_metadata.name : data.user.email?.split("@")[0] ?? "Workspace member";
  const workspaceId = await ensureUserWorkspace(data.user.id, displayName);
  if (!workspaceId) return null;
  return { userId: data.user.id, email: data.user.email ?? null, displayName, isDemo: false, workspaceId };
}

export async function ensureUserWorkspace(userId: string, displayName: string): Promise<string | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const profile = await supabase.from("profiles").upsert({ id: userId, display_name: displayName }, { onConflict: "id", ignoreDuplicates: true });
  if (profile.error) return null;
  const { data: member } = await supabase.from("workspace_members").select("workspace_id").eq("user_id", userId).limit(1).maybeSingle();
  if (member?.workspace_id) return member.workspace_id;
  const { data: created, error } = await supabase.from("workspaces").insert({ owner_id: userId, name: "My workspace" }).select("id").single();
  if (error || !created?.id) return null;
  const joined = await supabase.from("workspace_members").insert({ workspace_id: created.id, user_id: userId, role: "owner" });
  return joined.error ? null : created.id;
}
