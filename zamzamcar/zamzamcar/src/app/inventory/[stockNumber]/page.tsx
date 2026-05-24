import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TopBar } from "@/components/layout/top-bar";
import { MainNav } from "@/components/layout/main-nav";
import { Footer } from "@/components/layout/footer";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { CarGallery } from "@/components/cars/car-gallery";
import { CarSpecs, CarFeatures } from "@/components/cars/car-specs";
import { CarDetailSidebar } from "@/components/cars/car-detail-sidebar";
import { FinancingWidget } from "@/components/cars/financing-widget";
import { SimilarVehicles } from "@/components/cars/similar-vehicles";
import { FEATURED_INVENTORY, getPriceDollars } from "@/lib/data/inventory";
import { getCarByStockNumber, getGalleryImages } from "@/lib/data/gallery";
import { vehicleSchema, jsonLd } from "@/lib/seo/schema";
import { SITE, DEALER } from "@/lib/config";

interface Props {
  params: Promise<{ stockNumber: string }>;
}

/**
 * Dynamic SEO metadata per vehicle.
 *
 * Each car gets a unique title, description, OG image. This is how Google
 * indexes thousands of inventory pages — without dynamic metadata they'd all
 * compete with each other for the same keywords.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { stockNumber } = await params;
  const car = getCarByStockNumber(FEATURED_INVENTORY, stockNumber);

  if (!car) {
    return {
      title: "Vehicle not found",
      robots: { index: false, follow: false },
    };
  }

  const dollars = getPriceDollars(car);
  const title = `${car.year} ${car.make} ${car.model} ${car.trim || ""} for Sale`;
  const description = `${car.year} ${car.make} ${car.model} ${car.trim || ""} with ${car.mileage.toLocaleString()} miles in ${car.exteriorColor}. $${dollars.toLocaleString()} at ${DEALER.name} in ${DEALER.city}, ${DEALER.state}. Free CARFAX, transparent Out-the-Door pricing.`;
  const primaryImage = car.images[0]?.url || SITE.ogImage;
  const url = `${SITE.url}/inventory/${car.stockNumber}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      title,
      description,
      images: [{ url: primaryImage, width: 1200, height: 800, alt: title }],
      siteName: SITE.name,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [primaryImage],
    },
  };
}

/**
 * Pre-generate static pages for all inventory at build time.
 *
 * When DealerCenter sync runs (every 30 min), it triggers ISR revalidation
 * via revalidateTag("inventory") so new/updated cars get fresh static pages
 * without a full rebuild.
 */
export async function generateStaticParams() {
  return FEATURED_INVENTORY.map((car) => ({ stockNumber: car.stockNumber }));
}

/**
 * Car detail page.
 *
 * Layout:
 *   - Breadcrumbs (Home > Inventory > [Vehicle])
 *   - Two-column desktop: gallery+specs on left, sticky sidebar+financing on right
 *   - Single-column mobile: gallery, sidebar, specs, financing, similar
 *
 * Server Component fetches the car data; client interactivity (gallery
 * lightbox, financing sliders, contact modal) lives in nested client comps.
 */
export default async function CarDetailPage({ params }: Props) {
  const { stockNumber } = await params;
  const car = getCarByStockNumber(FEATURED_INVENTORY, stockNumber);

  if (!car) notFound();

  const images = getGalleryImages(car);
  const vehicleName = `${car.year} ${car.make} ${car.model} ${car.trim || ""}`.trim();
  const dollars = getPriceDollars(car);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(vehicleSchema(car)) }}
      />

      <TopBar />
      <MainNav />

      <main
        itemScope
        itemType="https://schema.org/Vehicle"
      >
        <meta itemProp="brand" content={car.make} />
        <meta itemProp="model" content={car.model} />
        <meta itemProp="vehicleModelDate" content={String(car.year)} />
        <meta itemProp="vehicleIdentificationNumber" content={car.vin} />

        {/* Breadcrumbs bar */}
        <div className="bg-slate-50 border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 lg:px-8 py-3">
            <Breadcrumbs
              items={[
                { label: "Inventory", href: "/inventory" },
                { label: vehicleName },
              ]}
            />
          </div>
        </div>

        {/* Main two-column layout */}
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 lg:py-10">
          <div className="grid lg:grid-cols-[1.5fr_1fr] gap-6 lg:gap-10">
            {/* Left column: gallery */}
            <div>
              <CarGallery images={images} vehicleName={vehicleName} />
            </div>

            {/* Right column: sidebar (sticky on desktop) */}
            <div className="lg:sticky lg:top-20 lg:self-start space-y-6">
              <CarDetailSidebar car={car} />
            </div>
          </div>

          {/* Full-width sections below the fold */}
          <div className="mt-10 lg:mt-14 grid lg:grid-cols-[1.5fr_1fr] gap-6 lg:gap-10">
            <div className="space-y-10">
              <CarSpecs car={car} />
              <CarFeatures car={car} />
            </div>

            <div className="lg:sticky lg:top-20 lg:self-start">
              <FinancingWidget vehiclePrice={dollars} />
            </div>
          </div>
        </div>

        <SimilarVehicles currentCar={car} inventory={FEATURED_INVENTORY} />
      </main>

      <Footer />
    </>
  );
}
