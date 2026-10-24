import type { Profile } from "@/lib/types";

const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];

export function ProfileFields({ profile, withAvatar = false }: { profile: Profile; withAvatar?: boolean }) {
  return (
    <>
      <div>
        <label className="label" htmlFor="full_name">Full name</label>
        <input id="full_name" name="full_name" className="input" required defaultValue={profile.full_name ?? ""} />
      </div>
      <div>
        <label className="label" htmlFor="phone">Phone (WhatsApp)</label>
        <input id="phone" name="phone" className="input" inputMode="tel" required defaultValue={profile.phone ?? ""} />
      </div>
      {!profile.is_nitjsr && (
        <div>
          <label className="label" htmlFor="college">College or organisation</label>
          <input id="college" name="college" className="input" required defaultValue={profile.college ?? ""} />
          <p className="hint">
            NIT Jamshedpur student? Sign out and sign in with your college email instead, so college-only events
            unlock.
          </p>
        </div>
      )}
      <div>
        <label className="label" htmlFor="tshirt_size">T-shirt size</label>
        <select id="tshirt_size" name="tshirt_size" className="input" defaultValue={profile.tshirt_size ?? ""}>
          <option value="">Choose</option>
          {SIZES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>
      {withAvatar && (
        <div>
          <label className="label" htmlFor="avatar">Photo for your ID card</label>
          <input id="avatar" name="avatar" type="file" accept="image/*" className="input" />
          <p className="hint">A clear, front-facing photo. Under 4 MB.</p>
        </div>
      )}
    </>
  );
}

export function IdentityBox({ profile }: { profile: Profile }) {
  if (!profile.is_nitjsr) return null;
  return (
    <div className="rounded-lg border border-line bg-slate-50 p-3 text-sm">
      <p className="font-semibold">From your college email</p>
      <p className="mt-1">
        {profile.reg_no ?? "Registration number not recognised"}
        {profile.batch && ` · Batch ${profile.batch} · ${profile.programme} · ${profile.branch}`}
      </p>
      <p className="hint">If this is wrong, contact an EES admin.</p>
    </div>
  );
}
