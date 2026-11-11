-- STEM 207 update 13: Website Builder websites for teachers, and a class gallery.
-- Paste this whole file in the Supabase SQL Editor and click Run. Safe to run more than once.
-- It adds two tables and six student functions. It changes no saved data.
--
-- student_websites  one row per student: the website's title, index.html, and styles.css, saved from the student's
--                   device as they work (so it follows them to another Chromebook and their teacher can open it).
--                   Hand in adds the student's Human Touch answers (teacher-only). Sharing with the class copies
--                   the page into gallery_* and waits for the teacher: classmates see only approved copies.
-- website_kudos     classmates' kind feedback on a shared website: one of three buttons, no free text.
-- Educators read and update their own classes' rows (row-level security, owns_class). Students never get table
-- access: they use the functions below with their session token, like student_log.
-- The app checks a student's words for personal information (an email, a phone number, an address, links,
-- "my name is") before anything is saved, and the teacher approves sharing.
-- Rollback: drop function website_save, website_mine, website_hand_in, website_share, class_gallery, website_kudos;
--           drop table website_kudos, student_websites.

create table if not exists public.student_websites (
  student_id text primary key references public.students (id) on delete cascade,
  class_id text not null references public.classes (id) on delete cascade,
  title text not null default 'My Website' check (char_length(title) between 1 and 80),
  html text not null default '' check (char_length(html) <= 60000),
  css text not null default '' check (char_length(css) <= 60000),
  status text not null default 'draft' check (status in ('draft', 'handed_in')),
  reflect jsonb not null default '{}'::jsonb check (pg_column_size(reflect) < 4000),
  gallery text not null default 'none' check (gallery in ('none', 'requested', 'approved')),
  gallery_title text check (char_length(gallery_title) <= 80),
  gallery_html text check (char_length(gallery_html) <= 60000),
  gallery_css text check (char_length(gallery_css) <= 60000),
  teacher_note text check (char_length(teacher_note) <= 300),
  updated_at timestamptz not null default now(),
  handed_in_at timestamptz,
  is_demo boolean not null default false
);
create index if not exists student_websites_class_idx on public.student_websites (class_id);

create table if not exists public.website_kudos (
  website_id text not null references public.student_websites (student_id) on delete cascade,
  student_id text not null references public.students (id) on delete cascade,
  kind text not null check (kind in ('learned', 'design', 'readable')),
  at timestamptz not null default now(),
  primary key (website_id, student_id, kind)
);

alter table public.student_websites enable row level security;
alter table public.website_kudos enable row level security;

drop policy if exists student_websites_owner on public.student_websites;
create policy student_websites_owner on public.student_websites for all to authenticated
  using (public.owns_class(class_id)) with check (public.owns_class(class_id));
drop policy if exists website_kudos_owner_read on public.website_kudos;
create policy website_kudos_owner_read on public.website_kudos for select to authenticated
  using (exists (select 1 from public.student_websites w where w.student_id = website_id and public.owns_class(w.class_id)));

-- The student behind a session token (null when the session is over).
create or replace function public.website_student(p_token uuid)
returns public.students language sql stable security definer set search_path = public as $$
  select s.* from public.student_sessions t join public.students s on s.id = t.student_id
   where t.token = p_token and t.expires_at > now();
$$;

-- A student's own website, as JSON (no gallery copy; that's the teacher's to approve).
create or replace function public.website_json(w public.student_websites)
returns json language sql stable set search_path = public as $$
  select json_build_object('title', w.title, 'html', w.html, 'css', w.css, 'status', w.status, 'gallery', w.gallery,
    'teacherNote', w.teacher_note, 'updatedAt', (extract(epoch from w.updated_at) * 1000)::bigint,
    'handedInAt', case when w.handed_in_at is null then null else (extract(epoch from w.handed_in_at) * 1000)::bigint end);
$$;

-- Save the website from the student's device (creates the row the first time).
create or replace function public.website_save(p_token uuid, p_title text, p_html text, p_css text)
returns json language plpgsql volatile security definer set search_path = public as $$
declare v_student public.students;
begin
  v_student := public.website_student(p_token);
  if v_student.id is null then return json_build_object('ok', false, 'error', 'session'); end if;
  if char_length(coalesce(p_html, '')) > 60000 or char_length(coalesce(p_css, '')) > 60000 then
    return json_build_object('ok', false, 'error', 'too_big');
  end if;
  insert into public.student_websites (student_id, class_id, title, html, css)
  values (v_student.id, v_student.class_id, left(coalesce(nullif(trim(p_title), ''), 'My Website'), 80), coalesce(p_html, ''), coalesce(p_css, ''))
  on conflict (student_id) do update
    set title = excluded.title, html = excluded.html, css = excluded.css, updated_at = now();
  return json_build_object('ok', true);
end $$;

