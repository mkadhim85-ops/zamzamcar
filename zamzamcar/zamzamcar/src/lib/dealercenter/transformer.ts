/**
 * DealerCenter → Unified Car transformer.
 *
 * This is the ONLY place where DealerCenter-specific quirks should live.
 * The rest of the app consumes the clean `Car` type and never sees raw feed data.
 *
 * Design principles:
 *   - Be defensive: feeds in the wild have typos, missing fields, weird casing.
 *   - Never throw on a single bad vehicle — log it and skip. One bad row should
 *     not poison an entire inventory sync.
 *   - Always produce a slug suitable for SEO.
 */

import type {
  Car,
  CarImage,
  BodyStyle,
  FuelType,
  Transmission,
  Drivetrain,
  CarCondition,
  CarStatus,
} from "@/types/car";
import type { DealerCenterVehicle } from "./types";

const PHOTO_FIELD_LIMIT = 40; // DealerCenter sends up to Photo1..Photo40

/**
 * Transform a single DealerCenter vehicle into our Car shape.
 * Returns null if the vehicle is missing required fields (logged for review).
 */
export function transformVehicle(raw: DealerCenterVehicle): Car | null {
  try {
    if (!raw.StockNumber || !raw.VIN || !raw.Year || !raw.Make || !raw.Model) {
      console.warn("[transformer] Skipping vehicle missing required fields", {
        stock: raw.StockNumber,
        vin: raw.VIN,
      });
      return null;
    }

    const year = toNumber(raw.Year);
    if (!year || year < 1900 || year > new Date().getFullYear() + 2) {
      console.warn("[transformer] Invalid year", raw.StockNumber, raw.Year);
      return null;
    }

    const make = cleanString(raw.Make);
    const model = cleanString(raw.Model);
    const trim = raw.Trim ? cleanString(raw.Trim) : undefined;
    const stockNumber = cleanString(raw.StockNumber);

    const slug = generateSlug({ year, make, model, trim, stockNumber });

    return {
      id: `dc-${stockNumber}`,
      stockNumber,
      vin: raw.VIN.trim().toUpperCase(),
      slug,
      year,
      make,
      model,
      trim,
      bodyStyle: normalizeBodyStyle(raw.BodyStyle),
      condition: normalizeCondition(raw.VehicleType),
      status: normalizeStatus(raw.Status),
      price: parsePrice(raw.InternetPrice ?? raw.Price),
      msrp: raw.MSRP ? parsePrice(raw.MSRP) : undefined,
      mileage: toNumber(raw.Mileage ?? raw.Odometer) ?? 0,
      fuelType: normalizeFuelType(raw.FuelType),
      transmission: normalizeTransmission(raw.Transmission),
      drivetrain: normalizeDrivetrain(raw.Drivetrain),
      engine: raw.Engine ? cleanString(raw.Engine) : undefined,
      mpgCity: toNumber(raw.CityMPG) || undefined,
      mpgHighway: toNumber(raw.HighwayMPG) || undefined,
      exteriorColor: cleanString(raw.ExteriorColor ?? "Unknown"),
      interiorColor: raw.InteriorColor
        ? cleanString(raw.InteriorColor)
        : undefined,
      features: parseFeatures(raw.Features),
      description: raw.Description ?? raw.Comments,
      images: parseImages(raw, `${year} ${make} ${model}${trim ? ` ${trim}` : ""}`),
      videoUrl: raw.VideoURL?.trim() || undefined,
      carfaxUrl: raw.CarfaxURL?.trim() || undefined,
      createdAt: raw.DateAdded ?? new Date().toISOString(),
      updatedAt: raw.LastUpdated ?? new Date().toISOString(),
      syncedAt: new Date().toISOString(),
      sourceId: stockNumber,
    };
  } catch (err) {
    console.error("[transformer] Failed to transform vehicle", {
      stock: raw.StockNumber,
      error: err instanceof Error ? err.message : err,
    });
    return null;
  }
}

/**
 * Transform an entire feed. Filters out bad vehicles silently — they were
 * already logged in transformVehicle.
 */
export function transformFeed(vehicles: DealerCenterVehicle[]): Car[] {
  return vehicles
    .map(transformVehicle)
    .filter((c): c is Car => c !== null);
}

// ── Helpers ────────────────────────────────────────────────────────────────

function cleanString(input: string): string {
  return input.trim().replace(/\s+/g, " ");
}

function toNumber(input: unknown): number | undefined {
  if (input === null || input === undefined || input === "") return undefined;
  // Strip currency symbols, commas, etc.
  const cleaned = String(input).replace(/[^\d.-]/g, "");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : undefined;
}

