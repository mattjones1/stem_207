-- STEM 207 update 9: archive classes (usability overhaul, Stage 3).
-- Paste this whole file in the Supabase SQL Editor and click Run. Safe to run more than once.
-- It adds one column and redefines two sign-in functions. It changes no saved data.
--
-- Educators can archive a class (hide it, and stop its students signing in) and restore it later.
-- Deleting a class already works: it removes the class with its students and their work (cascade).
-- Rollback: re-run schema.sql's class_roster and student_sign_in (the column can stay; it's unused then).

alter table public.classes add column if not exists archived_at timestamptz;

-- Step 1 of student sign-in: a class code finds only an active (not archived) class.
create or replace function public.class_roster(p_code text)
returns json language sql stable security definer set search_path = public as $$
  select json_build_object(
    'id', c.id, 'name', c.name, 'code', c.code,
    'students', coalesce((
      select json_agg(json_build_object('id', s.id, 'displayName', s.display_name, 'gradeBand', s.grade_band) order by s.display_name)
      from public.students s where s.class_id = c.id), '[]'::json))
  from public.classes c
  where c.code = upper(regexp_replace(coalesce(p_code, ''), '\s', '', 'g')) and c.archived_at is null;
$$;

-- Step 3 of student sign-in: the pictures must match, and the student's class must be active.
create or replace function public.student_sign_in(p_student_id text, p_code text[])
returns json language plpgsql volatile security definer set search_path = public as $$
declare
  v_student public.students;
  v_fails int;
  v_token uuid;
begin
  select s.* into v_student from public.students s join public.classes c on c.id = s.class_id
   where s.id = p_student_id and c.archived_at is null;
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

revoke all on function public.class_roster(text), public.student_sign_in(text, text[]) from public;
grant execute on function public.class_roster(text), public.student_sign_in(text, text[]) to anon, authenticated;
