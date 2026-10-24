const IST = "Asia/Kolkata";

export function rupees(paise: number | null | undefined) {
  const r = (paise ?? 0) / 100;
  return `₹${r.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

export function dateTime(iso: string | null | undefined) {
  if (!iso) return "To be announced";
  return new Date(iso).toLocaleString("en-IN", {
    timeZone: IST,
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function dateOnly(iso: string | null | undefined) {
  if (!iso) return "To be announced";
  return new Date(iso).toLocaleDateString("en-IN", { timeZone: IST, day: "numeric", month: "short", year: "numeric" });
}

// <input type="datetime-local"> values are typed in IST, whatever the server's zone
export function fromLocalInput(value: FormDataEntryValue | null) {
  const v = String(value ?? "").trim();
  return v ? new Date(`${v}:00+05:30`).toISOString() : null;
}

export function toLocalInput(iso: string | null | undefined) {
  if (!iso) return "";
  const d = new Date(new Date(iso).getTime() + 5.5 * 3600 * 1000);
  return d.toISOString().slice(0, 16);
}

export function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export const CATEGORY_LABELS: Record<string, string> = {
  technical: "Technical",
  fun: "Fun",
  workshop: "Workshop",
  hackathon: "Hackathon",
  sports: "Sports",
  orientation: "Orientation",
  other: "Other",
};

export const STATUS_LABELS: Record<string, string> = {
  pending_payment: "Payment due",
  pending_approval: "Waiting for approval",
  confirmed: "Confirmed",
  waitlisted: "Waitlisted",
  cancelled: "Cancelled",
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  active: "Active",
};
