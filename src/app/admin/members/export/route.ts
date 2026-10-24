import { createClient } from "@/lib/supabase/server";
import { csvResponse, toCsv } from "@/lib/csv";

export async function GET() {
  const supabase = await createClient();
  const { data: me } = await supabase.rpc("is_admin");
  if (!me) return new Response("Admins only", { status: 403 });
  const { data } = await supabase
    .from("memberships")
    .select("member_no, status, source, activated_at, tshirt_issued_at, profiles(full_name, reg_no, batch, email, phone, tshirt_size)")
    .order("member_no");
  type P = { full_name: string; reg_no: string; batch: number; email: string; phone: string; tshirt_size: string };
  const rows = (data ?? []).map((m) => {
    const p = m.profiles as unknown as P | null;
    return [m.member_no, p?.full_name, p?.reg_no, p?.batch, p?.email, p?.phone, p?.tshirt_size, m.status, m.source, m.activated_at, m.tshirt_issued_at];
  });
  const head = ["member_no", "name", "reg_no", "batch", "email", "phone", "tshirt", "status", "source", "activated_at", "tshirt_issued_at"];
  return csvResponse("ees-members.csv", toCsv([head, ...rows]));
}
