import Link from "next/link";
import Image from "next/image";
import { Menu } from "lucide-react";
import { getSession } from "@/lib/session";

const links = [
  { href: "/events", label: "Events" },
  { href: "/pravardhan", label: "Pravardhan" },
  { href: "/updates", label: "Updates" },
  { href: "/about", label: "About" },
];

export async function Nav() {
  const { user, profile } = await getSession();

  const account = user ? (
    <>
      {profile?.is_admin && (
        <Link href="/admin" className="btn-outline btn-sm">
          Admin
        </Link>
      )}
      <Link href="/dashboard" className="btn-primary btn-sm">
        My EES
      </Link>
      <form action="/auth/signout" method="post">
        <button className="btn-outline btn-sm">Sign out</button>
      </form>
    </>
  ) : (
    <Link href="/login" className="btn-primary btn-sm">
      Sign in
    </Link>
  );

  return (
    <header className="no-print sticky top-0 z-40 border-b-2 border-ink bg-white">
      <nav className="container-x flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/images/ees-logo-transparent.png" alt="EES" width={40} height={40} className="h-10 w-auto" />
          <span className="font-display text-lg font-bold">EES NIT JSR</span>
        </Link>
        <div className="hidden items-center gap-6 text-sm font-semibold md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-brand">
              {l.label}
            </Link>
          ))}
        </div>
        <div className="hidden items-center gap-2 md:flex">{account}</div>
        <details className="relative md:hidden">
          <summary className="btn-outline btn-sm list-none" aria-label="Menu">
            <Menu size={18} />
          </summary>
          <div className="absolute right-0 mt-2 flex w-56 flex-col gap-2 rounded-xl border-2 border-ink bg-white p-3 shadow-[4px_4px_0_0_#0f172a]">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="rounded px-2 py-1 font-semibold hover:bg-slate-100">
                {l.label}
              </Link>
            ))}
            <div className="flex flex-wrap gap-2 border-t border-line pt-2">{account}</div>
          </div>
        </details>
      </nav>
    </header>
  );
}
