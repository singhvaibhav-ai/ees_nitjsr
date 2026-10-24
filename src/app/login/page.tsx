import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const { next, error } = await searchParams;
  const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
  return (
    <div className="container-x flex justify-center py-16">
      <div className="card w-full max-w-md">
        <p className="eyebrow">Welcome</p>
        <h1 className="mt-1 text-3xl font-bold">Sign in to EES</h1>
        <p className="mt-2 text-sm text-muted">
          NIT Jamshedpur students: use your college email, like <b>2024ugee007@nitjsr.ac.in</b>. Your batch and
          branch are filled in from it. Everyone else can use any email.
        </p>
        <LoginForm next={safeNext} initialError={error} />
      </div>
    </div>
  );
}
