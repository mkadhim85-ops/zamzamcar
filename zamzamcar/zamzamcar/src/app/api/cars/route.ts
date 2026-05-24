/**
 * GET /api/cars
 *
 * Returns the dealer's inventory with filtering, sorting, and pagination.
 *
 * Data flow:
 *   1. Cached inventory snapshot lives in Vercel KV (or Redis).
 *   2. A separate cron job (/api/sync/dealercenter) refreshes that snapshot
 *      every 30 minutes from the DealerCenter feed.
 *   3. This route reads from the cache — never from DealerCenter directly.
 *      That keeps response times in the 50-100ms range and survives feed outages.
 *
 * Caching strategy:
 *   - The full inventory snapshot is one KV key (small dealers: <5MB easily).
 *   - We also use Next.js `unstable_cache` with a short tag-revalidatable TTL
 *     so the actual cold-start cost is minimal.
 *
 * Query params:
 *   make, model, bodyStyle, minYear, maxYear, minPrice, maxPrice,
 *   minMileage, maxMileage, fuelType, transmission, drivetrain,
 *   condition, status, search, sort, page, limit
 */

import { NextResponse, type NextRequest } from "next/server";
import { unstable_cache } from "next/cache";
import { getCachedInventory } from "@/lib/cache/inventory";
import type {
  Car,
  CarFilters,
  CarsResponse,
  CarSortOption,
  BodyStyle,
  FuelType,
  Transmission,
  Drivetrain,
  CarCondition,
  CarStatus,
} from "@/types/car";

// Use Node runtime for XML parsing capability when cold-syncing as fallback.
// (Edge would need a different XML strategy.)
export const runtime = "nodejs";

// Tell Vercel/Next this route is dynamic but its work is cached internally.
export const dynamic = "force-dynamic";

const DEFAULT_LIMIT = 24;
const MAX_LIMIT = 100;

export async function GET(request: NextRequest): Promise<NextResponse<CarsResponse | { error: string }>> {
  try {
    const filters = parseFilters(request.nextUrl.searchParams);

    // Load full inventory snapshot from KV (with internal in-memory cache).
    const allCars = await getInventorySnapshot();

    // Apply filters → sort → paginate, then compute facet counts.
    const filtered = applyFilters(allCars, filters);
    const sorted = applySort(filtered, filters.sort ?? "featured");

    const page = filters.page ?? 1;
    const limit = Math.min(filters.limit ?? DEFAULT_LIMIT, MAX_LIMIT);
    const start = (page - 1) * limit;
    const paginated = sorted.slice(start, start + limit);

    const response: CarsResponse = {
      cars: paginated,
      total: filtered.length,
      page,
      limit,
      totalPages: Math.ceil(filtered.length / limit) || 1,
      filters: computeFacets(allCars),
    };

    return NextResponse.json(response, {
      headers: {
        // Allow CDN to cache for 60s while we serve fresh after revalidation.
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        // Tag for on-demand revalidation when sync completes.
        "x-inventory-source": "cache",
      },
    });
  } catch (err) {
    console.error("[GET /api/cars] Error:", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Failed to fetch inventory. Please try again.",
      },
      { status: 500 }
    );
  }
}

// ── Cached snapshot loader ──────────────────────────────────────────────────

const getInventorySnapshot = unstable_cache(
  async (): Promise<Car[]> => {
    const cars = await getCachedInventory();
    return cars;
  },
  ["inventory-snapshot"],
  {
    tags: ["inventory"],
    revalidate: 60, // Refresh from KV at most once a minute
  }
);

// ── Filter parsing ──────────────────────────────────────────────────────────

function parseFilters(params: URLSearchParams): CarFilters {
  const get = (key: string) => params.get(key) ?? undefined;
  const getNum = (key: string): number | undefined => {
    const v = params.get(key);
    if (!v) return undefined;
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  };

  return {
    make: get("make"),
    model: get("model"),
    bodyStyle: get("bodyStyle") as BodyStyle | undefined,
    minYear: getNum("minYear"),
    maxYear: getNum("maxYear"),
    minPrice: getNum("minPrice"),
    maxPrice: getNum("maxPrice"),
    minMileage: getNum("minMileage"),
    maxMileage: getNum("maxMileage"),
    fuelType: get("fuelType") as FuelType | undefined,
    transmission: get("transmission") as Transmission | undefined,
    drivetrain: get("drivetrain") as Drivetrain | undefined,
    condition: get("condition") as CarCondition | undefined,
    status: (get("status") as CarStatus | undefined) ?? "available",
    search: get("search"),
    sort: get("sort") as CarSortOption | undefined,
    page: getNum("page"),
    limit: getNum("limit"),
  };
}

