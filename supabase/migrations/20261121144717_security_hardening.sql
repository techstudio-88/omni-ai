-- Close the two tables missed by the initial policy loop.
alter table public.usage_events enable row level security;
create policy usage_events_read_owned on public.usage_events for select to authenticated
  using (user_id = (select auth.uid()) and deleted_at is null);
create policy usage_events_insert_owned on public.usage_events for insert to authenticated
  with check (user_id = (select auth.uid()) and public.is_workspace_member(workspace_id));

alter table public.shared_links enable row level security;
create policy shared_links_read_owned on public.shared_links for select to authenticated
  using (user_id = (select auth.uid()) and public.is_workspace_member(workspace_id) and deleted_at is null);
create policy shared_links_insert_owned on public.shared_links for insert to authenticated
  with check (user_id = (select auth.uid()) and public.is_workspace_member(workspace_id));
create policy shared_links_update_owned on public.shared_links for update to authenticated
  using (user_id = (select auth.uid()) and public.is_workspace_member(workspace_id))
  with check (user_id = (select auth.uid()) and public.is_workspace_member(workspace_id));
create policy shared_links_delete_owned on public.shared_links for delete to authenticated
  using (user_id = (select auth.uid()) and public.is_workspace_member(workspace_id));

-- Keep the membership checks usable by RLS without exposing SECURITY DEFINER
-- procedures through the public PostgREST schema.
create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;
create or replace function private.is_workspace_member(target_workspace uuid)
returns boolean language sql stable security definer set search_path = public, auth as $$
  select exists(select 1 from public.workspace_members m where m.workspace_id = target_workspace and m.user_id = (select auth.uid()))
$$;
create or replace function private.is_workspace_owner(target_workspace uuid)
returns boolean language sql stable security definer set search_path = public, auth as $$
  select exists(select 1 from public.workspaces w where w.id = target_workspace and w.owner_id = (select auth.uid()))
$$;
revoke all on function private.is_workspace_member(uuid) from public, anon;
revoke all on function private.is_workspace_owner(uuid) from public, anon;
grant execute on function private.is_workspace_member(uuid) to authenticated;
grant execute on function private.is_workspace_owner(uuid) to authenticated;
create or replace function public.is_workspace_member(target_workspace uuid)
returns boolean language sql stable security invoker set search_path = public, private as $$
  select private.is_workspace_member(target_workspace)
$$;
create or replace function public.is_workspace_owner(target_workspace uuid)
returns boolean language sql stable security invoker set search_path = public, private as $$
  select private.is_workspace_owner(target_workspace)
$$;
revoke all on function public.is_workspace_member(uuid) from public, anon;
revoke all on function public.is_workspace_owner(uuid) from public, anon;
grant execute on function public.is_workspace_member(uuid) to authenticated;
grant execute on function public.is_workspace_owner(uuid) to authenticated;
