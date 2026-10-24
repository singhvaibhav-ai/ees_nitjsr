import Link from "next/link";
import { CATEGORY_LABELS, dateTime, rupees } from "@/lib/format";
import type { EventRow } from "@/lib/types";

export function EventCard({ e }: { e: EventRow }) {
  const free = e.fee_nitjsr_paise === 0 && e.fee_outsider_paise === 0;
  return (
    <Link href={`/events/${e.slug}`} className="card flex flex-col gap-3 transition hover:-translate-y-0.5">
      {e.banner_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={e.banner_url} alt="" className="-mx-5 -mt-5 h-40 w-[calc(100%+2.5rem)] rounded-t-[10px] object-cover" />
      )}
      <div className="flex flex-wrap items-center gap-2">
        <span className="badge bg-sun">{CATEGORY_LABELS[e.category] ?? e.category}</span>
        {e.audience === "all" && <span className="badge">Open to all</span>}
        {e.members_only && <span className="badge">Members only</span>}
        {e.team_max > 1 && <span className="badge">Team of {e.team_min === e.team_max ? e.team_max : `${e.team_min}–${e.team_max}`}</span>}
      </div>
      <h3 className="text-xl font-bold">{e.title}</h3>
      {e.summary && <p className="line-clamp-3 text-sm text-muted">{e.summary}</p>}
      <div className="mt-auto flex items-center justify-between text-sm">
        <span>{dateTime(e.starts_at)}</span>
        <span className="font-semibold">{free ? "Free" : e.fee_member_paise === 0 ? "Free for EES members" : `From ${rupees(Math.min(e.fee_member_paise, e.fee_nitjsr_paise))}`}</span>
      </div>
    </Link>
  );
}
