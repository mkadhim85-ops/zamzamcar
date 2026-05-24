"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Phone, Mail, MessageCircle, Calendar, Heart, Share2,
  Eye, Clock, MapPin, BadgeCheck, ChevronRight, Send,
} from "lucide-react";
import { CarGurusBadge } from "@/components/ui/cargurus-badge";
import { TitleBadge } from "@/components/ui/title-badge";
import { CarFaxBadge } from "@/components/ui/carfax-badge";
import { OTDBreakdown } from "@/components/cars/otd-breakdown";
import { formatPrice, formatNumber, formatRelativeDays } from "@/lib/utils/format";
import { getPriceDollars } from "@/lib/data/inventory";
import { DEALER } from "@/lib/config";
import type { DisplayCar } from "@/types/ui";

interface Props {
  car: DisplayCar;
}

/**
 * Car detail page sidebar.
 *
 * The "conversion column" — every element here either supports the price
 * (badges, savings) or pushes toward an action (call, text, schedule).
 *
 * Stacks vertically:
 *   1. Vehicle title (h1 for SEO)
 *   2. Badges row (CarGurus + Title + CARFAX)
 *   3. Price block with savings indicator
 *   4. OTD breakdown
 *   5. Action buttons (call/text/email)
 *   6. Schedule test drive
 *   7. Lot location reminder
 *
 * Should be wrapped with `sticky top-X` on desktop in the page layout
 * so it follows the user as they scroll through specs and gallery.
 */
export function CarDetailSidebar({ car }: Props) {
  const dollars = getPriceDollars(car);
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <aside className="space-y-4" aria-label="Vehicle pricing and contact">
      <Header car={car} />

      <BadgesRow car={car} />

      <CarFaxBadge accidents={car.accidents} />

      <PriceBlock car={car} dollars={dollars} />

      <OTDBreakdown basePrice={dollars} variant="full" />

      <ActionButtons onContactClick={() => setContactOpen(true)} />

      <ScheduleTestDrive />

      <LocationReminder />

      <AnimatePresence>
        {contactOpen && <ContactModal onClose={() => setContactOpen(false)} car={car} />}
      </AnimatePresence>
    </aside>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────

function Header({ car }: { car: DisplayCar }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2 text-[11px] text-slate-500 uppercase tracking-wider font-bold">
        <span className="font-mono text-slate-700">{car.year}</span>
        <span aria-hidden="true">•</span>
        <span>{car.bodyStyle}</span>
        <span aria-hidden="true">•</span>
        <span>{car.exteriorColor}</span>
      </div>

      <h1
        className="text-2xl lg:text-3xl font-black text-slate-900 leading-[1.1] tracking-tight"
        itemProp="name"
      >
        {car.year} {car.make} {car.model}
        {car.trim && (
          <span className="block text-lg lg:text-xl text-slate-600 font-bold mt-1">{car.trim}</span>
        )}
      </h1>

      <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <Eye className="w-3 h-3" strokeWidth={2} aria-hidden="true" />
          {formatNumber(car.viewCount)} views
        </span>
        <span className="text-slate-300" aria-hidden="true">•</span>
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" strokeWidth={2} aria-hidden="true" />
          Listed {formatRelativeDays(car.daysListed)}
        </span>
        <span className="text-slate-300" aria-hidden="true">•</span>
        <span className="font-mono">Stock #{car.stockNumber}</span>
      </div>
    </div>
  );
}

function BadgesRow({ car }: { car: DisplayCar }) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <CarGurusBadge rating={car.dealRating} score={car.dealScore} />
      <TitleBadge status={car.titleStatus} />
      {car.marketingBadges.includes("one-owner") && (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-900 text-white text-[11px] font-bold tracking-tight rounded-md">
          <BadgeCheck className="w-3 h-3" strokeWidth={2.5} />
          1-Owner
        </span>
      )}
    </div>
  );
}

function PriceBlock({ car, dollars }: { car: DisplayCar; dollars: number }) {
  return (
    <div
      className="bg-slate-50 border border-slate-200 rounded-2xl p-5"
      itemProp="offers"
      itemScope
      itemType="https://schema.org/Offer"
    >
      <meta itemProp="priceCurrency" content="USD" />
      <div className="text-[10px] uppercase tracking-wider text-slate-600 font-bold mb-1">
        Sale Price
      </div>
      <div className="flex items-baseline gap-2 flex-wrap">
        <span
          className="text-4xl font-black text-slate-900 tracking-tight font-mono"
          itemProp="price"
          content={String(dollars)}
        >
          {formatPrice(dollars)}
        </span>
        {car.marketAverage > dollars && (
          <span className="text-sm text-slate-400 line-through font-mono">
            Market avg {formatPrice(car.marketAverage)}
          </span>
        )}
      </div>

      {car.savings > 0 && (
        <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 bg-emerald-50 border border-emerald-200 rounded-md">
          <span className="text-[11px] font-bold text-emerald-700">
            You save {formatPrice(car.savings)} below market
          </span>
        </div>
      )}
    </div>
  );
}

