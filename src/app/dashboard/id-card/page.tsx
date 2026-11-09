import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import QRCode from "qrcode";
import { requireProfile, getMembership } from "@/lib/session";
import { verifyUrl } from "@/lib/idcard";
import { IdCardActions } from "./download-buttons";

export const metadata: Metadata = { title: "My ID card · EES NIT Jamshedpur" };

export default async function IdCardPage() {
  const { supabase, profile } = await requireProfile("/dashboard/id-card");
  const membership = await getMembership(supabase, profile.id);
  if (membership?.status !== "active" || !membership.member_no) redirect("/dashboard");

  const h = await headers();
  const origin = `${h.get("x-forwarded-proto") ?? "https"}://${h.get("host")}`;
  const qr = await QRCode.toString(verifyUrl(membership.member_no, origin), { type: "svg", margin: 0 });

  return (
    <div className="container-x py-10">
      <Link href="/dashboard" className="no-print text-sm font-semibold text-brand">← Back to Dashboard</Link>
      <div className="mt-6 flex flex-col items-center gap-6">
        <div id="print-card" className="w-full max-w-sm overflow-hidden rounded-2xl border-2 border-ink bg-white shadow-[6px_6px_0_0_#0f172a]">
          <div className="flex items-center justify-between bg-brand px-5 py-3 text-white">
            <div>
              <p className="font-display text-lg font-bold leading-tight">Electrical Engineering Society</p>
              <p className="text-xs opacity-90">NIT Jamshedpur · Member ID</p>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/ees-logo-transparent.png" alt="" className="h-10 w-10 rounded-full bg-white p-1" />
          </div>
          <div className="flex gap-4 p-5">
            {profile.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatar_url} alt="" className="h-28 w-24 rounded-lg border border-line object-cover" />
            ) : (
              <div className="flex h-28 w-24 items-center justify-center rounded-lg border border-dashed border-line text-center text-xs text-muted">
                Add a photo in your profile
              </div>
            )}
            <div className="min-w-0 text-sm">
              <p className="font-display text-xl font-bold leading-tight">{profile.full_name}</p>
              <p className="mt-1 font-mono font-semibold">{profile.reg_no}</p>
              <p className="text-xs text-muted">Batch {profile.batch} · {profile.programme} {profile.branch}</p>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <span className="rounded bg-sun px-2 py-0.5 font-mono text-xs font-bold border border-ink/10">{membership.member_no}</span>
                {profile.pid && (
                  <span className="rounded bg-brand text-white px-2 py-0.5 font-mono text-xs font-bold">{profile.pid}</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-line px-5 py-3 bg-slate-50">
            <p className="text-xs text-muted">Scan to verify membership</p>
            <div className="h-16 w-16" dangerouslySetInnerHTML={{ __html: qr }} />
          </div>
        </div>

        <IdCardActions memberNo={membership.member_no} />
        
        <div className="no-print">
          <Link href="/dashboard/profile" className="text-xs text-muted hover:text-brand underline">
            Need to update your profile or photo? Go to profile settings →
          </Link>
        </div>
      </div>
    </div>
  );
}
