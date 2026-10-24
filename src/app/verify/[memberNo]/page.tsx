import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Verify membership" };

type Verified = { member_no: string; status: string; name: string | null; reg_no: string | null; batch: number | null; branch: string | null; avatar_url: string | null } | null;

export default async function Verify({ params }: { params: Promise<{ memberNo: string }> }) {
  const { memberNo } = await params;
  const supabase = await createClient();
  const { data } = await supabase.rpc("verify_member", { p_member_no: decodeURIComponent(memberNo) });
  const m = data as Verified;
  const valid = m?.status === "active";

  return (
    <div className="container-x flex justify-center py-16">
      <div className={`card w-full max-w-sm text-center ${valid ? "" : "border-red-700"}`}>
        <p className={`text-2xl font-bold ${valid ? "text-green-700" : "text-red-700"}`}>
          {valid ? "Valid EES member" : "Not a valid membership"}
        </p>
        {m && (
          <div className="mt-4 space-y-1">
            {m.avatar_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={m.avatar_url} alt="" className="mx-auto h-32 w-28 rounded-lg object-cover" />
            )}
            <p className="text-lg font-semibold">{m.name}</p>
            <p className="font-mono text-sm">{m.reg_no}</p>
            <p className="text-sm text-muted">Batch {m.batch} · {m.branch}</p>
            <p className="font-mono text-sm">{m.member_no}</p>
          </div>
        )}
      </div>
    </div>
  );
}
