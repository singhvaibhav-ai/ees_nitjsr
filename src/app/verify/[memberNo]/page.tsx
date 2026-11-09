import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { CheckCircle2, XCircle, ShieldCheck, Calendar, Trophy, Users, Search, ArrowRight } from "lucide-react";
import { dateTime, STATUS_LABELS } from "@/lib/format";

export const metadata: Metadata = { title: "Verify Pravardhan ID & Membership" };

type EventItem = {
  event_id: string;
  event_title: string;
  event_slug: string;
  category: string;
  starts_at: string | null;
  venue: string | null;
  status: string;
  checked_in_at: string | null;
  team_name: string | null;
  team_code: string | null;
  is_leader: boolean;
};

type VerifiedUser = {
  found: boolean;
  pid: string | null;
  user_id: string;
  name: string | null;
  email: string;
  phone: string | null;
  reg_no: string | null;
  batch: number | null;
  branch: string | null;
  college: string | null;
  avatar_url: string | null;
  is_member: boolean;
  member_no: string | null;
  events: EventItem[];
};

type LegacyMember = {
  member_no: string;
  pid?: string;
  status: string;
  name: string | null;
  reg_no: string | null;
  batch: number | null;
  branch: string | null;
  college?: string | null;
  avatar_url: string | null;
};

