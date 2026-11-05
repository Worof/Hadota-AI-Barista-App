-- 002: members-only tables with join requests approved by ALL members, a social timeline, and media storage.
-- Run once in Supabase > SQL Editor (after schema.sql). Safe to re-run.
-- NOTE: after this migration people can no longer insert themselves into table_members; they must send a request.

-- ===== helpers =====
create or replace function public.is_member(tid uuid) returns boolean
language sql security definer stable set search_path = public as $$
  select exists (select 1 from public.table_members where table_id = tid and user_id = auth.uid())
$$;
revoke all on function public.is_member(uuid) from public, anon;
grant execute on function public.is_member(uuid) to authenticated;

-- ===== members-only: only members see who is at a table; everyone still sees title, vibe and seat count =====
alter table public.tables add column if not exists members_n int not null default 0;
update public.tables t set members_n = (select count(*) from public.table_members m where m.table_id = t.id);

drop policy if exists "members readable" on public.table_members;
drop policy if exists "join as yourself" on public.table_members;
drop policy if exists "members see members" on public.table_members;
create policy "members see members" on public.table_members for select to authenticated using (public.is_member(table_id));

-- ===== join requests =====
create table if not exists public.table_requests (
  id uuid primary key default gen_random_uuid(),
  table_id uuid not null references public.tables(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now(),
  decided_at timestamptz,
  unique (table_id, user_id)
);
create table if not exists public.table_votes (
  request_id uuid not null references public.table_requests(id) on delete cascade,
  voter_id uuid not null references public.profiles(id) on delete cascade,
  approve boolean not null,
  created_at timestamptz not null default now(),
  primary key (request_id, voter_id)
);
alter table public.table_requests enable row level security;
alter table public.table_votes enable row level security;

drop policy if exists "see requests" on public.table_requests;
drop policy if exists "ask to join" on public.table_requests;
drop policy if exists "withdraw request" on public.table_requests;
create policy "see requests" on public.table_requests for select to authenticated using (user_id = auth.uid() or public.is_member(table_id));
create policy "ask to join" on public.table_requests for insert to authenticated with check (user_id = auth.uid() and status = 'pending' and not public.is_member(table_id));
create policy "withdraw request" on public.table_requests for delete to authenticated
  using (user_id = auth.uid() and (status = 'pending' or (status = 'rejected' and decided_at < now() - interval '1 day')));

drop policy if exists "members see votes" on public.table_votes;
drop policy if exists "members vote" on public.table_votes;
create policy "members see votes" on public.table_votes for select to authenticated
  using (exists (select 1 from public.table_requests r where r.id = request_id and public.is_member(r.table_id)));
create policy "members vote" on public.table_votes for insert to authenticated
  with check (voter_id = auth.uid() and exists (select 1 from public.table_requests r
    where r.id = request_id and r.status = 'pending' and r.user_id <> auth.uid() and public.is_member(r.table_id)));

-- Decide a request: any "no" rejects it; when every CURRENT member said "yes" (and a seat is free) the person is seated.
create or replace function public.resolve_request(rid uuid) returns void
language plpgsql security definer set search_path = public as $$
declare r public.table_requests; total int; yes int; nays int; cap int; n int;
begin
  select * into r from public.table_requests where id = rid for update;
  if r.id is null or r.status <> 'pending' then return; end if;
  select count(*) into total from public.table_members where table_id = r.table_id;
  select count(*) filter (where v.approve), count(*) filter (where not v.approve) into yes, nays
    from public.table_votes v
    where v.request_id = rid and exists (select 1 from public.table_members m where m.table_id = r.table_id and m.user_id = v.voter_id);
  if nays > 0 then
    update public.table_requests set status = 'rejected', decided_at = now() where id = rid; return;
  end if;
  if total > 0 and yes >= total then
    select capacity, members_n into cap, n from public.tables where id = r.table_id for update;
    if n >= cap then
      update public.table_requests set status = 'rejected', decided_at = now() where id = rid; return;
    end if;
    insert into public.table_members (table_id, user_id) values (r.table_id, r.user_id) on conflict do nothing;
    update public.table_requests set status = 'approved', decided_at = now() where id = rid;
  end if;
end $$;
revoke all on function public.resolve_request(uuid) from public, anon, authenticated;

create or replace function public.after_vote() returns trigger
language plpgsql security definer set search_path = public as $$
begin perform public.resolve_request(new.request_id); return null; end $$;
drop trigger if exists on_vote on public.table_votes;
create trigger on_vote after insert on public.table_votes for each row execute function public.after_vote();

-- keep the seat counter right; when someone leaves, forget their request and re-check the other pending ones
create or replace function public.members_changed() returns trigger
language plpgsql security definer set search_path = public as $$
declare rid uuid;
begin
  if tg_op = 'INSERT' then
    update public.tables set members_n = members_n + 1 where id = new.table_id;
  else
    update public.tables set members_n = greatest(0, members_n - 1) where id = old.table_id;
    delete from public.table_requests where table_id = old.table_id and user_id = old.user_id;
    for rid in select id from public.table_requests where table_id = old.table_id and status = 'pending' loop
      perform public.resolve_request(rid);
    end loop;
  end if;
  return null;
end $$;
drop trigger if exists members_counter on public.table_members;
create trigger members_counter after insert or delete on public.table_members for each row execute function public.members_changed();

-- ===== social timeline =====
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  table_id uuid references public.tables(id) on delete cascade,      -- null = public timeline, otherwise members-only
  body text not null default '' check (char_length(body) <= 1000),
  media_path text check (char_length(media_path) <= 300),
  media_type text check (media_type in ('image','video')),
  repost_of uuid references public.posts(id) on delete set null,
  like_count int not null default 0,
  comment_count int not null default 0,
  repost_count int not null default 0,
  created_at timestamptz not null default now(),
  check (char_length(body) > 0 or media_path is not null or repost_of is not null)
);
create index if not exists posts_feed on public.posts (table_id, created_at desc);
create table if not exists public.post_likes (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);
create table if not exists public.post_comments (
  id bigint generated always as identity primary key,
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 500),
  created_at timestamptz not null default now()
);
create index if not exists post_comments_post on public.post_comments (post_id, created_at);
alter table public.posts enable row level security;
alter table public.post_likes enable row level security;
alter table public.post_comments enable row level security;

