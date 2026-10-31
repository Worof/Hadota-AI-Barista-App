-- حدوتة: Supabase schema. Paste into Supabase > SQL Editor > Run (once).
create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 30),
  created_at timestamptz not null default now()
);
create table public.user_data (            -- private: history + learning model
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}',
  updated_at timestamptz not null default now()
);
create table public.tables (
  id uuid primary key default gen_random_uuid(),
  host uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 2 and 60),
  vibe text check (char_length(vibe) <= 40),
  meet_at text check (char_length(meet_at) <= 60),
  capacity int not null check (capacity between 2 and 12),
  created_at timestamptz not null default now()
);
create table public.table_members (
  table_id uuid not null references public.tables(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (table_id, user_id)
);
create table public.messages (
  id bigint generated always as identity primary key,
  table_id uuid not null references public.tables(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 500),
  created_at timestamptz not null default now()
);
create index on public.messages (table_id, created_at);

-- profile created automatically at sign-up (name comes from sign-up metadata)
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name)
  values (new.id, left(coalesce(nullif(trim(new.raw_user_meta_data->>'name'), ''), split_part(new.email, '@', 1)), 30));
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- the host sits at their own table automatically
create function public.host_joins() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.table_members (table_id, user_id) values (new.id, new.host);
  return new;
end $$;
create trigger on_table_created after insert on public.tables
  for each row execute function public.host_joins();

-- capacity is enforced in the database (locks the table row so two people cannot take the last seat)
create function public.check_capacity() returns trigger
language plpgsql security definer set search_path = public as $$
declare cap int; taken int;
begin
  select capacity into cap from public.tables where id = new.table_id for update;
  select count(*) into taken from public.table_members where table_id = new.table_id;
  if taken >= cap then raise exception 'table_full'; end if;
  return new;
end $$;
create trigger before_member_insert before insert on public.table_members
  for each row execute function public.check_capacity();

alter table public.profiles enable row level security;
alter table public.user_data enable row level security;
alter table public.tables enable row level security;
alter table public.table_members enable row level security;
alter table public.messages enable row level security;

create policy "profiles readable by members" on public.profiles for select to authenticated using (true);
create policy "own profile update" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy "own data" on public.user_data for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "tables readable" on public.tables for select to authenticated using (true);
create policy "host creates table" on public.tables for insert to authenticated with check (host = auth.uid());
create policy "host deletes table" on public.tables for delete to authenticated using (host = auth.uid());
create policy "members readable" on public.table_members for select to authenticated using (true);
create policy "join as yourself" on public.table_members for insert to authenticated with check (user_id = auth.uid());
create policy "leave yourself" on public.table_members for delete to authenticated using (user_id = auth.uid());
create policy "members read chat" on public.messages for select to authenticated
  using (exists (select 1 from public.table_members m where m.table_id = messages.table_id and m.user_id = auth.uid()));
create policy "members write chat" on public.messages for insert to authenticated
  with check (user_id = auth.uid() and exists (select 1 from public.table_members m where m.table_id = messages.table_id and m.user_id = auth.uid()));

-- ===== الأكتر كلاماً: عدّاد مواضيع من قائمة ثابتة، من غير ما أي رسالة خاصة تتعرض =====
create table public.topics (word text primary key);
insert into public.topics (word) values ('هيل'),('تركي'),('كولد برو'),('إسبريسو'),('V60'),('فرنش بريس'),('يرجاتشيف'),('كولومبيا'),('مستكة'),('قرفة'),('تحويجة'),('كابتشينو'),('لاتيه'),('فلات وايت'),('موكا'),('تحميص'),('طحن'),('حموضة'),('أرابيكا'),('روبوستا'),('كراميل'),('شوكولاتة'),('فانيليا'),('سادة'),('كبّينج');
alter table public.topics enable row level security;
create policy "topics readable" on public.topics for select to authenticated using (true);

-- بترجّع كلمة وعدد بس (آخر ١٤ يوم) وبس لو اتذكرت مرتين أو أكتر. الرسائل نفسها خاصة بأعضاء الترابيزة.
create function public.trending_topics() returns table (word text, n bigint)
language sql security definer stable set search_path = public as $$
  select * from (
    select tp.word,
      (select count(*) from public.messages m where m.created_at > now() - interval '14 days' and m.body ilike '%' || tp.word || '%')
      + (select count(*) from public.tables t where t.created_at > now() - interval '14 days' and (t.title ilike '%' || tp.word || '%' or coalesce(t.vibe,'') ilike '%' || tp.word || '%')) as n
    from public.topics tp) x
  where n >= 2 order by n desc limit 12
$$;
revoke all on function public.trending_topics() from public, anon;
grant execute on function public.trending_topics() to authenticated;

-- ===== قياس الأداء: أحداث الاستخدام والتقييمات (كل مستخدم يكتب ويقرا أحداثه بس) =====
create table public.events (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  at timestamptz not null default now(),
  name text not null check (char_length(name) <= 40),
  arm text check (arm in ('learner','control')),
  session text check (char_length(session) <= 20),
  props jsonb not null default '{}' check (octet_length(props::text) <= 2000)
);
create index on public.events (at);
create index on public.events (user_id, at);
create table public.feedback (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  at timestamptz not null default now(),
  tags text[] not null default '{}',
  rating int check (rating between 1 and 5),
  drink text check (char_length(drink) <= 60),
  roast text check (char_length(roast) <= 20)
);
alter table public.events enable row level security;
alter table public.feedback enable row level security;
create policy "insert own events" on public.events for insert to authenticated with check (user_id = auth.uid());
create policy "read own events" on public.events for select to authenticated using (user_id = auth.uid());
create policy "insert own feedback" on public.feedback for insert to authenticated with check (user_id = auth.uid());
create policy "read own feedback" on public.feedback for select to authenticated using (user_id = auth.uid());
-- للتحليل: من Table Editor صدّر events وfeedback كـ CSV (بصلاحيات المالك)، وشغّل حزمة analytics عليهم.
