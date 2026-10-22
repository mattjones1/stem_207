-- STEM 207 update 12: Moxie course material (feedback cards between teams, and more shared team work).
-- Paste this whole file in the Supabase SQL Editor and click Run. Safe to run more than once.
-- Run updates 5 and 7 first. It only redefines team_events and changes no data.
--
-- team_events (one call from a student's device) now returns:
--   team        the student's partner team (names only), as before
--   events      teammates' shared work. The type list adds the Moxie sheet's team pages: kit number,
--               stand-ups, subsystem checklist, plan changes, and the pitch plan. Keep it the same as
--               TEAM_TYPES in assets/js/store.js.
--   cards       Star, Star, Wish feedback cards that other students in the class sent to this team
--               (moxie_feedback_card with data.toTeam = this team's id)
--   classTeams  every team in the student's class (id and first names only), so a student can pick
--               which team to send a card to
-- Rollback: re-run update-7-pathway-teams.sql.

create or replace function public.team_events(p_token uuid)
returns json language plpgsql stable security definer set search_path = public as $$
declare v_student public.students; v_team public.class_teams; v_teams json;
begin
  select s.* into v_student from public.student_sessions t join public.students s on s.id = t.student_id
   where t.token = p_token and t.expires_at > now();
  if not found then return json_build_object('ok', false, 'error', 'session'); end if;
  v_teams := coalesce((
    select json_agg(json_build_object('id', ct.id, 'members', coalesce((
      select json_agg(s.display_name order by s.display_name)
      from public.students s where s.id = any(ct.student_ids) and s.class_id = v_student.class_id), '[]'::json)) order by ct.created_at)
    from public.class_teams ct where ct.class_id = v_student.class_id), '[]'::json);
  select * into v_team from public.class_teams
   where class_id = v_student.class_id and v_student.id = any(student_ids)
   order by created_at desc limit 1;
  if not found then return json_build_object('ok', true, 'team', null, 'events', '[]'::json, 'cards', '[]'::json, 'classTeams', v_teams); end if;
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
        and e.type in ('moxie_design', 'moxie_codecheck', 'moxie_buglog', 'moxie_test', 'moxie_feedback_got', 'moxie_improve', 'moxie_card',
                       'moxie_kit', 'moxie_standup', 'moxie_subsystem', 'moxie_change', 'moxie_pitch', 'pathway_artifact')), '[]'::json),
    'cards', coalesce((
      select json_agg(json_build_object('id', e.id, 'at', e.at, 'data', e.data) order by e.at)
      from public.events e
      where e.class_id = v_student.class_id
        and e.type = 'moxie_feedback_card'
        and e.data->>'toTeam' = v_team.id
        and not (e.student_id = any(v_team.student_ids))), '[]'::json),
    'classTeams', v_teams);
end $$;
revoke all on function public.team_events(uuid) from public;
grant execute on function public.team_events(uuid) to anon, authenticated;
