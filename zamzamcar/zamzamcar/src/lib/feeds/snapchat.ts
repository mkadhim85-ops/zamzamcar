/**
 * Snapchat catalog feed generator.
 *
 * Format: CSV (Snapchat also accepts XML and Google format).
 * Spec: https://businesshelp.snapchat.com/s/article/product-feed-spec
 * Auto/Vehicle catalog: Snapchat uses an extended product catalog with
 *   vehicle-specific custom labels rather than a dedicated vertical (as of 2025).
 *
 * Snapchat's parser is closest to Google's product feed, so much of the field
 * mapping mirrors Google. Key differences: Snapchat wants flat CSV, uses
 * custom_label_N for vehicle-specific signals, and is stricter about image
 * dimensions (recommends 5:4 portrait).
 */

import type { Car } from "@/types/car";
import {
  buildAdDescription,
  buildAdTitle,
  escapeCsv,
  formatPriceWithCurrency,
  getPrimaryImageUrl,
  getTaggedUrl,
  isFeedEligible,
} from "./shared";
import { getAdditionalImageUrls } from "./shared";

const DEALER_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? "ZamZam Car";

const SNAPCHAT_HEADERS = [
  "id",
  "title",
  "description",
  "link",
  "image_link",
  "additional_image_link", // comma-separated up to 10
  "availability",
  "price",
  "brand",
  "condition",
  "gtin",            // Use VIN here — Snapchat accepts any unique identifier
  "mpn",
  "product_type",
  "google_product_category",
  "custom_label_0",  // year
  "custom_label_1",  // make-model
  "custom_label_2",  // body_style
  "custom_label_3",  // mileage_bucket
  "custom_label_4",  // condition (new/used/cpo)
];

const PRODUCT_CATEGORY = "Vehicles & Parts > Vehicles";

export function buildSnapchatFeed(cars: Car[]): string {
  const eligible = cars.filter(isFeedEligible);
  const header = SNAPCHAT_HEADERS.join(",");
  const rows = eligible.map(buildSnapchatRow).join("\n");
  return `${header}\n${rows}\n`;
}

function buildSnapchatRow(car: Car): string {
  const additionalImages = getAdditionalImageUrls(car, 10).join(",");

  const row = [
    car.stockNumber,                                  // id
    buildAdTitle(car),                                // title
    buildAdDescription(car),                          // description
    getTaggedUrl(car, "snapchat", "cpc"),             // link
    getPrimaryImageUrl(car),                          // image_link
    additionalImages,                                 // additional_image_link
    "in stock",                                       // availability
    formatPriceWithCurrency(car.price),               // price
    car.make,                                         // brand
    car.condition === "new" ? "new" : "used",         // condition
    car.vin,                                          // gtin (VIN works here)
    car.vin,                                          // mpn
    PRODUCT_CATEGORY,                                 // product_type
    PRODUCT_CATEGORY,                                 // google_product_category
    String(car.year),                                 // custom_label_0
    `${car.make} ${car.model}`,                       // custom_label_1
    car.bodyStyle,                                    // custom_label_2
    mileageBucket(car.mileage),                       // custom_label_3
    car.condition,                                    // custom_label_4
  ];

  return row.map(escapeCsv).join(",");
}

/**
 * Bucket mileage into bands. Useful for Snapchat audience segmentation —
 * you can target "low mileage" buyers separately from "high mileage value" buyers.
 */
function mileageBucket(mileage: number): string {
  if (mileage < 15_000) return "under_15k";
  if (mileage < 30_000) return "15k_30k";
  if (mileage < 60_000) return "30k_60k";
  if (mileage < 100_000) return "60k_100k";
  return "over_100k";
}
