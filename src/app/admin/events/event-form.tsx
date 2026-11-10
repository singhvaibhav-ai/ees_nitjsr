"use client";

import { ActionForm } from "@/components/forms";
import { CATEGORY_LABELS, toLocalInput } from "@/lib/format";
import type { Edition, EventRow, PaymentAccount } from "@/lib/types";
import { saveEvent } from "../actions";

const rs = (p?: number | null) => (p ? String(p / 100) : "0");

export function EventForm({
  e,
  editions,
  accounts,
  whatsapp,
}: {
  e?: EventRow;
  editions: Pick<Edition, "id" | "name">[];
  accounts: PaymentAccount[];
  whatsapp?: string | null;
}) {
  return (
    <ActionForm action={saveEvent} className="space-y-6" submit={e ? "Save changes" : "Create event"}>
      {e && <input type="hidden" name="id" value={e.id} />}

      <fieldset className="panel grid gap-4 sm:grid-cols-2">
        <legend className="px-1 font-bold">Basics</legend>
        <Field label="Title" name="title" defaultValue={e?.title} required />
        <Field label="URL slug" name="slug" defaultValue={e?.slug} hint="Leave empty to make one from the title" />
        <div>
          <label className="label">Category</label>
          <select name="category" defaultValue={e?.category ?? "technical"} className="input">
            {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Part of</label>
          <select name="edition_id" defaultValue={e?.edition_id ?? ""} className="input">
            <option value="">No fest (standalone)</option>
            {editions.map((ed) => <option key={ed.id} value={ed.id}>{ed.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Status</label>
          <select name="status" defaultValue={e?.status ?? "draft"} className="input">
            <option value="draft">Draft (hidden)</option>
            <option value="published">Published, registrations open</option>
            <option value="closed">Published, registrations closed</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <Field label="Venue" name="venue" defaultValue={e?.venue} />
        <Field label="Starts (IST)" name="starts_at" type="datetime-local" defaultValue={toLocalInput(e?.starts_at)} />
        <Field label="Ends (IST)" name="ends_at" type="datetime-local" defaultValue={toLocalInput(e?.ends_at)} />
        <Area label="One-line summary" name="summary" rows={2} defaultValue={e?.summary} full />
        <Area label="Description" name="description" rows={6} defaultValue={e?.description} full />
        <Area label="Rules" name="rules" rows={6} defaultValue={e?.rules} full />
        <Area label="Prizes" name="prizes" rows={3} defaultValue={e?.prizes} />
        <Area label="Contact (coordinators and phone numbers)" name="contact" rows={3} defaultValue={e?.contact} />
        <div>
          <label className="label">Banner image</label>
          <input type="file" name="banner" accept="image/*" className="input" />
          {e?.banner_url && <p className="hint">A banner is set. Upload to replace it.</p>}
        </div>
        <div>
          <label className="label">Rulebook (PDF)</label>
          <input type="file" name="rulebook" accept="application/pdf" className="input" />
          {e?.rulebook_url && <p className="hint">A rulebook is attached. Upload to replace it.</p>}
        </div>
        <Field label="WhatsApp group link" name="whatsapp_link" defaultValue={whatsapp} hint="Only shown to people who registered" full />
      </fieldset>

      <fieldset className="panel grid gap-4 sm:grid-cols-2">
        <legend className="px-1 font-bold">Who can register</legend>
        <div>
          <label className="label">Audience</label>
          <select name="audience" defaultValue={e?.audience ?? "nitjsr"} className="input">
            <option value="nitjsr">NIT Jamshedpur only (college email)</option>
            <option value="all">Open to everyone, including other colleges</option>
          </select>
        </div>
        <Field label="Batches (admission year)" name="allowed_batches" defaultValue={e?.allowed_batches.join(", ")} hint="e.g. 2025 or 2024, 2025. Empty means every batch" />
        <Field label="Branches" name="allowed_branches" defaultValue={e?.allowed_branches.join(", ")} hint="e.g. EE or EE, CS. Empty means every branch" />
        <Field label="Programmes" name="allowed_programmes" defaultValue={e?.allowed_programmes.join(", ")} hint="UG, PG. Empty means both" />
        <Check label="Only active EES members can register" name="members_only" defaultChecked={e?.members_only} />
        <Check label="Each registration needs approval by the event team" name="needs_approval" defaultChecked={e?.needs_approval} />
        <Field label="Min team size" name="team_min" type="number" defaultValue={String(e?.team_min ?? 1)} hint="1 and 1 means individual" />
        <Field label="Max team size" name="team_max" type="number" defaultValue={String(e?.team_max ?? 1)} />
        <Field label="Capacity (registrations)" name="capacity" type="number" defaultValue={e?.capacity?.toString()} hint="Empty means no limit" />
        <div />
        <Field label="Registration opens (IST)" name="reg_opens_at" type="datetime-local" defaultValue={toLocalInput(e?.reg_opens_at)} />
        <Field label="Registration closes (IST)" name="reg_closes_at" type="datetime-local" defaultValue={toLocalInput(e?.reg_closes_at)} />
      </fieldset>

      <fieldset className="panel grid gap-4 sm:grid-cols-3">
        <legend className="px-1 font-bold">Fees (₹, per registration)</legend>
        <Field label="Active EES members" name="fee_member" type="number" defaultValue={rs(e?.fee_member_paise)} />
        <Field label="Other NIT JSR students" name="fee_nitjsr" type="number" defaultValue={rs(e?.fee_nitjsr_paise)} />
        <Field label="Other colleges" name="fee_outsider" type="number" defaultValue={rs(e?.fee_outsider_paise)} />
        <div className="sm:col-span-3">
          <label className="label">Pay to</label>
          <select name="payment_account_id" defaultValue={e?.payment_account_id ?? ""} className="input">
            <option value="">No payment account (free event)</option>
            {accounts.map((a) => <option key={a.id} value={a.id}>{a.label} · {a.upi_id}</option>)}
          </select>
        </div>
      </fieldset>
    </ActionForm>
  );
}

function Field({ label, name, defaultValue, type = "text", hint, required, full }: {
  label: string; name: string; defaultValue?: string | null; type?: string; hint?: string; required?: boolean; full?: boolean;
}) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <label className="label" htmlFor={name}>{label}</label>
      <input id={name} name={name} type={type} defaultValue={defaultValue ?? ""} required={required} min={type === "number" ? 0 : undefined} className="input" />
      {hint && <p className="hint">{hint}</p>}
    </div>
  );
}

function Area({ label, name, defaultValue, rows, full }: { label: string; name: string; defaultValue?: string | null; rows: number; full?: boolean }) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <label className="label" htmlFor={name}>{label}</label>
      <textarea id={name} name={name} rows={rows} defaultValue={defaultValue ?? ""} className="input" />
    </div>
  );
}

function Check({ label, name, defaultChecked }: { label: string; name: string; defaultChecked?: boolean }) {
  return (
    <label className="flex items-center gap-2 text-sm font-semibold">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="h-4 w-4" />
      {label}
    </label>
  );
}
