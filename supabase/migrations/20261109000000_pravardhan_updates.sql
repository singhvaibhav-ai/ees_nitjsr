-- Migration: 20261109000000_pravardhan_updates.sql
-- Adds Pravardhan ID (P-ID), privacy protection on verify functions, and event registration helpers.

-- 1. Ensure P-ID column on profiles
alter table public.profiles add column if not exists pid text unique;

-- 2. Sequence for P-ID
create sequence if not exists public.pravardhan_id_seq start 1;

-- 3. Helper to ensure user has a unique P-ID (e.g. PRV-2026-0001)
create or replace function public.ensure_pid_for(uid uuid)
returns text language plpgsql security definer set search_path = public as $$
declare
  existing_pid text;
  new_pid text;
  yr text := to_char(now(), 'YYYY');
begin
  select pid into existing_pid from public.profiles where id = uid;
  if existing_pid is not null then
    return existing_pid;
  end if;

  new_pid := 'PRV-' || yr || '-' || lpad(nextval('public.pravardhan_id_seq')::text, 4, '0');
  update public.profiles set pid = new_pid where id = uid and pid is null;
  return new_pid;
end $$;

-- 4. Privacy-hardened public P-ID check (phone & email only visible to staff and admins)
create or replace function public.verify_pid(p_id text)
returns json language plpgsql security definer set search_path = public as $$
declare
  target_user public.profiles;
  mem public.memberships;
  events_json json;
  needle text := upper(trim(p_id));
  is_staff_or_admin boolean := false;
begin
  select * into target_user
  from public.profiles
  where upper(coalesce(pid, '')) = needle
     or upper(coalesce(reg_no, '')) = needle
     or upper(email) = needle
  limit 1;

  if target_user.id is null then
    return null;
  end if;

  -- Check if caller is authenticated admin or event staff
  if auth.uid() is not null then
    select public.is_admin() or exists (
      select 1 from public.event_staff where user_id = auth.uid()
    ) into is_staff_or_admin;
  end if;

  select * into mem from public.memberships where user_id = target_user.id;

  select coalesce(json_agg(
    json_build_object(
      'event_id', e.id,
      'event_title', e.title,
      'event_slug', e.slug,
      'category', e.category,
      'starts_at', e.starts_at,
      'venue', e.venue,
      'status', coalesce(r.status, 'confirmed'),
      'checked_in_at', r.checked_in_at,
      'team_name', t.name,
      'team_code', t.code,
      'is_leader', (r.user_id = target_user.id)
    ) order by e.starts_at nulls last, e.title
  ), '[]'::json) into events_json
  from public.events e
  left join public.registrations r on r.event_id = e.id and (
    r.user_id = target_user.id or exists (
      select 1 from public.team_members tm where tm.team_id = r.team_id and tm.user_id = target_user.id
    )
  )
  left join public.teams t on t.id = r.team_id
  where r.id is not null;

  return json_build_object(
    'found', true,
    'pid', target_user.pid,
    'user_id', target_user.id,
    'name', target_user.full_name,
    'email', case when is_staff_or_admin then target_user.email else null end,
    'phone', case when is_staff_or_admin then target_user.phone else null end,
    'reg_no', target_user.reg_no,
    'batch', target_user.batch,
    'branch', target_user.branch,
    'college', target_user.college,
    'avatar_url', target_user.avatar_url,
    'is_member', (coalesce(mem.status, '') = 'active'),
    'member_no', mem.member_no,
    'events', events_json
  );
end $$;

-- 5. Public ID card check
create or replace function public.verify_member(p_member_no text)
returns json language sql stable security definer set search_path = public as $$
  select json_build_object(
    'member_no', coalesce(m.member_no, p.pid),
    'pid', p.pid,
    'status', coalesce(m.status, case when p.pid is not null then 'participant' else 'none' end),
    'name', p.full_name,
    'reg_no', p.reg_no,
    'batch', p.batch,
    'branch', p.branch,
    'college', p.college,
    'avatar_url', p.avatar_url
  )
  from public.profiles p
  left join public.memberships m on p.id = m.user_id
  where m.member_no = upper(trim(p_member_no))
     or upper(coalesce(p.pid, '')) = upper(trim(p_member_no))
     or upper(coalesce(p.reg_no, '')) = upper(trim(p_member_no))
  limit 1;
$$;

