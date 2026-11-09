import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Search, ShieldCheck, Trophy, QrCode } from "lucide-react";

export const metadata: Metadata = {
  title: "Verify Pravardhan ID & Event Registrations",
  description: "Check participant Pravardhan ID (P-ID), active EES membership, and event registrations.",
};

export default async function VerifySearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  if (q && q.trim()) {
    redirect(`/verify/${encodeURIComponent(q.trim())}`);
  }

  return (
    <div className="container-x py-16 max-w-2xl">
      <div className="text-center space-y-3">
        <span className="eyebrow">Credential & Entry Check</span>
        <h1 className="text-3xl font-bold sm:text-4xl">Pravardhan Verification Portal</h1>
        <p className="text-muted text-sm sm:text-base max-w-lg mx-auto">
          Verify participant Pravardhan IDs (P-ID), confirm EES membership credentials, and verify whether a student is registered for specific fest events.
        </p>
      </div>

      <div className="card mt-8 border-2 border-ink shadow-[4px_4px_0_0_#0f172a] space-y-5">
        <form action="/verify" method="GET" className="space-y-4">
          <div>
            <label htmlFor="q" className="label font-bold">
              Enter Pravardhan ID (P-ID), Member No, or College Roll No
            </label>
            <div className="relative mt-1">
              <input
                id="q"
                name="q"
                type="text"
                required
                placeholder="e.g. PRV-2026-0001 or 2024UGEE007 or EES-2026-0001"
                className="input font-mono pr-10 text-base"
                autoFocus
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
            </div>
            <p className="hint">
              Input format: <code>PRV-2026-XXXX</code>, <code>202XUGEEXXX</code>, or member number.
            </p>
          </div>

          <button type="submit" className="btn-primary w-full py-3 flex items-center justify-center gap-2">
            <ShieldCheck size={18} />
            <span>Verify Registrations & Credentials</span>
          </button>
        </form>

        <div className="border-t border-line pt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-muted">
          <div className="flex items-center gap-2">
            <QrCode size={16} className="text-brand shrink-0" />
            <span>Scan QR on digital ID</span>
          </div>
          <div className="flex items-center gap-2">
            <Trophy size={16} className="text-sun shrink-0" />
            <span>Check event status</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
            <span>Instant gate check-in</span>
          </div>
        </div>
      </div>
    </div>
  );
}
