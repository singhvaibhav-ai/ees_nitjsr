import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ActionForm } from "@/components/forms";
import { dateTime, rupees, STATUS_LABELS } from "@/lib/format";
import { reviewPayment } from "../actions";

type Row = {
  id: string;
  purpose: string;
  amount_paise: number;
  utr: string;
  screenshot_path: string | null;
  status: string;
  created_at: string;
  reviewed_at: string | null;
  review_note: string | null;
  payer: { full_name: string | null; reg_no: string | null; email: string; phone: string | null } | null;
  registrations: { events: { title: string } | null } | null;
};

export default async function Payments({ searchParams }: { searchParams: Promise<{ show?: string }> }) {
  const { show } = await searchParams;
  const history = show === "history";
  const supabase = await createClient();
  let q = supabase
    .from("payments")
    .select("*, payer:profiles!payments_user_id_fkey(full_name, reg_no, email, phone), registrations(events(title))")
    .order("created_at", { ascending: !history })
    .limit(300);
  q = history ? q.neq("status", "pending") : q.eq("status", "pending");
  const { data } = await q;
  const rows = (data ?? []) as unknown as Row[];

  const shots = new Map<string, string>();
  const paths = rows.map((r) => r.screenshot_path).filter((p): p is string => !!p);
  if (paths.length) {
    const { data: signed } = await supabase.storage.from("payments").createSignedUrls(paths, 3600);
    signed?.forEach((s) => s.path && s.signedUrl && shots.set(s.path, s.signedUrl));
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="mr-4 text-3xl font-bold">Payments</h1>
        <Link href="/admin/payments" className={!history ? "btn-primary btn-sm" : "btn-outline btn-sm"}>To review ({history ? "…" : rows.length})</Link>
        <Link href="/admin/payments?show=history" className={history ? "btn-primary btn-sm" : "btn-outline btn-sm"}>History</Link>
      </div>
      <p className="mt-2 text-sm text-muted">
        Check each UTR against the UPI app&apos;s history before approving. A UTR can only be used once on the site.
      </p>

      {rows.length === 0 ? (
        <p className="mt-8 text-muted">{history ? "No reviewed payments yet." : "All caught up."}</p>
      ) : (
        <div className="mt-6 space-y-3">
          {rows.map((r) => (
            <div key={r.id} className="panel grid gap-3 md:grid-cols-[1fr_auto]">
              <div className="text-sm">
                <p className="font-semibold">
                  {r.payer?.full_name ?? r.payer?.email} {r.payer?.reg_no && <span className="font-mono text-muted">· {r.payer.reg_no}</span>}
                </p>
                <p>
                  {r.purpose === "membership" ? "Membership" : r.registrations?.events?.title ?? "Event"} ·{" "}
                  <b>{rupees(r.amount_paise)}</b> · UTR <span className="font-mono font-bold">{r.utr}</span>
                </p>
                <p className="text-xs text-muted">
                  Submitted {dateTime(r.created_at)} · {r.payer?.phone}
                  {history && ` · ${STATUS_LABELS[r.status]} ${dateTime(r.reviewed_at)}${r.review_note ? ` · ${r.review_note}` : ""}`}
                </p>
                {r.screenshot_path && shots.get(r.screenshot_path) && (
                  <a href={shots.get(r.screenshot_path)} target="_blank" rel="noreferrer" className="text-xs text-brand underline">
                    View screenshot
                  </a>
                )}
              </div>
              {!history && (
                <div className="flex flex-wrap items-start gap-2">
                  <ActionForm action={reviewPayment} className="flex gap-2" submit="Approve" submitClass="btn-primary btn-sm">
                    <input type="hidden" name="payment_id" value={r.id} />
                    <input type="hidden" name="decision" value="approve" />
                  </ActionForm>
                  <ActionForm action={reviewPayment} className="flex gap-2" submit="Reject" submitClass="btn-danger btn-sm">
                    <input type="hidden" name="payment_id" value={r.id} />
                    <input type="hidden" name="decision" value="reject" />
                    <input name="note" className="input w-40 py-1 text-xs" placeholder="Reason (shown to them)" />
                  </ActionForm>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
