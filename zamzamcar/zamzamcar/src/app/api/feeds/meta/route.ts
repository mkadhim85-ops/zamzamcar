/**
 * GET /api/feeds/meta
 *
 * Submit to Meta Commerce Manager:
 *   Catalog → Data sources → Add → Scheduled feed
 *   URL: https://zamzamcar.com/api/feeds/meta
 *   Type: Automotive (Vehicles)
 *   Frequency: Hourly recommended for active inventories
 *
 * Format: CSV. Same data powers both Facebook Marketplace ads and Instagram
 * shopping/catalog ads.
 */

import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { getCachedInventory } from "@/lib/cache/inventory";
import { buildMetaFeed } from "@/lib/feeds/meta";
import { feedCacheHeaders } from "@/lib/feeds/shared";

export const runtime = "nodejs";

const getMetaFeed = unstable_cache(
  async () => {
    const cars = await getCachedInventory();
    return buildMetaFeed(cars);
  },
  ["feed:meta"],
  { tags: ["feeds", "inventory"], revalidate: 300 }
);

export async function GET() {
  try {
    const csv = await getMetaFeed();
    return new NextResponse(csv, {
      status: 200,
      headers: {
        ...feedCacheHeaders("text/csv; charset=utf-8"),
        "Content-Disposition": 'inline; filename="zamzamcar-meta.csv"',
      },
    });
  } catch (err) {
    console.error("[feed:meta] Failed:", err);
    return NextResponse.json(
      { error: "Failed to generate Meta catalog feed" },
      { status: 500 }
    );
  }
}
