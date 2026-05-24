import type { MetadataRoute } from "next";
import { SITE } from "@/lib/config";
import { FEATURED_INVENTORY } from "@/lib/data/inventory";

/**
 * Dynamic sitemap.xml generator.
 *
 * In production, replace FEATURED_INVENTORY with a fetch from /api/cars to
 * include every vehicle in the inventory. Next.js regenerates this on each
 * deploy and on demand via `revalidate`.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // Static pages — high authority, change infrequently
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE.url,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${SITE.url}/inventory`,
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${SITE.url}/financing`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${SITE.url}/trade-in`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${SITE.url}/sell-your-car`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${SITE.url}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE.url}/contact`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  // Vehicle pages — one per inventory item
  const vehiclePages: MetadataRoute.Sitemap = FEATURED_INVENTORY.map((car) => ({
    url: `${SITE.url}/inventory/${car.stockNumber}`,
    lastModified: new Date(car.updatedAt),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticPages, ...vehiclePages];
}
