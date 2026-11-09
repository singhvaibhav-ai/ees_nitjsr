import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireProfile } from "@/lib/session";
import { dateTime, STATUS_LABELS } from "@/lib/format";
import { ActionForm } from "@/components/forms";
import type { EventRow } from "@/lib/types";
import { setStaffRegistrationStatus, addStaffResult, removeStaffResult } from "../actions";
import { Download, Users, CheckCircle2, Trophy, ArrowLeft } from "lucide-react";

export const metadata: Metadata = { title: "Manage Event · Workspace" };

type Reg = {
  id: string;
  status: string;
  fee_paise: number;
  checked_in_at: string | null;
  created_at: string;
  profiles: { full_name: string | null; reg_no: string | null; email: string; phone: string | null; college: string | null } | null;
  teams: {
    name: string;
    code: string;
    team_members: { profiles: { full_name: string | null; reg_no: string | null; email: string; phone: string | null; college: string | null } | null }[];
  } | null;
};

type ResultRow = { id: string; position: string; winner_name: string; sort: number };

export default async function EventWorkspaceDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, profile } = await requireProfile(`/dashboard/workspace/${id}`);

  // Check authorization: user must be admin or in event_staff
  let authorized = profile.is_admin;
  if (!authorized) {
    const { data: staff } = await supabase
      .from("event_staff")
      .select("role")
      .eq("event_id", id)
      .eq("user_id", profile.id)
      .maybeSingle();
    authorized = Boolean(staff);
  }

  if (!authorized) {
    redirect("/dashboard/workspace");
  }

  const { data: event } = await supabase.from("events").select("*").eq("id", id).maybeSingle<EventRow>();
  if (!event) notFound();

  const [regsRes, resultsRes, staffRes] = await Promise.all([
    supabase
      .from("registrations")
      .select(
        "id, status, fee_paise, checked_in_at, created_at, profiles(full_name, reg_no, email, phone, college), teams(name, code, team_members(profiles(full_name, reg_no, email, phone, college)))"
      )
      .eq("event_id", id)
      .order("created_at"),
    supabase.from("results").select("*").eq("event_id", id).order("sort"),
    supabase.from("event_staff").select("role, por_title, profiles(full_name, email)").eq("event_id", id),
  ]);

  const registrations = (regsRes.data ?? []) as unknown as Reg[];
  const results = (resultsRes.data ?? []) as ResultRow[];
  const checkedInCount = registrations.filter((r) => Boolean(r.checked_in_at)).length;
  const confirmedCount = registrations.filter((r) => r.status === "confirmed").length;

  return (
    <div className="container-x py-10 space-y-8">
      <div>
        <Link href="/dashboard/workspace" className="flex items-center gap-1.5 text-sm font-semibold text-brand">
          <ArrowLeft size={16} /> Back to Workspace
        </Link>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-4 border-b-2 border-ink pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="badge bg-brand text-white font-bold uppercase">{event.category}</span>
              <span className="badge border-ink font-semibold">{event.status}</span>
            </div>
            <h1 className="mt-2 text-3xl font-bold sm:text-4xl">{event.title}</h1>
            <p className="mt-1 text-sm text-muted">{event.summary}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link href={`/events/${event.slug}`} target="_blank" className="btn-outline btn-sm">
              View Public Page ↗
            </Link>
            <a href={`/dashboard/workspace/${id}/export`} className="btn-primary btn-sm flex items-center gap-1.5">
              <Download size={14} /> Export CSV
            </a>
          </div>
        </div>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted uppercase">Total Registered</span>
            <Users size={18} className="text-brand" />
          </div>
          <p className="mt-2 font-display text-3xl font-bold">{registrations.length}</p>
          <p className="mt-1 text-xs text-muted">Confirmed: {confirmedCount}</p>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted uppercase">Checked In Attendance</span>
            <CheckCircle2 size={18} className="text-green-600" />
          </div>
          <p className="mt-2 font-display text-3xl font-bold text-green-700">{checkedInCount}</p>
          <p className="mt-1 text-xs text-muted">
            {registrations.length > 0 ? `${Math.round((checkedInCount / registrations.length) * 100)}% turnout` : "No check-ins yet"}
          </p>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted uppercase">Event Team</span>
            <Trophy size={18} className="text-sun" />
          </div>
          <p className="mt-2 font-display text-3xl font-bold">{staffRes.data?.length ?? 0}</p>
          <p className="mt-1 text-xs text-muted">Heads, coordinators & volunteers</p>
        </div>
      </div>

      {/* Registrations List */}
      <section className="card p-0 overflow-hidden">
        <div className="border-b-2 border-ink bg-slate-50 p-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold">Participant Registrations ({registrations.length})</h2>
            <p className="text-xs text-muted">Mark attendance on event day and manage participant entry status</p>
          </div>
        </div>

        {registrations.length === 0 ? (
          <div className="p-8 text-center text-muted">No participants have registered for this event yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-x">
              <thead>
                <tr className="bg-slate-100 text-xs">
                  <th>Participant / Team</th>
                  <th>Contact Details</th>
                  <th>Status</th>
                  <th>Attendance</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td>
                      {r.teams ? (
                        <div>
                          <p className="font-bold">Team {r.teams.name}</p>
                          <span className="font-mono text-xs text-muted">Code: {r.teams.code}</span>
                          <ul className="mt-1 text-xs space-y-0.5">
                            {r.teams.team_members.map((m, i) => (
                              <li key={i} className="text-slate-700">
                                • {m.profiles?.full_name} ({m.profiles?.reg_no ?? m.profiles?.college})
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        <div>
                          <p className="font-bold">{r.profiles?.full_name ?? "Participant"}</p>
                          <p className="text-xs font-mono text-muted">{r.profiles?.reg_no ?? r.profiles?.college}</p>
                        </div>
                      )}
                    </td>
                    <td className="text-xs">
                      <p>{r.profiles?.email}</p>
                      {r.profiles?.phone && <p className="text-muted font-mono">{r.profiles.phone}</p>}
                    </td>
                    <td>
                      <span className="badge">{STATUS_LABELS[r.status] ?? r.status}</span>
                    </td>
                    <td>
                      {r.checked_in_at ? (
                        <span className="badge border-green-600 bg-green-50 text-green-800 font-bold">
                          ✓ Checked In ({dateTime(r.checked_in_at)})
                        </span>
                      ) : (
                        <span className="text-xs text-muted">Not checked in</span>
                      )}
                    </td>
                    <td className="text-right">
                      <div className="flex flex-wrap items-center justify-end gap-1.5">
                        {!r.checked_in_at && r.status === "confirmed" && (
                          <ActionForm action={setStaffRegistrationStatus} submit="Check In" submitClass="btn-primary btn-sm">
                            <input type="hidden" name="event_id" value={id} />
                            <input type="hidden" name="registration_id" value={r.id} />
                            <input type="hidden" name="status" value="checkin" />
                          </ActionForm>
                        )}
                        {r.status === "pending_approval" && (
                          <ActionForm action={setStaffRegistrationStatus} submit="Approve" submitClass="btn-sun btn-sm">
                            <input type="hidden" name="event_id" value={id} />
                            <input type="hidden" name="registration_id" value={r.id} />
                            <input type="hidden" name="status" value="confirmed" />
                          </ActionForm>
                        )}
                        {r.status !== "cancelled" && (
                          <ActionForm action={setStaffRegistrationStatus} submit="Cancel" submitClass="btn-danger btn-sm" confirm="Cancel this registration?">
                            <input type="hidden" name="event_id" value={id} />
                            <input type="hidden" name="registration_id" value={r.id} />
                            <input type="hidden" name="status" value="cancelled" />
                          </ActionForm>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Results & Winners Section */}
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <div className="border-b border-line pb-3">
            <h2 className="text-xl font-bold">Published Results</h2>
            <p className="text-xs text-muted">Winners and podium finishers displayed on the event public page</p>
          </div>
          <div className="mt-4 space-y-2">
            {results.length === 0 ? (
              <p className="text-xs text-muted">No results published yet.</p>
            ) : (
              results.map((res) => (
                <div key={res.id} className="panel flex items-center justify-between gap-2 p-3">
                  <div>
                    <span className="font-bold text-sm text-brand">{res.position}: </span>
                    <span className="font-semibold text-sm">{res.winner_name}</span>
                  </div>
                  <ActionForm action={removeStaffResult} submit="Remove" submitClass="btn-danger btn-sm">
                    <input type="hidden" name="event_id" value={id} />
                    <input type="hidden" name="id" value={res.id} />
                  </ActionForm>
                </div>
              ))
            )}
          </div>

          <div className="mt-6 border-t border-line pt-4">
            <h3 className="text-sm font-bold">Add Winner or Position</h3>
            <ActionForm action={addStaffResult} submit="Publish Result" submitClass="btn-primary btn-sm mt-3" className="mt-3 grid gap-2 sm:grid-cols-3">
              <input type="hidden" name="event_id" value={id} />
              <input name="position" className="input" placeholder="e.g. 1st Place / Winner" required />
              <input name="winner_name" className="input" placeholder="Winner Name or Team" required />
              <input name="sort" type="number" className="input" placeholder="Order (1, 2, 3)" defaultValue={results.length + 1} />
            </ActionForm>
          </div>
        </div>

        <div className="card">
          <div className="border-b border-line pb-3">
            <h2 className="text-xl font-bold">Event Details & Schedule</h2>
            <p className="text-xs text-muted">Key logistical rules for this competition</p>
          </div>
          <div className="mt-4 space-y-3 text-sm">
            <div>
              <span className="font-semibold text-muted block text-xs">Venue:</span>
              <p className="font-bold">{event.venue ?? "Campus / EE Department"}</p>
            </div>
            <div>
              <span className="font-semibold text-muted block text-xs">Team Size:</span>
              <p className="font-bold">{event.team_min === event.team_max ? `${event.team_min} members` : `${event.team_min} to ${event.team_max} members`}</p>
            </div>
            <div>
              <span className="font-semibold text-muted block text-xs">Eligibility Audience:</span>
              <p className="font-bold capitalize">{event.audience === "all" ? "Open to all colleges" : "NIT Jamshedpur students only"}</p>
            </div>
            <div>
              <span className="font-semibold text-muted block text-xs">Rules & Guidelines:</span>
              <p className="text-xs text-muted whitespace-pre-wrap">{event.rules ?? "Standard rules apply as per the Pravardhan brochure."}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
