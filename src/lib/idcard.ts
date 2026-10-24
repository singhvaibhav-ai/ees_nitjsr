export function siteUrl(fallbackOrigin?: string) {
  return (process.env.NEXT_PUBLIC_SITE_URL || fallbackOrigin || "http://localhost:3000").replace(/\/$/, "");
}

export function verifyUrl(memberNo: string, origin?: string) {
  return `${siteUrl(origin)}/verify/${encodeURIComponent(memberNo)}`;
}
