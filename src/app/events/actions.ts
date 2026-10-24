"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { errorMessage } from "@/lib/session";
import type { ActionState } from "@/lib/types";

export async function registerAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient();
  const slug = String(formData.get("slug"));
  const { error } = await supabase.rpc("register_for_event", {
    eid: String(formData.get("event_id")),
    p_team_name: String(formData.get("team_name") ?? "") || null,
    p_answers: {},
  });
  if (error) return { error: errorMessage(error) };
  revalidatePath(`/events/${slug}`);
  return { ok: "You're registered." };
}

export async function joinTeamAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("join_team", { p_code: String(formData.get("code") ?? "") });
  if (error) return { error: errorMessage(error) };
  revalidatePath(`/events/${String(formData.get("slug"))}`);
  return { ok: "You've joined the team." };
}

export async function leaveAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("leave_event", { eid: String(formData.get("event_id")) });
  if (error) return { error: errorMessage(error) };
  revalidatePath(`/events/${String(formData.get("slug"))}`);
  return { ok: "Registration withdrawn." };
}
