import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/session";
import { ActionForm } from "@/components/forms";
import { CATEGORY_LABELS, dateTime, rupees, STATUS_LABELS } from "@/lib/format";
import { feeLines, whoCanRegister } from "@/lib/eligibility";
import type { EventRow, PaymentAccount } from "@/lib/types";
import { joinTeamAction, leaveAction, registerAction } from "../actions";
import { submitEventPayment } from "@/app/dashboard/actions";

type MyStatus = {
  reason: string | null;
  fee_paise: number;
  registration: { id: string; status: string; fee_paise: number; team_id: string | null } | null;
  team: { id: string; name: string; code: string; leader_id: string; members: { name: string; reg_no: string | null }[] } | null;
  whatsapp_link: string | null;
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { supabase } = await getSession();
  const { data } = await supabase.from("events").select("title, summary").eq("slug", slug).maybeSingle();
  return { title: data?.title ?? "Event", description: data?.summary ?? undefined };
}

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { supabase, user, profile } = await getSession();
  const { data } = await supabase.from("events").select("*, editions(name, slug)").eq("slug", slug).maybeSingle();
  if (!data) notFound();
  const e = data as EventRow & { editions: { name: string; slug: string } | null };

  const { data: results } = await supabase.from("results").select("*").eq("event_id", e.id).order("sort");

  let status: MyStatus | null = null;
  let account: PaymentAccount | null = null;
  if (user) {
    const { data: s } = await supabase.rpc("my_event_status", { eid: e.id });
    status = s as MyStatus;
    if (e.payment_account_id) {
      const { data: a } = await supabase.from("payment_accounts").select("*").eq("id", e.payment_account_id).maybeSingle();
      account = a as PaymentAccount | null;
    }
  }

  return (
    <div className="container-x py-10">
      {e.editions && (
        <Link href={`/pravardhan`} className="text-sm text-brand">← {e.editions.name}</Link>
      )}
      <div className="mt-4 grid gap-8 lg:grid-cols-[2fr_1fr]">
        <article>
          {e.banner_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={e.banner_url} alt="" className="mb-6 max-h-80 w-full rounded-xl border-2 border-ink object-cover" />
          )}
          <span className="badge bg-sun">{CATEGORY_LABELS[e.category]}</span>
          <h1 className="mt-2 text-4xl font-bold sm:text-5xl">{e.title}</h1>
          {e.summary && <p className="mt-3 text-lg text-muted">{e.summary}</p>}

          <dl className="mt-6 grid gap-4 rounded-xl border border-line bg-white p-4 text-sm sm:grid-cols-2">
            <div><dt className="font-semibold">When</dt><dd>{dateTime(e.starts_at)}{e.ends_at && ` to ${dateTime(e.ends_at)}`}</dd></div>
            <div><dt className="font-semibold">Where</dt><dd>{e.venue ?? "To be announced"}</dd></div>
            <div><dt className="font-semibold">Who can register</dt><dd>{whoCanRegister(e)}</dd></div>
            <div><dt className="font-semibold">Team</dt><dd>{e.team_max > 1 ? `${e.team_min} to ${e.team_max} members` : "Individual"}</dd></div>
            <div><dt className="font-semibold">Fee</dt><dd>{feeLines(e).map((l) => <div key={l}>{l}</div>)}</dd></div>
            {e.reg_closes_at && <div><dt className="font-semibold">Registration closes</dt><dd>{dateTime(e.reg_closes_at)}</dd></div>}
          </dl>

          {results && results.length > 0 && (
            <section className="card mt-8">
              <h2 className="text-2xl font-bold">Results</h2>
              <ul className="mt-3 space-y-2">
                {results.map((r) => (
                  <li key={r.id} className="flex justify-between gap-4 border-b border-line pb-2">
                    <span className="font-semibold">{r.position}</span>
                    <span>{r.winner_name}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {e.description && <Section title="About">{e.description}</Section>}
          {e.rules && <Section title="Rules">{e.rules}</Section>}
          {e.rulebook_url && (
            <a href={e.rulebook_url} target="_blank" rel="noreferrer" className="btn-outline mt-4">Download rulebook</a>
          )}
          {e.prizes && <Section title="Prizes">{e.prizes}</Section>}
          {e.contact && <Section title="Contact">{e.contact}</Section>}
        </article>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="card space-y-4">
            <h2 className="text-xl font-bold">Registration</h2>
            <RegistrationPanel e={e} signedIn={!!user} onboarded={!!profile?.onboarded} status={status} account={account} userId={user?.id} pid={profile?.pid} />
          </div>
        </aside>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-2xl font-bold">{title}</h2>
      <div className="prose-x mt-2">{children}</div>
    </section>
  );
}

function RegistrationPanel({
  e,
  signedIn,
  onboarded,
  status,
  account,
  userId,
  pid,
}: {
  e: EventRow;
  signedIn: boolean;
  onboarded: boolean;
  status: MyStatus | null;
  account: PaymentAccount | null;
  userId?: string;
  pid?: string | null;
}) {
  if (e.status === "completed") return <p className="text-muted">This event is over.</p>;
  if (!signedIn)
    return (
      <Link href={`/login?next=/events/${e.slug}`} className="btn-primary w-full">Sign in to register</Link>
    );
  if (!onboarded)
    return <Link href={`/onboarding?next=/events/${e.slug}`} className="btn-primary w-full">Finish your profile</Link>;
  if (!status) return null;

  const reg = status.registration;
  const team = status.team;
  const leave = (
    <ActionForm action={leaveAction} submit="Withdraw" submitClass="btn-danger btn-sm" confirm="Withdraw from this event?">
      <input type="hidden" name="event_id" value={e.id} />
      <input type="hidden" name="slug" value={e.slug} />
    </ActionForm>
  );

  if (reg || team) {
    const isLeader = !team || team.leader_id === userId;
    return (
      <div className="space-y-4 text-sm">
        {pid && (
          <div className="flex items-center justify-between rounded-lg border-2 border-brand/20 bg-brand/5 p-2.5">
            <span className="text-xs font-semibold text-muted">Pravardhan ID:</span>
            <span className="font-mono text-xs font-bold text-brand">{pid}</span>
          </div>
        )}
        {reg && <p className="text-base">Status: <b>{STATUS_LABELS[reg.status] ?? reg.status}</b></p>}
        {team && (
          <div className="rounded-lg bg-slate-50 p-3">
            <p>Team <b>{team.name}</b></p>
            {isLeader && (
              <p className="mt-1">
                Team code <span className="rounded bg-sun px-2 font-mono font-bold">{team.code}</span>. Teammates sign in
                and enter it here to join ({e.team_min} to {e.team_max} members).
              </p>
            )}
            <ul className="mt-2 list-disc pl-5">
              {team.members?.map((m) => <li key={m.name + m.reg_no}>{m.name}{m.reg_no && ` (${m.reg_no})`}</li>)}
            </ul>
            {team.members && team.members.length < e.team_min && (
              <p className="mt-2 text-amber-800">You need at least {e.team_min} members.</p>
            )}
          </div>
        )}
        {reg?.status === "pending_payment" && (
          <div className="space-y-3 rounded-lg border border-line p-3">
            <p>Pay <b>{rupees(reg.fee_paise)}</b>{account && <> by UPI to <b>{account.owner_name}</b> (<span className="font-mono">{account.upi_id}</span>)</>}, then submit the UTR.</p>
            {account?.qr_url && <Image src={account.qr_url} alt="UPI QR" width={160} height={160} unoptimized />}
            <ActionForm action={submitEventPayment} submit="Submit payment" pendingText="Submitting…">
              <input type="hidden" name="registration_id" value={reg.id} />
              <input name="utr" className="input font-mono" placeholder="UTR / transaction ID" required minLength={8} />
              <input name="screenshot" type="file" accept="image/*" className="input" required />
            </ActionForm>
          </div>
        )}
        {status.whatsapp_link && (
          <a href={status.whatsapp_link} target="_blank" rel="noreferrer" className="btn-sun w-full">Join the WhatsApp group</a>
        )}
        {leave}
      </div>
    );
  }

  return (
    <div className="space-y-4 text-sm">
      {status.reason ? (
        <p className="rounded-lg bg-slate-100 p-3">{status.reason}</p>
      ) : (
        <>
          <p>Your fee: <b>{status.fee_paise === 0 ? "Free" : rupees(status.fee_paise)}</b></p>
          <ActionForm action={registerAction} submit={e.team_max > 1 ? "Create team and register" : "Register"} pendingText="Registering…">
            <input type="hidden" name="event_id" value={e.id} />
            <input type="hidden" name="slug" value={e.slug} />
            {e.team_max > 1 && <input name="team_name" className="input" placeholder="Team name" required />}
          </ActionForm>
        </>
      )}
      {e.team_max > 1 && (status.reason === null || status.reason === "All seats are taken") && (
        <div className="border-t border-line pt-4">
          <p className="font-semibold">Joining a friend&apos;s team?</p>
          <ActionForm action={joinTeamAction} className="mt-2 space-y-2" submit="Join team" submitClass="btn-outline">
            <input type="hidden" name="slug" value={e.slug} />
            <input name="code" className="input font-mono uppercase" placeholder="Team code" required />
          </ActionForm>
        </div>
      )}
    </div>
  );
}
