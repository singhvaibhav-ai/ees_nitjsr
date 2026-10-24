-- Starting data for 2026-27. Safe to run once after the migration.

insert into public.membership_drives (academic_year, fee_paise, branch, programme, paying_batches, auto_active_batches, deadline, is_current)
values ('2026-27', 100000, 'EE', 'UG', '{2025}', '{2023,2024}', '2026-11-01 23:59:00+05:30', true)
on conflict (academic_year) do nothing;

insert into public.editions (slug, name, tagline, starts_on, ends_on, announce_at)
values ('pravardhan-2026', 'Pravardhan 2026',
        'The annual techno-cultural fest of the Electrical Engineering Society, NIT Jamshedpur.',
        '2026-11-22', '2026-11-24', '2026-11-01 00:00:00+05:30')
on conflict (slug) do nothing;

-- Pravardhan events start as drafts: fill in dates, rules, eligibility and fees in Admin > Events, then publish.
insert into public.events (slug, edition_id, category, title, summary, status)
select v.slug, (select id from public.editions where slug = 'pravardhan-2026'), v.category, v.title, v.summary, 'draft'
from (values
  ('matlink-2026', 'technical', 'Matlink', 'A MATLAB-based competition testing problem-solving and algorithm design.'),
  ('pair-in-thesis-2026', 'technical', 'Pair-in-Thesis', 'Coding and algorithm challenges that sharpen logical reasoning and programming.'),
  ('adhyayan-2026', 'technical', 'Adhyayan', 'Academic quizzes and knowledge-based competitions.'),
  ('electrospection-2026', 'technical', 'Electrospection', 'Circuit-making and electronics challenges that test practical EE skills.'),
  ('navriti-2026', 'technical', 'Navriti', 'Present an innovative project idea or mini-thesis to a panel.'),
  ('analytica-2026', 'technical', 'Analytica', 'Data analysis and problem-solving competitions.'),
  ('electrohack-2026', 'hackathon', 'Electrohack', 'A timed hackathon to design and build innovative solutions.'),
  ('abhyas-2026', 'technical', 'Abhyas', 'A mock placement drive: aptitude, technical and interview rounds.'),
  ('bgmi-2026', 'fun', 'BGMI Tournament', 'Team-based BGMI tournament.'),
  ('film-making-2026', 'fun', 'Film Making', 'Make a short film and show off your storytelling.'),
  ('treasure-hunt-2026', 'fun', 'Treasure Hunt', 'Clues, teamwork and strategy across the campus.')
) as v(slug, category, title, summary)
on conflict (slug) do nothing;
