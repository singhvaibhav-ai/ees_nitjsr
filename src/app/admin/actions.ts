"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { errorMessage } from "@/lib/session";
import { fromLocalInput, slugify } from "@/lib/format";
import type { ActionState } from "@/lib/types";

async function admin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Please sign in again");
  const { data } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
  if (!data?.is_admin) throw new Error("Admins only");
  return { supabase, user };
}

const s = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const orNull = (v: string) => (v === "" ? null : v);
const paise = (f: FormData, k: string) => Math.round(Number(s(f, k) || 0) * 100);
const intList = (v: string) => v.split(/[\s,]+/).filter(Boolean).map(Number).filter(Number.isFinite);
const textList = (v: string) => v.split(/[\s,]+/).filter(Boolean).map((x) => x.toUpperCase());

async function uploadMedia(file: FormDataEntryValue | null, folder: string) {
  if (!(file instanceof File) || file.size === 0) return null;
  if (file.size > 4 * 1024 * 1024) throw new Error("Files must be under 4 MB");
  const { supabase } = await admin();
  const ext = (file.name.split(".").pop() || "bin").toLowerCase().replace(/[^a-z0-9]/g, "");
  const path = `${folder}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from("media").upload(path, file, { contentType: file.type });
  if (error) throw error;
  return supabase.storage.from("media").getPublicUrl(path).data.publicUrl;
}

// ---------- payments ----------

export async function reviewPayment(_: ActionState, f: FormData): Promise<ActionState> {
  try {
    const { supabase } = await admin();
    const approve = s(f, "decision") === "approve";
    const { error } = await supabase.rpc("review_payment", { pid: s(f, "payment_id"), approve, note: orNull(s(f, "note")) });
    if (error) throw error;
    revalidatePath("/admin", "layout");
    return { ok: approve ? "Approved" : "Rejected" };
  } catch (e) {
    return { error: errorMessage(e) };
  }
}

// ---------- members ----------

export async function importForm(_: ActionState, f: FormData): Promise<ActionState> {
  try {
    const { supabase } = await admin();
    let text = s(f, "rows");
    const file = f.get("file");
    if (file instanceof File && file.size > 0) text = await file.text();
    // Accept "reg_no,utr" lines or a Google Forms CSV export with a header row
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const rows: { reg_no: string; utr: string }[] = [];
    for (const line of lines) {
      const cells = line.split(",").map((c) => c.replace(/^"|"$/g, "").trim());
      const reg = cells.find((c) => /^\d{4}(ug|pg)[a-z]{2,3}\d{2,4}$/i.test(c.replace(/@nitjsr\.ac\.in$/i, "")));
      if (!reg) continue;
      const utr = cells.find((c) => /^[A-Za-z0-9]{10,22}$/.test(c) && c !== reg && !/^\d{4}(ug|pg)/i.test(c)) ?? "";
      rows.push({ reg_no: reg.replace(/@nitjsr\.ac\.in$/i, "").toUpperCase(), utr });
    }
    if (rows.length === 0) return { error: "No registration numbers found. Each line needs one, like 2025UGEE012." };
    const { data, error } = await supabase.rpc("import_form_payments", { rows });
    if (error) throw error;
    revalidatePath("/admin/members");
    return { ok: `Imported ${data} registration numbers. Matching accounts are now active members.` };
  } catch (e) {
    return { error: errorMessage(e) };
  }
}

export async function setTshirtIssued(_: ActionState, f: FormData): Promise<ActionState> {
  try {
    const { supabase } = await admin();
    const issued = s(f, "issued") === "1";
    const { error } = await supabase
      .from("memberships")
      .update({ tshirt_issued_at: issued ? new Date().toISOString() : null })
      .eq("user_id", s(f, "user_id"));
    if (error) throw error;
    revalidatePath("/admin/members");
    return { ok: issued ? "Marked as issued" : "Unmarked" };
  } catch (e) {
    return { error: errorMessage(e) };
  }
}

// ---------- events ----------

function eventFields(f: FormData) {
  const title = s(f, "title");
  return {
    title,
    slug: slugify(s(f, "slug") || title),
    edition_id: orNull(s(f, "edition_id")),
    category: s(f, "category") || "technical",
    summary: orNull(s(f, "summary")),
    description: orNull(s(f, "description")),
    rules: orNull(s(f, "rules")),
    prizes: orNull(s(f, "prizes")),
    venue: orNull(s(f, "venue")),
    contact: orNull(s(f, "contact")),
    starts_at: fromLocalInput(f.get("starts_at")),
    ends_at: fromLocalInput(f.get("ends_at")),
    status: s(f, "status") || "draft",
    audience: s(f, "audience") || "nitjsr",
    allowed_batches: intList(s(f, "allowed_batches")),
    allowed_branches: textList(s(f, "allowed_branches")),
    allowed_programmes: textList(s(f, "allowed_programmes")),
    members_only: f.get("members_only") === "on",
    team_min: Math.max(1, Number(s(f, "team_min") || 1)),
    team_max: Math.max(1, Number(s(f, "team_max") || 1)),
    capacity: s(f, "capacity") ? Number(s(f, "capacity")) : null,
    reg_opens_at: fromLocalInput(f.get("reg_opens_at")),
    reg_closes_at: fromLocalInput(f.get("reg_closes_at")),
    needs_approval: f.get("needs_approval") === "on",
    fee_member_paise: paise(f, "fee_member"),
    fee_nitjsr_paise: paise(f, "fee_nitjsr"),
    fee_outsider_paise: paise(f, "fee_outsider"),
    payment_account_id: orNull(s(f, "payment_account_id")),
  };
}

export async function saveEvent(_: ActionState, f: FormData): Promise<ActionState> {
  let id = s(f, "id");
  try {
    const { supabase } = await admin();
    const fields: Record<string, unknown> = eventFields(f);
    if (!fields.title) return { error: "Give the event a title" };
    if ((fields.team_max as number) < (fields.team_min as number)) return { error: "Max team size must be at least the min" };
    const banner = await uploadMedia(f.get("banner"), "events");
    if (banner) fields.banner_url = banner;
    const rulebook = await uploadMedia(f.get("rulebook"), "rulebooks");
    if (rulebook) fields.rulebook_url = rulebook;

    if (id) {
      const { error } = await supabase.from("events").update(fields).eq("id", id);
      if (error) throw error;
    } else {
      const { data, error } = await supabase.from("events").insert(fields).select("id").single();
      if (error) throw error;
      id = data.id;
    }
    const wa = s(f, "whatsapp_link");
    const { error: we } = await supabase.from("event_secrets").upsert({ event_id: id, whatsapp_link: orNull(wa) });
    if (we) throw we;
    revalidatePath("/", "layout");
  } catch (e) {
    const msg = errorMessage(e);
    return { error: msg.includes("events_slug_key") ? "Another event already uses that URL slug" : msg };
  }
  if (!s(f, "id")) redirect(`/admin/events/${id}`);
  return { ok: "Saved" };
}

export async function deleteEvent(_: ActionState, f: FormData): Promise<ActionState> {
  try {
    const { supabase } = await admin();
    const { count } = await supabase.from("registrations").select("id", { count: "exact", head: true }).eq("event_id", s(f, "id"));
    if (count) return { error: `This event has ${count} registrations. Set it to closed instead.` };
    const { error } = await supabase.from("events").delete().eq("id", s(f, "id"));
    if (error) throw error;
  } catch (e) {
    return { error: errorMessage(e) };
  }
  revalidatePath("/", "layout");
  redirect("/admin/events");
}

export async function addStaff(_: ActionState, f: FormData): Promise<ActionState> {
  try {
    const { supabase } = await admin();
    const email = s(f, "email").toLowerCase();
    const { data: p } = await supabase.from("profiles").select("id").eq("email", email).maybeSingle();
    if (!p) return { error: "No account with that email. Ask them to sign in once first." };
    const { error } = await supabase.from("event_staff").upsert({
      event_id: s(f, "event_id"),
      user_id: p.id,
      role: s(f, "role") || "head",
      por_title: orNull(s(f, "por_title")),
    });
    if (error) throw error;
    revalidatePath(`/admin/events/${s(f, "event_id")}`);
    return { ok: "Added" };
  } catch (e) {
    return { error: errorMessage(e) };
  }
}

export async function removeStaff(_: ActionState, f: FormData): Promise<ActionState> {
  try {
    const { supabase } = await admin();
    const { error } = await supabase.from("event_staff").delete().eq("event_id", s(f, "event_id")).eq("user_id", s(f, "user_id"));
    if (error) throw error;
    revalidatePath(`/admin/events/${s(f, "event_id")}`);
    return { ok: "Removed" };
  } catch (e) {
    return { error: errorMessage(e) };
  }
}

export async function setRegistrationStatus(_: ActionState, f: FormData): Promise<ActionState> {
  try {
    const { supabase } = await admin();
    const status = s(f, "status");
    const patch: Record<string, unknown> =
      status === "checkin" ? { checked_in_at: new Date().toISOString() } : { status };
    const { error } = await supabase.from("registrations").update(patch).eq("id", s(f, "registration_id"));
    if (error) throw error;
    revalidatePath(`/admin/events/${s(f, "event_id")}`);
    return { ok: "Updated" };
  } catch (e) {
    return { error: errorMessage(e) };
  }
}

export async function addResult(_: ActionState, f: FormData): Promise<ActionState> {
  try {
    const { supabase } = await admin();
    const { error } = await supabase.from("results").insert({
      event_id: s(f, "event_id"),
      position: s(f, "position"),
      winner_name: s(f, "winner_name"),
      sort: Number(s(f, "sort") || 0),
    });
    if (error) throw error;
    revalidatePath("/", "layout");
    return { ok: "Result added" };
  } catch (e) {
    return { error: errorMessage(e) };
  }
}

export async function removeResult(_: ActionState, f: FormData): Promise<ActionState> {
  try {
    const { supabase } = await admin();
    const { error } = await supabase.from("results").delete().eq("id", s(f, "id"));
    if (error) throw error;
    revalidatePath("/", "layout");
    return { ok: "Removed" };
  } catch (e) {
    return { error: errorMessage(e) };
  }
}

// ---------- editions ----------

export async function saveEdition(_: ActionState, f: FormData): Promise<ActionState> {
  try {
    const { supabase } = await admin();
    const name = s(f, "name");
    const fields: Record<string, unknown> = {
      name,
      slug: slugify(s(f, "slug") || name),
      tagline: orNull(s(f, "tagline")),
      description: orNull(s(f, "description")),
      starts_on: orNull(s(f, "starts_on")),
      ends_on: orNull(s(f, "ends_on")),
      announce_at: fromLocalInput(f.get("announce_at")),
    };
    const id = s(f, "id");
    const { error } = id
      ? await supabase.from("editions").update(fields).eq("id", id)
      : await supabase.from("editions").insert(fields);
    if (error) throw error;
    revalidatePath("/", "layout");
    return { ok: "Saved" };
  } catch (e) {
    return { error: errorMessage(e) };
  }
}

// ---------- posts ----------

export async function savePost(_: ActionState, f: FormData): Promise<ActionState> {
  let id = s(f, "id");
  try {
    const { supabase, user } = await admin();
    const title = s(f, "title");
    if (!title) return { error: "Give the post a title" };
    const publish = f.get("is_published") === "on";
    const fields: Record<string, unknown> = {
      title,
      slug: slugify(s(f, "slug") || title),
      body: s(f, "body"),
      is_published: publish,
      author_id: user.id,
    };
    const cover = await uploadMedia(f.get("cover"), "posts");
    if (cover) fields.cover_url = cover;
    if (publish) {
      const { data: existing } = id ? await supabase.from("posts").select("published_at").eq("id", id).single() : { data: null };
      fields.published_at = existing?.published_at ?? new Date().toISOString();
    }
    if (id) {
      const { error } = await supabase.from("posts").update(fields).eq("id", id);
      if (error) throw error;
    } else {
      const { data, error } = await supabase.from("posts").insert(fields).select("id").single();
      if (error) throw error;
      id = data.id;
    }
    revalidatePath("/", "layout");
  } catch (e) {
    return { error: errorMessage(e) };
  }
  if (!s(f, "id")) redirect(`/admin/posts/${id}`);
  return { ok: "Saved" };
}

// ---------- settings ----------

export async function saveAccount(_: ActionState, f: FormData): Promise<ActionState> {
  try {
    const { supabase } = await admin();
    const fields: Record<string, unknown> = { label: s(f, "label"), owner_name: s(f, "owner_name"), upi_id: s(f, "upi_id") };
    if (!fields.label || !fields.owner_name || !fields.upi_id) return { error: "Fill in label, owner and UPI ID" };
    const qr = await uploadMedia(f.get("qr"), "qr");
    if (qr) fields.qr_url = qr;
    const id = s(f, "id");
    const { data, error } = id
      ? await supabase.from("payment_accounts").update(fields).eq("id", id).select("id").single()
      : await supabase.from("payment_accounts").insert(fields).select("id").single();
    if (error) throw error;
    const approver = s(f, "approver_email").toLowerCase();
    if (approver) {
      const { data: p } = await supabase.from("profiles").select("id").eq("email", approver).maybeSingle();
      if (!p) return { error: "Account saved, but no user has that approver email yet" };
      await supabase.from("payment_account_approvers").upsert({ account_id: data.id, user_id: p.id });
    }
    revalidatePath("/admin/settings");
    return { ok: "Saved" };
  } catch (e) {
    return { error: errorMessage(e) };
  }
}

export async function saveDrive(_: ActionState, f: FormData): Promise<ActionState> {
  try {
    const { supabase } = await admin();
    const fields = {
      academic_year: s(f, "academic_year"),
      fee_paise: paise(f, "fee"),
      branch: (s(f, "branch") || "EE").toUpperCase(),
      programme: (s(f, "programme") || "UG").toUpperCase(),
      paying_batches: intList(s(f, "paying_batches")),
      auto_active_batches: intList(s(f, "auto_active_batches")),
      payment_account_id: orNull(s(f, "payment_account_id")),
      deadline: fromLocalInput(f.get("deadline")),
    };
    if (!/^\d{4}-\d{2}$/.test(fields.academic_year)) return { error: "Academic year looks like 2026-27" };
    const id = s(f, "id");
    if (id) {
      const { error } = await supabase.from("membership_drives").update(fields).eq("id", id);
      if (error) throw error;
    } else {
      await supabase.from("membership_drives").update({ is_current: false }).eq("is_current", true);
      const { error } = await supabase.from("membership_drives").insert({ ...fields, is_current: true });
      if (error) throw error;
    }
    revalidatePath("/admin/settings");
    return { ok: "Saved. Members of auto-active batches are activated the next time they open My EES." };
  } catch (e) {
    return { error: errorMessage(e) };
  }
}

export async function setAdmin(_: ActionState, f: FormData): Promise<ActionState> {
  try {
    const { supabase } = await admin();
    const make = s(f, "make") === "1";
    const { error } = await supabase.rpc("set_admin", { p_email: s(f, "email"), make_admin: make });
    if (error) throw error;
    revalidatePath("/admin/settings");
    return { ok: make ? "Admin added" : "Admin removed" };
  } catch (e) {
    return { error: errorMessage(e) };
  }
}
