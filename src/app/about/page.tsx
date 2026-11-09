import type { Metadata } from "next";
import { LEADERSHIP, PROFESSORS_IN_CHARGE, TEAMS } from "./team";
import { TeamClient } from "./team-client";

export const metadata: Metadata = {
  title: "About & Team",
  description: "About the Electrical Engineering Society at NIT Jamshedpur, its leadership, professors-in-charge, and core teams.",
};

export default async function About({ searchParams }: { searchParams: Promise<{ year?: string }> }) {
  const { year } = await searchParams;
  const years = Object.keys(TEAMS);
  const activeYear = year && TEAMS[year] ? year : years[0];

  return (
    <div className="container-x py-12 space-y-12">
      <div>
        <p className="eyebrow">Who we are</p>
        <h1 className="mt-1 max-w-3xl text-4xl font-bold sm:text-5xl">
          The Electrical Engineering <span className="text-brand">Society</span>
        </h1>
        <p className="mt-4 max-w-3xl text-lg text-muted">
          Every Electrical Engineering student, scholar and faculty member is part of EES at NIT Jamshedpur. Student
          post holders, guided by faculty coordinators, run technical workshops (MATLAB, IoT, circuit design),
          competitions and quizzes, sports like the Electrical Premier League (EPL), social initiatives, and the annual
          techno-cultural fest, Pravardhan.
        </p>
      </div>

      {/* Leadership */}
      <section>
        <h2 className="text-2xl font-bold">Patrons & Department Leadership</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {LEADERSHIP.map((p) => (
            <div key={p.name} className="card">
              <p className="font-display text-lg font-bold">{p.name}</p>
              <p className="mt-1 text-sm text-muted">{p.role}</p>
            </div>
          ))}
        </div>

        <h3 className="mt-8 text-lg font-bold">Professors in Charge, EES</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {PROFESSORS_IN_CHARGE.map((n) => (
            <div key={n} className="panel font-semibold text-sm">
              {n}
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Core Team Directory */}
      <section>
        <TeamClient initialYear={activeYear} />
      </section>
    </div>
  );
}
