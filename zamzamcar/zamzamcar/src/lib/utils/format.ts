/**
 * Formatters for prices, numbers, mileage, dates.
 *
 * Centralizing these means a single change (e.g., "show cents on all prices")
 * propagates everywhere instead of requiring grep + fix.
 */

const numberFormatter = new Intl.NumberFormat("en-US");

const priceFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const priceCentsFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Format a number with thousands separators: 12500 → "12,500" */
export function formatNumber(n: number): string {
  return numberFormatter.format(n);
}

/** Format mileage: 87420 → "87,420 mi" */
export function formatMileage(miles: number): string {
  return `${numberFormatter.format(miles)} mi`;
}

/**
 * Format a price WITHOUT cents (for sticker prices): 11990 → "$11,990"
 * Use this for headline prices on car cards.
 */
export function formatPrice(dollars: number): string {
  return priceFormatter.format(dollars);
}

/**
 * Format a price WITH cents (for OTD breakdowns): 11990 → "$11,990.00"
 * Use this for itemized calculations where decimals matter for transparency.
 */
export function formatPriceCents(dollars: number): string {
  return priceCentsFormatter.format(dollars);
}

/**
 * Format a date as relative time: new Date() → "today"
 * Used for "listed N days ago" labels.
 */
export function formatRelativeDays(daysAgo: number): string {
  if (daysAgo === 0) return "today";
  if (daysAgo === 1) return "yesterday";
  if (daysAgo < 7) return `${daysAgo} days ago`;
  if (daysAgo < 30) return `${Math.floor(daysAgo / 7)}w ago`;
  if (daysAgo < 365) return `${Math.floor(daysAgo / 30)}mo ago`;
  return `${Math.floor(daysAgo / 365)}y ago`;
}

/**
 * Generate initials from a full name: "Maria Hernandez" → "MH"
 * Used for testimonial avatars.
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
