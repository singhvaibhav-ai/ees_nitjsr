import type { Metadata } from "next";
import Link from "next/link";
import { requireProfile } from "@/lib/session";
import { ActionForm } from "@/components/forms";
import { IdentityBox, ProfileFields } from "@/components/profile-fields";
import { saveProfile, changePasswordAction } from "../actions";
import { Lock } from "lucide-react";

export const metadata: Metadata = { title: "Edit profile" };

export default async function EditProfile() {
  const { profile } = await requireProfile("/dashboard/profile");
  return (
    <div className="container-x max-w-xl py-12">
      <Link href="/dashboard" className="text-sm text-brand">← My EES</Link>
      <h1 className="mt-2 text-3xl font-bold">Edit profile</h1>
      <div className="mt-4">
        <IdentityBox profile={profile} />
      </div>
      <ActionForm action={saveProfile} className="panel mt-4 space-y-4" submit="Save">
        <ProfileFields profile={profile} withAvatar />
      </ActionForm>

      <div className="mt-8 border-t border-line pt-8">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Lock size={18} className="text-brand" />
          <span>Security & Password</span>
        </h2>
        <p className="mt-1 text-sm text-muted">
          Update your account password for future logins.
        </p>

        <ActionForm action={changePasswordAction} className="panel mt-4 space-y-4" submit="Change Password">
          <div>
            <label className="label" htmlFor="new-password">New Password</label>
            <input
              id="new-password"
              name="password"
              type="password"
              required
              minLength={8}
              className="input"
              placeholder="Min 8 characters"
            />
          </div>
          <div>
            <label className="label" htmlFor="confirm-new-password">Confirm New Password</label>
            <input
              id="confirm-new-password"
              name="confirm_password"
              type="password"
              required
              minLength={8}
              className="input"
              placeholder="Repeat your new password"
            />
          </div>
        </ActionForm>
      </div>
    </div>
  );
}
