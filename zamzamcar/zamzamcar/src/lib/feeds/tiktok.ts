/**
 * TikTok catalog feed generator.
 *
 * Format: CSV (TikTok also accepts XML/TSV/Google format).
 * Spec: https://ads.tiktok.com/help/article/catalog-product-feed-template
 * Vehicle template: https://ads.tiktok.com/help/article/vehicle-catalog
 *
 * TikTok Vehicle catalog overlaps significantly with Meta's, but field names
 * and accepted values differ. We keep them in separate files so changes to
 * one platform's spec don't accidentally break another.
 */

import type { Car } from "@/types/car";
import {
  buildAdDescription,
  buildAdTitle,
  escapeCsv,
  formatPrice,
  getPrimaryImageUrl,
  getTaggedUrl,
  isFeedEligible,
} from "./shared";
import { getAdditionalImageUrls } from "./shared";

const FEED_CURRENCY = process.env.FEED_CURRENCY ?? "USD";
const DEALER_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? "ZamZam Car";

const TIKTOK_HEADERS = [
  "sku_id",            // unique vehicle identifier
  "title",
  "description",
  "availability",
  "condition",
  "price",
  "link",
  "image_link",
  "additional_image_link",  // pipe-separated list
  "brand",
  "make",
  "model",
  "year",
  "mileage",
  "body_style",
  "fuel_type",
  "transmission",
  "drivetrain",
  "vin",
  "trim",
  "exterior_color",
  "interior_color",
  "state_of_vehicle",
  "dealer_name",
];

export function buildTikTokFeed(cars: Car[]): string {
  const eligible = cars.filter(isFeedEligible);
  const header = TIKTOK_HEADERS.join(",");
  const rows = eligible.map(buildTikTokRow).join("\n");
  return `${header}\n${rows}\n`;
}

function buildTikTokRow(car: Car): string {
  const additionalImages = getAdditionalImageUrls(car, 10).join("|");

  const row = [
    car.stockNumber,                          // sku_id
    buildAdTitle(car),                        // title
    buildAdDescription(car),                  // description
    "in stock",                               // availability
    car.condition === "new" ? "new" : "used", // condition
    `${formatPrice(car.price)} ${FEED_CURRENCY}`, // price
    getTaggedUrl(car, "tiktok", "cpc"),       // link
    getPrimaryImageUrl(car),                  // image_link
    additionalImages,                         // additional_image_link
    car.make,                                 // brand (TikTok uses brand for make)
    car.make,                                 // make
    car.model,                                // model
    car.year,                                 // year
    `${car.mileage} mi`,                      // mileage
    mapBodyStyleToTikTok(car.bodyStyle),      // body_style
    mapFuelTypeToTikTok(car.fuelType),        // fuel_type
    car.transmission === "manual" ? "manual" : "automatic", // transmission
    car.drivetrain.toUpperCase(),             // drivetrain
    car.vin,                                  // vin
    car.trim ?? "",                           // trim
    car.exteriorColor,                        // exterior_color
    car.interiorColor ?? "",                  // interior_color
    car.condition === "new"
      ? "new"
      : car.condition === "certified"
        ? "cpo"
        : "used",                             // state_of_vehicle
    DEALER_NAME,                              // dealer_name
  ];

  return row.map(escapeCsv).join(",");
}

function mapBodyStyleToTikTok(body: string): string {
  const map: Record<string, string> = {
    sedan: "sedan",
    suv: "suv",
    truck: "truck",
    coupe: "coupe",
    convertible: "convertible",
    hatchback: "hatchback",
    wagon: "wagon",
    van: "van",
    minivan: "minivan",
  };
  return map[body] ?? "other";
}

function mapFuelTypeToTikTok(fuel: string): string {
  const map: Record<string, string> = {
    gasoline: "gasoline",
    diesel: "diesel",
    electric: "electric",
    hybrid: "hybrid",
    "plug-in-hybrid": "plug-in-hybrid",
  };
  return map[fuel] ?? "other";
}
