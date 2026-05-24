/**
 * Google Merchant feed generator.
 *
 * Format: RSS 2.0 with Google's `g:` namespace.
 * Spec: https://support.google.com/merchants/answer/7052112 (product data spec)
 * Vehicle ads: https://support.google.com/merchants/answer/13674860
 *
 * Why RSS over CSV for Google?
 *   - Vehicle attributes (vehicle_fulfillment, vehicle_*) are cleaner in XML
 *   - Additional images (g:additional_image_link) repeat naturally as elements
 *   - Google's own examples for vehicle inventory are all XML
 */

import type { Car, FuelType } from "@/types/car";
import {
  buildAdDescription,
  buildAdTitle,
  escapeXml,
  formatPriceWithCurrency,
  getAdditionalImageUrls,
  getPrimaryImageUrl,
  getTaggedUrl,
  isFeedEligible,
} from "./shared";

const FEED_TITLE = "ZamZam Car Inventory";
const FEED_DESCRIPTION = "Live vehicle inventory feed for Google Merchant Center";
const FEED_LINK =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://zamzamcar.com";
const MERCHANT_ID = process.env.GOOGLE_MERCHANT_ID ?? "";

export function buildGoogleMerchantFeed(cars: Car[]): string {
  const eligible = cars.filter(isFeedEligible);
  const now = new Date().toUTCString();

  const items = eligible.map(buildVehicleItem).join("\n");

  // Merchant ID isn't part of the public Shopping feed spec, but Google's
  // crawler logs it as a hint. Comment is harmless if MID isn't set.
  const merchantHint = MERCHANT_ID
    ? `\n<!-- Merchant Center ID: ${MERCHANT_ID} -->`
    : "";

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
<channel>${merchantHint}
<title>${escapeXml(FEED_TITLE)}</title>
<link>${escapeXml(FEED_LINK)}</link>
<description>${escapeXml(FEED_DESCRIPTION)}</description>
<lastBuildDate>${now}</lastBuildDate>
${items}
</channel>
</rss>`;
}

function buildVehicleItem(car: Car): string {
  const title = escapeXml(buildAdTitle(car));
  const description = escapeXml(buildAdDescription(car));
  const link = escapeXml(getTaggedUrl(car, "google", "cpc"));
  const imageLink = escapeXml(getPrimaryImageUrl(car));
  const additionalImages = getAdditionalImageUrls(car, 10)
    .map((url) => `  <g:additional_image_link>${escapeXml(url)}</g:additional_image_link>`)
    .join("\n");

  const price = formatPriceWithCurrency(car.price);

  // Vehicle-specific identifiers — required for Vehicle Ads
  const vehicleFulfillment = car.condition === "new" ? "new" : "used";

  // Map our fuel types to Google's accepted values
  const googleFuelType = mapFuelTypeToGoogle(car.fuelType);

  // Google requires google_product_category for vehicles: "888" = Vehicles & Parts > Vehicles
  // Or the full path. We use the full path for clarity.
  const productCategory = "Vehicles &amp; Parts &gt; Vehicles";

  return `<item>
  <g:id>${escapeXml(car.stockNumber)}</g:id>
  <g:mpn>${escapeXml(car.vin)}</g:mpn>
  <title>${title}</title>
  <description>${description}</description>
  <link>${link}</link>
  <g:image_link>${imageLink}</g:image_link>
${additionalImages}
  <g:availability>in_stock</g:availability>
  <g:price>${escapeXml(price)}</g:price>
  <g:condition>${car.condition === "new" ? "new" : "used"}</g:condition>
  <g:brand>${escapeXml(car.make)}</g:brand>
  <g:product_type>${escapeXml(productCategory)}</g:product_type>
  <g:google_product_category>${productCategory}</g:google_product_category>
  <g:identifier_exists>yes</g:identifier_exists>
  <g:vehicle_fulfillment>${vehicleFulfillment}</g:vehicle_fulfillment>
  <g:vehicle_year>${car.year}</g:vehicle_year>
  <g:vehicle_make>${escapeXml(car.make)}</g:vehicle_make>
  <g:vehicle_model>${escapeXml(car.model)}</g:vehicle_model>${
    car.trim ? `\n  <g:vehicle_trim>${escapeXml(car.trim)}</g:vehicle_trim>` : ""
  }
  <g:vehicle_vin>${escapeXml(car.vin)}</g:vehicle_vin>
  <g:vehicle_mileage>${car.mileage} mi</g:vehicle_mileage>
  <g:vehicle_color>${escapeXml(car.exteriorColor)}</g:vehicle_color>
  <g:vehicle_body_style>${mapBodyStyleToGoogle(car.bodyStyle)}</g:vehicle_body_style>
  <g:vehicle_transmission>${mapTransmissionToGoogle(
    car.transmission
  )}</g:vehicle_transmission>
  <g:vehicle_drivetrain>${mapDrivetrainToGoogle(car.drivetrain)}</g:vehicle_drivetrain>
  <g:vehicle_fuel_type>${googleFuelType}</g:vehicle_fuel_type>${
    car.mpgCity
      ? `\n  <g:vehicle_fuel_economy_city>${car.mpgCity} MPG</g:vehicle_fuel_economy_city>`
      : ""
  }${
    car.mpgHighway
      ? `\n  <g:vehicle_fuel_economy_highway>${car.mpgHighway} MPG</g:vehicle_fuel_economy_highway>`
      : ""
  }
</item>`;
}

// ── Google value mappings ───────────────────────────────────────────────────
// Google has its own controlled vocabularies. Sending values outside these
// lists causes feed warnings and reduced ad eligibility.

function mapFuelTypeToGoogle(fuel: FuelType): string {
  switch (fuel) {
    case "gasoline":
      return "Gasoline";
    case "diesel":
      return "Diesel";
    case "electric":
      return "Electric";
    case "hybrid":
      return "Hybrid";
    case "plug-in-hybrid":
      return "Plug-in Hybrid";
    default:
      return "Other";
  }
}

function mapBodyStyleToGoogle(body: string): string {
  // Google accepts: SUV, Sedan, Coupe, Convertible, Hatchback, Truck, Van, Wagon, Other
  const map: Record<string, string> = {
    sedan: "Sedan",
    suv: "SUV",
    truck: "Truck",
    coupe: "Coupe",
    convertible: "Convertible",
    hatchback: "Hatchback",
    wagon: "Wagon",
    van: "Van",
    minivan: "Van",
  };
  return map[body] ?? "Other";
}

function mapTransmissionToGoogle(trans: string): string {
  // Google accepts: Automatic, Manual, Other
  return trans === "manual" ? "Manual" : "Automatic";
}

function mapDrivetrainToGoogle(drive: string): string {
  // Google accepts: AWD, FWD, RWD, 4WD
  return drive.toUpperCase();
}
