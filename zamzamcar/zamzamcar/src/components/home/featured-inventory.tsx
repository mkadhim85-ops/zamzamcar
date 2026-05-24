"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { CarCard } from "@/components/cars/car-card";
import { FEATURED_INVENTORY, getPriceDollars } from "@/lib/data/inventory";
import { cn } from "@/lib/utils/cn";
import type { DisplayCar } from "@/types/ui";

type TabId = "all" | "featured" | "under-12k" | "suv" | "great-deals" | "clean-title";

interface Tab {
  id: TabId;
  label: string;
  filter: (car: DisplayCar) => boolean;
}

const TABS: Tab[] = [
  { id: "all", label: "All vehicles", filter: () => true },
  { id: "featured", label: "Featured", filter: (c) => c.marketingBadges.length > 0 || c.dealRating === "great" },
  { id: "under-12k", label: "Under $12K", filter: (c) => getPriceDollars(c) < 12000 },
  { id: "suv", label: "SUV / Crossover", filter: (c) => c.bodyStyle === "suv" },
  { id: "great-deals", label: "Great Deals", filter: (c) => c.dealRating === "great" },
  { id: "clean-title", label: "Clean Title", filter: (c) => c.titleStatus === "clean" },
];

interface Props {
  cars?: DisplayCar[];
}

/**
 * Featured inventory grid section.
 *
 * Accepts cars as a prop so the page can fetch them server-side; falls back
 * to mock inventory for design preview. The tab filtering happens client-side
 * since there are only ~6 featured cars — server round-trip per tab change
 * would be wasted bandwidth.
 */
export function FeaturedInventory({ cars = FEATURED_INVENTORY }: Props) {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<TabId>("all");

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const activeTabConfig = TABS.find((t) => t.id === activeTab)!;
  const visibleCars = cars.filter(activeTabConfig.filter);

  return (
    <section
      className="bg-white py-12 lg:py-16 px-4 lg:px-8"
      aria-labelledby="inventory-heading"
    >
      <div className="max-w-7xl mx-auto">
        <Header />

        <TabBar
          tabs={TABS}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          counts={Object.fromEntries(TABS.map((t) => [t.id, cars.filter(t.filter).length])) as Record<TabId, number>}
        />

        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6"
          itemScope
          itemType="https://schema.org/ItemList"
        >
          <AnimatePresence mode="popLayout">
            {visibleCars.map((car, i) => (
              <CarCard
                key={car.id}
                car={car}
                index={i}
                onFavorite={toggleFavorite}
                isFavorited={favorites.has(car.id)}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

function Header() {
  return (
    <header className="flex items-end justify-between flex-wrap gap-4 mb-8">
      <div>
        <div className="inline-flex items-center gap-2 mb-3">
          <span className="w-6 h-px bg-emerald-600" />
          <span className="text-[11px] tracking-wider uppercase text-emerald-700 font-black">
            Featured Inventory
          </span>
        </div>
        <h2 id="inventory-heading" className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-[1.1] max-w-2xl">
          Used cars for sale in <span className="text-emerald-600">South Salt Lake</span>
        </h2>
        <p className="mt-3 text-slate-600 max-w-2xl">
          Every car shows the exact Out-the-Door price including 7.65% Utah tax and fees — no calculations needed.
        </p>
      </div>

      <Link
        href="/inventory"
        className="group inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-bold transition-all shadow-md hover:shadow-lg"
      >
        View all 120+ vehicles
        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" strokeWidth={2.5} aria-hidden="true" />
      </Link>
    </header>
  );
}

function TabBar({
  tabs,
  activeTab,
  onTabChange,
  counts,
}: {
  tabs: Tab[];
  activeTab: TabId;
  onTabChange: (id: TabId) => void;
  counts: Record<TabId, number>;
}) {
  return (
    <div className="flex gap-1.5 mb-6 overflow-x-auto pb-2 -mx-1 px-1" role="tablist">
      {tabs.map((tab) => {
        const active = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            role="tab"
            aria-selected={active}
            className={cn(
              "flex-shrink-0 inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-sm font-bold transition-all",
              active
                ? "bg-slate-900 text-white shadow-md"
                : "bg-white text-slate-700 hover:bg-slate-50 border-2 border-slate-200",
            )}
          >
            {tab.label}
            <span
              className={cn(
                "text-[10px] font-mono px-1.5 py-0.5 rounded",
                active ? "bg-white/20" : "bg-slate-100 text-slate-500",
              )}
            >
              {counts[tab.id]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