-- The student's own website (to pick up work on another device, and to see the teacher's answer).
create or replace function public.website_mine(p_token uuid)
returns json language plpgsql stable security definer set search_path = public as $$
declare v_student public.students; w public.student_websites;
begin
  v_student := public.website_student(p_token);
  if v_student.id is null then return json_build_object('ok', false, 'error', 'session'); end if;
  select * into w from public.student_websites where student_id = v_student.id;
  if not found then return json_build_object('ok', true, 'website', null); end if;
  return json_build_object('ok', true, 'website', public.website_json(w));
end $$;

-- Hand in: the website is marked handed in, with the student's Human Touch answers for the teacher.
create or replace function public.website_hand_in(p_token uuid, p_reflect json)
returns json language plpgsql volatile security definer set search_path = public as $$
declare v_student public.students;
begin
  v_student := public.website_student(p_token);
  if v_student.id is null then return json_build_object('ok', false, 'error', 'session'); end if;
  update public.student_websites
     set status = 'handed_in', handed_in_at = now(), reflect = coalesce(p_reflect::jsonb, '{}'::jsonb)
   where student_id = v_student.id;
  if not found then return json_build_object('ok', false, 'error', 'missing'); end if;
  return json_build_object('ok', true);
end $$;

-- Ask to share with the class (a copy of the page as it is now, for the teacher to approve), or stop sharing.
create or replace function public.website_share(p_token uuid, p_on boolean)
returns json language plpgsql volatile security definer set search_path = public as $$
declare v_student public.students;
begin
  v_student := public.website_student(p_token);
  if v_student.id is null then return json_build_object('ok', false, 'error', 'session'); end if;
  if p_on then
    update public.student_websites
       set gallery = 'requested', gallery_title = title, gallery_html = html, gallery_css = css
     where student_id = v_student.id;
  else
    update public.student_websites
       set gallery = 'none', gallery_title = null, gallery_html = null, gallery_css = null
     where student_id = v_student.id;
  end if;
  if not found then return json_build_object('ok', false, 'error', 'missing'); end if;
  return json_build_object('ok', true);
end $$;

-- The class gallery: only websites the teacher approved, in the student's own class, with kudos counts.
create or replace function public.class_gallery(p_token uuid)
returns json language plpgsql stable security definer set search_path = public as $$
declare v_student public.students;
begin
  v_student := public.website_student(p_token);
  if v_student.id is null then return json_build_object('ok', false, 'error', 'session'); end if;
  return json_build_object('ok', true, 'websites', coalesce((
    select json_agg(json_build_object(
      'id', w.student_id, 'displayName', s.display_name, 'title', w.gallery_title, 'html', w.gallery_html, 'css', w.gallery_css,
      'mine', w.student_id = v_student.id,
      'kudos', json_build_object(
        'learned', (select count(*) from public.website_kudos k where k.website_id = w.student_id and k.kind = 'learned'),
        'design', (select count(*) from public.website_kudos k where k.website_id = w.student_id and k.kind = 'design'),
        'readable', (select count(*) from public.website_kudos k where k.website_id = w.student_id and k.kind = 'readable')),
      'given', coalesce((select json_agg(k.kind) from public.website_kudos k where k.website_id = w.student_id and k.student_id = v_student.id), '[]'::json))
      order by s.display_name)
    from public.student_websites w join public.students s on s.id = w.student_id
    where w.class_id = v_student.class_id and w.gallery = 'approved'), '[]'::json));
end $$;

-- Kind feedback on a classmate's shared website: a button turns on or off. Never on your own website.
create or replace function public.website_kudos(p_token uuid, p_website text, p_kind text)
returns json language plpgsql volatile security definer set search_path = public as $$
declare v_student public.students;
begin
  v_student := public.website_student(p_token);
  if v_student.id is null then return json_build_object('ok', false, 'error', 'session'); end if;
  if coalesce(p_kind, '') not in ('learned', 'design', 'readable') or p_website is null or p_website = v_student.id or not exists (
    select 1 from public.student_websites w where w.student_id = p_website and w.class_id = v_student.class_id and w.gallery = 'approved') then
    return json_build_object('ok', false, 'error', 'not_allowed');
  end if;
  if exists (select 1 from public.website_kudos where website_id = p_website and student_id = v_student.id and kind = p_kind) then
    delete from public.website_kudos where website_id = p_website and student_id = v_student.id and kind = p_kind;
    return json_build_object('ok', true, 'on', false);
  end if;
  insert into public.website_kudos (website_id, student_id, kind) values (p_website, v_student.id, p_kind);
  return json_build_object('ok', true, 'on', true);
end $$;

revoke all on function public.website_student(uuid), public.website_json(public.student_websites), public.website_save(uuid, text, text, text),
  public.website_mine(uuid), public.website_hand_in(uuid, json), public.website_share(uuid, boolean), public.class_gallery(uuid),
  public.website_kudos(uuid, text, text) from public;
grant execute on function public.website_save(uuid, text, text, text), public.website_mine(uuid), public.website_hand_in(uuid, json),
  public.website_share(uuid, boolean), public.class_gallery(uuid), public.website_kudos(uuid, text, text) to anon, authenticated;
