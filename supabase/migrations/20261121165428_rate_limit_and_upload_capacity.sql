-- OmniBrain shared rate limiting and document upload capacity
create table if not exists public.rate_limits (
  user_id uuid not null references auth.users(id) on delete cascade,
  route text not null check (char_length(route) between 1 and 120),
  window_start timestamptz not null,
  request_count integer not null default 0 check (request_count >= 0),
  created_at timestamptz not null default now(),
  primary key (user_id, route, window_start)
);
alter table public.rate_limits enable row level security;
create policy "Users can read their own rate limits" on public.rate_limits for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users can insert their own rate limits" on public.rate_limits for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users can update their own rate limits" on public.rate_limits for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create or replace function public.consume_rate_limit(p_route text, p_window_seconds integer default 60, p_max_requests integer default 30)
returns table (allowed boolean, retry_after_seconds integer)
language plpgsql security invoker set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_window_start timestamptz;
  v_count integer;
begin
  if v_user_id is null then raise exception 'Authentication required'; end if;
  if p_route is null or char_length(p_route) not between 1 and 120 or p_window_seconds not between 1 and 3600 or p_max_requests not between 1 and 1000 then raise exception 'Invalid rate limit parameters'; end if;
  v_window_start := to_timestamp(floor(extract(epoch from clock_timestamp()) / p_window_seconds) * p_window_seconds);
  insert into public.rate_limits (user_id, route, window_start, request_count) values (v_user_id, p_route, v_window_start, 1)
  on conflict (user_id, route, window_start) do update set request_count = public.rate_limits.request_count + 1
  returning request_count into v_count;
  return query select v_count <= p_max_requests, case when v_count <= p_max_requests then 0 else greatest(1, ceil(extract(epoch from (v_window_start + make_interval(secs => p_window_seconds) - clock_timestamp())))::integer) end;
end;
$$;
revoke all on function public.consume_rate_limit(text, integer, integer) from public, anon;
grant execute on function public.consume_rate_limit(text, integer, integer) to authenticated;
grant select, insert, update on public.rate_limits to authenticated;
update storage.buckets set file_size_limit = 52428800 where id = 'omnibrain-documents';
