/**
 * Shared helpers for all marketing feed routes.
 *
 * Every ad platform wants slightly different field names and formats, but the
 * underlying questions are the same:
 *   - What is the canonical URL for this car?
 *   - What is the price formatted with currency?
 *   - What image counts as the "main" one?
 *   - What's a clean, deduplicated title?
 *   - Is this car eligible for advertising right now?
 *
 * Putting these in one place means a fix (e.g., changing how mileage is
 * communicated) propagates across every platform automatically.
 */

import type { Car } from "@/types/car";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://zamzamcar.com";

const FEED_CURRENCY = process.env.FEED_CURRENCY ?? "USD";

/**
 * Is this car eligible to appear in paid ad feeds?
 * Excludes sold cars, pending sales, and cars missing critical data.
 */
export function isFeedEligible(car: Car): boolean {
  if (car.status !== "available") return false;
  if (!car.price || car.price <= 0) return false;
  if (!car.images || car.images.length === 0) return false;
  if (!car.vin || car.vin.length !== 17) return false;
  return true;
}

/** Canonical product URL — same for every platform, used for tracking too. */
export function getCarUrl(car: Car): string {
  return `${SITE_URL}/inventory/${car.stockNumber}`;
}

/** Build a UTM-tagged URL so we can attribute traffic per ad platform. */
export function getTaggedUrl(car: Car, source: string, medium = "cpc"): string {
  const url = new URL(getCarUrl(car));
  url.searchParams.set("utm_source", source);
  url.searchParams.set("utm_medium", medium);
  url.searchParams.set("utm_campaign", "inventory");
  url.searchParams.set("utm_content", car.stockNumber);
  return url.toString();
}

/** Price formatted as "12999.00 USD" — accepted by every major platform. */
export function formatPriceWithCurrency(priceCents: number): string {
  const dollars = (priceCents / 100).toFixed(2);
  return `${dollars} ${FEED_CURRENCY}`;
}

/** Plain price string "12999.00" for platforms that take currency separately. */
export function formatPrice(priceCents: number): string {
  return (priceCents / 100).toFixed(2);
}

/**
 * Get the primary image, preferring the one flagged isPrimary, falling back
 * to the first image. Returns the URL (some platforms want it directly).
 */
export function getPrimaryImageUrl(car: Car): string {
  const primary = car.images.find((img) => img.isPrimary);
  return (primary ?? car.images[0]).url;
}

/** Additional image URLs (everything except the primary), capped at 10. */
export function getAdditionalImageUrls(car: Car, limit = 10): string[] {
  const primaryUrl = getPrimaryImageUrl(car);
  return car.images
    .map((img) => img.url)
    .filter((url) => url !== primaryUrl)
    .slice(0, limit);
}

/**
 * Construct a clean, ad-friendly title.
 * Format: "2022 Toyota Camry XSE — 25,000 mi"
 * Why include mileage? Higher CTR — buyers scan for low miles in the title.
 */
export function buildAdTitle(car: Car): string {
  const parts = [car.year, car.make, car.model, car.trim].filter(Boolean);
  const base = parts.join(" ");
  const mileage = car.mileage ? ` — ${car.mileage.toLocaleString()} mi` : "";
  return `${base}${mileage}`.slice(0, 150); // Google's title limit
}

/**
 * Build a description that hits length targets without keyword stuffing.
 * Platforms penalize duplicate descriptions across listings, so we mix in
 * features and specs to ensure uniqueness per vehicle.
 */
export function buildAdDescription(car: Car): string {
  if (car.description && car.description.length > 80) {
    // Use dealer-provided description if substantial
    return car.description.slice(0, 5000);
  }

  // Generate one
  const specs: string[] = [];
  if (car.mileage) specs.push(`${car.mileage.toLocaleString()} miles`);
  if (car.exteriorColor) specs.push(`${car.exteriorColor} exterior`);
  if (car.interiorColor) specs.push(`${car.interiorColor} interior`);
  if (car.engine) specs.push(car.engine);
  if (car.transmission && car.transmission !== "other") {
    specs.push(`${car.transmission} transmission`);
  }
  if (car.drivetrain) specs.push(car.drivetrain.toUpperCase());

  const title = buildAdTitle(car);
  const specsText = specs.length ? ` Features: ${specs.join(", ")}.` : "";
  const featuresText = car.features.length
    ? ` Includes ${car.features.slice(0, 6).join(", ")}.`
    : "";

  return `${title}.${specsText}${featuresText} Available now at ZamZam Car.`.slice(
    0,
    5000
  );
}

/** Safely escape XML special characters. Used by every XML-format feed. */
export function escapeXml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Escape a CSV field per RFC 4180.
 * Quotes the field if it contains comma, quote, newline, or leading/trailing space.
 */
export function escapeCsv(input: string | number | undefined | null): string {
  if (input === undefined || input === null) return "";
  const str = String(input);
  if (str === "") return "";
  if (/[",\n\r]|^\s|\s$/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Generate a content hash for change detection.
 * If this changes, the feed has new data and the CDN cache should be busted.
 */
export function computeInventoryHash(cars: Car[]): string {
  // Use only fields that affect feed output — ignore syncedAt etc.
  const stable = cars
    .filter(isFeedEligible)
    .map(
      (c) =>
        `${c.stockNumber}|${c.price}|${c.status}|${c.mileage}|${c.images.length}`
    )
    .sort()
    .join("\n");

  // FNV-1a hash — fast, decent distribution, no crypto import needed
  let h = 0x811c9dc5;
  for (let i = 0; i < stable.length; i++) {
    h ^= stable.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16);
}

/** Common cache headers for feed responses. */
export function feedCacheHeaders(contentType: string): HeadersInit {
  return {
    "Content-Type": contentType,
    // CDN caches for 5 minutes, serves stale up to 1 hour while revalidating.
    // On inventory sync, revalidateTag('feeds') forces fresh on next request.
    "Cache-Control":
      "public, s-maxage=300, stale-while-revalidate=3600, must-revalidate",
    "X-Robots-Tag": "noindex", // Don't let Google index the feed URL itself
  };
}
