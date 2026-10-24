import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Membership, Profile } from "@/lib/types";

export async function getSession() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, profile: null as Profile | null };
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single<Profile>();
  return { supabase, user, profile };
}

// For pages that need a finished profile
export async function requireProfile(next = "/dashboard") {
  const s = await getSession();
  if (!s.user) redirect(`/login?next=${encodeURIComponent(next)}`);
  if (!s.profile?.onboarded) redirect(`/onboarding?next=${encodeURIComponent(next)}`);
  return s as typeof s & { profile: Profile };
}

export async function requireAdmin() {
  const s = await requireProfile("/admin");
  if (!s.profile.is_admin) redirect("/dashboard");
  return s;
}

export async function getMembership(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  await supabase.rpc("sync_my_membership");
  const { data } = await supabase.from("memberships").select("*").eq("user_id", userId).maybeSingle<Membership>();
  return data;
}

export function errorMessage(e: unknown) {
  if (e && typeof e === "object" && "message" in e) return String((e as { message: string }).message);
  return "Something went wrong. Please try again.";
}
