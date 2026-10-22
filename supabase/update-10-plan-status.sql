-- STEM 207 update 10: students can tell current Learning Plans from finished ones (usability overhaul, Stage 4).
-- Paste this whole file in the Supabase SQL Editor and click Run. Safe to run more than once.
-- Run update 6 first. This only redefines student_state: each assigned Learning Plan now says whether
-- the teacher finished it (the plan is archived), for the Current / All toggle on My Learning Plans.
-- It changes no saved data. Rollback: re-run update-6-pathways.sql.

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
                          from (select * from public.class_messages where class_id = v_student.class_id order by created_at desc limit 20) m), '[]'::json),
    'pathways', coalesce((select json_agg(json_build_object('id', pa.id, 'pathwayId', pa.pathway_id, 'version', pa.version,
                                                            'dueDate', pa.due_date, 'note', pa.note, 'snapshot', pv.snapshot, 'finished', (pw.status = 'archived'),
                                                            'assignedAt', (extract(epoch from pa.assigned_at) * 1000)::bigint) order by pa.assigned_at)
                          from public.pathway_assignments pa
                          join public.pathway_versions pv on pv.pathway_id = pa.pathway_id and pv.version = pa.version
                          join public.pathways pw on pw.id = pa.pathway_id
                          where pa.class_id = v_student.class_id), '[]'::json));
end $$;
revoke all on function public.student_state(uuid) from public;
grant execute on function public.student_state(uuid) to anon, authenticated;
