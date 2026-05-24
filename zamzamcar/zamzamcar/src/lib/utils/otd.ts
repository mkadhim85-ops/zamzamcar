/**
 * Out-the-Door price calculator.
 *
 * This is the formula displayed on every car card and detail page:
 *   Base Price + (Base × 7.65% UT Tax) + $399 Doc Fee + $155 License = Total
 *
 * Why a dedicated module? Because this formula appears in dozens of places
 * and MUST be identical everywhere. If Utah ever changes its sales tax rate
 * or we adjust our doc fee, this is the ONLY file that needs updating.
 *
 * The function is pure and side-effect-free, so it's safe to use in
 * Server Components, Client Components, or background jobs.
 */

import { PRICING } from "@/lib/config";
import type { OTDBreakdown } from "@/types/ui";

/**
 * Calculate the Out-the-Door price breakdown for a vehicle.
 *
 * @param basePrice - The vehicle's sticker price in dollars (not cents)
 * @returns Full breakdown with each line item and the total
 */
export function calculateOTD(basePrice: number): OTDBreakdown {
  const salesTax = basePrice * PRICING.SALES_TAX_RATE;
  const docFee = PRICING.DOC_FEE;
  const licenseFee = PRICING.LICENSE_FEE;

  // Round to nearest cent to avoid floating-point display artifacts
  // like "13461.239999999998" appearing in the UI.
  const total = roundToCents(basePrice + salesTax + docFee + licenseFee);

  return {
    basePrice,
    salesTax: roundToCents(salesTax),
    docFee,
    licenseFee,
    total,
  };
}

function roundToCents(amount: number): number {
  return Math.round(amount * 100) / 100;
}
