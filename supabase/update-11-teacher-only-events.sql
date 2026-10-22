-- STEM 207 update 11: only teachers can pass work.
-- Paste this whole file in the Supabase SQL Editor and click Run. Safe to run more than once.
-- Run update 8 first. It changes no data.
--
-- 1. student_log refuses teacher-only event types (a Pass, a Try again, a teacher note, reviews, stage and Moxie
--    checks), so a student device can't pass its own work or earn XP and class points that way.
-- 2. class_journey counts a pass only when a teacher wrote it (events.by is set), matching SE.game in game.js,
--    which ignores teacher-only events without a teacher id.
-- Rollback: re-run update-8-class-journey-passes.sql and the student_log block in an older schema.sql.

create or replace function public.student_log(p_token uuid, p_event json)
returns json language plpgsql volatile security definer set search_path = public as $$
declare v_student public.students;
begin
  select s.* into v_student from public.student_sessions t join public.students s on s.id = t.student_id
   where t.token = p_token and t.expires_at > now();
  if not found then return json_build_object('ok', false, 'error', 'session'); end if;
  -- Teacher-only events (a Pass, a Try again, a note, reviews, checks) can't come from a student device.
  if (p_event ->> 'type') in ('teacher_confirmed', 'teacher_try_again', 'teacher_note', 'reflection_reviewed', 'ican_verified',
                              'ican_returned', 'moxie_gate', 'moxie_rubric', 'pathway_review', 'pathway_observation') then
    return json_build_object('ok', false, 'error', 'teacher_only');
  end if;
  insert into public.events (id, student_id, class_id, type, at, data)
  values (p_event ->> 'id', v_student.id, v_student.class_id, p_event ->> 'type',
          least(coalesce((p_event ->> 'at')::bigint, 0), (extract(epoch from now()) * 1000)::bigint + 60000),
          coalesce((p_event -> 'data')::jsonb, '{}'::jsonb))
  on conflict (id) do nothing;
  return json_build_object('ok', true);
end $$;

revoke all on function public.student_log(uuid, json) from public;
grant execute on function public.student_log(uuid, json) to anon, authenticated;

create or replace function public.class_journey(p_token uuid)
returns json language plpgsql stable security definer set search_path = public as $$
declare v_class text; v_students int;
begin
  select s.class_id into v_class from public.student_sessions t join public.students s on s.id = t.student_id
   where t.token = p_token and t.expires_at > now();
  if not found then return json_build_object('ok', false, 'error', 'session'); end if;
  select count(*) into v_students from public.students where class_id = v_class;
  return (
    with st as (select id from public.students where class_id = v_class),
    ev as (select e.student_id, e.type, e.at, e.data, e.by from public.events e join st on st.id = e.student_id),
    -- assigned work: single assigned activities, plus every activity in an assigned Learning Plan version
    assigned as (
      select activity_id as act from public.assignments where class_id = v_class
      union
      select step->>'activityId' from public.pathway_assignments pa
        join public.pathway_versions pv on pv.pathway_id = pa.pathway_id and pv.version = pa.version
        cross join lateral jsonb_array_elements(pv.snapshot->'steps') step
       where pa.class_id = v_class and step->>'kind' = 'mission'),
    sent as (select student_id, data->>'activityId' as act, min(at) as at from ev
             where type = 'mission_completed' and data ? 'activityId' group by 1, 2),
    -- a pass counts only when a teacher wrote it (by is set), never from a student device
    passed_all as (select distinct student_id, data->>'activityId' as act from ev where type = 'teacher_confirmed' and by is not null and data ? 'activityId'),
    passed as (select * from passed_all where act in (select act from assigned)),
    per as (select student_id, count(*) as n from passed_all group by 1),
    -- assigned activities with a due date that every student sent before the end of that day (UTC)
    ontime as (select a.activity_id from public.assignments a
               where a.class_id = v_class and a.due_date is not null and v_students > 0
                 and (select count(*) from sent s where s.act = a.activity_id
                        and s.at < extract(epoch from (a.due_date + 1)::timestamp) * 1000) = v_students)
    select json_build_object(
      'ok', true,
      'students', v_students,
      'passed', (select count(*) from passed),
      'passedAll', (select count(*) from passed_all),
      'withPassed', (select count(distinct student_id) from passed),
      'withThree', (select count(*) from per where n >= 3),
      'onTime', (select count(*) from ontime)));
end $$;

revoke all on function public.class_journey(uuid) from public;
grant execute on function public.class_journey(uuid) to anon, authenticated;