drop policy if exists "read public or my table posts" on public.posts;
drop policy if exists "write own posts" on public.posts;
drop policy if exists "delete own posts" on public.posts;
create policy "read public or my table posts" on public.posts for select to authenticated using (table_id is null or public.is_member(table_id));
create policy "write own posts" on public.posts for insert to authenticated with check (author = auth.uid() and (table_id is null or public.is_member(table_id)));
create policy "delete own posts" on public.posts for delete to authenticated using (author = auth.uid());

drop policy if exists "see likes" on public.post_likes;
drop policy if exists "like as me" on public.post_likes;
drop policy if exists "unlike as me" on public.post_likes;
create policy "see likes" on public.post_likes for select to authenticated using (exists (select 1 from public.posts p where p.id = post_id));
create policy "like as me" on public.post_likes for insert to authenticated with check (user_id = auth.uid() and exists (select 1 from public.posts p where p.id = post_id));
create policy "unlike as me" on public.post_likes for delete to authenticated using (user_id = auth.uid());

drop policy if exists "see comments" on public.post_comments;
drop policy if exists "comment as me" on public.post_comments;
drop policy if exists "delete own comment" on public.post_comments;
create policy "see comments" on public.post_comments for select to authenticated using (exists (select 1 from public.posts p where p.id = post_id));
create policy "comment as me" on public.post_comments for insert to authenticated with check (user_id = auth.uid() and exists (select 1 from public.posts p where p.id = post_id));
create policy "delete own comment" on public.post_comments for delete to authenticated using (user_id = auth.uid());

-- a table's private post can only be reposted inside that same table; public posts can be reposted anywhere
create or replace function public.check_repost() returns trigger
language plpgsql security definer set search_path = public as $$
declare orig_table uuid; found_row boolean;
begin
  if new.repost_of is not null then
    select true, table_id into found_row, orig_table from public.posts where id = new.repost_of;
    if found_row is null then raise exception 'repost_missing'; end if;
    if orig_table is not null and new.table_id is distinct from orig_table then raise exception 'repost_private'; end if;
  end if;
  return new;
end $$;
drop trigger if exists before_post on public.posts;
create trigger before_post before insert on public.posts for each row execute function public.check_repost();

create or replace function public.count_likes() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then update public.posts set like_count = like_count + 1 where id = new.post_id;
  else update public.posts set like_count = greatest(0, like_count - 1) where id = old.post_id; end if;
  return null;
end $$;
drop trigger if exists likes_counter on public.post_likes;
create trigger likes_counter after insert or delete on public.post_likes for each row execute function public.count_likes();

create or replace function public.count_comments() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then update public.posts set comment_count = comment_count + 1 where id = new.post_id;
  else update public.posts set comment_count = greatest(0, comment_count - 1) where id = old.post_id; end if;
  return null;
end $$;
drop trigger if exists comments_counter on public.post_comments;
create trigger comments_counter after insert or delete on public.post_comments for each row execute function public.count_comments();

create or replace function public.count_reposts() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' and new.repost_of is not null then update public.posts set repost_count = repost_count + 1 where id = new.repost_of;
  elsif tg_op = 'DELETE' and old.repost_of is not null then update public.posts set repost_count = greatest(0, repost_count - 1) where id = old.repost_of; end if;
  return null;
end $$;
drop trigger if exists reposts_counter on public.posts;
create trigger reposts_counter after insert or delete on public.posts for each row execute function public.count_reposts();

-- ===== media storage: public bucket for the public timeline, private bucket (members only) for table timelines =====
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('media', 'media', true, 20971520, array['image/jpeg','image/png','image/webp','video/mp4','video/webm']),
  ('media-private', 'media-private', false, 20971520, array['image/jpeg','image/png','image/webp','video/mp4','video/webm'])
on conflict (id) do nothing;

drop policy if exists "upload own public media" on storage.objects;
drop policy if exists "delete own public media" on storage.objects;
drop policy if exists "members upload private media" on storage.objects;
drop policy if exists "members read private media" on storage.objects;
create policy "upload own public media" on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "delete own public media" on storage.objects for delete to authenticated
  using (bucket_id = 'media' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "members upload private media" on storage.objects for insert to authenticated
  with check (bucket_id = 'media-private' and public.is_member(((storage.foldername(name))[1])::uuid) and (storage.foldername(name))[2] = auth.uid()::text);
create policy "members read private media" on storage.objects for select to authenticated
  using (bucket_id = 'media-private' and public.is_member(((storage.foldername(name))[1])::uuid));
