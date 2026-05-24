"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Sparkles, Gauge, Fuel, Settings2, Zap, Heart, Eye, Camera,
  BadgeCheck, ArrowRight, Phone, Clock,
} from "lucide-react";
import { CarGurusBadge } from "@/components/ui/cargurus-badge";
import { TitleBadge } from "@/components/ui/title-badge";
import { CarFaxBadge } from "@/components/ui/carfax-badge";
import { SyndicationDots } from "@/components/ui/syndication-dots";
import { OTDBreakdown } from "@/components/cars/otd-breakdown";
import { formatNumber, formatMileage, formatPrice } from "@/lib/utils/format";
import { getPriceDollars } from "@/lib/data/inventory";
import { DEALER } from "@/lib/config";
import type { DisplayCar } from "@/types/ui";

interface Props {
  car: DisplayCar;
  index: number;
  onFavorite?: (id: string) => void;
  isFavorited?: boolean;
}

/**
 * Vehicle card — the most-rendered component in the app.
 *
 * Optimizations:
 *   - Image uses Next.js <Image> with `loading="lazy"` (except first 3 above-fold)
 *   - Hover scale on image is GPU-accelerated transform
 *   - Schema.org microdata embedded inline (works with no JS)
 *   - Single Framer Motion wrapper for entrance animation (not per-element)
 *
 * The card is intentionally information-dense. Every visible element earns
 * its space: dealer rating, title status, history report, 4 specs, price
 * with savings, OTD breakdown, action buttons, syndication badges. Buyers
 * making decisions under $20k need this density to feel confident — sparse
 * cards force them to click into details just to compare basics.
 */
export function CarCard({ car, index, onFavorite, isFavorited = false }: Props) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const dollars = getPriceDollars(car);
  const primaryImage = car.images.find((img) => img.isPrimary) ?? car.images[0];

  // Above-the-fold cards (first 3) should not lazy-load — hurts LCP score
  const eager = index < 3;

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className="group relative bg-white rounded-xl overflow-hidden border border-slate-200 hover:border-slate-400 hover:shadow-2xl hover:shadow-slate-900/10 hover:-translate-y-0.5 transition-all duration-300"
      itemScope
      itemType="https://schema.org/Vehicle"
    >
      <CardImage
        car={car}
        primaryImage={primaryImage}
        loaded={imageLoaded}
        onLoad={() => setImageLoaded(true)}
        onFavorite={onFavorite}
        isFavorited={isFavorited}
        eager={eager}
      />

      <div className="p-4">
        <CardHeader car={car} />
        <CardBadges car={car} />

        <div className="mb-3">
          <CarFaxBadge accidents={car.accidents} />
        </div>

        <CardSpecs car={car} />
        <CardPricing car={car} dollars={dollars} />

        <OTDBreakdown basePrice={dollars} />

        <CardActions stockNumber={car.stockNumber} slug={car.slug} />
        <CardFooter car={car} />
      </div>
    </motion.article>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────

function CardImage({
  car,
  primaryImage,
  loaded,
  onLoad,
  onFavorite,
  isFavorited,
  eager,
}: {
  car: DisplayCar;
  primaryImage: { url: string; alt: string };
  loaded: boolean;
  onLoad: () => void;
  onFavorite?: (id: string) => void;
  isFavorited: boolean;
  eager: boolean;
}) {
  return (
    <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
      {!loaded && <div className="absolute inset-0 bg-slate-100 animate-pulse" />}

      <Image
        src={primaryImage.url}
        alt={`${car.year} ${car.make} ${car.model} ${car.trim} for sale at ${DEALER.name} in ${DEALER.city}, ${DEALER.state}`}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
        priority={eager}
        loading={eager ? undefined : "lazy"}
        onLoad={onLoad}
        className="object-cover group-hover:scale-105 transition-transform duration-700"
        itemProp="image"
      />

      {/* Top-left badges */}
      <div className="absolute top-3 left-3 flex flex-col gap-1.5">
        {car.marketingBadges.includes("one-owner") && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/95 backdrop-blur-md text-slate-900 text-[10px] font-bold tracking-wider uppercase rounded-md border border-slate-300 shadow-sm">
            <BadgeCheck className="w-2.5 h-2.5" strokeWidth={2.5} />
            1-Owner
          </span>
        )}
      </div>

      {/* Favorite button */}
      {onFavorite && (
        <button
          onClick={() => onFavorite(car.id)}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/95 backdrop-blur-md hover:bg-white border border-slate-200 flex items-center justify-center transition-all hover:scale-110 shadow-md"
          aria-label={isFavorited ? "Remove from favorites" : "Save vehicle"}
        >
          <Heart
            className={`w-4 h-4 transition-all ${
              isFavorited ? "fill-rose-500 stroke-rose-500" : "stroke-slate-700"
            }`}
            strokeWidth={2}
          />
        </button>
      )}

      {/* Bottom overlays */}
      <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 px-2 py-1 bg-slate-900/85 backdrop-blur-md text-white text-[10px] font-semibold rounded-md">
        <Camera className="w-3 h-3" strokeWidth={2} />
        {car.photoCount} photos
      </span>

      <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 px-2 py-1 bg-slate-900/85 backdrop-blur-md text-white text-[10px] font-medium rounded-md">
        <Eye className="w-3 h-3" strokeWidth={2} />
        {formatNumber(car.viewCount)}
      </span>
    </div>
  );
}

