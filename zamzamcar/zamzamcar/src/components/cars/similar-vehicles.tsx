"use client";

import { useState } from "react";
import { CarCard } from "@/components/cars/car-card";
import type { DisplayCar } from "@/types/ui";
import { getPriceDollars } from "@/lib/data/inventory";

interface Props {
  /** Current car (excluded from results) */
  currentCar: DisplayCar;
  /** Full inventory to filter from */
  inventory: DisplayCar[];
  /** Max results to show */
  limit?: number;
}

/**
 * Similar vehicles section for the car detail page.
 *
 * "Similar" is defined by either:
 *   1. Same body style (most common case)
 *   2. Within ±25% price range (for shoppers who care more about budget)
 *
 * Returns at most `limit` cars (default 3), ordered by relevance score:
 *   - +3 points for same body style
 *   - +2 points for same make
 *   - +1 point for similar price (within ±20%)
 *
 * If we don't have enough good matches, we just don't show the section —
 * better than padding with dissimilar cars to hit a target count.
 */
export function SimilarVehicles({ currentCar, inventory, limit = 3 }: Props) {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const currentPrice = getPriceDollars(currentCar);

  const similar = inventory
    .filter((c) => c.id !== currentCar.id) // Exclude current
    .filter((c) => c.status === "available")
    .map((c) => ({
      car: c,
      score: scoreSimilarity(c, currentCar, currentPrice),
    }))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.car);

  if (similar.length === 0) return null;

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <section
      className="bg-slate-50 py-12 lg:py-16 px-4 lg:px-8 mt-12"
      aria-labelledby="similar-heading"
    >
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="w-6 h-px bg-emerald-600" />
            <span className="text-[11px] tracking-wider uppercase text-emerald-700 font-black">
              You might also like
            </span>
          </div>
          <h2 id="similar-heading" className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
            Similar <span className="text-emerald-600">vehicles</span>
          </h2>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
          {similar.map((car, i) => (
            <CarCard
              key={car.id}
              car={car}
              index={i}
              onFavorite={toggleFavorite}
              isFavorited={favorites.has(car.id)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function scoreSimilarity(candidate: DisplayCar, current: DisplayCar, currentPrice: number): number {
  let score = 0;

  if (candidate.bodyStyle === current.bodyStyle) score += 3;
  if (candidate.make === current.make) score += 2;

  const candidatePrice = getPriceDollars(candidate);
  const priceDiff = Math.abs(candidatePrice - currentPrice) / currentPrice;
  if (priceDiff <= 0.2) score += 1;

  return score;
}
