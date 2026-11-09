import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Plus, Newspaper, Calendar, ShieldCheck, CreditCard, Users, Settings, ArrowRight, ExternalLink } from "lucide-react";

export default async function AdminHome() {
  const supabase = await createClient();
  const count = async (table: string, filter?: [string, string]) => {
    let q = supabase.from(table).select("*", { count: "exact", head: true });
    if (filter) q = q.eq(filter[0], filter[1]);
    const { count } = await q;
    return count ?? 0;
  };

  const [pending, members, users, regs, drive, recentEvents, recentPosts] = await Promise.all([
    count("payments", ["status", "pending"]),
    count("memberships", ["status", "active"]),
    count("profiles"),
    count("registrations"),
    supabase.from("membership_drives").select("id, payment_account_id").eq("is_current", true).maybeSingle(),
    supabase.from("events").select("id, slug, title, status, category, registrations(count)").order("created_at", { ascending: false }).limit(7),
    supabase.from("posts").select("id, slug, title, is_published, published_at").order("created_at", { ascending: false }).limit(4),
  ]);

  const stats = [
    { label: "Payments to Review", value: pending, href: "/admin/payments", alert: pending > 0, icon: CreditCard },
    { label: "Active Members", value: members, href: "/admin/members", alert: false, icon: ShieldCheck },
    { label: "Student Accounts", value: users, href: "/admin/members", alert: false, icon: Users },
    { label: "Event Registrations", value: regs, href: "/admin/events", alert: false, icon: Calendar },
  ];

  return (
    <div className="space-y-8">
      {/* Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="eyebrow">Command Center</span>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/admin/posts/new" className="btn-primary btn-sm flex items-center gap-1.5">
            <Plus size={16} />
            <span>Post Update</span>
          </Link>
          <Link href="/admin/events/new" className="btn-sun btn-sm flex items-center gap-1.5 font-bold text-ink">
            <Plus size={16} />
            <span>Add Event</span>
          </Link>
        </div>
      </div>

      {(!drive.data || !drive.data.payment_account_id) && (
        <div className="rounded-xl border-2 border-amber-400 bg-amber-50 p-4 text-sm text-amber-900 flex items-center justify-between gap-4">
          <p>
            Membership payments aren&apos;t set up yet. Add an active UPI account and verify the 2026-27 drive in Settings.
          </p>
          <Link href="/admin/settings" className="btn-primary btn-sm shrink-0">Configure Settings</Link>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Link
              key={s.label}
              href={s.href}
              className={`card hover:-translate-y-0.5 transition ${
                s.alert ? "border-amber-500 bg-amber-50/20 shadow-[4px_4px_0_0_#f59e0b]" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted">{s.label}</span>
                <Icon size={18} className={s.alert ? "text-amber-600" : "text-muted"} />
              </div>
              <p className="mt-2 text-4xl font-extrabold">{s.value}</p>
            </Link>
          );
        })}
      </div>

      {/* Quick Launch Control Hub */}
      <section className="card space-y-4">
        <h2 className="text-lg font-bold">Quick Management Actions</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Link href="/admin/posts" className="panel hover:bg-slate-50 transition flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-brand/10 border border-brand/20 flex items-center justify-center text-brand shrink-0">
              <Newspaper size={20} />
            </div>
            <div>
              <p className="font-bold text-sm">Society Feed</p>
              <p className="text-xs text-muted">Create & manage posts</p>
            </div>
          </Link>

          <Link href="/admin/events" className="panel hover:bg-slate-50 transition flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-sun/20 border border-sun flex items-center justify-center text-ink shrink-0">
              <Calendar size={20} />
            </div>
            <div>
              <p className="font-bold text-sm">Pravardhan Events</p>
              <p className="text-xs text-muted">Manage 7 core events</p>
            </div>
          </Link>

          <Link href="/admin/members" className="panel hover:bg-slate-50 transition flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-800 shrink-0">
              <Users size={20} />
            </div>
            <div>
              <p className="font-bold text-sm">Student Directory</p>
              <p className="text-xs text-muted">CSV & members list</p>
            </div>
          </Link>

          <Link href="/admin/settings" className="panel hover:bg-slate-50 transition flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-700 shrink-0">
              <Settings size={20} />
            </div>
            <div>
              <p className="font-bold text-sm">UPI & System</p>
              <p className="text-xs text-muted">Drive & payment accounts</p>
            </div>
          </Link>
        </div>
      </section>

      {/* Two-column overview: Events & Posts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pravardhan Events Manager */}
        <section className="card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Pravardhan Events ({recentEvents.data?.length ?? 0})</h2>
            <Link href="/admin/events" className="text-xs font-semibold text-brand hover:underline flex items-center gap-1">
              <span>View all</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="space-y-2">
            {(recentEvents.data ?? []).map((ev) => (
              <div key={ev.id} className="panel flex items-center justify-between gap-3 p-3 text-sm">
                <div>
                  <Link href={`/admin/events/${ev.id}`} className="font-bold hover:text-brand transition">
                    {ev.title}
                  </Link>
                  <p className="text-xs text-muted capitalize">{ev.category}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`badge text-xs ${ev.status === "published" ? "bg-emerald-100 text-emerald-800" : ""}`}>
                    {ev.status}
                  </span>
                  <Link href={`/admin/events/${ev.id}`} className="btn-outline btn-sm py-1 px-2 text-xs">
                    Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Updates & Notices */}
        <section className="card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Recent Updates</h2>
            <Link href="/admin/posts" className="text-xs font-semibold text-brand hover:underline flex items-center gap-1">
              <span>All posts</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="space-y-2">
            {(recentPosts.data ?? []).length === 0 ? (
              <div className="panel text-center py-8 text-muted text-sm">
                <p>No updates posted yet.</p>
                <Link href="/admin/posts/new" className="btn-primary btn-sm mt-3 inline-flex">
                  Write first post
                </Link>
              </div>
            ) : (
              (recentPosts.data ?? []).map((p) => (
                <div key={p.id} className="panel flex items-center justify-between gap-3 p-3 text-sm">
                  <div>
                    <Link href={`/admin/posts/${p.id}`} className="font-bold hover:text-brand transition">
                      {p.title}
                    </Link>
                    <p className="text-xs text-muted">{p.is_published ? "Published" : "Draft"}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {p.is_published && (
                      <Link href={`/updates/${p.slug}`} target="_blank" className="btn-outline btn-sm py-1 px-2 text-xs flex items-center gap-1">
                        <span>View</span>
                        <ExternalLink size={12} />
                      </Link>
                    )}
                    <Link href={`/admin/posts/${p.id}`} className="btn-outline btn-sm py-1 px-2 text-xs">
                      Edit
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
