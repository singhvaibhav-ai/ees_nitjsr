import { ImageResponse } from "next/og";
import { NextResponse, type NextRequest } from "next/server";
import QRCode from "qrcode";
import { createClient } from "@/lib/supabase/server";
import { verifyUrl } from "@/lib/idcard";
import type { Membership, Profile } from "@/lib/types";

// The ID card as a PNG the member can save to their phone
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/login", request.url));
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single<Profile>();
  const { data: m } = await supabase.from("memberships").select("*").eq("user_id", user.id).maybeSingle<Membership>();
  if (!profile || m?.status !== "active" || !m.member_no) return NextResponse.redirect(new URL("/dashboard", request.url));

  const origin = request.nextUrl.origin;
  const qr = await QRCode.toDataURL(verifyUrl(m.member_no, origin), { margin: 1, width: 220 });

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "#fff", border: "8px solid #0f172a", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#0052ff", color: "#fff", padding: "28px 40px" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 40, fontWeight: 800 }}>Electrical Engineering Society</div>
            <div style={{ fontSize: 24 }}>NIT Jamshedpur · Member ID</div>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`${origin}/images/ees-logo-transparent.png`} width={90} height={90} alt="" style={{ background: "#fff", borderRadius: 45, padding: 6 }} />
        </div>
        <div style={{ display: "flex", padding: 40, gap: 40, flex: 1 }}>
          {profile.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.avatar_url} width={240} height={300} alt="" style={{ objectFit: "cover", borderRadius: 16, border: "2px solid #e2e8f0" }} />
          ) : (
            <div style={{ width: 240, height: 300, border: "2px dashed #94a3b8", borderRadius: 16, display: "flex" }} />
          )}
          <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <div style={{ fontSize: 52, fontWeight: 800, color: "#0f172a" }}>{profile.full_name ?? ""}</div>
            <div style={{ fontSize: 34, marginTop: 12, color: "#0f172a" }}>{profile.reg_no ?? ""}</div>
            <div style={{ fontSize: 30, marginTop: 8, color: "#475569" }}>{`Batch ${profile.batch} · ${profile.programme} ${profile.branch}`}</div>
            <div style={{ display: "flex", marginTop: 24 }}>
              <div style={{ background: "#ffd600", padding: "8px 16px", fontSize: 32, fontWeight: 800, borderRadius: 8 }}>{m.member_no}</div>
            </div>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qr} width={220} height={220} alt="" style={{ alignSelf: "flex-end" }} />
        </div>
      </div>
    ),
    { width: 1200, height: 700 },
  );
}
