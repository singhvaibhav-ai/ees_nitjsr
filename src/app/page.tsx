import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { EventCard } from "@/components/event-card";
import { dateOnly } from "@/lib/format";
import type { Edition, EventRow } from "@/lib/types";

export default async function Home() {
  const supabase = await createClient();
  const { data: events } = await supabase
    .from("events")
    .select("*")
    .eq("status", "published")
    .order("starts_at", { ascending: true })
    .limit(6);
  const { data: posts } = await supabase
    .from("posts")
    .select("slug, title, published_at, cover_url")
    .eq("is_published", true)
    .order("published_at", { ascending: false })
    .limit(3);
  const { data: fest } = await supabase
    .from("editions")
    .select("*")
    .like("slug", "pravardhan%")
    .order("starts_on", { ascending: false })
    .limit(1)
    .maybeSingle<Edition>();

  return (
    <>
      <section className="border-b-2 border-ink bg-white">
        <div className="container-x grid items-center gap-10 py-14 lg:grid-cols-2">
          <div>
            <p className="eyebrow">Department of Electrical Engineering · NIT Jamshedpur</p>
            <h1 className="mt-3 text-5xl leading-none font-bold sm:text-6xl">
              Electrical Engineering <span className="text-brand">Society</span>
            </h1>
            <p className="mt-5 text-lg text-muted">
              Workshops, competitions, Pravardhan and everything else EES runs, in one place. Register for events, activate
              your membership and get your EES ID card.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/events" className="btn-primary">Explore events</Link>
              <Link href="/dashboard" className="btn-sun">Activate membership</Link>
            </div>
          </div>
          <Image src="/images/members.jpg" alt="EES members" width={1600} height={900} className="rounded-2xl border-2 border-ink object-cover shadow-[6px_6px_0_0_#0f172a]" priority />
        </div>
      </section>

      {fest && (
        <section className="bg-ink text-white">
          <Link href="/pravardhan" className="container-x flex flex-col items-center gap-6 py-10 sm:flex-row sm:justify-between">
            <Image src="/images/pravardhan-2026-logo.png" alt="Pravardhan 2026" width={1400} height={488} className="h-20 w-auto object-contain" />
            <div className="text-center sm:text-right">
              <p className="font-display text-2xl font-bold">{fest.name}</p>
              <p className="text-white/80">
                {fest.announce_at && new Date(fest.announce_at) > new Date()
                  ? `Coming soon · announced ${dateOnly(fest.announce_at)}`
                  : `${dateOnly(fest.starts_on)} to ${dateOnly(fest.ends_on)}`}
              </p>
            </div>
          </Link>
        </section>
      )}

      <section className="container-x py-14">
        <div className="flex items-end justify-between">
          <h2 className="text-3xl font-bold">Upcoming events</h2>
          <Link href="/events" className="text-sm font-semibold text-brand">All events →</Link>
        </div>
        {events && events.length > 0 ? (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {(events as EventRow[]).map((e) => <EventCard key={e.id} e={e} />)}
          </div>
        ) : (
          <p className="mt-4 text-muted">New events are announced here and on Instagram.</p>
        )}
      </section>

      {posts && posts.length > 0 && (
        <section className="container-x pb-6">
          <div className="flex items-end justify-between">
            <h2 className="text-3xl font-bold">Latest updates</h2>
            <Link href="/updates" className="text-sm font-semibold text-brand">All updates →</Link>
          </div>
          <div className="mt-6 grid gap-6 sm:grid-cols-3">
            {posts.map((p) => (
              <Link key={p.slug} href={`/updates/${p.slug}`} className="card hover:-translate-y-0.5">
                {p.cover_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.cover_url} alt="" className="-mx-5 -mt-5 mb-4 h-40 w-[calc(100%+2.5rem)] rounded-t-[10px] object-cover" />
                )}
                <p className="text-xs text-muted">{dateOnly(p.published_at)}</p>
                <h3 className="mt-1 text-lg font-bold">{p.title}</h3>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="container-x grid gap-10 py-14 md:grid-cols-2">
        <div>
          <h2 className="text-3xl font-bold">About EES</h2>
          <p className="mt-4 text-muted">
            The Electrical Engineering Society is the departmental society of Electrical Engineering at NIT Jamshedpur.
            Every EE student is part of it. Student members work with faculty coordinators to run workshops, technical
            competitions, sports like the Electrical Premier League, social initiatives and the annual fest, Pravardhan.
          </p>
          <Link href="/about" className="btn-outline mt-6">Meet the team</Link>
        </div>
        <div>
          <h2 className="text-3xl font-bold">EE Department</h2>
          <p className="mt-4 text-muted">
            The Department of Electrical Engineering at NIT Jamshedpur is a community dedicated to academic excellence,
            innovation and service: &ldquo;Illuminating Minds, Powering Innovation, Serving Society.&rdquo;
          </p>
        </div>
      </section>
    </>
  );
}
