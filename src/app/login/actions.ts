"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type AuthResult = {
  error?: string;
  ok?: boolean;
  target?: string;
};

export async function signInAction(formData: FormData): Promise<AuthResult> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "").trim();

  if (!email || !password) {
    return { error: "Please enter your email and password." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    if (error.message.toLowerCase().includes("invalid login credentials")) {
      return { error: "Invalid email or password. Please check your credentials or create an account." };
    }
    return { error: error.message };
  }

  // Determine destination
  let target = next || "/dashboard";
  if (data?.user) {
    const { data: prof } = await supabase
      .from("profiles")
      .select("is_admin, onboarded")
      .eq("id", data.user.id)
      .maybeSingle();

    if (prof?.is_admin && (target === "/dashboard" || target === "/")) {
      target = "/admin";
    } else if (prof && !prof.onboarded) {
      target = `/onboarding?next=${encodeURIComponent(target)}`;
    }
  }

  return { ok: true, target };
}

export async function signUpAction(formData: FormData): Promise<AuthResult> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!email || !email.includes("@")) {
    return { error: "Please enter a valid email address." };
  }
  if (!password || password.length < 8) {
    return { error: "Password must be at least 8 characters long." };
  }
  if (password !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  const admin = createAdminClient();
  if (admin) {
    const { error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (error) {
      if (error.message.toLowerCase().includes("already registered") || error.message.toLowerCase().includes("already exists")) {
        return { error: "An account with this email already exists. Please sign in instead." };
      }
      return { error: error.message };
    }
    return { ok: true };
  }

  // Fallback to standard signUp
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
  });
  if (error) return { error: error.message };
  return { ok: true };
}

