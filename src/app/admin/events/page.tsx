import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { CATEGORY_LABELS, dateTime } from "@/lib/format";

export default async function AdminEvents() {
  const supabase = await createClient();
  const { data: events } = await supabase
    .from("events")
    .select("id, title, slug, status, category, starts_at, editions(name), registrations(count)")
    .order("starts_at", { ascending: true, nullsFirst: false });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Events</h1>
        <Link href="/admin/events/new" className="btn-primary btn-sm">New event</Link>
      </div>
      <div className="mt-6 overflow-x-auto">
        <table className="table-x">
          <thead><tr><th>Event</th><th>Fest</th><th>When</th><th>Status</th><th>Registrations</th></tr></thead>
          <tbody>
            {(events ?? []).map((e) => (
              <tr key={e.id}>
                <td>
                  <Link href={`/admin/events/${e.id}`} className="font-semibold text-brand">{e.title}</Link>
                  <div className="text-xs text-muted">{CATEGORY_LABELS[e.category]}</div>
                </td>
                <td>{(e.editions as unknown as { name: string } | null)?.name ?? ""}</td>
                <td>{dateTime(e.starts_at)}</td>
                <td><span className="badge">{e.status}</span></td>
                <td>{(e.registrations as unknown as { count: number }[])[0]?.count ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
