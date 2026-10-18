-- STEM 207 update: assigned missions.
-- Already ran schema.sql before? Paste this in the Supabase SQL Editor and click Run. Safe to run again.

-- Missions a teacher has assigned to a class (activity ids come from the app's library).
create table if not exists public.assignments (
  id text primary key check (char_length(id) <= 64),
  class_id text not null references public.classes (id) on delete cascade,
  activity_id text not null check (char_length(activity_id) between 1 and 80),
  assigned_at timestamptz not null default now(),
  due_date date,
  is_demo boolean not null default false,
  unique (class_id, activity_id)
);
create index if not exists assignments_class_idx on public.assignments (class_id);

alter table public.assignments enable row level security;
drop policy if exists assignments_owner on public.assignments;
create policy assignments_owner on public.assignments for all to authenticated
  using (public.owns_class(class_id)) with check (public.owns_class(class_id));
grant select, insert, update, delete on public.assignments to authenticated;
revoke all on public.assignments from anon;

-- A student's own state: profile, class, full activity log, and the class's assigned missions.
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
    'assignments', coalesce((select json_agg(json_build_object('id', a.id, 'activityId', a.activity_id, 'dueDate', a.due_date,
                                                               'assignedAt', (extract(epoch from a.assigned_at) * 1000)::bigint) order by a.assigned_at)
                             from public.assignments a where a.class_id = v_student.class_id), '[]'::json));
end $$;

