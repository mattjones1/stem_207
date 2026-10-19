-- STEM 207 update 4: class journey totals for students.
-- Paste this whole file in the Supabase SQL Editor and click Run. Safe to run more than once.
-- It adds one read-only function and changes no data.
--
-- A student's device only loads that student's own work, so it can't add up the whole class.
-- class_journey returns the class's totals as counts only: no names, no ids, and nothing about
-- any one classmate. The app turns the counts into class points and class badges with the same
-- rules as SE.game.classCounts in assets/js/game.js.

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
    asg as (select activity_id, due_date from public.assignments where class_id = v_class),
    -- first time each student sent each assigned mission
    sent as (select student_id, data->>'activityId' as act, min(at) as at from ev
             where type = 'mission_completed' and (data->>'activityId') in (select activity_id from asg)
             group by 1, 2),
    conf as (select distinct student_id, data->>'activityId' as act from ev where type = 'teacher_confirmed' and data ? 'activityId'),
    stg as (select distinct student_id, data->>'stage' as stage from ev where type = 'ican_verified'),
    -- assigned missions with a due date that every student sent before the end of that day (UTC)
    ontime as (select a.activity_id from asg a
               where a.due_date is not null and v_students > 0
                 and (select count(*) from sent s where s.act = a.activity_id
                        and s.at < extract(epoch from (a.due_date + 1)::timestamp) * 1000) = v_students)
    select json_build_object(
      'ok', true,
      'students', v_students,
      'assignedDone', (select count(*) from sent),
      'confirmed', (select count(*) from conf),
      'stages', (select count(*) from stg),
      'withAssigned', (select count(distinct student_id) from sent),
      'withStage1', (select count(distinct student_id) from stg where stage = '1'),
      'onTime', (select count(*) from ontime)));
end $$;

revoke all on function public.class_journey(uuid) from public;
grant execute on function public.class_journey(uuid) to anon, authenticated;
