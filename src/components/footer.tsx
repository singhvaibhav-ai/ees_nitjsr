import Link from "next/link";

export function Footer() {
  return (
    <footer className="no-print mt-16 border-t-2 border-ink bg-white">
      <div className="container-x grid gap-8 py-10 sm:grid-cols-4">
        <div className="sm:col-span-2">
          <p className="font-display text-lg font-bold">Electrical Engineering Society</p>
          <p className="mt-2 text-sm text-muted">
            Department of Electrical Engineering, National Institute of Technology Jamshedpur, Adityapur, Jharkhand 831014
          </p>
          <p className="mt-4 text-xs font-semibold text-brand">
            &ldquo;Illuminating Minds, Powering Innovation, Serving Society.&rdquo;
          </p>
        </div>
        <div className="flex flex-col gap-1.5 text-sm">
          <span className="text-xs font-bold uppercase text-muted tracking-wider mb-1">Explore</span>
          <Link href="/events" className="hover:text-brand">Events & Competitions</Link>
          <Link href="/pravardhan" className="hover:text-brand">Pravardhan Fest</Link>
          <Link href="/epl" className="hover:text-brand">Electrical Premier League</Link>
          <Link href="/gallery" className="hover:text-brand">Photo Gallery</Link>
          <Link href="/faculty" className="hover:text-brand">Faculty Directory & ID</Link>
          <Link href="/updates" className="hover:text-brand">Notices & Updates</Link>
          <Link href="/verify" className="hover:text-brand font-medium text-brand">Verify P-ID & Credentials</Link>
          <Link href="/about" className="hover:text-brand">About & Core Team</Link>
        </div>
        <div className="text-sm">
          <span className="text-xs font-bold uppercase text-muted tracking-wider mb-1 block">Connect</span>
          <p className="font-semibold">Society Email</p>
          <a href="mailto:ees_eed@nitjsr.ac.in" className="text-brand break-all">ees_eed@nitjsr.ac.in</a>
          <p className="mt-4 font-semibold">Head of Department</p>
          <a href="mailto:hod.ee@nitjsr.ac.in" className="text-brand break-all">hod.ee@nitjsr.ac.in</a>
        </div>
      </div>
      <div className="border-t border-line py-4 text-center text-xs text-muted">
        © {new Date().getFullYear()} EES NIT Jamshedpur · Department of Electrical Engineering
      </div>
    </footer>
  );
}
