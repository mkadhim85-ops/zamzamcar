"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Sparkles, Calculator, Filter, CheckCircle2, ChevronDown,
  Car, BadgeCheck, DollarSign, Calendar, Gauge, ShieldCheck, X,
  Star, Clock,
} from "lucide-react";
import { DEALER, FILTERS, AI_SEARCH_SUGGESTIONS } from "@/lib/config";
import { calculateOTD } from "@/lib/utils/otd";
import { formatPriceCents, formatPrice } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

const SAMPLE_PRICE = 11990;

/**
 * Hero section.
 *
 * Three logical zones:
 *   1. Left: H1, supporting copy, value-prop checkmarks
 *   2. Right: Sample OTD calculator (transparent pricing demo)
 *   3. Bottom: Advanced 5-field filter widget + 4 trust stats
 *
 * Marked "use client" because of the filter dropdowns and rotating AI suggestions.
 * If we ever needed pure SSR for SEO, the H1 and filter HTML are static enough
 * to render server-side first, with progressive enhancement layered on.
 */
export function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-slate-50 via-white to-slate-50 border-b border-slate-200">
      <BackgroundPattern />

      <div className="relative max-w-7xl mx-auto px-4 lg:px-8 pt-10 lg:pt-14 pb-8">
        <div className="grid lg:grid-cols-[1.5fr_1fr] gap-10 lg:gap-14 items-center mb-8">
          <HeroCopy />
          <SampleOTDCard />
        </div>

        <FilterWidget />
        <TrustStats />
      </div>
    </section>
  );
}

function BackgroundPattern() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none opacity-[0.04]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000' fill-opacity='1'%3E%3Cpath d='M0 0h1v1H0z'/%3E%3C/g%3E%3C/svg%3E")`,
      }}
    />
  );
}

function HeroCopy() {
  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full mb-5 shadow-sm"
      >
        <span className="relative flex w-1.5 h-1.5">
          <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75 animate-ping" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
        </span>
        <span className="text-[10px] tracking-wider uppercase text-emerald-800 font-bold">
          120+ vehicles in stock · Open today
        </span>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.1 }}
        className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 leading-[1.05] tracking-tight"
      >
        Quality used cars,
        <br />
        <span className="text-emerald-600">honest prices</span> in Utah.
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="mt-4 text-base lg:text-lg text-slate-600 max-w-xl leading-relaxed"
      >
        Affordable pre-owned vehicles in {DEALER.city}. Free CARFAX on every car,
        transparent Out-the-Door pricing, and financing for all credit situations.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-700 font-medium"
      >
        {[
          "Free CARFAX history",
          "No-haggle OTD pricing",
          "All credit approved",
        ].map((label) => (
          <div key={label} className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" strokeWidth={2.5} />
            {label}
          </div>
        ))}
      </motion.div>
    </div>
  );
}

