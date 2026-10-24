import type { Metadata } from "next";
import Link from "next/link";
import { BOARD_ROLES, LEADERSHIP, PROFESSORS_IN_CHARGE, TEAMS } from "./team";

export const metadata: Metadata = { title: "About" };

export default async function About({ searchParams }: { searchParams: Promise<{ year?: string }> }) {
  const { year } = await searchParams;
  const years = Object.keys(TEAMS);
  const active = year && TEAMS[year] ? year : years[0];
  const team = TEAMS[active];
  const board = team.filter((m) => BOARD_ROLES.includes(m.role));
  const heads = team.filter((m) => !BOARD_ROLES.includes(m.role));

  return (
    <div className="container-x py-12">
      <p className="eyebrow">Who we are</p>
      <h1 className="mt-1 max-w-3xl text-4xl font-bold sm:text-5xl">
        The Electrical Engineering Society of NIT Jamshedpur
      </h1>
      <p className="mt-4 max-w-3xl text-lg text-muted">
        Every Electrical Engineering student, scholar and faculty member is part of EES. Student post holders, guided by
        faculty coordinators, run technical workshops (MATLAB, circuit design, emerging tech), competitions and quizzes,
        sports and recreational events, social initiatives like plantation drives, and the annual fest, Pravardhan.
      </p>

      <h2 className="mt-14 text-3xl font-bold">Leadership</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {LEADERSHIP.map((p) => (
          <div key={p.name} className="card">
            <p className="text-lg font-bold">{p.name}</p>
            <p className="text-sm text-muted">{p.role}</p>
          </div>
        ))}
      </div>

      <h3 className="mt-10 text-xl font-bold">Professors in charge, EES</h3>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {PROFESSORS_IN_CHARGE.map((n) => (
          <div key={n} className="panel font-semibold">{n}</div>
        ))}
      </div>

      <div className="mt-14 flex flex-wrap items-center gap-3">
        <h2 className="mr-4 text-3xl font-bold">Core team</h2>
        {years.map((y) => (
          <Link key={y} href={`/about?year=${y}`} className={y === active ? "btn-primary btn-sm" : "btn-outline btn-sm"}>{y}</Link>
        ))}
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {board.map((m) => (
          <div key={m.name + m.role} className="card">
            <p className="text-lg font-bold">{m.name}</p>
            <p className="text-sm font-semibold text-brand uppercase">{m.role}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {heads.map((m) => (
          <div key={m.name + m.role} className="panel">
            <p className="font-semibold">{m.name}</p>
            <p className="text-xs text-muted uppercase">{m.role}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
