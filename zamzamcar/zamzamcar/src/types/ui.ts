/**
 * UI-specific types for the frontend.
 *
 * The core Car type lives in @/types/car.ts. This file adds:
 *   - DisplayCar: enriched with deal ratings, view counts, marketing badges
 *   - OTDBreakdown: Out-the-Door price calculation result
 *   - FilterState: search/filter UI state
 *
 * The transformation from backend Car → DisplayCar happens in
 * @/lib/data/transform.ts.
 */

import type { Car } from "./car";

export type DealRating = "great" | "good" | "fair";
export type TitleStatus = "clean" | "rebuilt" | "salvage";
export type CarFaxStatus = "available" | "pending" | "none";

export interface DisplayCar extends Car {
  // Deal pricing intelligence (would come from CarGurus API in production)
  dealRating: DealRating;
  dealScore: number;
  marketAverage: number;
  savings: number;

  // Title & history (would come from CARFAX/AutoCheck API in production)
  titleStatus: TitleStatus;
  accidents: number;
  ownerCount: number;
  serviceRecords: number;
  carfaxAvailable: boolean;

  // Marketing
  photoCount: number;
  viewCount: number;
  daysListed: number;
  syndicatedPlatforms: Array<"cargurus" | "carscom" | "edmunds">;
  marketingBadges: Array<"one-owner" | "low-mileage" | "low-payments">;
}

export interface OTDBreakdown {
  basePrice: number;
  salesTax: number;
  docFee: number;
  licenseFee: number;
  total: number;
}

export interface FilterState {
  bodyType: string;
  make: string;
  priceRange: string;
  yearRange: string;
  mileageRange: string;
  searchQuery: string;
}

export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
  rating: number;
  location: string;
  daysAgo: number;
  verified: "Google" | "CarGurus" | "DealerRater" | "Facebook";
}

export interface FAQ {
  q: string;
  a: string;
}
