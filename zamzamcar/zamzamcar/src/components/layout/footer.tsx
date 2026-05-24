import Link from "next/link";
import { MapPin, Phone, Mail } from "lucide-react";
import { DEALER } from "@/lib/config";

/**
 * Site footer.
 *
 * Includes Schema.org PostalAddress microdata that complements the JSON-LD
 * in the page head — Google reads both for redundancy. The "Open today" badge
 * is intentionally static here; the dynamic version would require a Client
 * Component, which isn't worth the cost for a footer element.
 */
export function Footer() {
  return (
    <footer
      className="bg-slate-900 text-slate-300 py-12 lg:py-16 px-4 lg:px-8"
      itemScope
      itemType="https://schema.org/AutoDealer"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-[1.5fr_1fr_1fr_1fr] gap-10 lg:gap-12 mb-10">
          <BrandColumn />
          <InventoryLinks />
          <ServicesLinks />
          <HoursColumn />
        </div>

        <div className="pt-6 border-t border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} {DEALER.name}. All rights reserved. Utah Dealer License.
          </div>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms of Sale
            </Link>
            <Link href="/sitemap.xml" className="hover:text-white transition-colors">
              Sitemap
            </Link>
            <Link href="/accessibility" className="hover:text-white transition-colors">
              Accessibility
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function BrandColumn() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-11 h-11 bg-emerald-600 rounded-lg flex items-center justify-center shadow-md">
          <span className="text-white font-black tracking-tight">Z</span>
        </div>
        <span className="text-lg font-black text-white tracking-tight" itemProp="name">
          {DEALER.name}
        </span>
      </div>
      <p className="text-sm text-slate-400 leading-relaxed mb-5 max-w-sm">
        Honest, affordable used cars in {DEALER.city}. Free vehicle history reports, transparent
        Out-the-Door pricing, all-credit financing.
      </p>

      <div className="space-y-2.5 text-sm">
        <div
          className="flex items-start gap-2"
          itemProp="address"
          itemScope
          itemType="https://schema.org/PostalAddress"
        >
          <MapPin
            className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0"
            strokeWidth={2}
            aria-hidden="true"
          />
          <div>
            <div className="text-white font-semibold">
              <span itemProp="streetAddress">{DEALER.address}</span>
            </div>
            <div className="text-slate-400">
              <span itemProp="addressLocality">{DEALER.city}</span>,{" "}
              <span itemProp="addressRegion">{DEALER.state}</span>{" "}
              <span itemProp="postalCode">{DEALER.zip}</span>
            </div>
          </div>
        </div>
        <a
          href={`tel:${DEALER.phoneRaw}`}
          className="flex items-center gap-2 text-white hover:text-emerald-400 transition-colors"
        >
          <Phone className="w-4 h-4 text-emerald-500 flex-shrink-0" strokeWidth={2} aria-hidden="true" />
          <span className="font-semibold font-mono" itemProp="telephone">
            {DEALER.phone}
          </span>
        </a>
        <a
          href={`mailto:${DEALER.email}`}
          className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
        >
          <Mail className="w-4 h-4 text-emerald-500 flex-shrink-0" strokeWidth={2} aria-hidden="true" />
          <span className="font-mono">{DEALER.email}</span>
        </a>
      </div>
    </div>
  );
}

function InventoryLinks() {
  return (
    <div>
      <h2 className="text-xs uppercase tracking-wider text-white font-black mb-4">Inventory</h2>
      <ul className="space-y-2.5 text-sm">
        <li><Link href="/inventory" className="hover:text-white transition-colors">All Vehicles</Link></li>
        <li><Link href="/inventory?price=Under+%2410K" className="hover:text-white transition-colors">Under $10,000</Link></li>
        <li><Link href="/inventory?body=SUV" className="hover:text-white transition-colors">SUVs &amp; Crossovers</Link></li>
        <li><Link href="/inventory?body=Sedan" className="hover:text-white transition-colors">Sedans</Link></li>
        <li><Link href="/inventory?body=Truck" className="hover:text-white transition-colors">Trucks</Link></li>
        <li><Link href="/inventory?fuel=Electric" className="hover:text-white transition-colors">Electric &amp; Hybrid</Link></li>
      </ul>
    </div>
  );
}

function ServicesLinks() {
  return (
    <div>
      <h2 className="text-xs uppercase tracking-wider text-white font-black mb-4">Services</h2>
      <ul className="space-y-2.5 text-sm">
        <li><Link href="/financing" className="hover:text-white transition-colors">Financing</Link></li>
        <li><Link href="/financing/bad-credit" className="hover:text-white transition-colors">Bad Credit Approval</Link></li>
        <li><Link href="/trade-in" className="hover:text-white transition-colors">Trade-In Value</Link></li>
        <li><Link href="/sell-your-car" className="hover:text-white transition-colors">Sell Your Car</Link></li>
        <li><Link href="/otd-calculator" className="hover:text-white transition-colors">Out-the-Door Calculator</Link></li>
        <li><Link href="/vehicle-history" className="hover:text-white transition-colors">Vehicle History Reports</Link></li>
      </ul>
    </div>
  );
}

function HoursColumn() {
  return (
    <div>
      <h2 className="text-xs uppercase tracking-wider text-white font-black mb-4">Hours</h2>
      <ul className="space-y-1.5 text-sm">
        <li className="flex justify-between gap-3">
          <span>Mon–Fri</span>
          <span className="text-white font-semibold font-mono">{DEALER.hours.weekday}</span>
        </li>
        <li className="flex justify-between gap-3">
          <span>Saturday</span>
          <span className="text-white font-semibold font-mono">{DEALER.hours.saturday}</span>
        </li>
        <li className="flex justify-between gap-3">
          <span>Sunday</span>
          <span className="text-slate-500 font-mono">{DEALER.hours.sunday}</span>
        </li>
      </ul>

      <div className="mt-5 p-3 bg-slate-800 rounded-lg border border-slate-700">
        <div className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold mb-1">
          Open today
        </div>
        <div className="text-sm text-white font-semibold">Come visit our lot</div>
      </div>
    </div>
  );
}