// ── Filtering ───────────────────────────────────────────────────────────────

function applyFilters(cars: Car[], f: CarFilters): Car[] {
  const searchTokens = f.search
    ? f.search.toLowerCase().split(/\s+/).filter(Boolean)
    : null;

  return cars.filter((car) => {
    // By default, only show available cars unless caller explicitly asked otherwise
    if (f.status && car.status !== f.status) return false;

    if (f.make && !equalsIgnoreCase(car.make, f.make)) return false;
    if (f.model && !equalsIgnoreCase(car.model, f.model)) return false;
    if (f.bodyStyle && car.bodyStyle !== f.bodyStyle) return false;
    if (f.fuelType && car.fuelType !== f.fuelType) return false;
    if (f.transmission && car.transmission !== f.transmission) return false;
    if (f.drivetrain && car.drivetrain !== f.drivetrain) return false;
    if (f.condition && car.condition !== f.condition) return false;

    if (f.minYear && car.year < f.minYear) return false;
    if (f.maxYear && car.year > f.maxYear) return false;

    // Prices stored in cents — UI sends dollars
    if (f.minPrice && car.price < f.minPrice * 100) return false;
    if (f.maxPrice && car.price > f.maxPrice * 100) return false;

    if (f.minMileage && car.mileage < f.minMileage) return false;
    if (f.maxMileage && car.mileage > f.maxMileage) return false;

    if (searchTokens) {
      const haystack = [
        car.year,
        car.make,
        car.model,
        car.trim,
        car.bodyStyle,
        car.exteriorColor,
        car.stockNumber,
        car.vin,
        ...car.features,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      // Every token must match (AND logic) — better signal-to-noise
      if (!searchTokens.every((tok) => haystack.includes(tok))) return false;
    }

    return true;
  });
}

function equalsIgnoreCase(a: string, b: string): boolean {
  return a.toLowerCase() === b.toLowerCase();
}

// ── Sorting ─────────────────────────────────────────────────────────────────

function applySort(cars: Car[], sort: CarSortOption): Car[] {
  // Sort in-place on a copy to avoid mutating cached array
  const copy = [...cars];
  switch (sort) {
    case "price-asc":
      return copy.sort((a, b) => a.price - b.price);
    case "price-desc":
      return copy.sort((a, b) => b.price - a.price);
    case "year-desc":
      return copy.sort((a, b) => b.year - a.year);
    case "year-asc":
      return copy.sort((a, b) => a.year - b.year);
    case "mileage-asc":
      return copy.sort((a, b) => a.mileage - b.mileage);
    case "newest":
      return copy.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    case "featured":
    default:
      // Featured: newest first, but penalize sold/pending
      return copy.sort((a, b) => {
        const aWeight = a.status === "available" ? 0 : 1;
        const bWeight = b.status === "available" ? 0 : 1;
        if (aWeight !== bWeight) return aWeight - bWeight;
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
  }
}

// ── Facet computation (for filter UI) ───────────────────────────────────────

function computeFacets(cars: Car[]): CarsResponse["filters"] {
  const availableCars = cars.filter((c) => c.status === "available");
  const makeCounts = new Map<string, number>();
  const bodyStyleCounts = new Map<BodyStyle, number>();
  let minPrice = Infinity,
    maxPrice = 0,
    minYear = Infinity,
    maxYear = 0;

  for (const car of availableCars) {
    makeCounts.set(car.make, (makeCounts.get(car.make) ?? 0) + 1);
    bodyStyleCounts.set(
      car.bodyStyle,
      (bodyStyleCounts.get(car.bodyStyle) ?? 0) + 1
    );
    const priceDollars = Math.round(car.price / 100);
    if (priceDollars > 0 && priceDollars < minPrice) minPrice = priceDollars;
    if (priceDollars > maxPrice) maxPrice = priceDollars;
    if (car.year < minYear) minYear = car.year;
    if (car.year > maxYear) maxYear = car.year;
  }

  return {
    makes: Array.from(makeCounts.entries())
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => b.count - a.count),
    bodyStyles: Array.from(bodyStyleCounts.entries())
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => b.count - a.count),
    priceRange: {
      min: minPrice === Infinity ? 0 : minPrice,
      max: maxPrice,
    },
    yearRange: {
      min: minYear === Infinity ? new Date().getFullYear() : minYear,
      max: maxYear || new Date().getFullYear(),
    },
  };
}
