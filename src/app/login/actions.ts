"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type AuthResult = {
  error?: string;
  ok?: boolean;
};

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