/** Price stored as integer cents to avoid float-math drift on totals. */
function parsePrice(input: unknown): number {
  const n = toNumber(input);
  if (!n) return 0;
  return Math.round(n * 100);
}

function generateSlug(parts: {
  year: number;
  make: string;
  model: string;
  trim?: string;
  stockNumber: string;
}): string {
  const segments = [
    parts.year,
    parts.make,
    parts.model,
    parts.trim,
    `stk${parts.stockNumber}`,
  ].filter(Boolean);

  return segments
    .join("-")
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function normalizeBodyStyle(input?: string): BodyStyle {
  if (!input) return "other";
  const v = input.toLowerCase();
  if (v.includes("sedan")) return "sedan";
  if (v.includes("suv") || v.includes("sport utility")) return "suv";
  if (v.includes("truck") || v.includes("pickup")) return "truck";
  if (v.includes("coupe")) return "coupe";
  if (v.includes("convertible") || v.includes("cabriolet")) return "convertible";
  if (v.includes("hatchback")) return "hatchback";
  if (v.includes("wagon")) return "wagon";
  if (v.includes("minivan")) return "minivan";
  if (v.includes("van")) return "van";
  return "other";
}

function normalizeFuelType(input?: string): FuelType {
  if (!input) return "gasoline";
  const v = input.toLowerCase();
  if (v.includes("electric") && !v.includes("hybrid")) return "electric";
  if (v.includes("plug")) return "plug-in-hybrid";
  if (v.includes("hybrid")) return "hybrid";
  if (v.includes("diesel")) return "diesel";
  if (v.includes("gas") || v.includes("petrol") || v.includes("unleaded"))
    return "gasoline";
  return "other";
}

function normalizeTransmission(input?: string): Transmission {
  if (!input) return "automatic";
  const v = input.toLowerCase();
  if (v.includes("cvt")) return "cvt";
  if (v.includes("dual") || v.includes("dct") || v.includes("dsg"))
    return "dual-clutch";
  if (v.includes("manual") || v === "mt" || v.includes("stick")) return "manual";
  if (v.includes("auto") || v === "at") return "automatic";
  return "other";
}

function normalizeDrivetrain(input?: string): Drivetrain {
  if (!input) return "fwd";
  const v = input.toLowerCase();
  if (v.includes("awd") || v.includes("all-wheel") || v.includes("all wheel"))
    return "awd";
  if (v.includes("4wd") || v.includes("4x4") || v.includes("four-wheel"))
    return "4wd";
  if (v.includes("rwd") || v.includes("rear")) return "rwd";
  return "fwd";
}

function normalizeCondition(input?: string): CarCondition {
  if (!input) return "used";
  const v = input.toLowerCase();
  if (v.includes("certified") || v.includes("cpo")) return "certified";
  if (v === "new") return "new";
  return "used";
}

function normalizeStatus(input?: string): CarStatus {
  if (!input) return "available";
  const v = input.toLowerCase();
  if (v.includes("sold")) return "sold";
  if (v.includes("pending") || v.includes("hold")) return "pending";
  return "available";
}

function parseFeatures(input: unknown): string[] {
  if (!input) return [];
  if (Array.isArray(input)) return input.map(cleanString).filter(Boolean);
  if (typeof input === "string") {
    return input
      .split(/[,;|]/)
      .map((f) => cleanString(f))
      .filter(Boolean);
  }
  return [];
}

function parseImages(raw: DealerCenterVehicle, vehicleAlt: string): CarImage[] {
  const urls: string[] = [];

  // Case 1: Photos as array
  if (Array.isArray(raw.Photos)) {
    urls.push(...raw.Photos);
  } else if (typeof raw.Photos === "string" && raw.Photos.trim()) {
    // Case 2: Photos as comma/pipe-separated string
    urls.push(...raw.Photos.split(/[,|]/));
  }

  // Case 3: Photo1, Photo2, ... PhotoN fields
  for (let i = 1; i <= PHOTO_FIELD_LIMIT; i++) {
    const key = `Photo${i}` as keyof DealerCenterVehicle;
    const url = raw[key];
    if (typeof url === "string" && url.trim()) urls.push(url);
  }

  // Dedupe, clean, and convert to CarImage[]
  const seen = new Set<string>();
  return urls
    .map((u) => u.trim())
    .filter((u) => u && !seen.has(u) && seen.add(u))
    .map((url, idx) => ({
      url,
      alt: `${vehicleAlt} — Photo ${idx + 1}`,
      isPrimary: idx === 0,
    }));
}
