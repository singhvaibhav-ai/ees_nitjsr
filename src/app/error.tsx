"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // If it's Next.js internal redirect, let Next.js handle it
    if (error?.message === "NEXT_REDIRECT" || error?.digest?.startsWith("NEXT_REDIRECT")) {
      return;
    }
    console.error("App runtime error:", error);
  }, [error]);

  if (error?.message === "NEXT_REDIRECT" || error?.digest?.startsWith("NEXT_REDIRECT")) {
    return null;
  }

  return (
    <div className="container-x py-20 flex flex-col items-center justify-center text-center">
      <div className="h-16 w-16 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 mb-4">
        <AlertTriangle size={32} />
      </div>
      <h1 className="text-2xl font-bold font-display">Something went wrong</h1>
      <p className="mt-2 text-sm text-muted max-w-md">
        {error?.message && error.message !== "NEXT_REDIRECT"
          ? error.message
          : "An unexpected error occurred while loading this page. Please try again."}
      </p>
      <div className="mt-6 flex flex-wrap gap-3 justify-center">
        <button onClick={() => reset()} className="btn-primary btn-sm">
          Try again
        </button>
        <Link href="/admin" className="btn-outline btn-sm">
          Admin Dashboard
        </Link>
        <Link href="/" className="btn-outline btn-sm">
          Go to Homepage
        </Link>
      </div>
    </div>
  );
}
