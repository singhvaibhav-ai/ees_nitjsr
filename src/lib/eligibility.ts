import { rupees } from "@/lib/format";
import type { EventRow } from "@/lib/types";

// Plain-words summary of who can register, for the event page
export function whoCanRegister(e: EventRow) {
  const parts: string[] = [];
  parts.push(e.audience === "all" ? "Open to everyone, including other colleges" : "NIT Jamshedpur students");
  if (e.allowed_batches.length) parts.push(`batch ${e.allowed_batches.join(", ")}`);
  if (e.allowed_branches.length) parts.push(`${e.allowed_branches.join(", ")} branch`);
  if (e.allowed_programmes.length) parts.push(e.allowed_programmes.join(", "));
  if (e.members_only) parts.push("active EES members only");
  return parts.join(" · ");
}

export function feeLines(e: EventRow) {
  const lines: string[] = [];
  const same = e.fee_member_paise === e.fee_nitjsr_paise && e.fee_nitjsr_paise === e.fee_outsider_paise;
  if (same) return [e.fee_member_paise === 0 ? "Free" : rupees(e.fee_member_paise)];
  lines.push(`EES members: ${e.fee_member_paise === 0 ? "free" : rupees(e.fee_member_paise)}`);
  if (!e.members_only) lines.push(`Other NIT JSR students: ${e.fee_nitjsr_paise === 0 ? "free" : rupees(e.fee_nitjsr_paise)}`);
  if (e.audience === "all") lines.push(`Other colleges: ${e.fee_outsider_paise === 0 ? "free" : rupees(e.fee_outsider_paise)}`);
  return lines;
}

export function splitUpcoming(events: EventRow[]) {
  const now = Date.now();
  const upcoming = events.filter((e) => e.status !== "completed" && (!e.ends_at || new Date(e.ends_at).getTime() >= now));
  const past = events.filter((e) => !upcoming.includes(e)).reverse();
  return { upcoming, past };
}
