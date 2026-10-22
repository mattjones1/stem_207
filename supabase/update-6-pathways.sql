-- STEM 207 update 6: educator pathways (categories-pathways Phase 3).
-- Paste this whole file in the Supabase SQL Editor and click Run. Safe to run more than once.
-- It adds three tables and redefines student_state. It changes nothing already saved.
-- Run updates 2–5 first (it uses owns_class, assignments, and class_messages).
--
-- A pathway is an educator's ordered set of missions (and their own synthesis steps) toward one goal.
-- Publishing makes an immutable snapshot (pathway_versions). Assigning pins a class to one snapshot,
-- so later edits never change what an assigned class is working on.
-- Rollback: drop the three tables (assignments first), then re-run update-3-class-messages.sql
-- to put back the previous student_state.

-- 1. Pathways: owned by one educator. `steps` is the working copy (JSON list of steps).
create table if not exists public.pathways (
  id text primary key check (char_length(id) <= 64),
  educator_id uuid not null references public.educators (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 120),
  essential_question text check (essential_question is null or char_length(essential_question) <= 300),
  goal text check (goal is null or char_length(goal) <= 600),
  final_product text check (final_product is null or char_length(final_product) <= 600),
  audience jsonb not null default '{}'::jsonb,          -- { grades, minutes, equipment, prior }
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  version int not null default 0 check (version >= 0),  -- latest published version (0 = never published)
  steps jsonb not null default '[]'::jsonb check (jsonb_typeof(steps) = 'array' and pg_column_size(steps) < 60000),
  based_on text check (based_on is null or char_length(based_on) <= 64),   -- template or pathway it was copied from
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists pathways_educator_idx on public.pathways (educator_id);

-- 2. Published versions: one immutable snapshot per publish.
create table if not exists public.pathway_versions (
  pathway_id text not null references public.pathways (id) on delete cascade,
  version int not null check (version >= 1),
  snapshot jsonb not null check (pg_column_size(snapshot) < 80000),   -- title, goal, final product, audience, steps
  published_at timestamptz not null default now(),
  primary key (pathway_id, version)
);

-- 3. Assignments: a class works on one pinned version of a pathway.
create table if not exists public.pathway_assignments (
  id text primary key check (char_length(id) <= 64),
  class_id text not null references public.classes (id) on delete cascade,
  pathway_id text not null,
  version int not null,
  assigned_at timestamptz not null default now(),
  due_date date,
  note text check (note is null or char_length(note) <= 500),
  is_demo boolean not null default false,
  unique (class_id, pathway_id),
  foreign key (pathway_id, version) references public.pathway_versions (pathway_id, version) on delete restrict
);
create index if not exists pathway_assignments_class_idx on public.pathway_assignments (class_id);

-- Security: an educator sees and changes only their own pathways. Versions can be added and read,
-- never edited or deleted (they go away only with their pathway). Assignments need both the class
-- and the pathway to belong to the educator. Students never read these tables directly.
create or replace function public.owns_pathway(pid text)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.pathways where id = pid and educator_id = auth.uid());
$$;
revoke all on function public.owns_pathway(text) from public;
grant execute on function public.owns_pathway(text) to authenticated;

alter table public.pathways enable row level security;
alter table public.pathway_versions enable row level security;
alter table public.pathway_assignments enable row level security;

drop policy if exists pathways_owner on public.pathways;
create policy pathways_owner on public.pathways for all to authenticated
  using (educator_id = auth.uid()) with check (educator_id = auth.uid());

drop policy if exists pathway_versions_read on public.pathway_versions;
create policy pathway_versions_read on public.pathway_versions for select to authenticated using (public.owns_pathway(pathway_id));
drop policy if exists pathway_versions_add on public.pathway_versions;
create policy pathway_versions_add on public.pathway_versions for insert to authenticated with check (public.owns_pathway(pathway_id));

drop policy if exists pathway_assignments_owner on public.pathway_assignments;
create policy pathway_assignments_owner on public.pathway_assignments for all to authenticated
  using (public.owns_class(class_id))
  with check (public.owns_class(class_id) and public.owns_pathway(pathway_id));

grant select, insert, update, delete on public.pathways, public.pathway_assignments to authenticated;
grant select, insert on public.pathway_versions to authenticated;
revoke all on public.pathways, public.pathway_versions, public.pathway_assignments from anon;

-- 4. A student's own state now also lists their class's assigned pathways, each with its pinned snapshot.
--    Everything update-3 returned is unchanged.
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
                                                            'dueDate', pa.due_date, 'note', pa.note, 'snapshot', pv.snapshot,
                                                            'assignedAt', (extract(epoch from pa.assigned_at) * 1000)::bigint) order by pa.assigned_at)
                          from public.pathway_assignments pa
                          join public.pathway_versions pv on pv.pathway_id = pa.pathway_id and pv.version = pa.version
                          where pa.class_id = v_student.class_id), '[]'::json));
end $$;
revoke all on function public.student_state(uuid) from public;
grant execute on function public.student_state(uuid) to anon, authenticated;