function ActionButtons({ onContactClick }: { onContactClick: () => void }) {
  return (
    <div className="space-y-2">
      <a
        href={`tel:${DEALER.phoneRaw}`}
        className="w-full inline-flex items-center justify-center gap-2 px-4 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-black rounded-lg transition-all shadow-md hover:shadow-lg"
      >
        <Phone className="w-4 h-4" strokeWidth={2.5} />
        Call {DEALER.phone}
      </a>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={onContactClick}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-lg transition-all"
        >
          <Mail className="w-3.5 h-3.5" strokeWidth={2.5} />
          Email
        </button>
        <a
          href={`sms:${DEALER.phoneRaw}`}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-lg transition-all"
        >
          <MessageCircle className="w-3.5 h-3.5" strokeWidth={2.5} />
          Text
        </a>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button className="inline-flex items-center justify-center gap-1.5 px-3 py-2 border-2 border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-bold rounded-lg transition-all">
          <Heart className="w-3.5 h-3.5" strokeWidth={2.5} />
          Save
        </button>
        <button className="inline-flex items-center justify-center gap-1.5 px-3 py-2 border-2 border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-bold rounded-lg transition-all">
          <Share2 className="w-3.5 h-3.5" strokeWidth={2.5} />
          Share
        </button>
      </div>
    </div>
  );
}

function ScheduleTestDrive() {
  return (
    <a
      href="/schedule-test-drive"
      className="group block bg-white border-2 border-slate-200 hover:border-emerald-600 rounded-xl p-4 transition-all"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-emerald-50 group-hover:bg-emerald-600 flex items-center justify-center transition-colors flex-shrink-0">
          <Calendar
            className="w-5 h-5 text-emerald-600 group-hover:text-white transition-colors"
            strokeWidth={2}
            aria-hidden="true"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-black text-slate-900 tracking-tight">Schedule a test drive</div>
          <div className="text-xs text-slate-600 mt-0.5">Visit our lot — usually under 30 minutes</div>
        </div>
        <ChevronRight
          className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all flex-shrink-0"
          strokeWidth={2.5}
          aria-hidden="true"
        />
      </div>
    </a>
  );
}

function LocationReminder() {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
      <div className="flex items-start gap-2">
        <MapPin className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" strokeWidth={2.5} aria-hidden="true" />
        <div className="flex-1">
          <div className="text-xs text-slate-700 font-semibold mb-1">See it in person at our lot</div>
          <div className="text-xs text-slate-600 leading-relaxed">
            {DEALER.address}, {DEALER.city}, {DEALER.state} {DEALER.zip}
          </div>
          <a
            href={DEALER.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 mt-2 text-xs font-bold text-emerald-700 hover:text-emerald-800"
          >
            Get directions
            <ChevronRight className="w-3 h-3" strokeWidth={2.5} aria-hidden="true" />
          </a>
        </div>
      </div>
    </div>
  );
}

function ContactModal({ onClose, car }: { onClose: () => void; car: DisplayCar }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="contact-modal-title"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl"
      >
        <h3 id="contact-modal-title" className="text-xl font-black text-slate-900 tracking-tight mb-1">
          Ask about this car
        </h3>
        <p className="text-sm text-slate-600 mb-5">
          {car.year} {car.make} {car.model} {car.trim} · Stock #{car.stockNumber}
        </p>

        <div className="space-y-3">
          <input
            type="text"
            placeholder="Your name"
            className="w-full px-3 py-2.5 border-2 border-slate-200 focus:border-slate-900 rounded-lg text-sm outline-none"
          />
          <input
            type="email"
            placeholder="Email address"
            className="w-full px-3 py-2.5 border-2 border-slate-200 focus:border-slate-900 rounded-lg text-sm outline-none"
          />
          <input
            type="tel"
            placeholder="Phone (optional)"
            className="w-full px-3 py-2.5 border-2 border-slate-200 focus:border-slate-900 rounded-lg text-sm outline-none font-mono"
          />
          <textarea
            placeholder="Your question..."
            rows={4}
            className="w-full px-3 py-2.5 border-2 border-slate-200 focus:border-slate-900 rounded-lg text-sm outline-none resize-none"
            defaultValue={`Hi, I'm interested in the ${car.year} ${car.make} ${car.model} (stock #${car.stockNumber}). Is it still available?`}
          />
        </div>

        <div className="mt-5 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border-2 border-slate-200 hover:border-slate-300 text-slate-700 text-sm font-bold rounded-lg transition-all"
          >
            Cancel
          </button>
          <button className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg transition-all">
            <Send className="w-3.5 h-3.5" strokeWidth={2.5} />
            Send message
          </button>
        </div>

        <p className="mt-3 text-[10px] text-slate-500 text-center">
          We typically reply within 30 minutes during business hours.
        </p>
      </motion.div>
    </motion.div>
  );
}
