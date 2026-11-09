-- Starting data for 2026-27. Safe to run once after the migration.

insert into public.membership_drives (academic_year, fee_paise, branch, programme, paying_batches, auto_active_batches, deadline, is_current)
values ('2026-27', 100000, 'EE', 'UG', '{2025}', '{2023,2024}', '2026-11-20 23:59:00+05:30', true)
on conflict (academic_year) do nothing;

insert into public.editions (slug, name, tagline, starts_on, ends_on, announce_at)
values ('pravardhan-2026', 'Pravardhan 2026',
        'The annual techno-cultural fest of the Electrical Engineering Society, NIT Jamshedpur.',
        '2026-11-22', '2026-11-24', '2026-11-01 00:00:00+05:30')
on conflict (slug) do update set
  name = excluded.name,
  tagline = excluded.tagline,
  starts_on = excluded.starts_on,
  ends_on = excluded.ends_on,
  announce_at = excluded.announce_at;

-- Core Pravardhan 2026 Events (Published and Open for Registration)
insert into public.events (slug, edition_id, category, title, summary, description, status, team_min, team_max, starts_at, venue)
select v.slug, (select id from public.editions where slug = 'pravardhan-2026'), v.category, v.title, v.summary, v.description, 'published', v.team_min, v.team_max, v.starts_at::timestamptz, v.venue
from (values
  ('navriti-2026', 'technical', 'Navriti', 
   'Present an innovative project idea, working prototype, or mini-thesis to an expert panel.', 
   'Navriti is the flagship ideation and technical presentation symposium. Participants pitch innovative engineering concepts, working circuit prototypes, and research ideas. Judged on novelty, technical depth, and presentation clarity.', 
   1, 3, '2026-11-23 10:00:00+05:30', 'Department Seminar Hall, EE'),

  ('abhyas-2026', 'technical', 'Abhyas', 
   'Comprehensive mock placement drive: quantitative aptitude, core EE technical test, and HR interviews.', 
   'Simulating real corporate campus recruitment, Abhyas tests engineering students across aptitude, technical fundamentals, and interview skills with personalized feedback from recruiters and seniors.', 
   1, 1, '2026-11-22 14:00:00+05:30', 'Lecture Hall Complex'),

  ('electrospection-2026', 'technical', 'Electrospection', 
   'Practical electronics circuit-making, troubleshooting, and breadboard design under timed constraints.', 
   'Put your hands-on laboratory skills to the test. Teams receive mystery components and specifications to design, assemble, and debug functional circuits against the clock.', 
   1, 2, '2026-11-23 14:00:00+05:30', 'Electrical Machine & Circuit Lab'),

  ('pair-in-thesis-2026', 'technical', 'Pair-in-Thesis', 
   'Pair programming challenge testing algorithmic efficiency, data structures, and team logic.', 
   'A synchronized coding showdown where pairs alternate solving algorithmic puzzles, logic challenges, and system-level problems under time pressure.', 
   2, 2, '2026-11-22 11:00:00+05:30', 'Computer Center Lab 2'),

  ('fifa-2026', 'fun', 'FIFA Tournament', 
   'High-stakes 1v1 console e-sports football tournament across knockout brackets.', 
   'Step up to the console and claim the Pravardhan e-sports championship. Standard tournament rules, knockout rounds, and grand finale on the big screen.', 
   1, 1, '2026-11-24 11:00:00+05:30', 'Student Activity Center'),

  ('robosoccer-2026', 'technical', 'Robosoccer', 
   'Fast-paced robotic combat soccer tournament where custom wired/wireless bots clash.', 
   'Construct a custom robot to push, dribble, and shoot golf balls into the opponent goal in a dynamic indoor pitch. Tests mechanical agility, grip, and tactical driving.', 
   2, 4, '2026-11-24 14:00:00+05:30', 'Main Arena, Ground Floor EE'),

  ('matlink-2026', 'technical', 'Matlink', 
   'MATLAB & Simulink modeling, algorithm optimization, and scientific computing competition.', 
   'Tackle real-world electrical and control engineering problems using MATLAB and Simulink. Design models, analyze transients, and optimize signal processing routines.', 
   1, 2, '2026-11-23 16:00:00+05:30', 'Simulation & CAD Lab')
) as v(slug, category, title, summary, description, team_min, team_max, starts_at, venue)
on conflict (slug) do update set
  title = excluded.title,
  category = excluded.category,
  summary = excluded.summary,
  description = excluded.description,
  status = 'published',
  team_min = excluded.team_min,
  team_max = excluded.team_max,
  starts_at = excluded.starts_at,
  venue = excluded.venue;
