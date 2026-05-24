import Link from "next/link";
import { Car, ArrowRight, Phone } from "lucide-react";
import { TopBar } from "@/components/layout/top-bar";
import { MainNav } from "@/components/layout/main-nav";
import { Footer } from "@/components/layout/footer";
import { DEALER } from "@/lib/config";

/**
 * "Vehicle not found" page.
 *
 * Triggered when generateStaticParams doesn't include the requested stock
 * number AND the car isn't in our mock inventory.
 *
 * In production this most often happens when:
 *   1. A car was sold and the stock # is no longer active
 *   2. A buyer is following an old bookmark
 *   3. Bots probing for random URLs
 *
 * Strategy: don't dead-end the user. Push them back to active inventory
 * and offer a phone CTA in case they saw a specific car somewhere and
 * want to ask if it's still available.
 */
export default function CarNotFound() {
  return (
    <>
      <TopBar />
      <MainNav />

      <main className="min-h-[60vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center mb-6">
            <Car className="w-8 h-8 text-slate-400" strokeWidth={1.5} aria-hidden="true" />
          </div>

          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-3">
            Vehicle no longer available
          </h1>
          <p className="text-slate-600 leading-relaxed mb-8">
            This car may have been sold or moved off our lot. Browse our current inventory of
            120+ available vehicles, or call us — we may have something similar coming in soon.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/inventory"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white text-sm font-black rounded-lg transition-all shadow-md hover:shadow-lg"
            >
              Browse all inventory
              <ArrowRight className="w-4 h-4" strokeWidth={2.5} aria-hidden="true" />
            </Link>
            <a
              href={`tel:${DEALER.phoneRaw}`}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-black rounded-lg transition-all shadow-md hover:shadow-lg"
            >
              <Phone className="w-4 h-4" strokeWidth={2.5} aria-hidden="true" />
              Call {DEALER.phone}
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
