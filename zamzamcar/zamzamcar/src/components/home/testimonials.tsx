"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Quote, BadgeCheck } from "lucide-react";
import { TESTIMONIALS, AGGREGATE_RATING } from "@/lib/data/content";
import { getInitials, formatRelativeDays } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

/**
 * Customer testimonials with rotating focus.
 *
 * Schema.org microdata is embedded for both the AggregateRating (sidebar)
 * and individual Reviews (carousel). Google reads both to show star ratings
 * in search results.
 *
 * The carousel rotates manually only — no auto-advance because:
 *   1. Auto-rotation is annoying when users want to read at their own pace
 *   2. It causes layout shifts on slower devices that hurt Core Web Vitals
 */
export function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = TESTIMONIALS[activeIndex];

  return (
    <section
      className="bg-white py-14 lg:py-20 px-4 lg:px-8"
      aria-labelledby="testimonials-heading"
      itemScope
      itemType="https://schema.org/AutoDealer"
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-[1fr_2fr] gap-10 lg:gap-14 items-start mb-10">
          <Sidebar />
          <Carousel
            active={active}
            activeIndex={activeIndex}
            onSelect={setActiveIndex}
          />
        </div>
      </div>
    </section>
  );
}

function Sidebar() {
  return (
    <div>
      <div className="inline-flex items-center gap-2 mb-4">
        <span className="w-6 h-px bg-emerald-600" />
        <span className="text-[11px] tracking-wider uppercase text-emerald-700 font-black">
          Customer Reviews
        </span>
      </div>

      <h2
        id="testimonials-heading"
        className="text-3xl lg:text-4xl font-black text-slate-900 leading-[1.05] tracking-tight"
      >
        What buyers <span className="text-emerald-600">say about us</span>.
      </h2>

      <div
        className="mt-5 flex items-baseline gap-3"
        itemProp="aggregateRating"
        itemScope
        itemType="https://schema.org/AggregateRating"
      >
        <meta itemProp="bestRating" content={String(AGGREGATE_RATING.bestRating)} />
        <span className="text-5xl font-black text-slate-900" itemProp="ratingValue">
          {AGGREGATE_RATING.ratingValue}
        </span>
        <div className="flex flex-col">
          <div className="flex gap-0.5 mb-1" aria-hidden="true">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} className="w-4 h-4 fill-amber-400 stroke-amber-400" strokeWidth={1.5} />
            ))}
          </div>
          <span className="text-xs text-slate-600 font-medium">
            From{" "}
            <span itemProp="reviewCount">{AGGREGATE_RATING.reviewCount}</span> verified reviews
          </span>
        </div>
      </div>

      <div className="mt-5 pt-5 border-t border-slate-200">
        <p className="text-sm text-slate-600 leading-relaxed">
          Reviews verified through Google, CarGurus, and DealerRater. We never edit or pay for reviews.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        {["Google", "CarGurus", "DealerRater", "Facebook"].map((p) => (
          <span
            key={p}
            className="px-2 py-1 bg-slate-100 text-[10px] font-bold text-slate-700 rounded-md uppercase tracking-wider"
          >
            {p}
          </span>
        ))}
      </div>
    </div>
  );
}

function Carousel({
  active,
  activeIndex,
  onSelect,
}: {
  active: (typeof TESTIMONIALS)[number];
  activeIndex: number;
  onSelect: (i: number) => void;
}) {
  return (
    <div className="relative bg-slate-50 rounded-2xl p-6 lg:p-8 border-2 border-slate-200 shadow-sm">
      <Quote
        className="absolute -top-3 -left-2 w-10 h-10 text-emerald-600 fill-emerald-600"
        strokeWidth={1}
        aria-hidden="true"
      />

      <div className="relative min-h-[240px] lg:min-h-[200px]">
        <AnimatePresence mode="wait">
          <motion.figure
            key={active.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            itemProp="review"
            itemScope
            itemType="https://schema.org/Review"
          >
            <div
              itemProp="reviewRating"
              itemScope
              itemType="https://schema.org/Rating"
              className="flex gap-0.5 mb-4"
            >
              <meta itemProp="ratingValue" content={String(active.rating)} />
              <meta itemProp="bestRating" content="5" />
              {Array.from({ length: active.rating }).map((_, i) => (
                <Star
                  key={i}
                  className="w-4 h-4 fill-amber-400 stroke-amber-400"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
              ))}
            </div>

            <blockquote
              className="text-lg lg:text-xl text-slate-800 leading-[1.5] font-medium"
              itemProp="reviewBody"
            >
              &ldquo;{active.quote}&rdquo;
            </blockquote>

            <figcaption className="mt-5 flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-emerald-600 flex items-center justify-center flex-shrink-0 shadow-md">
                <span className="text-white font-black text-sm" aria-hidden="true">
                  {getInitials(active.author)}
                </span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className="text-slate-900 font-bold text-sm"
                    itemProp="author"
                    itemScope
                    itemType="https://schema.org/Person"
                  >
                    <span itemProp="name">{active.author}</span>
                  </span>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-blue-50 border border-blue-200 rounded text-[9px] font-bold text-blue-700 uppercase tracking-wider">
                    <BadgeCheck className="w-2.5 h-2.5" strokeWidth={2.5} aria-hidden="true" />
                    {active.verified}
                  </span>
                </div>
                <div className="text-xs text-slate-600 mt-0.5">{active.role}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  {active.location} · {formatRelativeDays(active.daysAgo)}
                </div>
              </div>
            </figcaption>
          </motion.figure>
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-1.5 mt-6 pt-5 border-t border-slate-200">
        {TESTIMONIALS.map((t, i) => (
          <button
            key={t.id}
            onClick={() => onSelect(i)}
            className="group flex-1 py-2"
            aria-label={`Show review from ${t.author}`}
          >
            <div
              className={cn(
                "h-1 rounded-full transition-all",
                activeIndex === i ? "bg-emerald-600" : "bg-slate-200 group-hover:bg-slate-300",
              )}
            />
          </button>
        ))}
        <div className="ml-2 text-[10px] text-slate-500 font-mono whitespace-nowrap">
          {activeIndex + 1} / {TESTIMONIALS.length}
        </div>
      </div>
    </div>
  );
}
