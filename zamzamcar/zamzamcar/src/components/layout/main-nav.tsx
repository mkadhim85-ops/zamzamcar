import Link from "next/link";
import { Phone } from "lucide-react";
import { DEALER } from "@/lib/config";

const NAV_LINKS = [
  { href: "/inventory", label: "Inventory" },
  { href: "/financing", label: "Financing" },
  { href: "/trade-in", label: "Trade-In" },
  { href: "/sell-your-car", label: "Sell Your Car" },
  { href: "/about", label: "About" },
];

/**
 * Main navigation bar.
 *
 * Sticky-positioned at the top once scrolled past the top bar.
 * The right side prioritizes the click-to-call button — by far our highest
 * converting CTA on mobile.
 */
export function MainNav() {
  return (
    <nav
      className="bg-white border-b border-slate-200 sticky top-0 z-30 backdrop-blur-md bg-white/95"
      aria-label="Primary navigation"
    >
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-3 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3 flex-shrink-0">
          <div className="w-11 h-11 bg-slate-900 rounded-lg flex items-center justify-center shadow-md">
            <span className="text-white font-black text-lg tracking-tight">Z</span>
          </div>
          <div>
            <div className="text-base lg:text-lg font-black text-slate-900 tracking-tight leading-none">
              {DEALER.name}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1 font-medium">
              <span>Trusted dealer since {DEALER.established}</span>
              <span className="hidden sm:inline" aria-hidden="true">•</span>
              <span className="hidden sm:inline">{DEALER.city}, {DEALER.state}</span>
            </div>
          </div>
        </Link>

        <ul className="hidden lg:flex items-center gap-7 text-sm font-semibold text-slate-700">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="hover:text-emerald-700 transition-colors">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <a
          href={`tel:${DEALER.phoneRaw}`}
          className="inline-flex items-center gap-2 px-3 lg:px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-bold transition-all shadow-md hover:shadow-lg"
        >
          <Phone className="w-3.5 h-3.5" strokeWidth={2.5} aria-hidden="true" />
          <span className="hidden sm:inline font-mono">{DEALER.phone}</span>
          <span className="sm:hidden">Call</span>
        </a>
      </div>
    </nav>
  );
}
