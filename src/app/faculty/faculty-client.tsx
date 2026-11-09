"use client";

import { useState } from "react";
import { FACULTY_MEMBERS, type FacultyMember } from "@/data/faculty";
import { Mail, MapPin, IdCard, X, Printer, CheckCircle } from "lucide-react";

export function FacultyClient() {
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [selectedFaculty, setSelectedFaculty] = useState<FacultyMember | null>(null);

  const filtered = FACULTY_MEMBERS.filter((f) => {
    if (roleFilter === "leadership") return f.role === "hod" || f.role === "pic";
    if (roleFilter === "professors") return f.role === "professor" || f.role === "associate";
    if (roleFilter === "assistants") return f.role === "assistant";
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Role Filters */}
      <div className="flex flex-wrap items-center gap-2 border-b-2 border-ink pb-4">
        <button
          onClick={() => setRoleFilter("all")}
          className={`rounded-lg border-2 border-ink px-4 py-2 text-sm font-bold transition ${
            roleFilter === "all" ? "bg-sun text-ink shadow-[3px_3px_0_0_#0f172a]" : "bg-white hover:bg-slate-50"
          }`}
        >
          All Faculty ({FACULTY_MEMBERS.length})
        </button>
        <button
          onClick={() => setRoleFilter("leadership")}
          className={`rounded-lg border-2 border-ink px-4 py-2 text-sm font-bold transition ${
            roleFilter === "leadership" ? "bg-sun text-ink shadow-[3px_3px_0_0_#0f172a]" : "bg-white hover:bg-slate-50"
          }`}
        >
          HOD & EES In-Charge
        </button>
        <button
          onClick={() => setRoleFilter("professors")}
          className={`rounded-lg border-2 border-ink px-4 py-2 text-sm font-bold transition ${
            roleFilter === "professors" ? "bg-sun text-ink shadow-[3px_3px_0_0_#0f172a]" : "bg-white hover:bg-slate-50"
          }`}
        >
          Professors & Associate Profs
        </button>
        <button
          onClick={() => setRoleFilter("assistants")}
          className={`rounded-lg border-2 border-ink px-4 py-2 text-sm font-bold transition ${
            roleFilter === "assistants" ? "bg-sun text-ink shadow-[3px_3px_0_0_#0f172a]" : "bg-white hover:bg-slate-50"
          }`}
        >
          Assistant Professors
        </button>
      </div>

      {/* Faculty Cards Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((fac) => (
          <div key={fac.id} className="card flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-ink bg-brand text-lg font-bold text-white shadow-[2px_2px_0_0_#0f172a]">
                  {fac.name.split(" ").slice(-1)[0][0]}
                </div>
                {fac.role === "hod" ? (
                  <span className="badge border-red-500 bg-red-50 text-red-700 font-bold">HOD</span>
                ) : fac.role === "pic" ? (
                  <span className="badge border-blue-500 bg-blue-50 text-brand font-bold">PIC, EES</span>
                ) : null}
              </div>

              <h3 className="mt-4 font-display text-xl font-bold leading-tight">{fac.name}</h3>
              <p className="text-sm font-semibold text-brand">{fac.designation}</p>
              <p className="mt-1 text-xs text-muted">{fac.qualification}</p>

              <p className="mt-3 text-xs text-slate-700 leading-relaxed">{fac.bio}</p>

              {/* Research Areas */}
              <div className="mt-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Specialization</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {fac.specialization.map((spec) => (
                    <span key={spec} className="rounded bg-slate-100 px-2 py-0.5 text-[11px] text-slate-700">
                      {spec}
                    </span>
                  ))}
                </div>
              </div>

              {/* Office & Email */}
              <div className="mt-4 space-y-1 text-xs text-muted">
                <div className="flex items-center gap-1.5">
                  <MapPin size={13} className="text-muted" />
                  <span>{fac.office}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Mail size={13} className="text-muted" />
                  <a href={`mailto:${fac.email}`} className="text-brand hover:underline">
                    {fac.email}
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-6 border-t border-line pt-4">
              <button
                onClick={() => setSelectedFaculty(fac)}
                className="btn-outline btn-sm w-full flex items-center justify-center gap-1.5"
              >
                <IdCard size={15} /> View Faculty ID Card
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Faculty ID Card Modal */}
      {selectedFaculty && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setSelectedFaculty(null)}
        >
          <div
            className="card relative w-full max-w-md overflow-hidden p-0"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedFaculty(null)}
              className="absolute top-4 right-4 z-10 rounded-full border-2 border-ink bg-white p-1.5 text-ink shadow-[2px_2px_0_0_#0f172a] hover:bg-slate-100"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            {/* ID Card Front */}
            <div id="faculty-card-print" className="border-b-2 border-ink bg-white">
              {/* Card Header */}
              <div className="flex items-center justify-between border-b-2 border-ink bg-ink px-6 py-4 text-white">
                <div>
                  <p className="font-display text-sm font-bold tracking-wide">NATIONAL INSTITUTE OF TECHNOLOGY</p>
                  <p className="text-[11px] font-semibold text-sun">JAMSHEDPUR · FACULTY IDENTITY CARD</p>
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/nitjsr-logo.png"
                  alt="NIT JSR"
                  className="h-10 w-10 rounded-full bg-white p-1"
                />
              </div>

              {/* Card Body */}
              <div className="p-6">
                <div className="flex gap-4">
                  <div className="flex h-28 w-24 flex-col items-center justify-center rounded-lg border-2 border-ink bg-slate-100 p-2 text-center shadow-[2px_2px_0_0_#0f172a]">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand font-bold text-white text-lg">
                      {selectedFaculty.name.split(" ").slice(-1)[0][0]}
                    </div>
                    <span className="mt-2 text-[9px] font-bold text-muted uppercase">FACULTY</span>
                  </div>

                  <div className="flex-1 space-y-1">
                    <p className="font-display text-lg font-bold text-ink leading-tight">
                      {selectedFaculty.name}
                    </p>
                    <p className="text-xs font-bold text-brand">{selectedFaculty.designation}</p>
                    <p className="text-[11px] text-muted">{selectedFaculty.qualification}</p>
                    <p className="text-xs font-semibold text-slate-800">Department of Electrical Engineering</p>
                    <div className="pt-1">
                      <span className="inline-block rounded bg-sun px-2 py-0.5 font-mono text-[11px] font-bold text-ink">
                        {selectedFaculty.facultyIdNo}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-2 border-t border-line pt-3 text-xs">
                  <div>
                    <span className="text-[10px] text-muted block uppercase">Office Location</span>
                    <span className="font-semibold text-ink">{selectedFaculty.office}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted block uppercase">Official Email</span>
                    <span className="font-mono text-[11px] text-ink truncate block">{selectedFaculty.email}</span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between rounded-lg border border-line bg-slate-50 p-2.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-green-700">
                    <CheckCircle size={15} />
                    <span>Verified Faculty Credential</span>
                  </div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/ees-logo-transparent.png"
                    alt="EES"
                    className="h-7 w-7 opacity-80"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between bg-slate-50 p-4">
              <span className="text-xs text-muted">NIT Jamshedpur Official ID</span>
              <button
                onClick={() => window.print()}
                className="btn-primary btn-sm flex items-center gap-1.5"
              >
                <Printer size={14} /> Print ID Card
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