function SampleOTDCard() {
  const otd = calculateOTD(SAMPLE_PRICE);

  return (
    <motion.aside
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.7, delay: 0.3 }}
      className="bg-white rounded-2xl border-2 border-slate-200 shadow-xl shadow-slate-900/10 overflow-hidden"
      aria-labelledby="sample-otd-heading"
    >
      <header className="bg-slate-900 px-5 py-3 text-white">
        <div className="flex items-center gap-2">
          <Calculator className="w-4 h-4" strokeWidth={2.5} aria-hidden="true" />
          <h2 id="sample-otd-heading" className="text-xs uppercase tracking-wider font-bold">
            Sample Out-the-Door Math
          </h2>
        </div>
        <p className="text-[11px] text-slate-300 mt-0.5">
          For a {formatPrice(SAMPLE_PRICE)} vehicle in Utah
        </p>
      </header>

      <div className="p-5">
        <dl className="space-y-1.5 font-mono text-xs mb-3">
          <div className="flex justify-between">
            <dt className="text-slate-600">Sale price</dt>
            <dd className="text-slate-900 font-bold">{formatPriceCents(otd.basePrice)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-600">+ Utah tax (7.65%)</dt>
            <dd className="text-slate-900 font-bold">{formatPriceCents(otd.salesTax)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-600">+ Doc fee</dt>
            <dd className="text-slate-900 font-bold">{formatPriceCents(otd.docFee)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-600">+ License/Title/Reg.</dt>
            <dd className="text-slate-900 font-bold">{formatPriceCents(otd.licenseFee)}</dd>
          </div>
        </dl>

        <div className="bg-emerald-50 border-2 border-emerald-200 rounded-lg p-3 flex items-baseline justify-between">
          <span className="text-[10px] font-bold text-emerald-900 uppercase tracking-wider">
            You pay
          </span>
          <span className="font-mono text-xl font-black text-emerald-700">
            {formatPriceCents(otd.total)}
          </span>
        </div>

        <p className="mt-3 flex items-start gap-1.5 text-[11px] text-slate-600 leading-relaxed">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
          <span>Exactly what you'll pay. Guaranteed in writing — no surprises at signing.</span>
        </p>
      </div>
    </motion.aside>
  );
}

// ── Filter Widget ───────────────────────────────────────────────────────────

function FilterWidget() {
  const [filters, setFilters] = useState({
    bodyType: "Any",
    make: "Any",
    price: "Any",
    year: "Any",
    mileage: "Any",
  });
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [activeSuggestion, setActiveSuggestion] = useState(0);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (isFocused) return;
    const id = setInterval(() => {
      setActiveSuggestion((p) => (p + 1) % AI_SEARCH_SUGGESTIONS.length);
    }, 2800);
    return () => clearInterval(id);
  }, [isFocused]);

  const updateFilter = (key: keyof typeof filters, value: string) =>
    setFilters((p) => ({ ...p, [key]: value }));

  const activeCount = Object.values(filters).filter((v) => v !== "Any").length;
  const clearAll = () =>
    setFilters({ bodyType: "Any", make: "Any", price: "Any", year: "Any", mileage: "Any" });

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.5 }}
      className="bg-white rounded-2xl border-2 border-slate-200 shadow-xl shadow-slate-900/10 overflow-hidden"
    >
      <div className="bg-slate-900 px-5 py-3 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-emerald-400" strokeWidth={2.5} aria-hidden="true" />
          <h2 className="text-sm font-bold text-white tracking-tight">Find Your Next Vehicle</h2>
          {activeCount > 0 && (
            <span className="ml-1 px-1.5 py-0.5 bg-emerald-500 text-white text-[10px] font-bold rounded">
              {activeCount} active
            </span>
          )}
        </div>
        <div className="text-[11px] text-slate-400 font-mono">120+ matching vehicles</div>
      </div>

      <div className="p-4 lg:p-5">
        <div className="relative mb-4">
          <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" strokeWidth={2.5} aria-hidden="true" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="w-full bg-slate-50 border-2 border-slate-200 hover:border-slate-300 focus:border-slate-900 rounded-lg pl-11 pr-28 py-3 text-sm text-slate-900 outline-none transition-all"
            aria-label="AI-powered vehicle search"
          />
          {!query && (
            <div className="absolute left-11 top-1/2 -translate-y-1/2 pointer-events-none">
              <AnimatePresence mode="wait">
                <motion.span
                  key={activeSuggestion}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.4 }}
                  className="text-sm text-slate-400"
                >
                  Try &ldquo;{AI_SEARCH_SUGGESTIONS[activeSuggestion]}&rdquo;
                </motion.span>
              </AnimatePresence>
            </div>
          )}
          <button
            className="absolute right-1.5 top-1/2 -translate-y-1/2 inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-bold transition-all"
          >
            <Search className="w-3.5 h-3.5" strokeWidth={2.5} aria-hidden="true" />
            Search
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          <Dropdown
            label="Body Type" value={filters.bodyType} options={FILTERS.BODY_TYPES} icon={Car}
            onChange={(v) => updateFilter("bodyType", v)}
            isOpen={openDropdown === "bodyType"}
            onToggle={() => setOpenDropdown(openDropdown === "bodyType" ? null : "bodyType")}
            onClose={() => setOpenDropdown(null)}
          />
          <Dropdown
            label="Make" value={filters.make} options={FILTERS.MAKES} icon={BadgeCheck}
            onChange={(v) => updateFilter("make", v)}
            isOpen={openDropdown === "make"}
            onToggle={() => setOpenDropdown(openDropdown === "make" ? null : "make")}
            onClose={() => setOpenDropdown(null)}
          />
          <Dropdown
            label="Price" value={filters.price} options={FILTERS.PRICE_RANGES} icon={DollarSign}
            onChange={(v) => updateFilter("price", v)}
            isOpen={openDropdown === "price"}
            onToggle={() => setOpenDropdown(openDropdown === "price" ? null : "price")}
            onClose={() => setOpenDropdown(null)}
          />
          <Dropdown
            label="Year" value={filters.year} options={FILTERS.YEAR_RANGES} icon={Calendar}
            onChange={(v) => updateFilter("year", v)}
            isOpen={openDropdown === "year"}
            onToggle={() => setOpenDropdown(openDropdown === "year" ? null : "year")}
            onClose={() => setOpenDropdown(null)}
          />
          <Dropdown
            label="Mileage" value={filters.mileage} options={FILTERS.MILEAGE_RANGES} icon={Gauge}
            onChange={(v) => updateFilter("mileage", v)}
            isOpen={openDropdown === "mileage"}
            onToggle={() => setOpenDropdown(openDropdown === "mileage" ? null : "mileage")}
            onClose={() => setOpenDropdown(null)}
          />
        </div>

        <div className="mt-3 flex items-center justify-between flex-wrap gap-2 pt-3 border-t border-slate-100">
          <div className="text-[11px] text-slate-500">
            <span className="font-semibold">Popular:</span>
            <button className="ml-1.5 text-emerald-700 hover:text-emerald-800 font-semibold">
              SUVs Under $15K
            </button>
            <span className="mx-1.5 text-slate-300">•</span>
            <button className="text-emerald-700 hover:text-emerald-800 font-semibold">
              AWD Vehicles
            </button>
            <span className="mx-1.5 text-slate-300">•</span>
            <button className="text-emerald-700 hover:text-emerald-800 font-semibold">
              Low Mileage
            </button>
          </div>
          {activeCount > 0 && (
            <button
              onClick={clearAll}
              className="text-[11px] text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-1"
            >
              <X className="w-3 h-3" strokeWidth={2.5} aria-hidden="true" />
              Clear filters
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

interface DropdownProps {
  label: string;
  value: string;
  options: readonly string[];
  icon?: typeof Car;
  onChange: (value: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

function Dropdown({
  label, value, options, icon: Icon, onChange, isOpen, onToggle, onClose,
}: DropdownProps) {
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        className={cn(
          "w-full flex items-center gap-2 px-3 py-2.5 bg-white border-2 rounded-lg text-left transition-all hover:border-slate-400",
          isOpen ? "border-slate-900 ring-2 ring-slate-900/10" : "border-slate-200",
        )}
      >
        {Icon && (
          <Icon className="w-4 h-4 text-slate-500 flex-shrink-0" strokeWidth={2} aria-hidden="true" />
        )}
        <div className="flex-1 min-w-0">
          <div className="text-[9px] uppercase tracking-wider text-slate-500 font-bold leading-none mb-0.5">
            {label}
          </div>
          <div className="text-sm font-bold text-slate-900 truncate leading-tight">{value}</div>
        </div>
        <ChevronDown
          className={cn("w-4 h-4 text-slate-400 flex-shrink-0 transition-transform", isOpen && "rotate-180")}
          strokeWidth={2}
          aria-hidden="true"
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-30" onClick={onClose} aria-hidden="true" />
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="absolute z-40 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-2xl shadow-slate-900/15 overflow-hidden max-h-72 overflow-y-auto"
            >
              {options.map((option) => (
                <button
                  key={option}
                  onClick={() => { onChange(option); onClose(); }}
                  className={cn(
                    "w-full px-3 py-2 text-left text-sm font-medium transition-colors",
                    value === option ? "bg-emerald-50 text-emerald-900" : "text-slate-700 hover:bg-slate-50",
                  )}
                >
                  {option}
                  {value === option && (
                    <CheckCircle2 className="w-3.5 h-3.5 inline ml-1.5 text-emerald-600" strokeWidth={2.5} aria-hidden="true" />
                  )}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function TrustStats() {
  const stats = [
    { value: "120+", label: "Vehicles in stock", Icon: Car },
    { value: "4.8★", label: "312 Google reviews", Icon: Star },
    { value: "15+", label: "Lenders, all credit", Icon: BadgeCheck },
    { value: "< 2hr", label: "Avg. drive-home time", Icon: Clock },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.7 }}
      className="mt-8 lg:mt-10 grid grid-cols-2 lg:grid-cols-4 gap-px bg-slate-200 rounded-xl overflow-hidden border border-slate-200 shadow-sm"
    >
      {stats.map(({ value, label, Icon }) => (
        <div key={label} className="bg-white px-4 lg:px-5 py-4">
          <Icon className="w-4 h-4 text-emerald-600 mb-1.5" strokeWidth={2} aria-hidden="true" />
          <div className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight">{value}</div>
          <div className="text-[10px] text-slate-500 mt-0.5 tracking-wide font-semibold uppercase">
            {label}
          </div>
        </div>
      ))}
    </motion.div>
  );
}
