import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { ActionForm } from "@/components/forms";
import { IdentityBox, ProfileFields } from "@/components/profile-fields";
import { saveProfile } from "@/app/dashboard/actions";

export const metadata: Metadata = { title: "Finish your profile" };

export default async function Onboarding({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  const { user, profile } = await getSession();
  if (!user) redirect("/login");
  if (!profile) return <p className="container-x py-16">Your profile is still being created. Refresh in a moment.</p>;
  const target = next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";

  return (
    <div className="container-x flex justify-center py-12">
      <div className="card w-full max-w-lg">
        <p className="eyebrow">One step left</p>
        <h1 className="mt-1 text-3xl font-bold">Finish your profile</h1>
        <p className="mt-2 text-sm text-muted">Signed in as {profile.email}</p>
        <div className="mt-4">
          <IdentityBox profile={profile} />
        </div>
        <ActionForm action={saveProfile} className="mt-4 space-y-4" submit="Save and continue">
          <input type="hidden" name="next" value={target} />
          <ProfileFields profile={profile} />
        </ActionForm>
      </div>
    </div>
  );
}
