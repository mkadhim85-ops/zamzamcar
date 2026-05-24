/**
 * JSON-LD Schema.org generators.
 *
 * Google has deprecated some itemProp microdata extraction in favor of JSON-LD.
 * Pages embed these via <script type="application/ld+json"> for maximum coverage.
 *
 * Schemas used:
 *   - AutoDealer (homepage, footer) — wins business panel in search
 *   - Vehicle + Offer (car detail page) — wins price + image in SERP
 *   - FAQPage (FAQ section) — wins "People Also Ask" accordion
 *   - AggregateRating + Review (testimonials) — wins star rating display
 *   - BreadcrumbList (interior pages) — wins breadcrumb trail
 *
 * Test these at: https://search.google.com/test/rich-results
 */

import { DEALER, SITE } from "@/lib/config";
import { AGGREGATE_RATING } from "@/lib/data/content";
import type { Testimonial, FAQ } from "@/types/ui";
import type { DisplayCar } from "@/types/ui";

export function autoDealerSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "AutoDealer",
    "@id": `${SITE.url}/#dealer`,
    name: DEALER.name,
    legalName: DEALER.legalName,
    description: SITE.description,
    url: SITE.url,
    telephone: DEALER.phone,
    email: DEALER.email,
    foundingDate: String(DEALER.established),
    address: {
      "@type": "PostalAddress",
      streetAddress: DEALER.address,
      addressLocality: DEALER.city,
      addressRegion: DEALER.state,
      postalCode: DEALER.zip,
      addressCountry: DEALER.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: DEALER.geo.latitude,
      longitude: DEALER.geo.longitude,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "09:00",
        closes: "19:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Saturday",
        opens: "09:00",
        closes: "18:00",
      },
    ],
    sameAs: [DEALER.social.facebook, DEALER.social.instagram, DEALER.social.google],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: AGGREGATE_RATING.ratingValue,
      reviewCount: AGGREGATE_RATING.reviewCount,
      bestRating: AGGREGATE_RATING.bestRating,
      worstRating: AGGREGATE_RATING.worstRating,
    },
  };
}

export function vehicleSchema(car: DisplayCar) {
  const priceDollars = car.price / 100;

  return {
    "@context": "https://schema.org",
    "@type": "Vehicle",
    "@id": `${SITE.url}/inventory/${car.stockNumber}#vehicle`,
    name: `${car.year} ${car.make} ${car.model}${car.trim ? ` ${car.trim}` : ""}`,
    description: `${car.year} ${car.make} ${car.model} ${car.trim || ""} for sale at ${DEALER.name} in ${DEALER.city}, ${DEALER.state}.`.trim(),
    image: car.images.map((img) => img.url),
    brand: { "@type": "Brand", name: car.make },
    model: car.model,
    vehicleModelDate: String(car.year),
    vehicleIdentificationNumber: car.vin,
    mileageFromOdometer: {
      "@type": "QuantitativeValue",
      value: car.mileage,
      unitCode: "SMI",
    },
    fuelType: car.fuelType,
    vehicleTransmission: car.transmission,
    driveWheelConfiguration: car.drivetrain,
    bodyType: car.bodyStyle,
    color: car.exteriorColor,
    vehicleEngine: car.engine
      ? { "@type": "EngineSpecification", name: car.engine }
      : undefined,
    numberOfPreviousOwners: car.ownerCount,
    offers: {
      "@type": "Offer",
      url: `${SITE.url}/inventory/${car.stockNumber}`,
      price: priceDollars,
      priceCurrency: "USD",
      availability:
        car.status === "available"
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      itemCondition:
        car.condition === "new"
          ? "https://schema.org/NewCondition"
          : "https://schema.org/UsedCondition",
      seller: { "@id": `${SITE.url}/#dealer` },
    },
  };
}

export function faqPageSchema(faqs: FAQ[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  };
}

export function reviewSchema(testimonials: Testimonial[]) {
  return testimonials.map((t) => ({
    "@context": "https://schema.org",
    "@type": "Review",
    reviewRating: {
      "@type": "Rating",
      ratingValue: t.rating,
      bestRating: 5,
    },
    author: { "@type": "Person", name: t.author },
    reviewBody: t.quote,
    publisher: { "@id": `${SITE.url}/#dealer` },
  }));
}

/**
 * Helper to render a JSON-LD script tag.
 * Usage in a Server Component:
 *
 * <script
 *   type="application/ld+json"
 *   dangerouslySetInnerHTML={{ __html: jsonLd(autoDealerSchema()) }}
 * />
 */
export function jsonLd(schema: object): string {
  return JSON.stringify(schema);
}
