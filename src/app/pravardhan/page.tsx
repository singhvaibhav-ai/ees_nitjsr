import type { Metadata } from "next";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { EventCard } from "@/components/event-card";
import { dateOnly } from "@/lib/format";
import type { Edition, EventRow } from "@/lib/types";

export const metadata: Metadata = { title: "Pravardhan" };

export default async function Pravardhan() {
  const supabase = await createClient();
  const { data: fest } = await supabase
    .from("editions")
    .select("*")
    .like("slug", "pravardhan%")
    .order("starts_on", { ascending: false })
    .limit(1)
    .maybeSingle<Edition>();
  const announced = !fest?.announce_at || new Date(fest.announce_at) <= new Date();
  const { data: events } = fest
    ? await supabase.from("events").select("*").eq("edition_id", fest.id).neq("status", "draft").order("starts_at")
    : { data: [] };

  return (
    <>
      <section className="bg-ink text-white">
        <div className="container-x flex flex-col items-center py-16 text-center">
          <Image src="/images/pravardhan-2026-logo.png" alt="Pravardhan 2026" width={1400} height={488} className="h-28 w-auto sm:h-40 object-contain drop-shadow-[0_10px_20px_rgba(255,255,255,0.15)]" priority />
          <h1 className="mt-6 text-4xl font-bold sm:text-5xl">{fest?.name ?? "Pravardhan"}</h1>
          <p className="mt-3 max-w-2xl text-white/80">
            {fest?.tagline ?? "The annual techno-cultural fest of the Electrical Engineering Society, NIT Jamshedpur."}
          </p>
          {fest && announced && (
            <p className="mt-4 rounded-full bg-sun px-4 py-1 font-bold text-ink">
              {dateOnly(fest.starts_on)} to {dateOnly(fest.ends_on)}
            </p>
          )}
        </div>
      </section>

      <section className="container-x py-12">
        {!fest || !announced ? (
          <div className="card mx-auto max-w-xl text-center">
            <p className="eyebrow">Coming soon</p>
            <h2 className="mt-2 text-3xl font-bold">The line-up drops {fest?.announce_at ? dateOnly(fest.announce_at) : "soon"}</h2>
            <p className="mt-3 text-muted">
              Sign in now and, if you&apos;re an EE student, activate your EES membership so you&apos;re ready to register
              the day events open.
            </p>
          </div>
        ) : (
          <>
            {fest.description && <p className="prose-x mx-auto max-w-3xl text-center text-lg">{fest.description}</p>}
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {(events as EventRow[] | null)?.map((e) => <EventCard key={e.id} e={e} />)}
            </div>
          </>
        )}
      </section>
    </>
  );
}
