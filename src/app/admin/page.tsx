import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AdminHome() {
  const supabase = await createClient();
  const count = async (table: string, filter?: [string, string]) => {
    let q = supabase.from(table).select("*", { count: "exact", head: true });
    if (filter) q = q.eq(filter[0], filter[1]);
    const { count } = await q;
    return count ?? 0;
  };
  const [pending, members, users, regs, drive] = await Promise.all([
    count("payments", ["status", "pending"]),
    count("memberships", ["status", "active"]),
    count("profiles"),
    count("registrations"),
    supabase.from("membership_drives").select("id, payment_account_id").eq("is_current", true).maybeSingle(),
  ]);

  const stats = [
    { label: "Payments to review", value: pending, href: "/admin/payments" },
    { label: "Active members", value: members, href: "/admin/members" },
    { label: "Accounts", value: users, href: "/admin/members" },
    { label: "Event registrations", value: regs, href: "/admin/events" },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold">Overview</h1>
      {(!drive.data || !drive.data.payment_account_id) && (
        <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
          Membership payments aren&apos;t set up yet. Add a UPI account and the 2026-27 drive in{" "}
          <Link href="/admin/settings" className="underline">Settings</Link>.
        </p>
      )}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="card hover:-translate-y-0.5">
            <p className="text-4xl font-bold">{s.value}</p>
            <p className="text-sm text-muted">{s.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
