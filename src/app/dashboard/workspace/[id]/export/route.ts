import { createClient } from "@/lib/supabase/server";
import { csvResponse, toCsv } from "@/lib/csv";

type Person = {
  full_name: string | null;
  reg_no: string | null;
  pid?: string | null;
  email: string;
  phone: string | null;
  college: string | null;
  batch: number | null;
  branch: string | null;
};

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
  let authorized = Boolean(profile?.is_admin);

  if (!authorized) {
    const { data: staff } = await supabase
      .from("event_staff")
      .select("role")
      .eq("event_id", id)
      .eq("user_id", user.id)
      .maybeSingle();
    authorized = Boolean(staff);
  }

  if (!authorized) {
    return new Response("Unauthorized", { status: 403 });
  }

  const { data: ev } = await supabase.from("events").select("slug").eq("id", id).single();
  const { data } = await supabase
    .from("registrations")
    .select(
      "status, fee_paise, checked_in_at, created_at, profiles(full_name, reg_no, pid, email, phone, college, batch, branch), teams(name, team_members(profiles(full_name, reg_no, pid, email, phone, college, batch, branch)))"
    )
    .eq("event_id", id)
    .order("created_at");

  const head = [
    "team",
    "name",
    "p_id",
    "reg_no",
    "batch",
    "branch",
    "college",
    "email",
    "phone",
    "status",
    "fee_rs",
    "registered_at",
    "checked_in_at",
  ];
  const rows: (string | number | null)[][] = [];
  for (const r of data ?? []) {
    const team = r.teams as unknown as { name: string; team_members: { profiles: Person | null }[] } | null;
    const people = team ? team.team_members.map((m) => m.profiles) : [r.profiles as unknown as Person | null];
    for (const p of people) {
      rows.push([
        team?.name ?? "",
        p?.full_name ?? "",
        p?.pid ?? "",
        p?.reg_no ?? "",
        p?.batch ?? "",
        p?.branch ?? "",
        p?.college ?? "",
        p?.email ?? "",
        p?.phone ?? "",
        r.status,
        r.fee_paise / 100,
        r.created_at,
        r.checked_in_at,
      ]);
    }
  }

  return csvResponse(`${ev?.slug ?? "event"}-participants.csv`, toCsv([head, ...rows]));
}
