import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { PaymentAccount } from "@/lib/types";
import { EventForm } from "../event-form";

export default async function NewEvent() {
  const supabase = await createClient();
  const { data: editions } = await supabase.from("editions").select("id, name").order("starts_on", { ascending: false });
  const { data: accounts } = await supabase.from("payment_accounts").select("*");
  return (
    <div>
      <Link href="/admin/events" className="text-sm text-brand">← Events</Link>
      <h1 className="mt-2 mb-6 text-3xl font-bold">New event</h1>
      <EventForm editions={editions ?? []} accounts={(accounts ?? []) as PaymentAccount[]} />
    </div>
  );
}
