# EES NIT Jamshedpur

Website of the Electrical Engineering Society, NIT Jamshedpur: events and registrations, Pravardhan, EES membership with a digital ID card, and updates.

Built with Next.js 16 (App Router), Supabase (Postgres, Auth, Storage) and Tailwind CSS 4. Hosted on Vercel.

## How it works

- **Sign in** with an email code or Google. A college email like `2024ugee007@nitjsr.ac.in` fills in batch (admission year), programme (UG/PG), branch and roll number automatically. Anyone else can sign in with any email for events open to everyone.
- **Membership** is set per academic year in Admin → Settings: the fee, which batches pay, which batches are already paid (active automatically), and the UPI account. EE students pay by UPI, enter the UTR and a screenshot, and an admin or the account's approver approves it. Active members get a member number and an ID card with a QR code that opens `/verify/<member no>`.
- **Google Form payments** from before the site existed: Admin → Members → Import. Paste or upload rows with registration numbers (UTR optional). Those students become active members when they sign in.
- **Events** have their own eligibility (open to all or NIT JSR only, batches, branches, programmes, members only), team size, capacity, registration window, approval, and fees for members, other NIT JSR students and other colleges. Teams register with a team code. Paid registrations use the same UPI + UTR approval as membership.
- **Editions** group events into a fest. The newest edition whose slug starts with `pravardhan` powers `/pravardhan`; its events stay hidden until the edition's announce time.

All rules that matter (eligibility, fees, payment status, who is a member) live in Postgres functions in `supabase/migrations`, protected by row level security. The browser can't skip them.

## Setup (once)

Use the society email for every account below, so it can be handed over.

1. **Supabase**: create a project at supabase.com (region Mumbai). In the SQL editor, run `supabase/migrations/20261024000000_init.sql`, then `supabase/seed.sql`.
   Or with the CLI: `npx supabase link --project-ref <ref>` then `npx supabase db push` and run the seed in the SQL editor.
2. **Email sign-in codes**
   - Authentication → Email Templates: in **both** "Confirm signup" (sent to first-time users) and "Magic Link" (returning users), make the message show the code. Copy `supabase/templates/otp.html`, which uses `{{ .Token }}`. Without this, emails contain only a link and the code box on the site has nothing to accept.
   - Authentication → SMTP Settings: add a real SMTP sender (for example Resend, Brevo, or a Gmail app password on the society account). Supabase's built-in sender only allows a few emails an hour, which is not enough for a membership drive.
3. **Google sign-in (optional, recommended)**: create an OAuth client in Google Cloud (Web application, redirect URI `https://<project-ref>.supabase.co/auth/v1/callback`), then paste the client ID and secret in Authentication → Providers → Google.
4. **URLs**: Authentication → URL Configuration: Site URL `https://<your-domain>`, and add `https://<your-domain>/auth/callback` (plus `http://localhost:3000/auth/callback` for development) to Redirect URLs.
5. **Vercel**: import the GitHub repo and set the environment variables from `.env.example`:
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Supabase → Project Settings → API) and `NEXT_PUBLIC_SITE_URL`.
6. **First admin**: sign in once on the site, then in the Supabase SQL editor run
   `update public.profiles set is_admin = true where email = 'your-email@nitjsr.ac.in';`
   After that, add other admins from Admin → Settings.
7. **Before opening membership**: Admin → Settings → add the UPI account (with QR image), then pick it in the 2026-27 drive. Import the Google Form responses in Admin → Members.

## Development

```bash
cp .env.example .env.local   # fill in your Supabase project, or a local one
npm install
npm run dev
```

A local Supabase (needs Docker): `npx supabase start`, then `npx supabase db reset` applies the migration and seed. Sign-in emails appear in the local Inbucket/Mailpit UI it prints.

## Where things are

```
src/app/              pages (public, /dashboard, /admin) and server actions
src/app/admin/        admin panel: payments, members, events, editions, posts, settings
src/lib/              Supabase clients, formatting, session helpers
src/proxy.ts          refreshes the login session, guards /dashboard and /admin
supabase/migrations/  the whole database: tables, rules, row level security, storage
supabase/seed.sql     2026-27 membership drive, Pravardhan 2026 and its events (drafts)
```

## Not built yet

- Event workspace for event heads (today admins manage registrations; the database already lets event staff see and update their own event)
- Faculty profiles and ID cards
- Electrical Premier League fixtures and points table
- Team pages from the database (the About page lists the core teams from `src/app/about/team.ts`)
- Gallery
