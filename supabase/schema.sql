-- ════════════════════════════════════════════════════════════════════════════
--  STEM 207: database schema for Supabase (free tier)
--
--  How to use: in your Supabase project, open SQL Editor → New query, paste this
--  whole file, and press Run. It is safe to run again; it only creates what's
--  missing and replaces the functions.
--
--  Who can see what (enforced by Postgres row-level security, not by the app):
--    • Educators sign in with Supabase Auth (email + password). They can read and
--      change only their own classes, the students in those classes, and those
--      students' activity.
--    • Students never get a Supabase account. They sign in with a class code, their
--      name, and three pictures through the functions at the bottom of this file,
--      which hand back a short-lived session token. Students can only add events to
--      their own log and read their own progress.
--    • Nobody can read a student's picture code except that student's educator.
--
--  What's stored about students: a display name (first name + last initial), a
--  grade band, a 3-picture sign-in code, and their activity in the app. Nothing else.
-- ════════════════════════════════════════════════════════════════════════════

-- ───────── Tables ─────────
create table if not exists public.educators (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null default '',
  email text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.classes (
  id text primary key check (char_length(id) <= 64),
  educator_id uuid not null references public.educators (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  code text not null unique check (code ~ '^[A-Z0-9]{3,12}$'),
  is_demo boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists classes_educator_idx on public.classes (educator_id);

create table if not exists public.students (
  id text primary key check (char_length(id) <= 64),
  class_id text not null references public.classes (id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 24),
  grade_band text not null default '4-5' check (grade_band in ('2-3', '4-5', '6-8')),
  pic_code text[] not null check (array_length(pic_code, 1) = 3),
  is_demo boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists students_class_idx on public.students (class_id);
create unique index if not exists students_class_name_uq on public.students (class_id, lower(display_name));

create table if not exists public.events (
  id text primary key check (char_length(id) <= 64),
  student_id text not null references public.students (id) on delete cascade,
  class_id text not null references public.classes (id) on delete cascade,
  type text not null check (char_length(type) between 1 and 40),
  at bigint not null,                      -- milliseconds since 1970, like JavaScript Date.now()
  data jsonb not null default '{}'::jsonb check (pg_column_size(data) < 20000),
  by text,                                 -- educator id for teacher actions; null for student actions
  is_demo boolean not null default false
);
create index if not exists events_class_idx on public.events (class_id, at);
create index if not exists events_student_idx on public.events (student_id, at);

-- Missions a teacher has assigned to a class (activity ids come from the app's library).
create table if not exists public.assignments (
  id text primary key check (char_length(id) <= 64),
  class_id text not null references public.classes (id) on delete cascade,
  activity_id text not null check (char_length(activity_id) between 1 and 80),
  assigned_at timestamptz not null default now(),
  due_date date,
  note text,                               -- teacher's instructions for this mission, shown to students
  is_demo boolean not null default false,
  unique (class_id, activity_id)
);
create index if not exists assignments_class_idx on public.assignments (class_id);
alter table public.assignments add column if not exists note text;
alter table public.assignments drop constraint if exists assignments_note_len;
alter table public.assignments add constraint assignments_note_len check (note is null or char_length(note) <= 500);

-- Short messages from a teacher to the whole class (students read them through student_state).
create table if not exists public.class_messages (
  id text primary key check (char_length(id) <= 64),
  class_id text not null references public.classes (id) on delete cascade,
  body text not null check (char_length(body) between 1 and 500),
  created_at timestamptz not null default now(),
  is_demo boolean not null default false
);
create index if not exists class_messages_class_idx on public.class_messages (class_id, created_at);

-- Student sessions and sign-in attempts are private: only the functions below touch them.
create table if not exists public.student_sessions (
  token uuid primary key default gen_random_uuid(),
  student_id text not null references public.students (id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '7 days'
);
create index if not exists student_sessions_student_idx on public.student_sessions (student_id);

create table if not exists public.sign_in_attempts (
  id bigserial primary key,
  student_id text not null references public.students (id) on delete cascade,
  at timestamptz not null default now(),
  ok boolean not null
);
create index if not exists sign_in_attempts_idx on public.sign_in_attempts (student_id, at);

-- ───────── New educator accounts ─────────
-- When someone signs up through Supabase Auth, create their educator profile.
create or replace function public.handle_new_educator()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.educators (id, name, email)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'name', ''), coalesce(new.email, ''))
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_educator();

-- ───────── Row-level security ─────────
alter table public.educators enable row level security;
alter table public.classes enable row level security;
alter table public.students enable row level security;
alter table public.events enable row level security;
alter table public.student_sessions enable row level security;
alter table public.sign_in_attempts enable row level security;
alter table public.assignments enable row level security;
alter table public.class_messages enable row level security;

-- Does the signed-in educator own this class?
create or replace function public.owns_class(cid text)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.classes where id = cid and educator_id = auth.uid());
$$;

drop policy if exists educators_self_read on public.educators;
create policy educators_self_read on public.educators for select to authenticated using (id = auth.uid());
drop policy if exists educators_self_update on public.educators;
create policy educators_self_update on public.educators for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
drop policy if exists educators_self_insert on public.educators;
create policy educators_self_insert on public.educators for insert to authenticated with check (id = auth.uid());

drop policy if exists classes_owner on public.classes;
create policy classes_owner on public.classes for all to authenticated
  using (educator_id = auth.uid()) with check (educator_id = auth.uid());

drop policy if exists students_owner on public.students;
create policy students_owner on public.students for all to authenticated
  using (public.owns_class(class_id)) with check (public.owns_class(class_id));

drop policy if exists events_owner_read on public.events;
create policy events_owner_read on public.events for select to authenticated using (public.owns_class(class_id));
drop policy if exists events_owner_insert on public.events;
create policy events_owner_insert on public.events for insert to authenticated
  with check (
    public.owns_class(class_id)
    and exists (select 1 from public.students s where s.id = student_id and s.class_id = events.class_id)
    and (by is null or by = auth.uid()::text)
  );
drop policy if exists events_owner_delete on public.events;
create policy events_owner_delete on public.events for delete to authenticated using (public.owns_class(class_id));
drop policy if exists class_messages_owner on public.class_messages;
create policy class_messages_owner on public.class_messages for all to authenticated
  using (public.owns_class(class_id)) with check (public.owns_class(class_id));
drop policy if exists assignments_owner on public.assignments;
create policy assignments_owner on public.assignments for all to authenticated
  using (public.owns_class(class_id)) with check (public.owns_class(class_id));
-- student_sessions and sign_in_attempts have no policies, so no one can read them directly.

grant select, insert, update, delete on public.educators, public.classes, public.students, public.events, public.assignments, public.class_messages to authenticated;
revoke all on public.educators, public.classes, public.students, public.events, public.assignments, public.class_messages from anon;
revoke all on public.student_sessions, public.sign_in_attempts from anon, authenticated;

-- ───────── Student sign-in and progress (callable by anyone with the public key) ─────────

-- Step 1 of student sign-in: a class code returns the class name and the students' display names.
-- (Picture codes are never returned.)
create or replace function public.class_roster(p_code text)
returns json language sql stable security definer set search_path = public as $$
  select json_build_object(
    'id', c.id, 'name', c.name, 'code', c.code,
    'students', coalesce((
      select json_agg(json_build_object('id', s.id, 'displayName', s.display_name, 'gradeBand', s.grade_band) order by s.display_name)
      from public.students s where s.class_id = c.id), '[]'::json))
  from public.classes c
  where c.code = upper(regexp_replace(coalesce(p_code, ''), '\s', '', 'g'));
$$;

-- A student's own state: profile, class, full activity log, assigned missions (with instructions), and class messages.
create or replace function public.student_state(p_token uuid)
returns json language plpgsql stable security definer set search_path = public as $$
declare v_student public.students;
begin
  select s.* into v_student from public.student_sessions t join public.students s on s.id = t.student_id
   where t.token = p_token and t.expires_at > now();
  if not found then return json_build_object('ok', false, 'error', 'session'); end if;
  return json_build_object(
    'ok', true,
    'student', json_build_object('id', v_student.id, 'classId', v_student.class_id, 'displayName', v_student.display_name,
                                 'gradeBand', v_student.grade_band, 'isDemo', v_student.is_demo,
                                 'createdAt', (extract(epoch from v_student.created_at) * 1000)::bigint),
    'class', (select json_build_object('id', c.id, 'name', c.name, 'code', c.code, 'isDemo', c.is_demo) from public.classes c where c.id = v_student.class_id),
    'events', coalesce((select json_agg(json_build_object('id', e.id, 'studentId', e.student_id, 'classId', e.class_id, 'type', e.type,
                                                          'at', e.at, 'data', e.data, 'by', e.by, 'isDemo', e.is_demo) order by e.at)
                        from public.events e where e.student_id = v_student.id), '[]'::json),
    'assignments', coalesce((select json_agg(json_build_object('id', a.id, 'activityId', a.activity_id, 'dueDate', a.due_date, 'note', a.note,
                                                               'assignedAt', (extract(epoch from a.assigned_at) * 1000)::bigint) order by a.assigned_at)
                             from public.assignments a where a.class_id = v_student.class_id), '[]'::json),
    'messages', coalesce((select json_agg(json_build_object('id', m.id, 'body', m.body,
                                                            'createdAt', (extract(epoch from m.created_at) * 1000)::bigint) order by m.created_at desc)
                          from (select * from public.class_messages where class_id = v_student.class_id order by created_at desc limit 20) m), '[]'::json));
end $$;

-- Step 3 of student sign-in: check the three pictures. Too many wrong tries in 10 minutes
-- pauses sign-in for that student, so picture codes can't be guessed by brute force.
create or replace function public.student_sign_in(p_student_id text, p_code text[])
returns json language plpgsql volatile security definer set search_path = public as $$
declare
  v_student public.students;
  v_fails int;
  v_token uuid;
begin
  select * into v_student from public.students where id = p_student_id;
  if not found then return json_build_object('ok', false, 'error', 'missing'); end if;

  select count(*) into v_fails from public.sign_in_attempts
   where student_id = p_student_id and not ok and at > now() - interval '10 minutes';
  if v_fails >= 8 then return json_build_object('ok', false, 'error', 'locked'); end if;

  if p_code is distinct from v_student.pic_code then
    insert into public.sign_in_attempts (student_id, ok) values (p_student_id, false);
    return json_build_object('ok', false, 'error', 'wrong');
  end if;

  insert into public.sign_in_attempts (student_id, ok) values (p_student_id, true);
  delete from public.sign_in_attempts where at < now() - interval '1 day';
  delete from public.student_sessions where expires_at < now();
  insert into public.student_sessions (student_id) values (p_student_id) returning token into v_token;
  return (json_build_object('ok', true, 'token', v_token)::jsonb || public.student_state(v_token)::jsonb)::json;
end $$;

-- Record one event in the signed-in student's own log.
create or replace function public.student_log(p_token uuid, p_event json)
returns json language plpgsql volatile security definer set search_path = public as $$
declare v_student public.students;
begin
  select s.* into v_student from public.student_sessions t join public.students s on s.id = t.student_id
   where t.token = p_token and t.expires_at > now();
  if not found then return json_build_object('ok', false, 'error', 'session'); end if;
  insert into public.events (id, student_id, class_id, type, at, data)
  values (p_event ->> 'id', v_student.id, v_student.class_id, p_event ->> 'type',
          least(coalesce((p_event ->> 'at')::bigint, 0), (extract(epoch from now()) * 1000)::bigint + 60000),
          coalesce((p_event -> 'data')::jsonb, '{}'::jsonb))
  on conflict (id) do nothing;
  return json_build_object('ok', true);
end $$;

create or replace function public.student_sign_out(p_token uuid)
returns json language sql volatile security definer set search_path = public as $$
  delete from public.student_sessions where token = p_token returning json_build_object('ok', true);
$$;

revoke all on function public.class_roster(text), public.student_state(uuid), public.student_sign_in(text, text[]),
  public.student_log(uuid, json), public.student_sign_out(uuid), public.owns_class(text), public.handle_new_educator() from public;
grant execute on function public.class_roster(text), public.student_state(uuid), public.student_sign_in(text, text[]),
  public.student_log(uuid, json), public.student_sign_out(uuid) to anon, authenticated;
grant execute on function public.owns_class(text) to authenticated;
