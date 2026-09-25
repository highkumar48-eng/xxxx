begin;
create table if not exists public.videos (
 id uuid primary key default gen_random_uuid(),
 title text not null check(char_length(title) between 1 and 160),
 description text default '' check(char_length(description)<=5000),
 tags text[] not null default '{}',
 video_url text not null,
 thumbnail_url text,
 media_type text not null default 'video' check(media_type in ('video','image')),
 media_path text,
 media_bucket text check(media_bucket in ('videos','thumbnails')),
 thumbnail_path text,
 duration integer,
 file_size bigint,
 views bigint not null default 0,
 is_published boolean not null default true,
 created_at timestamptz not null default now(),
 search_vector tsvector
);
create or replace function public.update_search_vector() returns trigger
language plpgsql security invoker set search_path = '' as $$
begin
 new.search_vector := setweight(to_tsvector('english',coalesce(new.title,'')),'A') || setweight(to_tsvector('english',coalesce(new.description,'')),'B') || setweight(to_tsvector('english',array_to_string(coalesce(new.tags,'{}'),' ')),'C');
 return new;
end;
$$;
drop trigger if exists videos_search_vector_update on public.videos;
create trigger videos_search_vector_update before insert or update on public.videos for each row execute function public.update_search_vector();
update public.videos set title=title where search_vector is null;
create index if not exists videos_search_idx on public.videos using gin(search_vector);
create index if not exists videos_published_created_idx on public.videos(created_at desc) where is_published;
create index if not exists videos_tags_idx on public.videos using gin(tags);
alter table public.videos enable row level security;
revoke all on public.videos from anon,authenticated;
grant select on public.videos to anon,authenticated;
grant all on public.videos to service_role;
drop policy if exists "Public can view published videos" on public.videos;
create policy "Public can view published videos" on public.videos for select to anon,authenticated using(is_published=true);
create or replace function public.increment_view_count(video_id uuid) returns boolean
language plpgsql security invoker set search_path = '' as $$
begin
 update public.videos set views=views+1 where id=video_id and is_published=true;
 return found;
end;
$$;
revoke all on function public.increment_view_count(uuid) from public,anon,authenticated;
grant execute on function public.increment_view_count(uuid) to service_role;
-- Shared, atomic rate limiting survives serverless cold starts.
create table if not exists public.login_attempts(client_key text primary key, attempts integer not null, window_start timestamptz not null);
alter table public.login_attempts enable row level security;
revoke all on public.login_attempts from public,anon,authenticated;
grant all on public.login_attempts to service_role;
create or replace function public.consume_login_attempt(client_key text) returns boolean
language plpgsql security invoker set search_path = '' as $$
declare current_attempts integer;
begin
 delete from public.login_attempts where window_start < now()-interval '1 day';
 insert into public.login_attempts as a(client_key,attempts,window_start) values(consume_login_attempt.client_key,1,now())
 on conflict on constraint login_attempts_pkey do update set
 attempts=case when a.window_start<now()-interval '15 minutes' then 1 else a.attempts+1 end,
 window_start=case when a.window_start<now()-interval '15 minutes' then now() else a.window_start end
 returning attempts into current_attempts;
 return current_attempts<=10;
end;
$$;
revoke all on function public.consume_login_attempt(text) from public,anon,authenticated;
grant execute on function public.consume_login_attempt(text) to service_role;
-- Public bucket URLs remain reachable when an item is hidden. Hiding is delisting, not privacy.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('videos','videos',true,52428800,array['video/mp4','video/webm','video/quicktime']),('thumbnails','thumbnails',true,5242880,array['image/jpeg','image/png','image/webp'])
on conflict(id) do update set public=excluded.public,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;
-- No anonymous Storage write policy: the server issues signed upload tokens only after admin verification.
commit;
