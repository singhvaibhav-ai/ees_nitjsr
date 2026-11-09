import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { requireProfile, getMembership } from "@/lib/session";
import { ActionForm } from "@/components/forms";
import { dateOnly, rupees, STATUS_LABELS } from "@/lib/format";
import type { Drive, PaymentAccount, Profile, Membership } from "@/lib/types";
import { submitMembership } from "./actions";
import { CalendarCheck, ArrowRight, Trophy, QrCode } from "lucide-react";

export const metadata: Metadata = { title: "My EES" };

type MyEvent = { slug: string; title: string; starts_at: string | null; status: string; team?: string };

export default async function Dashboard() {
  const { supabase, profile } = await requireProfile("/dashboard");
  const membership = await getMembership(supabase, profile.id);

  const { data: drive } = await supabase.from("membership_drives").select("*").eq("is_current", true).maybeSingle<Drive>();
  const { data: account } = drive?.payment_account_id
    ? await supabase.from("payment_accounts").select("*").eq("id", drive.payment_account_id).maybeSingle<PaymentAccount>()
    : { data: null };
  const { data: pending } = await supabase
    .from("payments")
    .select("id, utr, created_at")
    .eq("user_id", profile.id)
    .eq("purpose", "membership")
    .eq("status", "pending")
    .maybeSingle();

  const { data: regs } = await supabase
    .from("registrations")
    .select("status, team_id, events(slug, title, starts_at)")
    .eq("user_id", profile.id);
  const { data: teamRows } = await supabase
    .from("team_members")
    .select("teams(name, leader_id), events(slug, title, starts_at)")
    .eq("user_id", profile.id);

  // Check event staff access
  const { data: staffRows } = await supabase
    .from("event_staff")
    .select("event_id, role")
    .eq("user_id", profile.id);

  const isStaff = (staffRows && staffRows.length > 0) || profile.is_admin;

  const mine: MyEvent[] = [];
  for (const r of regs ?? []) {
    const e = r.events as unknown as { slug: string; title: string; starts_at: string | null } | null;
    if (e) mine.push({ ...e, status: r.status });
  }
  for (const t of teamRows ?? []) {
    const e = t.events as unknown as { slug: string; title: string; starts_at: string | null } | null;
    const team = t.teams as unknown as { name: string; leader_id: string } | null;
    if (e && team && team.leader_id !== profile.id) mine.push({ ...e, status: "team", team: team.name });
  }

  return (
    <div className="container-x py-10">
      <p className="eyebrow">My EES</p>
      <h1 className="mt-1 text-4xl font-bold">Hi, {profile.full_name?.split(" ")[0]}</h1>
      <p className="mt-1 text-muted">
        {profile.is_nitjsr && profile.reg_no
          ? `${profile.reg_no} · Batch ${profile.batch} · ${profile.programme} ${profile.branch}`
          : profile.college ?? profile.email}
      </p>

      {/* Event Staff Workspace Banner */}
      {isStaff && (
        <div className="mt-6 flex flex-col justify-between gap-4 rounded-xl border-2 border-ink bg-sun/20 p-5 shadow-[4px_4px_0_0_#0f172a] sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-ink bg-sun text-ink">
              <CalendarCheck size={20} />
            </div>
            <div>
              <p className="font-bold text-ink">Event Staff & Lead Workspace</p>
              <p className="text-xs text-muted">
                {profile.is_admin
                  ? "Admin privileges: manage registrations, attendee check-ins, and results across events"
                  : `You are assigned as staff for ${staffRows?.length ?? 1} event(s)`}
              </p>
            </div>
          </div>
          <Link href="/dashboard/workspace" className="btn-primary btn-sm flex items-center gap-1.5 self-start sm:self-auto">
            <span>Open Workspace</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      )}

      {/* Pravardhan Pass & P-ID Banner */}
      {profile.pid && (
        <div className="mt-6 flex flex-col justify-between gap-4 rounded-xl border-2 border-ink bg-slate-900 p-5 text-white shadow-[4px_4px_0_0_#facc15] sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-sun bg-sun/10 text-sun shrink-0">
              <Trophy size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-sun">Pravardhan 2026 Pass</span>
                <span className="rounded bg-sun/20 px-2 py-0.5 font-mono text-xs font-bold text-sun border border-sun/30">
                  {profile.pid}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-300">
                Your unique Pravardhan ID. Event coordinators scan or verify this for venue entry and event registration status.
              </p>
            </div>
          </div>
          <Link
            href={`/verify/${profile.pid}`}
            className="btn-sun btn-sm flex items-center gap-1.5 self-start text-ink sm:self-auto font-bold shrink-0"
          >
            <QrCode size={14} />
            <span>View Pass & Registrations</span>
          </Link>
        </div>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-[2fr_1fr]">
        <section className="card">
          <h2 className="text-xl font-bold">EES membership</h2>
          <MembershipBlock profile={profile} membership={membership} drive={drive} account={account} pending={pending} />
        </section>

        <aside className="space-y-6">
          <section className="panel">
            <h2 className="font-bold">Your details</h2>
            <dl className="mt-3 space-y-1 text-sm">
              <div><dt className="inline text-muted">Email: </dt><dd className="inline">{profile.email}</dd></div>
              <div><dt className="inline text-muted">Phone: </dt><dd className="inline">{profile.phone}</dd></div>
              <div><dt className="inline text-muted">T-shirt: </dt><dd className="inline">{profile.tshirt_size ?? "Not set"}</dd></div>
            </dl>
            <Link href="/dashboard/profile" className="btn-outline btn-sm mt-4">Edit profile</Link>
          </section>
        </aside>
      </div>

      <section className="mt-10">
        <h2 className="text-2xl font-bold">My events</h2>
        {mine.length === 0 ? (
          <p className="mt-2 text-muted">
            Nothing yet. <Link href="/events" className="text-brand underline">Browse events</Link>.
          </p>
        ) : (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {mine.map((e) => (
              <li key={e.slug} className="panel flex items-center justify-between gap-3">
                <div>
                  <Link href={`/events/${e.slug}`} className="font-semibold hover:text-brand">{e.title}</Link>
                  <p className="text-xs text-muted">{dateOnly(e.starts_at)}</p>
                </div>
                <span className="badge">{e.team ? `Team ${e.team}` : STATUS_LABELS[e.status] ?? e.status}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function MembershipBlock({
  profile,
  membership,
  drive,
  account,
  pending,
}: {
  profile: Profile;
  membership: Membership | null;
  drive: Drive | null;
  account: PaymentAccount | null;
  pending: { utr: string; created_at: string } | null;
}) {
  if (membership?.status === "active") {
    return (
      <div className="mt-4 space-y-3">
        <p className="text-lg">
          You&apos;re an active EES member. Member number <b>{membership.member_no}</b>.
        </p>
        {!profile.avatar_url && (
          <p className="text-sm text-amber-800">Add a photo in your profile so it shows on your ID card.</p>
        )}
        <Link href="/dashboard/id-card" className="btn-sun">View my ID card</Link>
      </div>
    );
  }

  if (!profile.is_nitjsr) {
    return <p className="mt-3 text-muted">Membership is for EE students and staff of NIT Jamshedpur. You can still register for events open to everyone.</p>;
  }
  if (!drive || profile.branch !== drive.branch) {
    return <p className="mt-3 text-muted">EES membership is for Electrical Engineering students. You can register for events open to your branch.</p>;
  }

  if (pending) {
    return (
      <div className="mt-4 rounded-lg bg-amber-50 p-4 text-sm">
        <p className="font-semibold">Payment waiting for approval</p>
        <p className="mt-1">UTR {pending.utr}, submitted {dateOnly(pending.created_at)}. Your ID card appears here once it&apos;s approved.</p>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-4">
      {membership?.status === "rejected" && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-800">
          Your last payment was not approved{membership.note ? `: ${membership.note}` : "."} You can submit again.
        </p>
      )}
      <p>
        Activate your lifetime EES membership for <b>{rupees(drive.fee_paise)}</b>. It covers Pravardhan events, the EES
        T-shirt and your EES ID card.
        {drive.deadline && <> Last date: <b>{dateOnly(drive.deadline)}</b>.</>}
      </p>
      {account ? (
        <div className="flex flex-col items-start gap-4 rounded-lg border border-line p-4 sm:flex-row">
          {account.qr_url && (
            <Image src={account.qr_url} alt="UPI QR code" width={180} height={180} className="rounded border border-line" unoptimized />
          )}
          <div className="text-sm">
            <p>1. Pay <b>{rupees(drive.fee_paise)}</b> by UPI to <b>{account.owner_name}</b></p>
            <p className="mt-1 font-mono">{account.upi_id}</p>
            <p className="mt-2">2. Enter the UTR (12-digit transaction ID) and attach the screenshot below.</p>
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted">Payment details will appear here soon.</p>
      )}
      {account && (
        <ActionForm action={submitMembership} submit="Submit for approval" pendingText="Submitting…">
          <div>
            <label className="label" htmlFor="utr">UTR / transaction ID</label>
            <input id="utr" name="utr" className="input font-mono" required minLength={8} placeholder="312345678901" />
          </div>
          <div>
            <label className="label" htmlFor="screenshot">Payment screenshot</label>
            <input id="screenshot" name="screenshot" type="file" accept="image/*" className="input" required />
          </div>
        </ActionForm>
      )}
    </div>
  );
}
