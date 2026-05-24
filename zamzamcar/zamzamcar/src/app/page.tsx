import type { Metadata } from "next";
import { TopBar } from "@/components/layout/top-bar";
import { MainNav } from "@/components/layout/main-nav";
import { Footer } from "@/components/layout/footer";
import { Hero } from "@/components/home/hero";
import { FeaturedInventory } from "@/components/home/featured-inventory";
import { TrustBlocks } from "@/components/home/trust-blocks";
import { Testimonials } from "@/components/home/testimonials";
import { FAQSection } from "@/components/home/faq-section";
import { faqPageSchema, jsonLd } from "@/lib/seo/schema";
import { FAQS } from "@/lib/data/content";
import { SITE, DEALER } from "@/lib/config";

export const metadata: Metadata = {
  title: `Used Cars for Sale in ${DEALER.city}, ${DEALER.state} | ${DEALER.name}`,
  description: `Browse affordable used cars in ${DEALER.city}, Utah at ${DEALER.name}. Free CARFAX reports, transparent Out-the-Door pricing, all-credit financing. Call ${DEALER.phone}.`,
  alternates: { canonical: SITE.url },
};

/**
 * Homepage.
 *
 * Server Component — the orchestrator. Each section is its own component
 * (client where needed). This page handles:
 *   - SEO metadata (title, description, canonical)
 *   - FAQPage JSON-LD (AutoDealer JSON-LD is in root layout)
 *   - Section composition in the correct order
 *
 * To fetch live inventory instead of mock data, add:
 *   const cars = await fetch(`${SITE.url}/api/cars?featured=true&limit=6`)
 *     .then(r => r.json()).then(d => d.cars);
 *   ...
 *   <FeaturedInventory cars={cars} />
 */
export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(faqPageSchema(FAQS)) }}
      />

      <TopBar />
      <MainNav />

      <main>
        <Hero />
        <FeaturedInventory />
        <TrustBlocks />
        <Testimonials />
        <FAQSection />
      </main>

      <Footer />
    </>
  );
}
