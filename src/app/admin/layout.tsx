import Link from "next/link";
import { requireAdmin } from "@/lib/session";

const links = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/payments", label: "Payments" },
  { href: "/admin/members", label: "Members" },
  { href: "/admin/events", label: "Events" },
  { href: "/admin/editions", label: "Pravardhan / editions" },
  { href: "/admin/posts", label: "Updates" },
  { href: "/admin/settings", label: "Settings" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="container-x grid gap-8 py-8 lg:grid-cols-[200px_1fr]">
      <aside>
        <p className="eyebrow mb-3">Admin</p>
        <nav className="flex flex-wrap gap-2 lg:flex-col">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="rounded-lg px-3 py-1.5 text-sm font-semibold hover:bg-white hover:shadow-sm">
              {l.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
