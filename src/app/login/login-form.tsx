"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { signUpAction } from "./actions";
import { Eye, EyeOff, Lock, Mail, Clock } from "lucide-react";

export function LoginForm({ next, initialError }: { next: string; initialError?: string }) {
  const router = useRouter();
  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(initialError ?? "");
  const [successMsg, setSuccessMsg] = useState("");

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setSuccessMsg("");

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    setBusy(false);
    if (signInError) {
      if (signInError.message.toLowerCase().includes("invalid login credentials")) {
        setError("Invalid email or password. Please check your credentials or create an account.");
      } else {
        setError(signInError.message);
      }
      return;
    }

    router.replace(next);
    router.refresh();
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setSuccessMsg("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      setBusy(false);
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setBusy(false);
      return;
    }

    const formData = new FormData();
    formData.append("email", email.trim().toLowerCase());
    formData.append("password", password);
    formData.append("confirmPassword", confirmPassword);

    const res = await signUpAction(formData);
    if (res.error) {
      setError(res.error);
      setBusy(false);
      return;
    }

    // Immediately sign in with the new account
    const supabase = createClient();
    const { error: signInErr } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    setBusy(false);
    if (signInErr) {
      setError("Account created! Please sign in with your password.");
      setTab("signin");
    } else {
      router.replace(next);
      router.refresh();
    }
  }

  return (
    <div className="mt-6 space-y-5">
      {/* Tab Switcher */}
      <div className="grid grid-cols-2 rounded-xl border-2 border-ink bg-slate-100 p-1">
        <button
          type="button"
          onClick={() => {
            setTab("signin");
            setError("");
          }}
          className={`rounded-lg py-2 text-sm font-bold transition ${
            tab === "signin"
              ? "bg-white text-ink shadow-[2px_2px_0_0_#0f172a]"
              : "text-muted hover:text-ink"
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => {
            setTab("signup");
            setError("");
          }}
          className={`rounded-lg py-2 text-sm font-bold transition ${
            tab === "signup"
              ? "bg-white text-ink shadow-[2px_2px_0_0_#0f172a]"
              : "text-muted hover:text-ink"
          }`}
        >
          Create Account
        </button>
      </div>

      {tab === "signin" ? (
        <form onSubmit={handleSignIn} className="space-y-4">
          <div>
            <label className="label" htmlFor="signin-email">
              Email Address
            </label>
            <div className="relative mt-1">
              <input
                id="signin-email"
                type="email"
                required
                autoComplete="email"
                className="input pl-9"
                placeholder="2024ugee007@nitjsr.ac.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
            </div>
          </div>

          <div>
            <label className="label" htmlFor="signin-password">
              Password
            </label>
            <div className="relative mt-1">
              <input
                id="signin-password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                className="input pl-9 pr-10"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button className="btn-primary w-full py-2.5 font-bold" disabled={busy}>
            {busy ? "Signing in…" : "Sign In with Password"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleSignUp} className="space-y-4">
          <div>
            <label className="label" htmlFor="signup-email">
              Email Address
            </label>
            <div className="relative mt-1">
              <input
                id="signup-email"
                type="email"
                required
                autoComplete="email"
                className="input pl-9"
                placeholder="2024ugee007@nitjsr.ac.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
            </div>
            <p className="hint">NIT JSR students: use your college email for auto-profiling.</p>
          </div>

          <div>
            <label className="label" htmlFor="signup-password">
              Create Password
            </label>
            <div className="relative mt-1">
              <input
                id="signup-password"
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
                autoComplete="new-password"
                className="input pl-9 pr-10"
                placeholder="Min 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="label" htmlFor="signup-confirm-password">
              Confirm Password
            </label>
            <div className="relative mt-1">
              <input
                id="signup-confirm-password"
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
                autoComplete="new-password"
                className="input pl-9"
                placeholder="Repeat your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
            </div>
          </div>

          <button className="btn-primary w-full py-2.5 font-bold" disabled={busy}>
            {busy ? "Creating account…" : "Create Account & Sign In"}
          </button>
        </form>
      )}

      {error && <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
      {successMsg && <p className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{successMsg}</p>}

      {/* Alternative Login Methods (Marked as Coming Soon) */}
      <div className="pt-2">
        <div className="flex items-center gap-3 text-xs text-muted">
          <span className="h-px flex-1 bg-line" />
          <span>Other Sign-In Options</span>
          <span className="h-px flex-1 bg-line" />
        </div>

        <div className="mt-4 space-y-2.5">
          <button
            type="button"
            disabled
            className="w-full flex items-center justify-between rounded-lg border border-line bg-slate-50 px-4 py-2.5 text-xs font-semibold text-muted opacity-70 cursor-not-allowed"
          >
            <span>Continue with Google</span>
            <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1">
              <Clock size={11} />
              <span>Coming Soon</span>
            </span>
          </button>

          <button
            type="button"
            disabled
            className="w-full flex items-center justify-between rounded-lg border border-line bg-slate-50 px-4 py-2.5 text-xs font-semibold text-muted opacity-70 cursor-not-allowed"
          >
            <span>Email OTP / Magic Code</span>
            <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1">
              <Clock size={11} />
              <span>Coming Soon</span>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
