"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { errorMessage } from "@/lib/session";
import type { ActionState } from "@/lib/types";

const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];
const MAX_UPLOAD = 4 * 1024 * 1024; // Vercel caps request bodies at 4.5 MB

async function uploadTo(bucket: string, userId: string, file: File) {
  if (file.size > MAX_UPLOAD) throw new Error("Image must be under 4 MB");
  if (!file.type.startsWith("image/")) throw new Error("Upload an image (JPG or PNG)");
  const supabase = await createClient();
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const path = `${userId}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, { contentType: file.type, upsert: true });
  if (error) throw error;
  return path;
}

export async function saveProfile(_: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in again" };

  const full_name = String(formData.get("full_name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").replace(/[^\d+]/g, "");
  const tshirt_size = String(formData.get("tshirt_size") ?? "");
  const college = String(formData.get("college") ?? "").trim() || null;
  if (full_name.length < 2) return { error: "Enter your full name" };
  if (phone.replace(/\D/g, "").length < 10) return { error: "Enter a 10-digit phone number" };

  const update: Record<string, unknown> = {
    full_name,
    phone,
    college,
    tshirt_size: SIZES.includes(tshirt_size) ? tshirt_size : null,
    onboarded: true,
  };

  try {
    const avatar = formData.get("avatar");
    if (avatar instanceof File && avatar.size > 0) {
      const path = await uploadTo("avatars", user.id, avatar);
      update.avatar_url = supabase.storage.from("avatars").getPublicUrl(path).data.publicUrl;
    }
    const { error } = await supabase.from("profiles").update(update).eq("id", user.id);
    if (error) throw error;
  } catch (e) {
    return { error: errorMessage(e) };
  }

  revalidatePath("/", "layout");
  const next = String(formData.get("next") ?? "");
  if (next.startsWith("/") && !next.startsWith("//")) redirect(next);
  return { ok: "Profile saved" };
}

export async function submitMembership(_: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in again" };
  try {
    let screenshot: string | null = null;
    const file = formData.get("screenshot");
    if (file instanceof File && file.size > 0) screenshot = await uploadTo("payments", user.id, file);
    else return { error: "Attach the payment screenshot" };
    const { error } = await supabase.rpc("submit_membership_payment", {
      p_utr: String(formData.get("utr") ?? ""),
      p_screenshot: screenshot,
    });
    if (error) throw error;
  } catch (e) {
    return { error: errorMessage(e) };
  }
  revalidatePath("/dashboard");
  return { ok: "Submitted. You'll see your ID card here once it's approved." };
}

export async function submitEventPayment(_: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in again" };
  try {
    const file = formData.get("screenshot");
    if (!(file instanceof File) || file.size === 0) return { error: "Attach the payment screenshot" };
    const screenshot = await uploadTo("payments", user.id, file);
    const { error } = await supabase.rpc("submit_event_payment", {
      rid: String(formData.get("registration_id")),
      p_utr: String(formData.get("utr") ?? ""),
      p_screenshot: screenshot,
    });
    if (error) throw error;
  } catch (e) {
    return { error: errorMessage(e) };
  }
  revalidatePath("/", "layout");
  return { ok: "Payment submitted for approval." };
}

export async function changePasswordAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in again" };

  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirm_password") ?? "");

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters long." };
  }
  if (password !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: errorMessage(error) };

  revalidatePath("/dashboard/profile");
  return { ok: "Password updated successfully!" };
}
