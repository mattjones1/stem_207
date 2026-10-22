-- STEM 207 update 7: shared team artifacts on pathway steps (categories-pathways Phase 4).
-- Paste this whole file in the Supabase SQL Editor and click Run. Safe to run more than once.
-- Run update 5 first. This only redefines team_events: teammates' shared work now also includes
-- pathway_artifact (one shared description or link per step). Pathway evidence, syntheses, and
-- reflections stay private to each student. It changes nothing already saved.
-- Rollback: re-run update-5-moxie-teams.sql.

-- A student's team (names only) and their teammates' shared Moxie and pathway work.
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
        and e.type in ('moxie_design', 'moxie_codecheck', 'moxie_buglog', 'moxie_test', 'moxie_feedback_got', 'moxie_improve', 'moxie_card', 'pathway_artifact')), '[]'::json));
end $$;
revoke all on function public.team_events(uuid) from public;
grant execute on function public.team_events(uuid) to anon, authenticated;
