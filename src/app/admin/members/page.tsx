import { createClient } from "@/lib/supabase/server";
import { ActionForm } from "@/components/forms";
import { dateOnly } from "@/lib/format";
import { importForm, setTshirtIssued } from "../actions";

type Row = {
  user_id: string;
  status: string;
  source: string | null;
  member_no: string | null;
  activated_at: string | null;
  tshirt_issued_at: string | null;
  profiles: { full_name: string | null; reg_no: string | null; batch: number | null; phone: string | null; tshirt_size: string | null; email: string } | null;
};

const SOURCE: Record<string, string> = { auto: "3rd/4th year", paid: "Paid on site", form_import: "Google Form", faculty: "Faculty", manual: "Manual" };

export default async function Members({ searchParams }: { searchParams: Promise<{ q?: string; status?: string }> }) {
  const { q, status } = await searchParams;
  const supabase = await createClient();
  let query = supabase
    .from("memberships")
    .select("*, profiles(full_name, reg_no, batch, phone, tshirt_size, email)")
    .order("activated_at", { ascending: false, nullsFirst: false })
    .limit(1000);
  query = query.eq("status", status === "pending" || status === "rejected" ? status : "active");
  const { data } = await query;
  let rows = (data ?? []) as unknown as Row[];
  if (q) {
    const needle = q.toLowerCase();
    rows = rows.filter((r) =>
      [r.profiles?.full_name, r.profiles?.reg_no, r.member_no, r.profiles?.email].some((v) => v?.toLowerCase().includes(needle)),
    );
  }
  const { count: imported } = await supabase.from("form_imports").select("*", { count: "exact", head: true });

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">Members</h1>
        <a href="/admin/members/export" className="btn-outline btn-sm">Download CSV</a>
      </div>

      <section className="panel">
        <h2 className="font-bold">Import Google Form payments</h2>
        <p className="mt-1 text-sm text-muted">
          Paste rows or upload the form&apos;s CSV export. Each row needs a registration number (or college email); a UTR is
          picked up if present. {imported ?? 0} imported so far. Matching students become active members immediately,
          and the rest as soon as they sign in.
        </p>
        <ActionForm action={importForm} className="mt-3 space-y-3" submit="Import" pendingText="Importing…">
          <textarea name="rows" rows={4} className="input font-mono" placeholder={"2025UGEE012,412345678901\n2025ugee044@nitjsr.ac.in,T2410..."} />
          <input type="file" name="file" accept=".csv,text/csv" className="input" />
        </ActionForm>
      </section>

      <section>
        <form className="flex flex-wrap gap-2">
          <input name="q" defaultValue={q} className="input max-w-xs" placeholder="Search name, reg no, member no" />
          <select name="status" defaultValue={status ?? "active"} className="input w-40">
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
          <button className="btn-outline">Filter</button>
        </form>
        <p className="mt-3 text-sm text-muted">{rows.length} shown</p>
        <div className="mt-2 overflow-x-auto">
          <table className="table-x">
            <thead>
              <tr><th>Name</th><th>Reg no</th><th>Member no</th><th>How</th><th>Since</th><th>T-shirt</th></tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.user_id}>
                  <td>{r.profiles?.full_name}<div className="text-xs text-muted">{r.profiles?.phone}</div></td>
                  <td className="font-mono">{r.profiles?.reg_no}</td>
                  <td className="font-mono">{r.member_no}</td>
                  <td>{r.source ? SOURCE[r.source] : ""}</td>
                  <td>{dateOnly(r.activated_at)}</td>
                  <td>
                    {r.status === "active" && (
                      <ActionForm action={setTshirtIssued} className="flex items-center gap-2" submit={r.tshirt_issued_at ? "Undo" : "Mark issued"} submitClass="btn-outline btn-sm">
                        <span className="text-xs">{r.profiles?.tshirt_size ?? "?"}{r.tshirt_issued_at && " · issued"}</span>
                        <input type="hidden" name="user_id" value={r.user_id} />
                        <input type="hidden" name="issued" value={r.tshirt_issued_at ? "0" : "1"} />
                      </ActionForm>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
