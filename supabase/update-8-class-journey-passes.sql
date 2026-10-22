-- STEM 207 update 8: class journey counts come from teacher passes (usability overhaul, Stage 2).
-- Paste this whole file in the Supabase SQL Editor and click Run. Safe to run more than once.
-- Run updates 2–7 first (it reads assignments, pathway_assignments, and pathway_versions).
-- It only redefines class_journey and changes no data.
--
-- One check for every activity: a student's reflection earns nothing until the teacher passes it.
-- The class journey moves only when a teacher passes assigned work: an activity assigned to the class,
-- or an activity inside a Learning Plan assigned to the class. Counts only: no names, no ids.
-- Keep these rules identical to SE.game.classCounts and journeyFrom in assets/js/game.js.
-- Rollback: re-run update-4-class-journey.sql (and the app's older game.js).

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
    ev as (select e.student_id, e.type, e.at, e.data from public.events e join st on st.id = e.student_id),
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
    passed_all as (select distinct student_id, data->>'activityId' as act from ev where type = 'teacher_confirmed' and data ? 'activityId'),
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
