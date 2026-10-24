import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { EventCard } from "@/components/event-card";
import { CATEGORY_LABELS } from "@/lib/format";
import { splitUpcoming } from "@/lib/eligibility";
import type { EventRow } from "@/lib/types";

export const metadata: Metadata = { title: "Events" };

export default async function Events({ searchParams }: { searchParams: Promise<{ c?: string }> }) {
  const { c } = await searchParams;
  const supabase = await createClient();
  let q = supabase.from("events").select("*").neq("status", "draft").order("starts_at", { ascending: true });
  if (c && CATEGORY_LABELS[c]) q = q.eq("category", c);
  const { data } = await q;
  const events = (data ?? []) as EventRow[];
  const { upcoming, past } = splitUpcoming(events);

  return (
    <div className="container-x py-12">
      <p className="eyebrow">Society events</p>
      <h1 className="mt-1 text-4xl font-bold">Events</h1>
      <div className="mt-6 flex flex-wrap gap-2">
        <Link href="/events" className={!c ? "btn-primary btn-sm" : "btn-outline btn-sm"}>All</Link>
        {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
          <Link key={k} href={`/events?c=${k}`} className={c === k ? "btn-primary btn-sm" : "btn-outline btn-sm"}>{v}</Link>
        ))}
      </div>

      <h2 className="mt-10 text-2xl font-bold">Upcoming</h2>
      {upcoming.length ? (
        <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{upcoming.map((e) => <EventCard key={e.id} e={e} />)}</div>
      ) : (
        <p className="mt-2 text-muted">Nothing announced yet. Follow EES on Instagram for the next one.</p>
      )}

      {past.length > 0 && (
        <>
          <h2 className="mt-12 text-2xl font-bold">Past events</h2>
          <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{past.map((e) => <EventCard key={e.id} e={e} />)}</div>
        </>
      )}
    </div>
  );
}
