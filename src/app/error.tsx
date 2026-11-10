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
    console.error("App runtime error:", error);
  }, [error]);

  return (
    <div className="container-x py-20 flex flex-col items-center justify-center text-center">
      <div className="h-16 w-16 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 mb-4">
        <AlertTriangle size={32} />
      </div>
      <h1 className="text-2xl font-bold font-display">Something went wrong</h1>
      <p className="mt-2 text-sm text-muted max-w-md">
        Please make sure you are signed in with an authorized account or try reloading the page.
      </p>
      <div className="mt-6 flex flex-wrap gap-3 justify-center">
        <button onClick={() => reset()} className="btn-primary btn-sm">
          Try again
        </button>
        <Link href="/login" className="btn-outline btn-sm">
          Sign In
        </Link>
        <Link href="/" className="btn-outline btn-sm">
          Go to Homepage
        </Link>
      </div>
    </div>
  );
}

