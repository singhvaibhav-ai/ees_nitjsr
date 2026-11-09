import type { Metadata } from "next";
import Link from "next/link";
import { requireProfile } from "@/lib/session";
import { dateOnly } from "@/lib/format";
import type { EventRow } from "@/lib/types";
import { ChevronRight, ShieldAlert } from "lucide-react";

export const metadata: Metadata = { title: "Event Staff Workspace" };

type StaffAssignment = {
  event_id: string;
  role: string;
  por_title: string | null;
  events: EventRow;
};

export default async function WorkspacePage() {
  const { supabase, profile } = await requireProfile("/dashboard/workspace");

  // Query events where user is staff
  const { data: staffRows } = await supabase
    .from("event_staff")
    .select("event_id, role, por_title, events(*)")
    .eq("user_id", profile.id);

  // If user is admin, also allow viewing all events
  const { data: allEvents } = profile.is_admin
    ? await supabase.from("events").select("*").order("starts_at", { ascending: false })
    : { data: null };

  const assignments = (staffRows ?? []) as unknown as StaffAssignment[];

  return (
    <div className="container-x py-10">
      <Link href="/dashboard" className="text-sm text-brand">← My EES</Link>
      
      <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-b-2 border-ink pb-6">
        <div>
          <p className="eyebrow">Coordinator & Head Portal</p>
          <h1 className="mt-1 text-3xl font-bold sm:text-4xl">Event Staff Workspace</h1>
          <p className="mt-2 text-sm text-muted">
            Manage your assigned events: track participant registrations, execute live check-ins, and publish results.
          </p>
        </div>
        {profile.is_admin && (
          <span className="badge bg-sun text-ink font-bold">Admin Privileges Active</span>
        )}
      </div>

      {assignments.length === 0 && !profile.is_admin ? (
        <div className="card mt-8 max-w-xl text-center">
          <ShieldAlert className="mx-auto h-12 w-12 text-muted" />
          <h2 className="mt-3 text-xl font-bold">No Event Assignments Yet</h2>
          <p className="mt-2 text-sm text-muted leading-relaxed">
            You have not been assigned as an Event Head, Coordinator, or Volunteer for any upcoming event.
            Please contact an EES Executive Member or Admin to add your email ({profile.email}) to the event team.
          </p>
          <Link href="/dashboard" className="btn-outline btn-sm mt-6">
            Return to Dashboard
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-8">
          <div>
            <h2 className="text-xl font-bold">Your Assigned Events ({assignments.length})</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {assignments.map(({ event_id, role, por_title, events }) => (
                <Link
                  key={event_id}
                  href={`/dashboard/workspace/${event_id}`}
                  className="card group flex flex-col justify-between transition hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#0f172a]"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="badge bg-brand/10 text-brand font-bold uppercase">{events.category}</span>
                      <span className="badge border-ink font-semibold capitalize">{role}</span>
                    </div>
                    <h3 className="mt-3 font-display text-xl font-bold group-hover:text-brand">{events.title}</h3>
                    {por_title && <p className="text-xs font-semibold text-muted">{por_title}</p>}
                    <p className="mt-2 text-xs text-muted line-clamp-2">{events.summary}</p>
                  </div>

                  <div className="mt-6 border-t border-line pt-3 flex items-center justify-between text-xs font-bold text-brand">
                    <span>Open Workspace</span>
                    <ChevronRight size={16} />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {profile.is_admin && allEvents && allEvents.length > 0 && (
            <div className="border-t border-line pt-8">
              <h2 className="text-xl font-bold">All Events (Admin Directory)</h2>
              <p className="text-xs text-muted">As an admin, you can manage registrations and check-ins across any event:</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {(allEvents as EventRow[]).map((e) => (
                  <Link
                    key={e.id}
                    href={`/dashboard/workspace/${e.id}`}
                    className="panel flex flex-col justify-between hover:border-brand"
                  >
                    <div>
                      <p className="font-bold text-sm">{e.title}</p>
                      <p className="text-xs text-muted">{e.status} · {dateOnly(e.starts_at)}</p>
                    </div>
                    <span className="mt-2 text-xs text-brand font-semibold">Manage →</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