function CardHeader({ car }: { car: DisplayCar }) {
  return (
    <div className="mb-3">
      <div className="flex items-baseline gap-2 mb-0.5 text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
        <span className="font-mono text-slate-700">{car.year}</span>
        <span aria-hidden="true">•</span>
        <span>{car.bodyStyle}</span>
        <span aria-hidden="true">•</span>
        <span className="text-slate-500">{car.exteriorColor}</span>
      </div>
      <h3 className="text-lg font-bold text-slate-900 leading-tight tracking-tight" itemProp="name">
        <meta itemProp="brand" content={car.make} />
        <meta itemProp="model" content={car.model} />
        <meta itemProp="vehicleModelDate" content={String(car.year)} />
        <meta itemProp="vehicleIdentificationNumber" content={car.vin} />
        {car.year} {car.make} {car.model}
        {car.trim && (
          <span className="block text-sm text-slate-600 font-medium mt-0.5">{car.trim}</span>
        )}
      </h3>
    </div>
  );
}

function CardBadges({ car }: { car: DisplayCar }) {
  return (
    <div className="flex items-center gap-1.5 mb-3 flex-wrap">
      <CarGurusBadge rating={car.dealRating} score={car.dealScore} />
      <TitleBadge status={car.titleStatus} />
    </div>
  );
}

function CardSpecs({ car }: { car: DisplayCar }) {
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-2 mb-3 pb-3 border-b border-slate-100">
      <Spec icon={Gauge} value={formatMileage(car.mileage)} itemProp="mileageFromOdometer" />
      <Spec icon={Fuel} value={car.fuelType} itemProp="fuelType" />
      <Spec icon={Settings2} value={car.transmission} itemProp="vehicleTransmission" />
      <Spec icon={Zap} value={car.drivetrain.toUpperCase()} itemProp="driveWheelConfiguration" />
    </div>
  );
}

function Spec({
  icon: Icon,
  value,
  itemProp,
}: {
  icon: typeof Gauge;
  value: string;
  itemProp?: string;
}) {
  return (
    <div className="flex items-center gap-1.5 min-w-0">
      <Icon className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" strokeWidth={2} aria-hidden="true" />
      <span className="text-xs text-slate-700 truncate font-medium capitalize" itemProp={itemProp}>
        {value}
      </span>
    </div>
  );
}

function CardPricing({ car, dollars }: { car: DisplayCar; dollars: number }) {
  return (
    <div className="mb-3 pb-3 border-b border-slate-100">
      <div className="flex items-baseline justify-between mb-1">
        <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
          Sale Price
        </span>
        {car.savings > 0 && (
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
            Save {formatPrice(car.savings)}
          </span>
        )}
      </div>
      <div
        className="flex items-baseline gap-2 flex-wrap"
        itemProp="offers"
        itemScope
        itemType="https://schema.org/Offer"
      >
        <meta itemProp="priceCurrency" content="USD" />
        <span
          className="text-3xl font-black text-slate-900 tracking-tight"
          itemProp="price"
          content={String(dollars)}
        >
          {formatPrice(dollars)}
        </span>
        {car.marketAverage > dollars && (
          <span className="text-[11px] text-slate-400 line-through font-mono">
            Avg {formatPrice(car.marketAverage)}
          </span>
        )}
      </div>
    </div>
  );
}

function CardActions({ stockNumber, slug }: { stockNumber: string; slug: string }) {
  return (
    <div className="mt-4 flex gap-2">
      <Link
        href={`/inventory/${stockNumber}`}
        className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-lg transition-all shadow-sm hover:shadow-md"
      >
        View Details
        <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.5} aria-hidden="true" />
      </Link>
      <a
        href={`tel:${DEALER.phoneRaw}`}
        className="inline-flex items-center justify-center w-11 h-11 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all shadow-sm hover:shadow-md"
        aria-label={`Call ${DEALER.name} at ${DEALER.phone}`}
      >
        <Phone className="w-4 h-4" strokeWidth={2.5} />
      </a>
    </div>
  );
}

function CardFooter({ car }: { car: DisplayCar }) {
  return (
    <footer className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
      <div className="flex items-center gap-2 font-mono">
        <span>Stock #{car.stockNumber}</span>
        <span className="text-slate-300" aria-hidden="true">•</span>
        <span className="flex items-center gap-1">
          <Clock className="w-2.5 h-2.5" strokeWidth={2} aria-hidden="true" />
          {car.daysListed}d ago
        </span>
      </div>
      <SyndicationDots platforms={car.syndicatedPlatforms} />
    </footer>
  );
}
