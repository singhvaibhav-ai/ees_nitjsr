import { createClient } from "@/lib/supabase/server";
import { ActionForm } from "@/components/forms";
import { toLocalInput } from "@/lib/format";
import type { Drive, PaymentAccount } from "@/lib/types";
import { saveAccount, saveDrive, setAdmin } from "../actions";

export default async function Settings() {
  const supabase = await createClient();
  const [{ data: drive }, { data: accounts }, { data: admins }] = await Promise.all([
    supabase.from("membership_drives").select("*").eq("is_current", true).maybeSingle<Drive>(),
    supabase.from("payment_accounts").select("*, payment_account_approvers(profiles(email))").order("created_at"),
    supabase.from("profiles").select("email, full_name").eq("is_admin", true),
  ]);
  const accts = (accounts ?? []) as (PaymentAccount & { payment_account_approvers: { profiles: { email: string } | null }[] })[];

  return (
    <div className="space-y-10">
      <h1 className="text-3xl font-bold">Settings</h1>

      <section>
        <h2 className="text-xl font-bold">UPI accounts</h2>
        <p className="text-sm text-muted">Where money goes. Each membership drive and paid event points at one. Approvers (besides admins) can review its payments.</p>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {[...accts, null].map((a) => (
            <ActionForm key={a?.id ?? "new"} action={saveAccount} className="panel space-y-3" submit={a ? "Save" : "Add account"} submitClass="btn-primary btn-sm">
              <h3 className="font-bold">{a ? a.label : "New UPI account"}</h3>
              {a && <input type="hidden" name="id" value={a.id} />}
              <input name="label" className="input" defaultValue={a?.label} placeholder="Label, e.g. Membership 2026-27" required />
              <input name="owner_name" className="input" defaultValue={a?.owner_name} placeholder="Account holder, e.g. Aditya Bhardwaj" required />
              <input name="upi_id" className="input font-mono" defaultValue={a?.upi_id} placeholder="name@okaxis" required />
              <div>
                <label className="label">QR code image</label>
                <input name="qr" type="file" accept="image/*" className="input" />
                {a?.qr_url && <p className="hint">QR uploaded. Upload to replace it.</p>}
              </div>
              <input name="approver_email" type="email" className="input" placeholder="Add an approver by email (optional)" />
              {a && a.payment_account_approvers.length > 0 && (
                <p className="hint">Approvers: {a.payment_account_approvers.map((x) => x.profiles?.email).join(", ")}</p>
              )}
            </ActionForm>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold">Membership drive {drive?.academic_year}</h2>
        <ActionForm action={saveDrive} className="panel mt-3 grid gap-3 sm:grid-cols-2" submit={drive ? "Save drive" : "Start drive"} submitClass="btn-primary btn-sm w-fit">
          {drive && <input type="hidden" name="id" value={drive.id} />}
          <div><label className="label">Academic year</label><input name="academic_year" className="input" defaultValue={drive?.academic_year ?? "2026-27"} required /></div>
          <div><label className="label">Fee (₹)</label><input name="fee" type="number" className="input" defaultValue={drive ? drive.fee_paise / 100 : 1000} required /></div>
          <div><label className="label">Batches that pay</label><input name="paying_batches" className="input" defaultValue={drive?.paying_batches.join(", ") ?? "2025"} /></div>
          <div>
            <label className="label">Batches already paid (auto-active)</label>
            <input name="auto_active_batches" className="input" defaultValue={drive?.auto_active_batches.join(", ") ?? "2023, 2024"} />
            <p className="hint">Anyone in these batches is an active member as soon as they sign in.</p>
          </div>
          <div><label className="label">Branch</label><input name="branch" className="input" defaultValue={drive?.branch ?? "EE"} /></div>
          <div><label className="label">Programme</label><input name="programme" className="input" defaultValue={drive?.programme ?? "UG"} /></div>
          <div>
            <label className="label">Pay to</label>
            <select name="payment_account_id" className="input" defaultValue={drive?.payment_account_id ?? ""}>
              <option value="">Choose a UPI account</option>
              {accts.map((a) => <option key={a.id} value={a.id}>{a.label} · {a.upi_id}</option>)}
            </select>
          </div>
          <div><label className="label">Last date (IST)</label><input name="deadline" type="datetime-local" className="input" defaultValue={toLocalInput(drive?.deadline) || "2026-11-01T23:59"} /></div>
        </ActionForm>
      </section>

      <section>
        <h2 className="text-xl font-bold">Admins</h2>
        <ul className="mt-2 text-sm">
          {(admins ?? []).map((a) => <li key={a.email}>{a.full_name ?? ""} · {a.email}</li>)}
        </ul>
        <div className="mt-3 flex flex-wrap gap-4">
          <ActionForm action={setAdmin} className="flex gap-2" submit="Make admin" submitClass="btn-outline btn-sm">
            <input type="hidden" name="make" value="1" />
            <input name="email" type="email" className="input" placeholder="Their sign-in email" required />
          </ActionForm>
          <ActionForm action={setAdmin} className="flex gap-2" submit="Remove admin" submitClass="btn-danger btn-sm" confirm="Remove admin access?">
            <input type="hidden" name="make" value="0" />
            <input name="email" type="email" className="input" placeholder="Their sign-in email" required />
          </ActionForm>
        </div>
      </section>
    </div>
  );
}
