/**
 * Meta (Facebook & Instagram) catalog feed generator.
 *
 * Format: CSV (Meta also accepts XML/TSV, but CSV is the most reliable).
 * Spec: https://www.facebook.com/business/help/686259348512056
 * Auto catalog: https://www.facebook.com/business/help/2347000688963254
 *
 * Meta has two vehicle catalog types:
 *   1. "Auto" — for vehicle dealers (this one)
 *   2. "Vehicle offers" — for finance/lease deals
 *
 * Required fields: vehicle_id, make, model, year, mileage, body_style,
 *   exterior_color, condition, price, currency, url, image[0]_url, title,
 *   description, address, dealer_id (or dealer_name).
 */

import type { Car } from "@/types/car";
import {
  buildAdDescription,
  buildAdTitle,
  escapeCsv,
  formatPrice,
  getAdditionalImageUrls,
  getPrimaryImageUrl,
  getTaggedUrl,
  isFeedEligible,
} from "./shared";

const DEALER_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? "ZamZam Car";
const DEALER_ADDRESS = process.env.DEALER_ADDRESS ?? "";
const DEALER_CITY = process.env.DEALER_CITY ?? "";
const DEALER_REGION = process.env.DEALER_REGION ?? "";
const DEALER_POSTAL = process.env.DEALER_POSTAL ?? "";
const DEALER_COUNTRY = process.env.DEALER_COUNTRY ?? "US";
const FEED_CURRENCY = process.env.FEED_CURRENCY ?? "USD";

const META_HEADERS = [
  "vehicle_id",
  "title",
  "description",
  "url",
  "make",
  "model",
  "year",
  "mileage.value",
  "mileage.unit",
  "image[0].url",
  "image[1].url",
  "image[2].url",
  "image[3].url",
  "image[4].url",
  "image[5].url",
  "image[6].url",
  "image[7].url",
  "image[8].url",
  "image[9].url",
  "body_style",
  "fuel_type",
  "transmission",
  "drivetrain",
  "vin",
  "trim",
  "exterior_color",
  "interior_color",
  "condition",
  "state_of_vehicle",
  "price",
  "currency",
  "address.addr1",
  "address.city",
  "address.region",
  "address.postal_code",
  "address.country",
  "dealer_name",
  "availability",
];

export function buildMetaFeed(cars: Car[]): string {
  const eligible = cars.filter(isFeedEligible);

  const headerRow = META_HEADERS.join(",");
  const dataRows = eligible.map(buildMetaRow).join("\n");

  // Note: no BOM. Meta's parser handles UTF-8 directly and a BOM trips its
  // header detection on the first column name.
  return `${headerRow}\n${dataRows}\n`;
}

function buildMetaRow(car: Car): string {
  const additionalImages = getAdditionalImageUrls(car, 9);
  // Pad to exactly 9 additional image slots (10 total with primary)
  const imageSlots = Array.from({ length: 9 }, (_, i) => additionalImages[i] ?? "");

  const row = [
    car.stockNumber,                        // vehicle_id
    buildAdTitle(car),                      // title
    buildAdDescription(car),                // description
    getTaggedUrl(car, "meta", "cpc"),       // url
    car.make,                               // make
    car.model,                              // model
    car.year,                               // year
    car.mileage,                            // mileage.value
    "MI",                                   // mileage.unit
    getPrimaryImageUrl(car),                // image[0].url
    ...imageSlots,                          // image[1..9].url
    mapBodyStyleToMeta(car.bodyStyle),      // body_style
    mapFuelTypeToMeta(car.fuelType),        // fuel_type
    mapTransmissionToMeta(car.transmission),// transmission
    mapDrivetrainToMeta(car.drivetrain),    // drivetrain
    car.vin,                                // vin
    car.trim ?? "",                         // trim
    car.exteriorColor,                      // exterior_color
    car.interiorColor ?? "",                // interior_color
    car.condition === "new" ? "EXCELLENT" : "GOOD", // condition
    mapConditionToMeta(car.condition),      // state_of_vehicle
    formatPrice(car.price),                 // price
    FEED_CURRENCY,                          // currency
    DEALER_ADDRESS,                         // address.addr1
    DEALER_CITY,                            // address.city
    DEALER_REGION,                          // address.region
    DEALER_POSTAL,                          // address.postal_code
    DEALER_COUNTRY,                         // address.country
    DEALER_NAME,                            // dealer_name
    "AVAILABLE",                            // availability
  ];

  return row.map(escapeCsv).join(",");
}

// ── Meta value mappings ─────────────────────────────────────────────────────

function mapBodyStyleToMeta(body: string): string {
  // Meta accepts: CONVERTIBLE, COUPE, HATCHBACK, MINIVAN, OTHER_BODY_STYLE,
  //               PICKUP_TRUCK, SEDAN, SUV, TRUCK, VAN, WAGON
  const map: Record<string, string> = {
    sedan: "SEDAN",
    suv: "SUV",
    truck: "TRUCK",
    coupe: "COUPE",
    convertible: "CONVERTIBLE",
    hatchback: "HATCHBACK",
    wagon: "WAGON",
    van: "VAN",
    minivan: "MINIVAN",
  };
  return map[body] ?? "OTHER_BODY_STYLE";
}

function mapFuelTypeToMeta(fuel: string): string {
  // Meta accepts: DIESEL, ELECTRIC, FLEX, GASOLINE, HYBRID, HYDROGEN, OTHER_FUEL_TYPE, PLUG_IN_HYBRID
  const map: Record<string, string> = {
    gasoline: "GASOLINE",
    diesel: "DIESEL",
    electric: "ELECTRIC",
    hybrid: "HYBRID",
    "plug-in-hybrid": "PLUG_IN_HYBRID",
  };
  return map[fuel] ?? "OTHER_FUEL_TYPE";
}

function mapTransmissionToMeta(trans: string): string {
  // Meta accepts: AUTOMATIC, MANUAL, OTHER_TRANSMISSION
  if (trans === "manual") return "MANUAL";
  if (trans === "automatic" || trans === "cvt" || trans === "dual-clutch")
    return "AUTOMATIC";
  return "OTHER_TRANSMISSION";
}

function mapDrivetrainToMeta(drive: string): string {
  // Meta accepts: AWD4WD, FOUR_WD, FWD, RWD, OTHER_DRIVETRAIN
  const map: Record<string, string> = {
    awd: "AWD4WD",
    "4wd": "FOUR_WD",
    fwd: "FWD",
    rwd: "RWD",
  };
  return map[drive] ?? "OTHER_DRIVETRAIN";
}

function mapConditionToMeta(condition: string): string {
  // Meta state_of_vehicle: NEW, USED, CPO
  if (condition === "new") return "NEW";
  if (condition === "certified") return "CPO";
  return "USED";
}
