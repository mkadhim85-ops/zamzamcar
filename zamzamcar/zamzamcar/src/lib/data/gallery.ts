/**
 * Gallery image enrichment.
 *
 * In production, DealerCenter sends 20-40 images per vehicle. Our mock data
 * has only one. This helper synthesizes additional gallery entries for design
 * preview by reusing the same image with different alt text — when real
 * DealerCenter data flows in, this function becomes a passthrough.
 *
 * The real implementation should be replaced once the DealerCenter image
 * pipeline is wired up. The signature stays the same so detail-page code
 * doesn't have to change.
 */

import type { DisplayCar } from "@/types/ui";
import type { CarImage } from "@/types/car";

const GALLERY_LABELS = [
  "Front exterior",
  "Side profile",
  "Rear exterior",
  "Interior dashboard",
  "Driver seat",
  "Rear seats",
  "Steering wheel detail",
  "Engine bay",
  "Trunk space",
  "Wheels and tires",
];

/**
 * Return an enriched image array for the gallery.
 *
 * If the car already has multiple images, returns them unchanged.
 * If it only has one, synthesizes additional entries reusing the same URL
 * but with distinct alt text — good for layout testing, not for production
 * (Google would penalize identical images sharing one URL).
 */
export function getGalleryImages(car: DisplayCar): CarImage[] {
  if (car.images.length > 1) return car.images;

  const primary = car.images[0];
  if (!primary) return [];

  const carName = `${car.year} ${car.make} ${car.model} ${car.trim || ""}`.trim();

  return GALLERY_LABELS.slice(0, car.photoCount > 10 ? 10 : car.photoCount).map(
    (label, i) => ({
      url: primary.url,
      alt: `${carName} — ${label}`,
      isPrimary: i === 0,
    })
  );
}

/**
 * Look up a car by stock number from the mock inventory.
 * Replace with API fetch when going live: GET /api/cars/[stockNumber]
 */
export function getCarByStockNumber(
  inventory: DisplayCar[],
  stockNumber: string
): DisplayCar | undefined {
  return inventory.find(
    (c) => c.stockNumber.toLowerCase() === stockNumber.toLowerCase()
  );
}
