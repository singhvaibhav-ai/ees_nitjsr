import type { Metadata } from "next";
import Link from "next/link";
import { requireProfile } from "@/lib/session";
import { ActionForm } from "@/components/forms";
import { IdentityBox, ProfileFields } from "@/components/profile-fields";
import { saveProfile } from "../actions";

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
    </div>
  );
}
