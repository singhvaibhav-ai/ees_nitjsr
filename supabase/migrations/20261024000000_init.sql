-- EES NIT Jamshedpur: initial schema
-- Run with `supabase db push`, or paste into the Supabase SQL editor once.
--
-- Rules of thumb used throughout:
--   * Money is stored in paise (integer).
--   * Anything that decides status, fees or eligibility happens in a
--     SECURITY DEFINER function, never in the browser.
--   * Users can only ever update the profile columns explicitly granted below.

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ---------------------------------------------------------------------------
-- Profiles
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  phone text,
  college text,                         -- for people outside NIT JSR
  avatar_url text,
  tshirt_size text check (tshirt_size in ('XS','S','M','L','XL','XXL','XXXL')),
  -- Filled from the college email (2024ugee007@nitjsr.ac.in), never by the user
  is_nitjsr boolean not null default false,
  reg_no text unique,                   -- 2024UGEE007
  batch int,                            -- admission year, 2024
  programme text,                       -- UG | PG | FACULTY
  branch text,                          -- EE, ME, CE, CS ...
  roll text,                            -- 007
  is_admin boolean not null default false,
  onboarded boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

-- ---------------------------------------------------------------------------
-- Payment accounts and membership drives
-- ---------------------------------------------------------------------------

create table public.payment_accounts (
  id uuid primary key default gen_random_uuid(),
  label text not null,                  -- "President 2026-27"
  owner_name text not null,
  upi_id text not null,
  qr_url text,
  created_at timestamptz not null default now()
);

