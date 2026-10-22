-- STEM 207 update 5: partner teams for Moxie.
-- Paste this whole file in the Supabase SQL Editor and click Run. Safe to run more than once.
-- It adds one table and one read-only function, and changes nothing already saved.
--
-- Moxie partners share one capstone: one design, one build log, one set of test results.
-- A student's device only loads that student's own work, so team_events returns their
-- teammates' SHARED work and nothing else. Reflections, explanations, and every other kind
-- of event stay private to each student. Only the teacher decides who is on a team.

-- 1. Teams: a teacher puts two or more students from the same class together.
create table if not exists public.class_teams (
  id text primary key check (char_length(id) <= 64),
  class_id text not null references public.classes (id) on delete cascade,
  student_ids text[] not null check (cardinality(student_ids) between 2 and 4),
  created_at timestamptz not null default now(),
  is_demo boolean not null default false
);
create index if not exists class_teams_class_idx on public.class_teams (class_id);

-- Teachers can read and change teams only in their own classes, and only with students from
-- that class. Students never read the table; they get their team through team_events below.
alter table public.class_teams enable row level security;
drop policy if exists class_teams_owner on public.class_teams;
create policy class_teams_owner on public.class_teams for all to authenticated
  using (public.owns_class(class_id))
  with check (
    public.owns_class(class_id)
    and not exists (select 1 from unnest(student_ids) sid
                    where not exists (select 1 from public.students s where s.id = sid and s.class_id = class_teams.class_id))
  );
grant select, insert, update, delete on public.class_teams to authenticated;
revoke all on public.class_teams from anon;

-- 2. A student's team (names only) and their teammates' shared Moxie work.
--    Keep the list of types the same as TEAM_TYPES in assets/js/store.js.
create or replace function public.team_events(p_token uuid)
returns json language plpgsql stable security definer set search_path = public as $$
declare v_student public.students; v_team public.class_teams;
begin
  select s.* into v_student from public.student_sessions t join public.students s on s.id = t.student_id
   where t.token = p_token and t.expires_at > now();
  if not found then return json_build_object('ok', false, 'error', 'session'); end if;
  select * into v_team from public.class_teams
   where class_id = v_student.class_id and v_student.id = any(student_ids)
   order by created_at desc limit 1;
  if not found then return json_build_object('ok', true, 'team', null, 'events', '[]'::json); end if;
  return json_build_object(
    'ok', true,
    'team', json_build_object('id', v_team.id, 'members', coalesce((
      select json_agg(json_build_object('id', s.id, 'displayName', s.display_name) order by s.display_name)
      from public.students s where s.id = any(v_team.student_ids) and s.class_id = v_student.class_id), '[]'::json)),
    'events', coalesce((
      select json_agg(json_build_object('id', e.id, 'studentId', e.student_id, 'classId', e.class_id, 'type', e.type,
                                        'at', e.at, 'data', e.data) order by e.at)
      from public.events e
      where e.class_id = v_student.class_id
        and e.student_id = any(v_team.student_ids)
        and e.student_id <> v_student.id
        and e.type in ('moxie_design', 'moxie_codecheck', 'moxie_buglog', 'moxie_test', 'moxie_feedback_got', 'moxie_improve', 'moxie_card')), '[]'::json));
end $$;
revoke all on function public.team_events(uuid) from public;
grant execute on function public.team_events(uuid) to anon, authenticated;
