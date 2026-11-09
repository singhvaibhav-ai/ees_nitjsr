"use client";

import { useState } from "react";
import Link from "next/link";
import { BOARD_ROLES, TEAMS } from "./team";
import { Search, ArrowRight } from "lucide-react";

export function TeamClient({ initialYear }: { initialYear: string }) {
  const [selectedYear, setSelectedYear] = useState<string>(initialYear);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [roleFilter, setRoleFilter] = useState<"all" | "board" | "heads">("all");

  const years = Object.keys(TEAMS);
  const team = TEAMS[selectedYear] ?? TEAMS[years[0]];

  const filteredTeam = team.filter((m) => {
    const isBoard = BOARD_ROLES.includes(m.role);
    if (roleFilter === "board" && !isBoard) return false;
    if (roleFilter === "heads" && isBoard) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return m.name.toLowerCase().includes(q) || m.role.toLowerCase().includes(q);
    }
    return true;
  });

  const board = filteredTeam.filter((m) => BOARD_ROLES.includes(m.role));
  const heads = filteredTeam.filter((m) => !BOARD_ROLES.includes(m.role));

  return (
    <div className="space-y-10">
      {/* Search and Filters */}
      <div className="card space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted mr-1">Tenure:</span>
            {years.map((y) => (
              <button
                key={y}
                onClick={() => setSelectedYear(y)}
                className={`rounded-lg border-2 border-ink px-3 py-1.5 text-xs font-bold transition ${
                  y === selectedYear ? "bg-sun text-ink shadow-[2px_2px_0_0_#0f172a]" : "bg-white hover:bg-slate-50"
                }`}
              >
                {y}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setRoleFilter("all")}
              className={`btn-sm ${roleFilter === "all" ? "btn-primary" : "btn-outline"}`}
            >
              All ({team.length})
            </button>
            <button
              onClick={() => setRoleFilter("board")}
              className={`btn-sm ${roleFilter === "board" ? "btn-primary" : "btn-outline"}`}
            >
              Executive Board
            </button>
            <button
              onClick={() => setRoleFilter("heads")}
              className={`btn-sm ${roleFilter === "heads" ? "btn-primary" : "btn-outline"}`}
            >
              Committee Heads
            </button>
          </div>
        </div>

        {/* Real-time search */}
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Search team member by name or role (e.g. 'President', 'Web Head', 'Aditya')..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-10"
          />
        </div>
      </div>

      {filteredTeam.length === 0 ? (
        <div className="panel text-center py-10 text-muted">
          No team members found matching &quot;{searchQuery}&quot;.
        </div>
      ) : (
        <>
          {/* Executive Board */}
          {board.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="h-3 w-3 rounded-full bg-brand" />
                <h2 className="text-2xl font-bold">Executive Board ({board.length})</h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {board.map((m) => (
                  <div key={m.name + m.role} className="card relative overflow-hidden transition hover:-translate-y-0.5">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-display text-lg font-bold leading-tight">{m.name}</p>
                        <p className="mt-1 font-mono text-xs font-bold text-brand uppercase">{m.role}</p>
                      </div>
                      <span className="badge bg-brand/10 text-brand font-bold text-[10px]">BOARD</span>
                    </div>
                    <p className="mt-3 text-xs text-muted">Electrical Engineering · Tenure {selectedYear}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Committee Heads */}
          {heads.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="h-3 w-3 rounded-full bg-sun" />
                <h2 className="text-2xl font-bold">Committee & Wing Heads ({heads.length})</h2>
              </div>
              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {heads.map((m) => (
                  <div key={m.name + m.role} className="panel transition hover:border-brand">
                    <p className="font-bold text-sm">{m.name}</p>
                    <p className="mt-0.5 text-xs font-semibold text-brand uppercase">{m.role}</p>
                    <p className="mt-2 text-[10px] text-muted">EES NIT Jamshedpur</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Leadership & Faculty Link */}
      <div className="card bg-slate-50">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="font-display text-xl font-bold">Faculty Advisory & Leadership</h3>
            <p className="text-xs text-muted">
              Learn more about our Director, Dean, Head of Department, and Professors-in-Charge.
            </p>
          </div>
          <Link href="/faculty" className="btn-primary btn-sm flex items-center gap-1.5">
            <span>View Faculty Directory & Digital ID</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
