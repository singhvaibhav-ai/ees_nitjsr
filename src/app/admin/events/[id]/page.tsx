import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ActionForm } from "@/components/forms";
import { dateTime, STATUS_LABELS } from "@/lib/format";
import type { EventRow, PaymentAccount } from "@/lib/types";
import { EventForm } from "../event-form";
import { addResult, addStaff, deleteEvent, removeResult, removeStaff, setRegistrationStatus } from "../../actions";

type Person = { full_name: string | null; reg_no: string | null; email: string; phone: string | null; college: string | null };
type Reg = {
  id: string;
  status: string;
  fee_paise: number;
  checked_in_at: string | null;
  created_at: string;
  profiles: Person | null;
  teams: { name: string; code: string; team_members: { profiles: Person | null }[] } | null;
};

export default async function AdminEvent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: e } = await supabase.from("events").select("*").eq("id", id).maybeSingle<EventRow>();
  if (!e) notFound();
  const [{ data: editions }, { data: accounts }, { data: secret }, { data: staff }, { data: regs }, { data: results }] = await Promise.all([
    supabase.from("editions").select("id, name"),
    supabase.from("payment_accounts").select("*"),
    supabase.from("event_secrets").select("whatsapp_link").eq("event_id", id).maybeSingle(),
    supabase.from("event_staff").select("user_id, role, por_title, profiles(full_name, email)").eq("event_id", id),
    supabase
      .from("registrations")
      .select("id, status, fee_paise, checked_in_at, created_at, profiles(full_name, reg_no, email, phone, college), teams(name, code, team_members(profiles(full_name, reg_no, email, phone, college)))")
      .eq("event_id", id)
      .order("created_at"),
    supabase.from("results").select("*").eq("event_id", id).order("sort"),
  ]);
  const registrations = (regs ?? []) as unknown as Reg[];
  const counts = registrations.reduce<Record<string, number>>((acc, r) => ({ ...acc, [r.status]: (acc[r.status] ?? 0) + 1 }), {});

  return (
    <div className="space-y-10">
      <div>
        <Link href="/admin/events" className="text-sm text-brand">← Events</Link>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-bold">{e.title}</h1>
          <Link href={`/events/${e.slug}`} className="btn-outline btn-sm" target="_blank">View public page</Link>
        </div>
      </div>

      <section>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-bold">Registrations ({registrations.length})</h2>
          <a href={`/admin/events/${id}/export`} className="btn-outline btn-sm">Download CSV</a>
        </div>
        <p className="mt-1 text-sm text-muted">
          {Object.entries(counts).map(([k, v]) => `${STATUS_LABELS[k] ?? k}: ${v}`).join(" · ") || "None yet"}
        </p>
        {registrations.length > 0 && (
          <div className="mt-3 overflow-x-auto">
            <table className="table-x">
              <thead><tr><th>Who</th><th>Contact</th><th>Status</th><th>Registered</th><th></th></tr></thead>
              <tbody>
                {registrations.map((r) => (
                  <tr key={r.id}>
                    <td>
                      {r.teams ? (
                        <>
                          <p className="font-semibold">Team {r.teams.name} <span className="font-mono text-xs text-muted">{r.teams.code}</span></p>
                          <ul className="text-xs">
                            {r.teams.team_members.map((m, i) => <li key={i}>{m.profiles?.full_name} {m.profiles?.reg_no ?? m.profiles?.college}</li>)}
                          </ul>
                        </>
                      ) : (
                        <>
                          <p className="font-semibold">{r.profiles?.full_name}</p>
                          <p className="text-xs text-muted">{r.profiles?.reg_no ?? r.profiles?.college}</p>
                        </>
                      )}
                    </td>
                    <td className="text-xs">{r.profiles?.email}<br />{r.profiles?.phone}</td>
                    <td>
                      <span className="badge">{STATUS_LABELS[r.status]}</span>
                      {r.checked_in_at && <div className="text-xs text-green-700">Checked in</div>}
                    </td>
                    <td className="text-xs">{dateTime(r.created_at)}</td>
                    <td>
                      <div className="flex flex-wrap gap-1">
                        {r.status === "pending_approval" && <RegButton id={r.id} eventId={id} status="confirmed" label="Approve" />}
                        {r.status === "confirmed" && !r.checked_in_at && <RegButton id={r.id} eventId={id} status="checkin" label="Check in" />}
                        {r.status !== "cancelled" && <RegButton id={r.id} eventId={id} status="cancelled" label="Cancel" danger />}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="panel">
          <h2 className="text-xl font-bold">Event head and PORs</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {(staff ?? []).map((st) => {
              const p = st.profiles as unknown as { full_name: string | null; email: string } | null;
              return (
                <li key={st.user_id} className="flex items-center justify-between gap-2">
                  <span><b>{p?.full_name ?? p?.email}</b> · {st.role}{st.por_title && ` · ${st.por_title}`}</span>
                  <ActionForm action={removeStaff} submit="Remove" submitClass="btn-danger btn-sm" className="">
                    <input type="hidden" name="event_id" value={id} />
                    <input type="hidden" name="user_id" value={st.user_id} />
                  </ActionForm>
                </li>
              );
            })}
          </ul>
          <ActionForm action={addStaff} className="mt-4 grid gap-2 sm:grid-cols-2" submit="Add" submitClass="btn-outline btn-sm">
            <input type="hidden" name="event_id" value={id} />
            <input name="email" type="email" className="input" placeholder="Their sign-in email" required />
            <select name="role" className="input" defaultValue="head">
              <option value="head">Event head</option>
              <option value="coordinator">Coordinator</option>
              <option value="volunteer">Volunteer</option>
            </select>
            <input name="por_title" className="input sm:col-span-2" placeholder="POR title (optional), e.g. Design lead" />
          </ActionForm>
          <p className="hint">Event heads can edit this event and see its registrations once the event workspace ships; for now admins manage it here.</p>
        </div>

        <div className="panel">
          <h2 className="text-xl font-bold">Results</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {(results ?? []).map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-2">
                <span><b>{r.position}</b> · {r.winner_name}</span>
                <ActionForm action={removeResult} submit="Remove" submitClass="btn-danger btn-sm" className="">
                  <input type="hidden" name="id" value={r.id} />
                </ActionForm>
              </li>
            ))}
          </ul>
          <ActionForm action={addResult} className="mt-4 grid gap-2 sm:grid-cols-3" submit="Add result" submitClass="btn-outline btn-sm">
            <input type="hidden" name="event_id" value={id} />
            <input name="position" className="input" placeholder="Winner / Orange Cap" required />
            <input name="winner_name" className="input" placeholder="Name or team" required />
            <input name="sort" type="number" className="input" placeholder="Order" />
          </ActionForm>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-bold">Edit details</h2>
        <EventForm e={e} editions={editions ?? []} accounts={(accounts ?? []) as PaymentAccount[]} whatsapp={secret?.whatsapp_link} />
      </section>

      <section className="panel border-red-200">
        <h2 className="font-bold text-red-800">Delete event</h2>
        <p className="text-sm text-muted">Only possible while nobody has registered. Otherwise set it to closed.</p>
        <ActionForm action={deleteEvent} submit="Delete event" submitClass="btn-danger btn-sm mt-3" confirm="Delete this event for good?">
          <input type="hidden" name="id" value={id} />
        </ActionForm>
      </section>
    </div>
  );
}

function RegButton({ id, eventId, status, label, danger }: { id: string; eventId: string; status: string; label: string; danger?: boolean }) {
  return (
    <ActionForm action={setRegistrationStatus} submit={label} submitClass={danger ? "btn-danger btn-sm" : "btn-outline btn-sm"} className="">
      <input type="hidden" name="registration_id" value={id} />
      <input type="hidden" name="event_id" value={eventId} />
      <input type="hidden" name="status" value={status} />
    </ActionForm>
  );
}
