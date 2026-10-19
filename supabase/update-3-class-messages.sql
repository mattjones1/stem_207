-- STEM 207 update 3: class messages and assignment instructions.
-- Paste this whole file in the Supabase SQL Editor and click Run. Safe to run more than once.
-- It changes nothing that students or teachers already saved.

-- 1. Instructions a teacher adds to an assigned mission (shown to students on Today).
alter table public.assignments add column if not exists note text;
alter table public.assignments drop constraint if exists assignments_note_len;
alter table public.assignments add constraint assignments_note_len check (note is null or char_length(note) <= 500);

-- 2. Short messages from a teacher to the whole class.
create table if not exists public.class_messages (
  id text primary key check (char_length(id) <= 64),
  class_id text not null references public.classes (id) on delete cascade,
  body text not null check (char_length(body) between 1 and 500),
  created_at timestamptz not null default now(),
  is_demo boolean not null default false
);
create index if not exists class_messages_class_idx on public.class_messages (class_id, created_at);

-- Teachers can read and change messages only in their own classes. Students never read the
-- table directly; they get their class's messages through student_state below.
alter table public.class_messages enable row level security;
drop policy if exists class_messages_owner on public.class_messages;
create policy class_messages_owner on public.class_messages for all to authenticated
  using (public.owns_class(class_id)) with check (public.owns_class(class_id));
grant select, insert, update, delete on public.class_messages to authenticated;
revoke all on public.class_messages from anon;

-- 3. A student's own state now includes assignment instructions and the 20 newest class messages.
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
revoke all on function public.student_state(uuid) from public;
grant execute on function public.student_state(uuid) to anon, authenticated;
