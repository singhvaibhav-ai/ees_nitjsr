import Link from "next/link";

export function Footer() {
  return (
    <footer className="no-print mt-16 border-t-2 border-ink bg-white">
      <div className="container-x grid gap-8 py-10 sm:grid-cols-3">
        <div>
          <p className="font-display text-lg font-bold">Electrical Engineering Society</p>
          <p className="mt-2 text-sm text-muted">Department of Electrical Engineering, NIT Jamshedpur, Jharkhand 831014</p>
        </div>
        <div className="flex flex-col gap-1 text-sm">
          <Link href="/events" className="hover:text-brand">Events</Link>
          <Link href="/pravardhan" className="hover:text-brand">Pravardhan</Link>
          <Link href="/updates" className="hover:text-brand">Updates</Link>
          <Link href="/about" className="hover:text-brand">About and team</Link>
        </div>
        <div className="text-sm">
          <p className="font-semibold">Contact</p>
          <a href="mailto:ees_eed@nitjsr.ac.in" className="text-brand">ees_eed@nitjsr.ac.in</a>
        </div>
      </div>
      <div className="border-t border-line py-4 text-center text-xs text-muted">
        © {new Date().getFullYear()} EES NIT Jamshedpur · Built by the EES web team
      </div>
    </footer>
  );
}
