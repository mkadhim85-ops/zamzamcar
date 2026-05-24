"use client";

import { useEffect } from "react";
import { RefreshCw, Phone, AlertTriangle } from "lucide-react";
import { DEALER } from "@/lib/config";

/**
 * Root error boundary.
 *
 * Triggered when an unrecoverable error happens in a Server Component or
 * Client Component below it. Provides a way to recover (the `reset` callback)
 * and a fallback contact CTA for customers.
 *
 * Must be a Client Component because it uses hooks.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to your error tracking service (Sentry, Datadog, etc.)
    console.error("[homepage] Unhandled error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl border-2 border-slate-200 p-8 shadow-lg">
        <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center mb-5">
          <AlertTriangle className="w-6 h-6 text-rose-600" strokeWidth={2} />
        </div>

        <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
          Something went wrong
        </h1>
        <p className="text-slate-600 mb-6 leading-relaxed">
          We hit an unexpected problem loading this page. Try refreshing — if it keeps
          happening, give us a call and we&apos;ll help you directly.
        </p>

        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={reset}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-lg transition-all"
          >
            <RefreshCw className="w-4 h-4" strokeWidth={2.5} />
            Try again
          </button>
          <a
            href={`tel:${DEALER.phoneRaw}`}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg transition-all"
          >
            <Phone className="w-4 h-4" strokeWidth={2.5} />
            Call {DEALER.phone}
          </a>
        </div>

        {error.digest && (
          <p className="mt-5 text-[10px] text-slate-400 font-mono">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
