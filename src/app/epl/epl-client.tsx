"use client";

import { useState } from "react";
import {
  EPL_TEAMS,
  EPL_STANDINGS,
  EPL_MATCHES,
  ORANGE_CAP_LEADERS,
  PURPLE_CAP_LEADERS,
  type EplTeam,
} from "@/data/epl";
import { Trophy, Calendar, Users, Award, ShieldCheck, Flame } from "lucide-react";

export function EplClient() {
  const [tab, setTab] = useState<"table" | "fixtures" | "teams" | "leaders" | "rules">("table");
  const [fixtureFilter, setFixtureFilter] = useState<"all" | "completed" | "upcoming">("all");

  const teamsMap = new Map<string, EplTeam>(EPL_TEAMS.map((t) => [t.id, t]));

  const filteredMatches = EPL_MATCHES.filter((m) => {
    if (fixtureFilter === "completed") return m.status === "completed";
    if (fixtureFilter === "upcoming") return m.status === "upcoming" || m.status === "live";
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Tab Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b-2 border-ink pb-4">
        <button
          onClick={() => setTab("table")}
          className={`flex items-center gap-2 rounded-lg border-2 border-ink px-4 py-2 text-sm font-bold transition ${
            tab === "table" ? "bg-sun text-ink shadow-[3px_3px_0_0_#0f172a]" : "bg-white hover:bg-slate-50"
          }`}
        >
          <Trophy size={16} /> Points Table
        </button>
        <button
          onClick={() => setTab("fixtures")}
          className={`flex items-center gap-2 rounded-lg border-2 border-ink px-4 py-2 text-sm font-bold transition ${
            tab === "fixtures" ? "bg-sun text-ink shadow-[3px_3px_0_0_#0f172a]" : "bg-white hover:bg-slate-50"
          }`}
        >
          <Calendar size={16} /> Fixtures & Results
        </button>
        <button
          onClick={() => setTab("teams")}
          className={`flex items-center gap-2 rounded-lg border-2 border-ink px-4 py-2 text-sm font-bold transition ${
            tab === "teams" ? "bg-sun text-ink shadow-[3px_3px_0_0_#0f172a]" : "bg-white hover:bg-slate-50"
          }`}
        >
          <Users size={16} /> Teams
        </button>
        <button
          onClick={() => setTab("leaders")}
          className={`flex items-center gap-2 rounded-lg border-2 border-ink px-4 py-2 text-sm font-bold transition ${
            tab === "leaders" ? "bg-sun text-ink shadow-[3px_3px_0_0_#0f172a]" : "bg-white hover:bg-slate-50"
          }`}
        >
          <Award size={16} /> Cap Leaders
        </button>
        <button
          onClick={() => setTab("rules")}
          className={`flex items-center gap-2 rounded-lg border-2 border-ink px-4 py-2 text-sm font-bold transition ${
            tab === "rules" ? "bg-sun text-ink shadow-[3px_3px_0_0_#0f172a]" : "bg-white hover:bg-slate-50"
          }`}
        >
          <ShieldCheck size={16} /> Rules & Format
        </button>
      </div>

      {/* Points Table Tab */}
      {tab === "table" && (
        <div className="space-y-6">
          <div className="card overflow-x-auto p-0">
            <div className="border-b-2 border-ink bg-slate-50 p-4">
              <h2 className="font-display text-xl font-bold">EPL 2026 Standings</h2>
              <p className="text-xs text-muted">Top 4 teams advance to the Playoff Eliminator and Qualifier rounds</p>
            </div>
            <table className="table-x">
              <thead>
                <tr className="bg-slate-100 text-xs">
                  <th className="w-12 text-center">Pos</th>
                  <th>Team</th>
                  <th className="text-center">P</th>
                  <th className="text-center">W</th>
                  <th className="text-center">L</th>
                  <th className="text-center">NRR</th>
                  <th className="text-center">Pts</th>
                  <th className="text-center">Form</th>
                </tr>
              </thead>
              <tbody>
                {EPL_STANDINGS.map((row, idx) => {
                  const team = teamsMap.get(row.teamId);
                  const isPlayoffs = idx < 4;
                  return (
                    <tr
                      key={row.teamId}
                      className={`hover:bg-slate-50 ${isPlayoffs ? "border-l-4 border-l-brand" : ""}`}
                    >
                      <td className="text-center font-bold">{idx + 1}</td>
                      <td>
                        <div className="flex items-center gap-3">
                          <span
                            className="inline-block h-3.5 w-3.5 rounded-full border border-ink"
                            style={{ backgroundColor: team?.color }}
                          />
                          <div>
                            <p className="font-bold">{team?.name}</p>
                            <p className="text-xs text-muted">{team?.batch}</p>
                          </div>
                        </div>
                      </td>
                      <td className="text-center font-mono">{row.played}</td>
                      <td className="text-center font-mono font-bold text-green-700">{row.won}</td>
                      <td className="text-center font-mono text-red-600">{row.lost}</td>
                      <td className="text-center font-mono text-xs">{row.nrr}</td>
                      <td className="text-center font-mono text-base font-bold text-brand">{row.points}</td>
                      <td className="text-center">
                        <div className="inline-flex gap-1">
                          {row.form.map((res, fIdx) => (
                            <span
                              key={fIdx}
                              className={`flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold text-white ${
                                res === "W" ? "bg-green-600" : "bg-red-600"
                              }`}
                            >
                              {res}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="panel border-brand/40 bg-blue-50/50">
              <h3 className="font-bold text-brand">Playoff Qualification Rule</h3>
              <p className="mt-1 text-xs text-muted leading-relaxed">
                Positions 1 & 2 battle in Qualifier 1 for a direct Grand Final berth. Positions 3 & 4 battle in the
                Eliminator. The loser of Qualifier 1 gets a second chance against the Eliminator winner in Qualifier 2.
              </p>
            </div>
            <div className="panel border-sun/60 bg-amber-50/50">
              <h3 className="font-bold text-amber-800">Scoring & Points System</h3>
              <p className="mt-1 text-xs text-muted leading-relaxed">
                Win: 2 points · Loss: 0 points · Tie / No Result: 1 point each. Net Run Rate (NRR) is applied in case of
                tied tournament points.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Fixtures & Results Tab */}
      {tab === "fixtures" && (
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted">Filter:</span>
            <button
              onClick={() => setFixtureFilter("all")}
              className={`btn-sm ${fixtureFilter === "all" ? "btn-primary" : "btn-outline"}`}
            >
              All Matches
            </button>
            <button
              onClick={() => setFixtureFilter("completed")}
              className={`btn-sm ${fixtureFilter === "completed" ? "btn-primary" : "btn-outline"}`}
            >
              Completed
            </button>
            <button
              onClick={() => setFixtureFilter("upcoming")}
              className={`btn-sm ${fixtureFilter === "upcoming" ? "btn-primary" : "btn-outline"}`}
            >
              Upcoming / Playoffs
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {filteredMatches.map((m) => {
              const teamA = teamsMap.get(m.teamAId);
              const teamB = teamsMap.get(m.teamBId);
              const isCompleted = m.status === "completed";

              return (
                <div key={m.id} className="card relative flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-line pb-2 text-xs">
                      <span className="font-bold text-brand uppercase">{m.stage} · Match {m.matchNumber}</span>
                      <span
                        className={`badge ${
                          isCompleted
                            ? "border-green-300 bg-green-50 text-green-800"
                            : "border-blue-300 bg-blue-50 text-blue-800"
                        }`}
                      >
                        {isCompleted ? "Result" : "Scheduled"}
                      </span>
                    </div>

                    <div className="my-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className="h-3 w-3 rounded-full border border-ink"
                            style={{ backgroundColor: teamA?.color }}
                          />
                          <span className="font-bold">{teamA?.name}</span>
                        </div>
                        {isCompleted && (
                          <div className="text-right">
                            <span className="font-mono font-bold">{m.scoreA}</span>
                            <span className="ml-1 text-xs text-muted">({m.oversA} ov)</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className="h-3 w-3 rounded-full border border-ink"
                            style={{ backgroundColor: teamB?.color }}
                          />
                          <span className="font-bold">{teamB?.name}</span>
                        </div>
                        {isCompleted && (
                          <div className="text-right">
                            <span className="font-mono font-bold">{m.scoreB}</span>
                            <span className="ml-1 text-xs text-muted">({m.oversB} ov)</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-line pt-3 text-xs">
                    {isCompleted ? (
                      <div>
                        <p className="font-bold text-ink">{m.result}</p>
                        {m.potm && (
                          <p className="mt-0.5 text-muted">
                            <span className="text-brand font-semibold">POTM:</span> {m.potm}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center justify-between text-muted">
                        <span>{m.date} at {m.time}</span>
                        <span>{m.venue}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Teams Tab */}
      {tab === "teams" && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {EPL_TEAMS.map((team) => (
            <div key={team.id} className="card relative flex flex-col justify-between">
              <div
                className="absolute top-0 right-0 h-16 w-16 opacity-10 rounded-bl-full"
                style={{ backgroundColor: team.color }}
              />
              <div>
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-ink text-white font-bold text-lg shadow-[2px_2px_0_0_#0f172a]"
                    style={{ backgroundColor: team.color }}
                  >
                    {team.shortName}
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-bold">{team.name}</h3>
                    <p className="text-xs text-muted font-semibold">{team.batch}</p>
                  </div>
                </div>
                <p className="mt-4 text-sm text-slate-700 leading-relaxed">{team.description}</p>
              </div>

              <div className="mt-6 border-t border-line pt-3 text-xs">
                <span className="text-muted">Captain:</span> <span className="font-bold text-ink">{team.captain}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Leaders Tab */}
      {tab === "leaders" && (
        <div className="grid gap-8 md:grid-cols-2">
          {/* Orange Cap */}
          <div className="card border-amber-500/80 bg-gradient-to-b from-amber-50/40 to-white">
            <div className="flex items-center justify-between border-b-2 border-ink pb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 font-bold text-white shadow-[2px_2px_0_0_#0f172a]">
                  <Flame size={18} />
                </span>
                <div>
                  <h3 className="font-display text-xl font-bold">Orange Cap</h3>
                  <p className="text-xs text-muted">Most Runs in EPL 2026</p>
                </div>
              </div>
              <span className="badge border-amber-600 bg-amber-100 text-amber-900 font-bold">Leader: {ORANGE_CAP_LEADERS[0].name}</span>
            </div>

            <div className="mt-4 divide-y divide-line">
              {ORANGE_CAP_LEADERS.map((p, i) => (
                <div key={p.name} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <span className="w-5 text-center font-bold text-muted">{i + 1}</span>
                    <div>
                      <p className="font-bold">{p.name}</p>
                      <p className="text-xs text-muted">{p.team} · {p.statDetail}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-display text-2xl font-black text-amber-600">{p.statValue}</span>
                    <span className="block text-[10px] text-muted uppercase">Runs</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Purple Cap */}
          <div className="card border-purple-500/80 bg-gradient-to-b from-purple-50/40 to-white">
            <div className="flex items-center justify-between border-b-2 border-ink pb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-600 font-bold text-white shadow-[2px_2px_0_0_#0f172a]">
                  <Trophy size={18} />
                </span>
                <div>
                  <h3 className="font-display text-xl font-bold">Purple Cap</h3>
                  <p className="text-xs text-muted">Most Wickets in EPL 2026</p>
                </div>
              </div>
              <span className="badge border-purple-600 bg-purple-100 text-purple-900 font-bold">Leader: {PURPLE_CAP_LEADERS[0].name}</span>
            </div>

            <div className="mt-4 divide-y divide-line">
              {PURPLE_CAP_LEADERS.map((p, i) => (
                <div key={p.name} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <span className="w-5 text-center font-bold text-muted">{i + 1}</span>
                    <div>
                      <p className="font-bold">{p.name}</p>
                      <p className="text-xs text-muted">{p.team} · {p.statDetail}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-display text-2xl font-black text-purple-600">{p.statValue}</span>
                    <span className="block text-[10px] text-muted uppercase">Wickets</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Rules Tab */}
      {tab === "rules" && (
        <div className="card space-y-6">
          <h2 className="font-display text-2xl font-bold">Tournament Regulations & Match Format</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="panel space-y-2">
              <h3 className="font-bold text-brand">1. Match Structure</h3>
              <p className="text-sm text-muted leading-relaxed">
                Each match is 15 overs per side. Maximum of 3 overs per bowler. Powerplay spans the first 4 overs with
                a maximum of 2 fielders outside the 30-yard circle.
              </p>
            </div>
            <div className="panel space-y-2">
              <h3 className="font-bold text-brand">2. Team Composition</h3>
              <p className="text-sm text-muted leading-relaxed">
                Squads are strictly formed by Electrical Engineering student batches, postgraduates, and faculty.
                Every playing XI must wear their assigned team colors.
              </p>
            </div>
            <div className="panel space-y-2">
              <h3 className="font-bold text-brand">3. Super Over</h3>
              <p className="text-sm text-muted leading-relaxed">
                In the event of a tied match in the playoff rounds, a Super Over will decide the winner immediately.
                Each team nominates 3 batsmen and 1 bowler.
              </p>
            </div>
            <div className="panel space-y-2">
              <h3 className="font-bold text-brand">4. Spirit of Cricket</h3>
              <p className="text-sm text-muted leading-relaxed">
                The decision of the on-field student and faculty umpires is final. Strict departmental disciplinary code
                applies to conduct on and off the field.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
