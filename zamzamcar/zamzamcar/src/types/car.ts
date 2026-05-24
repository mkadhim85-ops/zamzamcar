/**
 * Unified Car Model
 *
 * This is the single source of truth for car data across the entire application.
 * The DealerCenter feed gets transformed into this shape (see lib/dealercenter/transformer.ts)
 * so the rest of the app never has to know about feed-specific quirks.
 */

export type FuelType = "gasoline" | "diesel" | "electric" | "hybrid" | "plug-in-hybrid" | "other";
export type Transmission = "automatic" | "manual" | "cvt" | "dual-clutch" | "other";
export type Drivetrain = "fwd" | "rwd" | "awd" | "4wd";
export type BodyStyle =
  | "sedan"
  | "suv"
  | "truck"
  | "coupe"
  | "convertible"
  | "hatchback"
  | "wagon"
  | "van"
  | "minivan"
  | "other";

export type CarCondition = "new" | "used" | "certified";
export type CarStatus = "available" | "pending" | "sold";

export interface CarImage {
  url: string;
  alt: string;
  width?: number;
  height?: number;
  isPrimary?: boolean;
}

export interface Car {
  // Identity
  id: string;              // Internal UUID
  stockNumber: string;     // DealerCenter stock # — primary user-facing identifier
  vin: string;             // 17-char Vehicle Identification Number
  slug: string;            // SEO-friendly URL slug: "2022-toyota-camry-xse-stk123"

  // Basic info
  year: number;
  make: string;            // "Toyota"
  model: string;           // "Camry"
  trim?: string;           // "XSE"
  bodyStyle: BodyStyle;
  condition: CarCondition;
  status: CarStatus;

  // Pricing
  price: number;           // Sale price in USD cents (avoid float math)
  msrp?: number;           // Original MSRP for showing discounts
  monthlyPayment?: number; // Estimated, for "as low as $X/mo" display

  // Mechanical
  mileage: number;
  fuelType: FuelType;
  transmission: Transmission;
  drivetrain: Drivetrain;
  engine?: string;         // "2.5L 4-Cylinder"
  mpgCity?: number;
  mpgHighway?: number;

  // Appearance
  exteriorColor: string;
  interiorColor?: string;

  // Marketing
  features: string[];      // ["Bluetooth", "Backup Camera", "Sunroof"]
  description?: string;    // Full marketing description (may be AI-enhanced later)
  highlights?: string[];   // Top 3-5 selling points for cards

  // Media
  images: CarImage[];
  videoUrl?: string;
  carfaxUrl?: string;

  // Metadata
  createdAt: string;       // ISO 8601
  updatedAt: string;
  syncedAt: string;        // Last successful pull from DealerCenter
  sourceId: string;        // Original ID from DealerCenter for matching
}

/** Filter parameters accepted by GET /api/cars */
export interface CarFilters {
  make?: string;
  model?: string;
  bodyStyle?: BodyStyle;
  minYear?: number;
  maxYear?: number;
  minPrice?: number;
  maxPrice?: number;
  minMileage?: number;
  maxMileage?: number;
  fuelType?: FuelType;
  transmission?: Transmission;
  drivetrain?: Drivetrain;
  condition?: CarCondition;
  status?: CarStatus;
  search?: string;         // Free-text search
  sort?: CarSortOption;
  page?: number;
  limit?: number;
}

export type CarSortOption =
  | "price-asc"
  | "price-desc"
  | "year-desc"
  | "year-asc"
  | "mileage-asc"
  | "newest"
  | "featured";

export interface CarsResponse {
  cars: Car[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  filters: {
    makes: Array<{ value: string; count: number }>;
    bodyStyles: Array<{ value: BodyStyle; count: number }>;
    priceRange: { min: number; max: number };
    yearRange: { min: number; max: number };
  };
}
