-- OmniBrain's first schema. All user content is private by default.
create extension if not exists vector with schema extensions;

create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Workspace member',
  avatar_url text,
  preferences jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  plan text not null default 'free' check (plan in ('free','pro','team','enterprise')),
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz
);
create table if not exists public.workspace_members (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner','admin','member','viewer')),
  joined_at timestamptz not null default now(),
  primary key (workspace_id,user_id)
);

create or replace function public.is_workspace_member(target_workspace uuid)
returns boolean language sql stable security definer set search_path = public, auth as $$
  select exists(select 1 from public.workspace_members m where m.workspace_id = target_workspace and m.user_id = (select auth.uid()))
$$;
create or replace function public.is_workspace_owner(target_workspace uuid)
returns boolean language sql stable security definer set search_path = public, auth as $$
  select exists(select 1 from public.workspaces w where w.id = target_workspace and w.owner_id = (select auth.uid()))
$$;
revoke all on function public.is_workspace_member(uuid) from public;
revoke all on function public.is_workspace_owner(uuid) from public;
grant execute on function public.is_workspace_member(uuid) to authenticated;
grant execute on function public.is_workspace_owner(uuid) to authenticated;

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade, name text not null, description text not null default '',
  instructions text not null default '', settings jsonb not null default '{}'::jsonb, status text not null default 'active',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz
);
create table if not exists public.project_members (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade, project_id uuid not null references public.projects(id) on delete cascade,
  role text not null default 'member', created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz,
  unique(project_id,user_id)
);
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade, project_id uuid references public.projects(id) on delete set null,
  title text not null default 'New conversation', mode text not null default 'chat', model text,
  metadata jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz
);
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade, conversation_id uuid not null references public.conversations(id) on delete cascade,
  role text not null check (role in ('system','user','assistant','tool')), content text not null default '', parts jsonb not null default '[]'::jsonb,
  model text, provider text, status text not null default 'completed', metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz
);
create table if not exists public.message_versions (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade, message_id uuid not null references public.messages(id) on delete cascade,
  content text not null, version integer not null, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz,
  unique(message_id,version)
);
create table if not exists public.attachments (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade, message_id uuid references public.messages(id) on delete set null,
  document_id uuid, name text not null, mime_type text not null, size_bytes bigint not null default 0, storage_path text,
  status text not null default 'uploaded', created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz
);
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade, project_id uuid references public.projects(id) on delete set null,
  name text not null, mime_type text not null, size_bytes bigint not null check(size_bytes between 0 and 20971520),
  storage_path text not null unique, status text not null default 'processing' check(status in ('processing','ready','failed','deleted')),
  page_count integer, error_message text, metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz
);
create table if not exists public.document_chunks (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade, document_id uuid not null references public.documents(id) on delete cascade,
  chunk_index integer not null, page_number integer, section_title text, text text not null, embedding extensions.vector(768),
  metadata jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz,
  unique(document_id,chunk_index)
);
create table if not exists public.memories (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade, type text not null default 'preference', key text not null, value text not null,
  source text not null default 'user', confidence numeric not null default 1 check(confidence between 0 and 1), enabled boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz
);
create table if not exists public.custom_assistants (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade, name text not null, description text not null default '',
  instructions text not null default '', model text, tools text[] not null default '{}', visibility text not null default 'private',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz
);
create table if not exists public.prompt_templates (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade, title text not null, body text not null, category text not null default 'general',
  is_shared boolean not null default false, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz
);
create table if not exists public.tool_definitions (
  id text primary key, name text not null, description text not null, enabled boolean not null default false,
  requires_confirmation boolean not null default true, config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.tool_calls (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade, conversation_id uuid references public.conversations(id) on delete set null,
  tool_id text not null references public.tool_definitions(id), status text not null default 'pending', input jsonb not null default '{}'::jsonb,
  output jsonb, confirmed_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz
);
create table if not exists public.execution_runs (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade, conversation_id uuid references public.conversations(id) on delete set null,
  status text not null default 'running', workflow text not null, provider text, model text, request_time_ms integer,
  retry_count integer not null default 0, error_code text, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz
);
create table if not exists public.execution_steps (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade, run_id uuid not null references public.execution_runs(id) on delete cascade,
  step_index integer not null, name text not null, status text not null, detail text, duration_ms integer,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz, unique(run_id,step_index)
);
create table if not exists public.citations (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade, message_id uuid references public.messages(id) on delete cascade,
  document_id uuid references public.documents(id) on delete set null, title text not null, url text, page_number integer, section_title text,
  source_type text not null, retrieved_at timestamptz not null default now(), created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz
);
create table if not exists public.usage_events (
  id uuid primary key default gen_random_uuid(), workspace_id uuid references public.workspaces(id) on delete set null,
  user_id uuid not null references auth.users(id) on delete cascade, provider text not null, model text not null,
  input_tokens integer, output_tokens integer, total_tokens integer, estimated_cost_usd numeric,
  request_time_ms integer not null default 0, retry_count integer not null default 0, tool_usage jsonb not null default '[]'::jsonb,
  status text not null, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz
);
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade, provider text, external_id text, plan text not null default 'free',
  status text not null default 'active', period_start timestamptz, period_end timestamptz, metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz
);
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade, subscription_id uuid references public.subscriptions(id) on delete set null,
  provider text, external_id text, amount numeric not null default 0, currency text not null default 'USD', status text not null,
  metadata jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz
);
create table if not exists public.shared_links (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade, conversation_id uuid not null references public.conversations(id) on delete cascade,
  token_hash text not null unique, expires_at timestamptz, revoked_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz
);
create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade, message_id uuid references public.messages(id) on delete set null,
  rating smallint check(rating between 1 and 5), comment text, category text, created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(), deleted_at timestamptz
);
create table if not exists public.moderation_events (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade, category text not null, action text not null,
  metadata jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz
);
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade, actor_id uuid references auth.users(id) on delete set null,
  action text not null, resource_type text not null, resource_id text, metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz
);
create table if not exists public.providers (
  id text primary key, name text not null, status text not null default 'planned', capabilities text[] not null default '{}',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.models (
  id text primary key, provider_id text not null references public.providers(id), name text not null, status text not null default 'planned',
  context_window integer, supports_vision boolean not null default false, supports_tools boolean not null default false,
  input_cost_usd numeric, output_cost_usd numeric, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create index if not exists projects_workspace_idx on public.projects(workspace_id, created_at desc) where deleted_at is null;
create index if not exists conversations_user_idx on public.conversations(user_id, updated_at desc) where deleted_at is null;
create index if not exists messages_conversation_idx on public.messages(conversation_id, created_at) where deleted_at is null;
create index if not exists documents_user_idx on public.documents(user_id, created_at desc) where deleted_at is null;
create index if not exists chunks_document_idx on public.document_chunks(document_id, chunk_index) where deleted_at is null;
create index if not exists chunks_embedding_idx on public.document_chunks using hnsw (embedding extensions.vector_cosine_ops) where embedding is not null and deleted_at is null;
create index if not exists memories_user_enabled_idx on public.memories(user_id, enabled, created_at desc) where deleted_at is null;
create index if not exists usage_user_created_idx on public.usage_events(user_id, created_at desc) where deleted_at is null;

create or replace function public.match_document_chunks(p_user_id uuid, p_query extensions.vector(768), p_document_ids uuid[] default null, p_match_count integer default 5)
returns table(id uuid, document_id uuid, page_number integer, section_title text, text text, similarity float, document_name text)
language sql stable security invoker set search_path = public, extensions as $$
  select c.id, c.document_id, c.page_number, c.section_title, c.text,
    1 - (c.embedding <=> p_query) as similarity, d.name as document_name
  from public.document_chunks c join public.documents d on d.id = c.document_id
  where p_user_id = (select auth.uid()) and c.user_id = (select auth.uid())
    and c.deleted_at is null and d.deleted_at is null and d.status = 'ready'
    and (p_document_ids is null or c.document_id = any(p_document_ids))
  order by c.embedding <=> p_query limit greatest(1, least(p_match_count, 20))
$$;
revoke all on function public.match_document_chunks(uuid, extensions.vector, uuid[], integer) from public;
grant execute on function public.match_document_chunks(uuid, extensions.vector, uuid[], integer) to authenticated;

-- User-owned content is accessible only to its owner while they belong to its workspace.
alter table public.profiles enable row level security;
create policy profiles_select_self on public.profiles for select to authenticated using (id = (select auth.uid()) and deleted_at is null);
create policy profiles_insert_self on public.profiles for insert to authenticated with check (id = (select auth.uid()));
create policy profiles_update_self on public.profiles for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

alter table public.workspaces enable row level security;
create policy workspaces_read_member on public.workspaces for select to authenticated using (public.is_workspace_member(id) and deleted_at is null);
create policy workspaces_create_owner on public.workspaces for insert to authenticated with check (owner_id = (select auth.uid()));
create policy workspaces_update_owner on public.workspaces for update to authenticated using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
create policy workspaces_delete_owner on public.workspaces for delete to authenticated using (owner_id = (select auth.uid()));

alter table public.workspace_members enable row level security;
create policy workspace_members_read_member on public.workspace_members for select to authenticated using (public.is_workspace_member(workspace_id));
create policy workspace_members_add_owner on public.workspace_members for insert to authenticated with check (public.is_workspace_owner(workspace_id));
create policy workspace_members_remove_owner on public.workspace_members for delete to authenticated using (public.is_workspace_owner(workspace_id) or user_id = (select auth.uid()));

do $$
declare tbl text;
begin
  foreach tbl in array array['projects','project_members','conversations','messages','message_versions','attachments','documents','document_chunks','memories','custom_assistants','prompt_templates','tool_calls','execution_runs','execution_steps','citations','feedback','moderation_events','audit_logs'] loop
    execute format('alter table public.%I enable row level security', tbl);
    execute format('create policy %I on public.%I for select to authenticated using (user_id = (select auth.uid()) and public.is_workspace_member(workspace_id) and deleted_at is null)', tbl || '_read_owned', tbl);
    execute format('create policy %I on public.%I for insert to authenticated with check (user_id = (select auth.uid()) and public.is_workspace_member(workspace_id))', tbl || '_insert_owned', tbl);
    execute format('create policy %I on public.%I for update to authenticated using (user_id = (select auth.uid()) and public.is_workspace_member(workspace_id)) with check (user_id = (select auth.uid()) and public.is_workspace_member(workspace_id))', tbl || '_update_owned', tbl);
    execute format('create policy %I on public.%I for delete to authenticated using (user_id = (select auth.uid()) and public.is_workspace_member(workspace_id))', tbl || '_delete_owned', tbl);
  end loop;
end $$;

-- Billing rows are visible to the owner; clients cannot create or change payment state.
alter table public.subscriptions enable row level security;
create policy subscriptions_read_owner on public.subscriptions for select to authenticated using (user_id = (select auth.uid()) and public.is_workspace_member(workspace_id) and deleted_at is null);
alter table public.payments enable row level security;
create policy payments_read_owner on public.payments for select to authenticated using (user_id = (select auth.uid()) and public.is_workspace_member(workspace_id) and deleted_at is null);

alter table public.providers enable row level security;
create policy providers_read_catalog on public.providers for select to authenticated using (true);
alter table public.models enable row level security;
create policy models_read_catalog on public.models for select to authenticated using (true);
alter table public.tool_definitions enable row level security;
create policy tools_read_catalog on public.tool_definitions for select to authenticated using (true);

insert into public.providers(id,name,status,capabilities) values
  ('google','Google Gemini','active',array['text','vision','streaming','search','embeddings']),
  ('openai','OpenAI','planned',array[]::text[]), ('anthropic','Anthropic','planned',array[]::text[]),
  ('xai','xAI','planned',array[]::text[]), ('deepseek','DeepSeek','planned',array[]::text[]),
  ('mistral','Mistral','planned',array[]::text[]), ('perplexity','Perplexity','planned',array[]::text[])
on conflict (id) do nothing;
insert into public.models(id,provider_id,name,status,context_window,supports_vision,supports_tools) values
  ('gemini-3.5-flash-lite','google','Gemini 3.5 Flash-Lite','active',1000000,true,true),
  ('gemini-3-flash-preview','google','Gemini 3 Flash','active',1000000,true,true),
  ('gemini-3.1-pro-preview','google','Gemini 3.1 Pro','active',1000000,true,true)
on conflict (id) do nothing;
insert into public.tool_definitions(id,name,description,enabled,requires_confirmation) values
  ('calculator','Calculator','Deterministic arithmetic for supported expressions.',true,false),
  ('web-search','Web search','Searches current public web pages through Gemini grounding.',true,false),
  ('url-reader','URL reader','Reads a user supplied public HTTP(S) page after private-network checks.',false,false),
  ('send-email','Send email','Sends an external email. Requires a connected provider and explicit confirmation.',false,true),
  ('publish-content','Publish content','Publishes externally. Requires a connected provider and explicit confirmation.',false,true),
  ('code-sandbox','Code sandbox','Runs user code in an isolated execution service.',false,true)
on conflict (id) do nothing;

create trigger profiles_touch_updated_at before update on public.profiles for each row execute function public.touch_updated_at();
do $$ declare tbl text; begin
  foreach tbl in array array['workspaces','projects','project_members','conversations','messages','message_versions','attachments','documents','document_chunks','memories','custom_assistants','prompt_templates','tool_definitions','tool_calls','execution_runs','execution_steps','citations','usage_events','subscriptions','payments','shared_links','feedback','moderation_events','audit_logs','providers','models'] loop
    execute format('create trigger %I before update on public.%I for each row execute function public.touch_updated_at()', tbl || '_touch_updated_at', tbl);
  end loop;
end $$;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('omnibrain-documents','omnibrain-documents',false,20971520,array['application/pdf','text/plain','text/markdown','text/csv','application/vnd.openxmlformats-officedocument.wordprocessingml.document','image/png','image/jpeg','image/webp'])
on conflict (id) do nothing;
create policy omnibrain_documents_read_own on storage.objects for select to authenticated
  using (bucket_id = 'omnibrain-documents' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy omnibrain_documents_insert_own on storage.objects for insert to authenticated
  with check (bucket_id = 'omnibrain-documents' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy omnibrain_documents_update_own on storage.objects for update to authenticated
  using (bucket_id = 'omnibrain-documents' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'omnibrain-documents' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy omnibrain_documents_delete_own on storage.objects for delete to authenticated
  using (bucket_id = 'omnibrain-documents' and (storage.foldername(name))[1] = (select auth.uid())::text);