export default async function Verify({ params }: { params: Promise<{ memberNo: string }> }) {
  const { memberNo } = await params;
  const decoded = decodeURIComponent(memberNo).trim();
  const supabase = await createClient();

  // 1. Try comprehensive P-ID & event verification
  const { data: pidData } = await supabase.rpc("verify_pid", { p_id: decoded });
  const user = pidData as VerifiedUser | null;

  // 2. Fallback to verify_member if not found
  let legacy: LegacyMember | null = null;
  if (!user || !user.found) {
    const { data: legacyData } = await supabase.rpc("verify_member", { p_member_no: decoded });
    legacy = legacyData as LegacyMember | null;
  }

  const isValid = Boolean(user?.found || legacy?.status === "active");

  return (
    <div className="container-x py-12 max-w-3xl space-y-8">
      {/* Search Header for Organizers */}
      <div className="card space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="eyebrow">Credential Verification</span>
            <h1 className="text-2xl font-bold">Pravardhan ID & Member Check</h1>
          </div>
          <Link href="/verify" className="btn-outline btn-sm self-start sm:self-auto flex items-center gap-1.5">
            <Search size={14} />
            <span>Search Another ID</span>
          </Link>
        </div>
        <form action="/verify" method="GET" className="flex gap-2 pt-1">
          <input
            name="q"
            defaultValue={decoded}
            placeholder="Search P-ID (e.g. PRV-2026-0001) or Roll No"
            className="input font-mono text-sm"
          />
          <button type="submit" className="btn-primary btn-sm px-4">
            Verify
          </button>
        </form>
      </div>

      {/* Main Verification Card */}
      {!isValid ? (
        <div className="card border-2 border-red-600 bg-red-50/50 text-center py-10 space-y-3">
          <XCircle size={44} className="mx-auto text-red-600" />
          <h2 className="text-2xl font-bold text-red-900">No Record Found</h2>
          <p className="text-sm text-red-700 max-w-md mx-auto">
            No active EES membership or Pravardhan event registration was found for &ldquo;<b>{decoded}</b>&rdquo;.
          </p>
          <div className="pt-2">
            <Link href="/verify" className="btn-outline btn-sm">Try another query</Link>
          </div>
        </div>
      ) : user ? (
        <div className="space-y-6">
          {/* Identity Pass */}
          <div className="card border-2 border-ink space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-line pb-5">
              <div className="flex items-center gap-4">
                {user.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.avatar_url} alt="" className="h-16 w-16 rounded-xl border-2 border-ink object-cover" />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl border-2 border-ink bg-sun font-display text-xl font-bold text-ink">
                    {user.name?.[0] ?? "P"}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold">{user.name ?? "Participant"}</h2>
                    <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
                  </div>
                  <p className="font-mono text-sm text-muted">
                    {user.reg_no ?? user.email}
                  </p>
                  <p className="text-xs text-muted">
                    {user.branch && user.batch ? `Batch ${user.batch} · ${user.branch}` : user.college}
                  </p>
                </div>
              </div>

              {/* Status Badges */}
              <div className="flex flex-wrap sm:flex-col items-start sm:items-end gap-2">
                {user.pid && (
                  <div className="rounded-lg border-2 border-brand bg-brand/10 px-3 py-1 font-mono text-xs font-bold text-brand">
                    P-ID: {user.pid}
                  </div>
                )}
                {user.is_member ? (
                  <span className="badge bg-emerald-100 text-emerald-800 border border-emerald-400">
                    <ShieldCheck size={12} className="inline mr-1" />
                    Active EES Member {user.member_no ? `(${user.member_no})` : ""}
                  </span>
                ) : (
                  <span className="badge bg-slate-100 text-slate-700 border border-slate-300">
                    Pravardhan Participant
                  </span>
                )}
              </div>
            </div>

            {/* Quick summary stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-center">
              <div className="panel bg-slate-50">
                <span className="text-xs text-muted uppercase font-bold tracking-wider">Registered Events</span>
                <p className="font-display text-2xl font-bold mt-0.5">{user.events.length}</p>
              </div>
              <div className="panel bg-slate-50">
                <span className="text-xs text-muted uppercase font-bold tracking-wider">Confirmed</span>
                <p className="font-display text-2xl font-bold text-emerald-600 mt-0.5">
                  {user.events.filter((e) => e.status === "confirmed").length}
                </p>
              </div>
              <div className="panel bg-slate-50 col-span-2 sm:col-span-1">
                <span className="text-xs text-muted uppercase font-bold tracking-wider">Venue Check-ins</span>
                <p className="font-display text-2xl font-bold text-brand mt-0.5">
                  {user.events.filter((e) => Boolean(e.checked_in_at)).length}
                </p>
              </div>
            </div>
          </div>

          {/* Registered Events List */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Trophy size={20} className="text-brand" />
              <span>Event Registrations for this Participant</span>
            </h3>

            {user.events.length === 0 ? (
              <div className="panel text-center py-6 text-muted">
                <p>Not registered for any specific events yet.</p>
                <Link href="/events" className="btn-outline btn-sm mt-3 inline-flex items-center gap-1">
                  <span>Browse Pravardhan Events</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            ) : (
              <div className="grid gap-3">
                {user.events.map((e) => {
                  const isConfirmed = e.status === "confirmed";
                  const isCheckedIn = Boolean(e.checked_in_at);

                  return (
                    <div
                      key={e.event_id}
                      className={`panel flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition ${
                        isCheckedIn
                          ? "border-emerald-500 bg-emerald-50/20"
                          : isConfirmed
                          ? "border-ink bg-white"
                          : "border-amber-400 bg-amber-50/20"
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/events/${e.event_slug}`}
                            className="font-bold text-lg hover:text-brand transition"
                          >
                            {e.event_title}
                          </Link>
                          <span className="badge capitalize text-xs">{e.category}</span>
                        </div>

                        {e.team_name && (
                          <p className="text-xs text-muted flex items-center gap-1.5">
                            <Users size={13} className="text-slate-500" />
                            <span>Team: <b>{e.team_name}</b> {e.team_code ? `(${e.team_code})` : ""}</span>
                            {e.is_leader && <span className="text-brand font-semibold text-[10px] uppercase tracking-wider">(Leader)</span>}
                          </p>
                        )}

                        {e.venue && (
                          <p className="text-xs text-muted">
                            📍 Venue: {e.venue}
                          </p>
                        )}

                        {e.starts_at && (
                          <p className="text-xs text-muted flex items-center gap-1">
                            <Calendar size={13} />
                            <span>{dateTime(e.starts_at)}</span>
                          </p>
                        )}
                      </div>

                      {/* Status and Check-in pill */}
                      <div className="flex flex-wrap sm:flex-col items-start sm:items-end gap-1.5">
                        <span
                          className={`badge ${
                            isConfirmed
                              ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                              : "bg-amber-100 text-amber-800 border-amber-300"
                          }`}
                        >
                          {STATUS_LABELS[e.status] ?? e.status}
                        </span>

                        {isCheckedIn ? (
                          <span className="rounded px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider bg-emerald-600 text-white">
                            ✓ Checked In
                          </span>
                        ) : (
                          <span className="rounded px-2 py-0.5 text-[11px] font-semibold tracking-wider bg-slate-200 text-slate-700">
                            Not Checked In
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : legacy ? (
        /* Legacy EES Member format */
        <div className="card max-w-sm mx-auto text-center space-y-4">
          <p className="text-2xl font-bold text-emerald-700 flex items-center justify-center gap-2">
            <CheckCircle2 size={24} />
            <span>Valid EES Member</span>
          </p>
          {legacy.avatar_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={legacy.avatar_url} alt="" className="mx-auto h-32 w-28 rounded-lg object-cover border-2 border-ink" />
          )}
          <div className="space-y-1">
            <p className="text-lg font-semibold">{legacy.name}</p>
            <p className="font-mono text-sm">{legacy.reg_no}</p>
            <p className="text-sm text-muted">Batch {legacy.batch} · {legacy.branch}</p>
            <p className="font-mono text-sm font-bold text-brand">{legacy.member_no}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