create table public.payment_account_approvers (
  account_id uuid references public.payment_accounts(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  primary key (account_id, user_id)
);

create table public.membership_drives (
  id uuid primary key default gen_random_uuid(),
  academic_year text not null unique,   -- '2026-27'
  fee_paise int not null,
  branch text not null default 'EE',
  programme text not null default 'UG',
  paying_batches int[] not null default '{}',      -- batches asked to pay this year
  auto_active_batches int[] not null default '{}', -- batches treated as already paid
  payment_account_id uuid references public.payment_accounts(id),
  deadline timestamptz,
  is_current boolean not null default false,
  created_at timestamptz not null default now()
);

create unique index one_current_drive on public.membership_drives (is_current) where is_current;

create sequence public.member_no_seq start 1;

create table public.memberships (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  status text not null check (status in ('pending','active','rejected')),
  source text check (source in ('auto','paid','form_import','faculty','manual')),
  drive_id uuid references public.membership_drives(id),
  member_no text unique,
  activated_at timestamptz,
  tshirt_issued_at timestamptz,
  note text,
  updated_at timestamptz not null default now()
);

create trigger memberships_touch before update on public.memberships
  for each row execute function public.touch_updated_at();

-- Registration numbers that paid outside the site (the Google Form)
create table public.form_imports (
  reg_no text primary key,
  utr text,
  amount_paise int,
  drive_id uuid references public.membership_drives(id),
  imported_by uuid references public.profiles(id),
  imported_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Editions, events, staff, teams, registrations
-- ---------------------------------------------------------------------------

create table public.editions (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,            -- 'pravardhan-2026'
  name text not null,
  tagline text,
  description text,
  starts_on date,
  ends_on date,
  announce_at timestamptz,              -- page shows "coming soon" until then
  banner_url text,
  created_at timestamptz not null default now()
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  edition_id uuid references public.editions(id) on delete set null,
  category text not null default 'technical'
    check (category in ('technical','fun','workshop','hackathon','sports','orientation','other')),
  title text not null,
  summary text,
  description text,
  rules text,
  rulebook_url text,
  prizes text,
  venue text,
  starts_at timestamptz,
  ends_at timestamptz,
  banner_url text,
  contact text,
  status text not null default 'draft' check (status in ('draft','published','closed','completed')),
  -- Who can register (an empty array means "any")
  audience text not null default 'nitjsr' check (audience in ('all','nitjsr')),
  allowed_batches int[] not null default '{}',
  allowed_branches text[] not null default '{}',
  allowed_programmes text[] not null default '{}',
  members_only boolean not null default false,
  team_min int not null default 1 check (team_min >= 1),
  team_max int not null default 1 check (team_max >= 1),
  capacity int,
  reg_opens_at timestamptz,
  reg_closes_at timestamptz,
  needs_approval boolean not null default false,
  -- Fees by category of person. Active EES members default to free.
  fee_member_paise int not null default 0,
  fee_nitjsr_paise int not null default 0,
  fee_outsider_paise int not null default 0,
  payment_account_id uuid references public.payment_accounts(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (team_max >= team_min)
);

create trigger events_touch before update on public.events
  for each row execute function public.touch_updated_at();

-- Only registrants and staff may read these
create table public.event_secrets (
  event_id uuid primary key references public.events(id) on delete cascade,
  whatsapp_link text
);

create table public.event_staff (
  event_id uuid references public.events(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  role text not null default 'head' check (role in ('head','coordinator','volunteer')),
  por_title text,
  primary key (event_id, user_id)
);

create or replace function public.is_event_staff(eid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.event_staff where event_id = eid and user_id = auth.uid());
$$;

create table public.teams (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  name text not null,
  code text not null unique,
  leader_id uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.team_members (
  team_id uuid references public.teams(id) on delete cascade,
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (team_id, user_id),
  unique (event_id, user_id)
);

create table public.registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade, -- the person, or the team leader
  team_id uuid unique references public.teams(id) on delete cascade,
  status text not null check (status in ('pending_payment','pending_approval','confirmed','waitlisted','cancelled')),
  fee_paise int not null default 0,
  answers jsonb not null default '{}',
  checked_in_at timestamptz,
  created_at timestamptz not null default now(),
  unique (event_id, user_id)
);

-- ---------------------------------------------------------------------------
-- Payments, results, posts
-- ---------------------------------------------------------------------------

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  purpose text not null check (purpose in ('membership','event')),
  drive_id uuid references public.membership_drives(id),
  registration_id uuid references public.registrations(id) on delete cascade,
  account_id uuid references public.payment_accounts(id),
  amount_paise int not null,
  utr text not null unique,
  screenshot_path text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  review_note text,
  created_at timestamptz not null default now(),
  check ((purpose = 'membership' and drive_id is not null) or (purpose = 'event' and registration_id is not null))
);

create table public.results (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  position text not null,               -- 'Winner', '1st runner-up', 'Orange Cap'
  winner_name text not null,            -- person or team, as it should appear
  user_id uuid references public.profiles(id),
  team_id uuid references public.teams(id),
  sort int not null default 0
);

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  body text not null default '',
  cover_url text,
  is_published boolean not null default false,
  published_at timestamptz,
  author_id uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.audit_log (
  id bigint generated always as identity primary key,
  actor uuid,
  action text not null,
  target text,
  detail jsonb,
  at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Membership logic
-- ---------------------------------------------------------------------------

create or replace function public.current_drive()
returns public.membership_drives language sql stable security definer set search_path = public as $$
  select * from public.membership_drives where is_current limit 1;
$$;

-- Make someone an active member (idempotent)
create or replace function public.activate_membership(uid uuid, src text, did uuid)
returns void language plpgsql security definer set search_path = public as $$
declare
  yr text;
begin
  select coalesce(left(academic_year, 4), to_char(now(), 'YYYY')) into yr
    from public.membership_drives where id = did;
  yr := coalesce(yr, to_char(now(), 'YYYY'));

  insert into public.memberships (user_id, status, source, drive_id, member_no, activated_at)
  values (uid, 'active', src, did, 'EES-' || yr || '-' || lpad(nextval('public.member_no_seq')::text, 4, '0'), now())
  on conflict (user_id) do update
    set status = 'active',
        source = excluded.source,
        drive_id = coalesce(public.memberships.drive_id, excluded.drive_id),
        member_no = coalesce(public.memberships.member_no, excluded.member_no),
        activated_at = coalesce(public.memberships.activated_at, now())
    where public.memberships.status <> 'active';
end $$;

-- Apply the automatic rules (3rd/4th years, Google Form imports) to one person
create or replace function public.sync_membership_for(uid uuid)
returns void language plpgsql security definer set search_path = public as $$
declare
  p public.profiles;
  d public.membership_drives;
begin
  select * into p from public.profiles where id = uid;
  if p.id is null or not p.is_nitjsr then return; end if;
  if exists (select 1 from public.memberships where user_id = uid and status = 'active') then return; end if;

  d := public.current_drive();

  if exists (select 1 from public.form_imports where reg_no = p.reg_no) then
    perform public.activate_membership(uid, 'form_import',
      coalesce((select drive_id from public.form_imports where reg_no = p.reg_no), d.id));
  elsif d.id is not null and p.branch = d.branch and p.programme = d.programme
        and p.batch = any (d.auto_active_batches) then
    perform public.activate_membership(uid, 'auto', d.id);
  end if;
end $$;

create or replace function public.sync_my_membership()
returns void language sql security definer set search_path = public as $$
  select public.sync_membership_for(auth.uid());
$$;

-- New auth user -> profile, parsed from the college email
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  m text[];
begin
  m := regexp_match(lower(new.email), '^(\d{4})(ug|pg)([a-z]{2,3})(\d{2,4})@nitjsr\.ac\.in$');
  if m is not null then
    insert into public.profiles (id, email, full_name, is_nitjsr, reg_no, batch, programme, branch, roll)
    values (new.id, lower(new.email), new.raw_user_meta_data->>'full_name', true,
            upper(m[1] || m[2] || m[3] || m[4]), m[1]::int, upper(m[2]), upper(m[3]), m[4]);
  else
    insert into public.profiles (id, email, full_name, is_nitjsr)
    values (new.id, lower(new.email), new.raw_user_meta_data->>'full_name',
            lower(new.email) like '%@nitjsr.ac.in');
  end if;
  perform public.sync_membership_for(new.id);
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.is_payment_approver(acc uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.is_admin() or exists (
    select 1 from public.payment_account_approvers where account_id = acc and user_id = auth.uid());
$$;

create or replace function public.normalize_utr(u text)
returns text language sql immutable as $$
  select upper(regexp_replace(coalesce(u, ''), '\s', '', 'g'));
$$;

create or replace function public.submit_membership_payment(p_utr text, p_screenshot text)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  p public.profiles;
  d public.membership_drives;
  pid uuid;
  u text := public.normalize_utr(p_utr);
begin
  select * into p from public.profiles where id = auth.uid();
  if p.id is null then raise exception 'Please sign in first'; end if;
  d := public.current_drive();
  if d.id is null then raise exception 'Membership payments are not open right now'; end if;
  if not p.is_nitjsr or p.branch is distinct from d.branch then
    raise exception 'Membership is for % students signed in with their college email', d.branch;
  end if;
  if exists (select 1 from public.memberships where user_id = p.id and status = 'active') then
    raise exception 'Your membership is already active';
  end if;
  if exists (select 1 from public.payments where user_id = p.id and purpose = 'membership' and status = 'pending') then
    raise exception 'You already have a payment waiting for approval';
  end if;
  if length(u) < 8 then raise exception 'Enter the full UTR / transaction ID'; end if;
  if exists (select 1 from public.payments where utr = u) then
    raise exception 'This UTR has already been submitted';
  end if;

  insert into public.payments (user_id, purpose, drive_id, account_id, amount_paise, utr, screenshot_path)
  values (p.id, 'membership', d.id, d.payment_account_id, d.fee_paise, u, p_screenshot)
  returning id into pid;

  insert into public.memberships (user_id, status, drive_id)
  values (p.id, 'pending', d.id)
  on conflict (user_id) do update set status = 'pending', drive_id = excluded.drive_id;

  return pid;
end $$;

-- ---------------------------------------------------------------------------
-- Event logic
-- ---------------------------------------------------------------------------

create or replace function public.is_active_member(uid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.memberships where user_id = uid and status = 'active');
$$;

-- Null when the person may register; otherwise the reason they can't
create or replace function public.eligibility_reason(eid uuid, uid uuid)
returns text language plpgsql stable security definer set search_path = public as $$
declare
  e public.events;
  p public.profiles;
  taken int;
begin
  select * into e from public.events where id = eid;
  select * into p from public.profiles where id = uid;
  if e.id is null then return 'Event not found'; end if;
  if p.id is null then return 'Sign in to register'; end if;
  if not p.onboarded then return 'Finish your profile first'; end if;
  if e.status <> 'published' then return 'Registrations are closed'; end if;
  if e.reg_opens_at is not null and now() < e.reg_opens_at then return 'Registrations have not opened yet'; end if;
  if e.reg_closes_at is not null and now() > e.reg_closes_at then return 'Registrations are closed'; end if;
  if e.audience = 'nitjsr' and not p.is_nitjsr then
    return 'Open to NIT Jamshedpur students only. Sign in with your college email.';
  end if;
  if cardinality(e.allowed_batches) > 0 and (p.batch is null or not p.batch = any (e.allowed_batches)) then
    return 'Open to batch ' || array_to_string(e.allowed_batches, ', ') || ' only';
  end if;
  if cardinality(e.allowed_branches) > 0 and (p.branch is null or not p.branch = any (e.allowed_branches)) then
    return 'Open to ' || array_to_string(e.allowed_branches, ', ') || ' students only';
  end if;
  if cardinality(e.allowed_programmes) > 0 and (p.programme is null or not p.programme = any (e.allowed_programmes)) then
    return 'Open to ' || array_to_string(e.allowed_programmes, ', ') || ' students only';
  end if;
  if e.members_only and not public.is_active_member(uid) then
    return 'Only for active EES members. Activate your membership first.';
  end if;
  if e.capacity is not null then
    select count(*) into taken from public.registrations
      where event_id = eid and status in ('confirmed','pending_payment','pending_approval');
    if taken >= e.capacity then return 'All seats are taken'; end if;
  end if;
  return null;
end $$;

create or replace function public.fee_for(eid uuid, uid uuid)
returns int language sql stable security definer set search_path = public as $$
  select case
    when public.is_active_member(uid) then e.fee_member_paise
    when (select is_nitjsr from public.profiles where id = uid) then e.fee_nitjsr_paise
    else e.fee_outsider_paise end
  from public.events e where e.id = eid;
$$;

create or replace function public.my_event_status(eid uuid)
returns json language sql stable security definer set search_path = public as $$
  select json_build_object(
    'reason', public.eligibility_reason(eid, auth.uid()),
    'fee_paise', public.fee_for(eid, auth.uid()),
    'registration', (select row_to_json(r) from public.registrations r where r.event_id = eid and r.user_id = auth.uid()),
    'team', (select json_build_object('id', t.id, 'name', t.name, 'code', t.code, 'leader_id', t.leader_id,
                     'members', (select json_agg(json_build_object('name', coalesce(pr.full_name, pr.email), 'reg_no', pr.reg_no))
                                   from public.team_members tm join public.profiles pr on pr.id = tm.user_id where tm.team_id = t.id))
             from public.team_members tm join public.teams t on t.id = tm.team_id
             where tm.event_id = eid and tm.user_id = auth.uid()),
    'whatsapp_link', (select s.whatsapp_link from public.event_secrets s where s.event_id = eid
                        and (exists (select 1 from public.team_members tm where tm.event_id = eid and tm.user_id = auth.uid())
                             or exists (select 1 from public.registrations r where r.event_id = eid and r.user_id = auth.uid() and r.status <> 'cancelled')))
  );
$$;

create or replace function public.random_code()
returns text language sql volatile as $$
  select upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));
$$;

-- Register yourself (solo) or create a team (team events)
create or replace function public.register_for_event(eid uuid, p_team_name text, p_answers jsonb)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  e public.events;
  uid uuid := auth.uid();
  why text;
  fee int;
  tid uuid;
  rid uuid;
  st text;
begin
  select * into e from public.events where id = eid for update;
  if exists (select 1 from public.team_members where event_id = eid and user_id = uid)
     or exists (select 1 from public.registrations where event_id = eid and user_id = uid) then
    raise exception 'You are already registered for this event';
  end if;
  why := public.eligibility_reason(eid, uid);
  if why is not null then raise exception '%', why; end if;

  fee := public.fee_for(eid, uid);
  if fee > 0 then st := 'pending_payment';
  elsif e.needs_approval then st := 'pending_approval';
  else st := 'confirmed'; end if;

  if e.team_max > 1 then
    if coalesce(trim(p_team_name), '') = '' then raise exception 'Give your team a name'; end if;
    insert into public.teams (event_id, name, code, leader_id)
    values (eid, trim(p_team_name), public.random_code(), uid) returning id into tid;
    insert into public.team_members (team_id, event_id, user_id) values (tid, eid, uid);
  end if;

  insert into public.registrations (event_id, user_id, team_id, status, fee_paise, answers)
  values (eid, uid, tid, st, fee, coalesce(p_answers, '{}'::jsonb)) returning id into rid;
  return rid;
end $$;

create or replace function public.join_team(p_code text)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  t public.teams;
  e public.events;
  uid uuid := auth.uid();
  why text;
  n int;
begin
  select * into t from public.teams where code = upper(trim(p_code)) for update;
  if t.id is null then raise exception 'No team found with that code'; end if;
  select * into e from public.events where id = t.event_id;
  if exists (select 1 from public.team_members where event_id = e.id and user_id = uid)
     or exists (select 1 from public.registrations where event_id = e.id and user_id = uid) then
    raise exception 'You are already registered for this event';
  end if;
  why := public.eligibility_reason(e.id, uid);
  -- A full event should still let teammates join an existing team
  if why is not null and why <> 'All seats are taken' then raise exception '%', why; end if;
  select count(*) into n from public.team_members where team_id = t.id;
  if n >= e.team_max then raise exception 'This team is already full (% members)', e.team_max; end if;
  insert into public.team_members (team_id, event_id, user_id) values (t.id, e.id, uid);
  return t.id;
end $$;

create or replace function public.leave_event(eid uuid)
returns void language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  r public.registrations;
begin
  select * into r from public.registrations where event_id = eid and user_id = uid;
  if r.id is not null then
    if exists (select 1 from public.payments where registration_id = r.id and status = 'approved') then
      raise exception 'Your payment was already approved; ask the event team to cancel it';
    end if;
    delete from public.registrations where id = r.id;   -- also removes the team and its members
    delete from public.teams where id = r.team_id;
  else
    delete from public.team_members where event_id = eid and user_id = uid;
  end if;
end $$;

create or replace function public.submit_event_payment(rid uuid, p_utr text, p_screenshot text)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  r public.registrations;
  e public.events;
  pid uuid;
  u text := public.normalize_utr(p_utr);
begin
  select * into r from public.registrations where id = rid and user_id = auth.uid();
  if r.id is null then raise exception 'Registration not found'; end if;
  if r.status <> 'pending_payment' then raise exception 'No payment is due for this registration'; end if;
  if exists (select 1 from public.payments where registration_id = rid and status = 'pending') then
    raise exception 'Your payment is already waiting for approval';
  end if;
  if length(u) < 8 then raise exception 'Enter the full UTR / transaction ID'; end if;
  if exists (select 1 from public.payments where utr = u) then raise exception 'This UTR has already been submitted'; end if;
  select * into e from public.events where id = r.event_id;
  insert into public.payments (user_id, purpose, registration_id, account_id, amount_paise, utr, screenshot_path)
  values (auth.uid(), 'event', rid, e.payment_account_id, r.fee_paise, u, p_screenshot)
  returning id into pid;
  return pid;
end $$;

-- Approve or reject a payment (admins, or approvers of the receiving account)
create or replace function public.review_payment(pid uuid, approve boolean, note text)
returns void language plpgsql security definer set search_path = public as $$
declare
  pay public.payments;
  e public.events;
begin
  select * into pay from public.payments where id = pid for update;
  if pay.id is null then raise exception 'Payment not found'; end if;
  if not public.is_payment_approver(pay.account_id) then raise exception 'You cannot review this payment'; end if;
  if pay.status <> 'pending' then raise exception 'This payment was already reviewed'; end if;

  update public.payments
     set status = case when approve then 'approved' else 'rejected' end,
         reviewed_by = auth.uid(), reviewed_at = now(), review_note = note
   where id = pid;

  if pay.purpose = 'membership' then
    if approve then
      perform public.activate_membership(pay.user_id, 'paid', pay.drive_id);
    else
      update public.memberships set status = 'rejected', note = review_payment.note
       where user_id = pay.user_id and status = 'pending';
    end if;
  else
    select e2.* into e from public.events e2 join public.registrations r on r.event_id = e2.id where r.id = pay.registration_id;
    if approve then
      update public.registrations
         set status = case when e.needs_approval then 'pending_approval' else 'confirmed' end
       where id = pay.registration_id;
    end if;
  end if;

  insert into public.audit_log (actor, action, target, detail)
  values (auth.uid(), case when approve then 'payment.approve' else 'payment.reject' end, pid::text,
          json_build_object('utr', pay.utr, 'amount_paise', pay.amount_paise, 'note', note));
end $$;

-- Admin: load Google Form responses; activates anyone who already signed up
create or replace function public.import_form_payments(rows jsonb)
returns int language plpgsql security definer set search_path = public as $$
declare
  item jsonb;
  d public.membership_drives;
  n int := 0;
  rn text;
begin
  if not public.is_admin() then raise exception 'Admins only'; end if;
  d := public.current_drive();
  for item in select * from jsonb_array_elements(rows) loop
    rn := upper(regexp_replace(item->>'reg_no', '\s', '', 'g'));
    continue when rn is null or rn = '';
    insert into public.form_imports (reg_no, utr, amount_paise, drive_id, imported_by)
    values (rn, nullif(item->>'utr', ''), nullif(item->>'amount_paise', '')::int, d.id, auth.uid())
    on conflict (reg_no) do update set utr = coalesce(excluded.utr, public.form_imports.utr);
    n := n + 1;
  end loop;
  perform public.sync_membership_for(p.id)
    from public.profiles p where p.reg_no in (select reg_no from public.form_imports);
  insert into public.audit_log (actor, action, detail) values (auth.uid(), 'membership.import', json_build_object('rows', n));
  return n;
end $$;

-- Public ID card check (only what the card itself shows)
create or replace function public.verify_member(p_member_no text)
returns json language sql stable security definer set search_path = public as $$
  select json_build_object('member_no', m.member_no, 'status', m.status, 'name', p.full_name,
                           'reg_no', p.reg_no, 'batch', p.batch, 'branch', p.branch, 'avatar_url', p.avatar_url)
  from public.memberships m join public.profiles p on p.id = m.user_id
  where m.member_no = upper(p_member_no);
$$;

-- Admin: grant or remove admin by email
create or replace function public.set_admin(p_email text, make_admin boolean)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'Admins only'; end if;
  update public.profiles set is_admin = make_admin where email = lower(trim(p_email));
  if not found then raise exception 'No account with that email. They must sign in once first.'; end if;
  insert into public.audit_log (actor, action, target) values (auth.uid(), case when make_admin then 'admin.grant' else 'admin.revoke' end, lower(p_email));
end $$;

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.payment_accounts enable row level security;
alter table public.payment_account_approvers enable row level security;
alter table public.membership_drives enable row level security;
alter table public.memberships enable row level security;
alter table public.form_imports enable row level security;
alter table public.editions enable row level security;
alter table public.events enable row level security;
alter table public.event_secrets enable row level security;
alter table public.event_staff enable row level security;
alter table public.teams enable row level security;
alter table public.team_members enable row level security;
alter table public.registrations enable row level security;
alter table public.payments enable row level security;
alter table public.results enable row level security;
alter table public.posts enable row level security;
alter table public.audit_log enable row level security;

-- profiles: you, admins, and staff of an event you registered for
-- Policy helpers run as definer so policies never query each other's tables (no recursion)
create or replace function public.in_my_team(tid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.team_members where team_id = tid and user_id = auth.uid());
$$;

create or replace function public.staff_can_see_person(pid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.registrations r join public.event_staff s on s.event_id = r.event_id
                 where r.user_id = pid and s.user_id = auth.uid())
      or exists (select 1 from public.team_members tm join public.event_staff s on s.event_id = tm.event_id
                 where tm.user_id = pid and s.user_id = auth.uid());
$$;

create policy profiles_read on public.profiles for select using (
  id = auth.uid() or public.is_admin() or public.staff_can_see_person(id)
);
create policy profiles_update_self on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());
create policy profiles_admin on public.profiles for update using (public.is_admin());
-- Users may only change these columns; identity columns stay as parsed
revoke update on public.profiles from authenticated, anon;
grant update (full_name, phone, college, avatar_url, tshirt_size, onboarded) on public.profiles to authenticated;

create policy accounts_read on public.payment_accounts for select using (true);
create policy accounts_admin on public.payment_accounts for all using (public.is_admin()) with check (public.is_admin());
create policy approvers_read on public.payment_account_approvers for select using (user_id = auth.uid() or public.is_admin());
create policy approvers_admin on public.payment_account_approvers for all using (public.is_admin()) with check (public.is_admin());

create policy drives_read on public.membership_drives for select using (true);
create policy drives_admin on public.membership_drives for all using (public.is_admin()) with check (public.is_admin());

create policy memberships_read on public.memberships for select using (user_id = auth.uid() or public.is_admin());
create policy memberships_admin on public.memberships for update using (public.is_admin());

create policy imports_admin on public.form_imports for all using (public.is_admin()) with check (public.is_admin());

create policy editions_read on public.editions for select using (true);
create policy editions_admin on public.editions for all using (public.is_admin()) with check (public.is_admin());

-- Drafts and events of an unannounced edition are hidden from the public
create policy events_read on public.events for select using (
  public.is_admin() or public.is_event_staff(id)
  or (status <> 'draft' and (edition_id is null or exists (
        select 1 from public.editions ed where ed.id = edition_id and (ed.announce_at is null or ed.announce_at <= now()))))
);
create policy events_admin on public.events for all using (public.is_admin()) with check (public.is_admin());
create policy events_staff_update on public.events for update using (public.is_event_staff(id)) with check (public.is_event_staff(id));

create policy secrets_staff on public.event_secrets for all using (public.is_admin() or public.is_event_staff(event_id))
  with check (public.is_admin() or public.is_event_staff(event_id));

create policy staff_read on public.event_staff for select using (true);
create policy staff_admin on public.event_staff for all using (public.is_admin()) with check (public.is_admin());

create policy teams_read on public.teams for select using (
  public.is_admin() or public.is_event_staff(event_id) or public.in_my_team(id));
create policy team_members_read on public.team_members for select using (
  user_id = auth.uid() or public.is_admin() or public.is_event_staff(event_id) or public.in_my_team(team_id));

create policy registrations_read on public.registrations for select using (
  user_id = auth.uid() or public.is_admin() or public.is_event_staff(event_id)
  or (team_id is not null and public.in_my_team(team_id)));
create policy registrations_staff on public.registrations for update using (public.is_admin() or public.is_event_staff(event_id));

create policy payments_read on public.payments for select using (
  user_id = auth.uid() or public.is_payment_approver(account_id));

create policy results_read on public.results for select using (true);
create policy results_staff on public.results for all using (public.is_admin() or public.is_event_staff(event_id))
  with check (public.is_admin() or public.is_event_staff(event_id));

create policy posts_read on public.posts for select using (is_published or public.is_admin());
create policy posts_admin on public.posts for all using (public.is_admin()) with check (public.is_admin());

create policy audit_admin on public.audit_log for select using (public.is_admin());

-- Functions callable from the app
revoke execute on function public.activate_membership(uuid, text, uuid) from public, anon, authenticated;
revoke execute on function public.sync_membership_for(uuid) from public, anon, authenticated;
revoke execute on function public.eligibility_reason(uuid, uuid) from public, anon;
revoke execute on function public.fee_for(uuid, uuid) from public, anon;

-- ---------------------------------------------------------------------------
-- Storage
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public) values ('media', 'media', true) on conflict do nothing;
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true) on conflict do nothing;
insert into storage.buckets (id, name, public) values ('payments', 'payments', false) on conflict do nothing;

create policy media_admin_write on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and public.is_admin());
create policy media_admin_update on storage.objects for update to authenticated
  using (bucket_id = 'media' and public.is_admin());

create policy avatars_own_write on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy avatars_own_update on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy payments_own_write on storage.objects for insert to authenticated
  with check (bucket_id = 'payments' and (storage.foldername(name))[1] = auth.uid()::text);
create policy payments_read on storage.objects for select to authenticated
  using (bucket_id = 'payments' and (
    (storage.foldername(name))[1] = auth.uid()::text
    or exists (select 1 from public.payments p where p.screenshot_path = storage.objects.name
               and public.is_payment_approver(p.account_id))));
