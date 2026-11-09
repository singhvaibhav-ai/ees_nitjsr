"use server";

import { revalidatePath } from "next/cache";
import { requireProfile } from "@/lib/session";
import type { ActionState } from "@/lib/types";

function s(f: FormData, key: string): string {
  const v = f.get(key);
  if (typeof v !== "string" || !v.trim()) throw new Error(`Missing ${key}`);
  return v.trim();
}

function errorMessage(e: unknown): string {
  return e instanceof Error ? e.message : "Something went wrong";
}

async function verifyStaffAccess(eventId: string) {
  const { supabase, profile } = await requireProfile("/dashboard/workspace");
  if (profile.is_admin) return { supabase, profile };

  const { data: staff } = await supabase
    .from("event_staff")
    .select("role")
    .eq("event_id", eventId)
    .eq("user_id", profile.id)
    .maybeSingle();

  if (!staff) throw new Error("You are not authorized as staff for this event.");
  return { supabase, profile };
}

export async function setStaffRegistrationStatus(_: ActionState, f: FormData): Promise<ActionState> {
  try {
    const eventId = s(f, "event_id");
    const { supabase } = await verifyStaffAccess(eventId);
    const regId = s(f, "registration_id");
    const status = s(f, "status");

    const patch: Record<string, unknown> =
      status === "checkin" ? { checked_in_at: new Date().toISOString() } : { status };

    const { error } = await supabase.from("registrations").update(patch).eq("id", regId).eq("event_id", eventId);
    if (error) throw error;

    revalidatePath(`/dashboard/workspace/${eventId}`);
    revalidatePath(`/admin/events/${eventId}`);
    return { ok: "Status updated successfully" };
  } catch (e) {
    return { error: errorMessage(e) };
  }
}

export async function addStaffResult(_: ActionState, f: FormData): Promise<ActionState> {
  try {
    const eventId = s(f, "event_id");
    const { supabase } = await verifyStaffAccess(eventId);

    const { error } = await supabase.from("results").insert({
      event_id: eventId,
      position: s(f, "position"),
      winner_name: s(f, "winner_name"),
      sort: Number(f.get("sort") || 0),
    });
    if (error) throw error;

    revalidatePath(`/dashboard/workspace/${eventId}`);
    revalidatePath(`/events`);
    return { ok: "Result added" };
  } catch (e) {
    return { error: errorMessage(e) };
  }
}

export async function removeStaffResult(_: ActionState, f: FormData): Promise<ActionState> {
  try {
    const eventId = s(f, "event_id");
    const { supabase } = await verifyStaffAccess(eventId);

    const { error } = await supabase.from("results").delete().eq("id", s(f, "id")).eq("event_id", eventId);
    if (error) throw error;

    revalidatePath(`/dashboard/workspace/${eventId}`);
    return { ok: "Result removed" };
  } catch (e) {
    return { error: errorMessage(e) };
  }
}
