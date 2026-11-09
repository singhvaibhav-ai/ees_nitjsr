# EES NIT Jamshedpur

Official website of the Electrical Engineering Society, National Institute of Technology Jamshedpur: events and registrations, Pravardhan techno-cultural fest, Electrical Premier League (EPL), EES membership with digital ID cards, faculty directory, photo gallery, and departmental updates.

Built with Next.js 16 (App Router & Turbopack), Supabase (PostgreSQL, Auth, Storage, Row-Level Security), and Tailwind CSS 4.

---

## Architecture & Features

- **Sign In & Automated Profiling**: Sign in via email OTP code or Google OAuth. College emails (e.g., `2024ugee007@nitjsr.ac.in`) automatically parse admission year (batch), programme (UG/PG), branch (`EE`), and roll number.
- **Lifetime Membership & Digital ID Cards**: Active members receive a unique member number, verified credential status, and an interactive digital ID card with a cryptographic QR code linking to `/verify/<memberNo>`.
- **Event Head & Staff Workspace** (`/dashboard/workspace`): Event coordinators, heads, and volunteers have a dedicated workspace to view real-time registrations, check-in attendees on event day, approve team entries, export CSV attendance rosters, and publish winners.
- **Electrical Premier League (EPL)** (`/epl`): Annual intra-departmental cricket tournament with live match schedules, interactive points table, playoff brackets, top run scorers (Orange Cap), and top wicket takers (Purple Cap).
- **Faculty Directory & Official Digital Credentials** (`/faculty`): Departmental faculty directory featuring research specializations, HOD and Professors-in-Charge, official contact details, and printable verified faculty ID cards.
- **Media Gallery** (`/gallery`): Interactive visual archive of Pravardhan fests, technical workshops, EPL tournaments, and campus life with full-screen lightbox viewing.
- **Dynamic Team Directory** (`/about`): Filter and search core committee tenures (2026-27, 2025-26), Executive Board members, and wing heads in real-time.
- **Pravardhan Fest Portal** (`/pravardhan`): Edition showcase dynamically surfacing events, prize pools, and schedule announcements.
- **Comprehensive Admin Panel** (`/admin`): Manage membership drives, UPI payment accounts, manual Google Form payment imports, events, fests, announcements, and administrator permissions.

---

## Getting Started & Setup Guide

### 1. Prerequisites
- **Node.js** (v20 or higher, v24 recommended) and **npm**
- A free **Supabase** account (or local Supabase CLI with Docker)

### 2. Environment Configuration
Copy the provided `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Fill in your Supabase project parameters:
```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-id>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Database Migration & Seed Data
Create a new project at [supabase.com](https://supabase.com) (recommended region: **Mumbai, India**).

1. In the Supabase Dashboard, navigate to the **SQL Editor**.
2. Run the initial migration script:
   - Copy and execute [`supabase/migrations/20261024000000_init.sql`](supabase/migrations/20261024000000_init.sql).
3. Populate starter editions and events:
   - Copy and execute [`supabase/seed.sql`](supabase/seed.sql).

*(Alternative with Supabase CLI)*:
```bash
npx supabase link --project-ref <your-ref>
npx supabase db push
```

### 4. Authentication & Email OTP Configuration
To allow users to sign in via verification codes:
1. In your Supabase Dashboard, go to **Authentication → Email Templates**.
2. In both **"Confirm signup"** and **"Magic Link"** templates, update the email body to render the code. You can use the template in [`supabase/templates/otp.html`](supabase/templates/otp.html), ensuring `{{ .Token }}` is included.
3. In **Authentication → URL Configuration**:
   - Set **Site URL** to `http://localhost:3000` (or your production Vercel domain).
   - In **Redirect URLs**, add `http://localhost:3000/auth/callback` and `https://<your-production-domain>/auth/callback`.
4. *(Production)* Configure custom SMTP in **Authentication → SMTP Settings** (e.g. Resend, Brevo, or Gmail App Password) to remove Supabase's default rate limits.

### 5. Assigning the First Admin
1. Sign in once through the website UI at `/login` with your society or personal email.
2. In the Supabase **SQL Editor**, grant admin permissions:
   ```sql
   update public.profiles
   set is_admin = true
   where email = 'your-email@nitjsr.ac.in';
   ```
3. Once assigned, you will see the **Admin** button in the top navigation bar.

### 6. Local Development
Install dependencies and launch the Turbopack dev server:
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
├── src/
│   ├── app/
│   │   ├── (public pages)
│   │   │   ├── page.tsx               # Homepage with Pravardhan highlight & events
│   │   │   ├── events/                # Public events catalog & registration flow
│   │   │   ├── pravardhan/            # Pravardhan fest portal
│   │   │   ├── epl/                   # Electrical Premier League fixtures & points table
│   │   │   ├── faculty/               # Faculty directory & digital credentials
│   │   │   ├── gallery/               # Photo gallery & lightbox
│   │   │   ├── about/                 # About EES, leadership & interactive team directory
│   │   │   ├── updates/               # Notices and blog announcements
│   │   │   └── verify/[memberNo]/     # QR code verification endpoint
│   │   ├── dashboard/                 # Member portal, ID card generator, profile
│   │   │   ├── workspace/             # Event Head & Staff Workspace (check-ins, results, CSV)
│   │   │   └── id-card/               # Digital student ID card & OpenGraph PNG generator
│   │   ├── admin/                     # Admin control panel (payments, members, drives, events)
│   │   └── login/                     # Auth login with email OTP & Google OAuth
│   ├── components/                    # Design system components (Nav, Footer, Cards, Forms)
│   ├── data/                          # Structured datasets (EPL, Faculty, Gallery)
│   ├── lib/                           # Supabase SSR/client, session guards, CSV & helpers
│   └── proxy.ts                       # Next.js session refresh & route protection
├── supabase/
│   ├── migrations/                    # PostgreSQL schema, RLS policies, trigger functions
│   ├── seed.sql                       # Default 2026-27 membership drive & events
│   └── templates/                     # Email OTP authentication templates
└── public/images/                     # Logos, posters, and assets
```
