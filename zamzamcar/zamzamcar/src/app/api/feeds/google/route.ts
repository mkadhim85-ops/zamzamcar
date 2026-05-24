/**
 * GET /api/feeds/google
 *
 * Submit this URL to Google Merchant Center:
 *   Products → Feeds → Add primary feed → Scheduled fetch
 *   URL: https://zamzamcar.com/api/feeds/google
 *   Frequency: Daily (or hourly for ag g res si v e freshness)
 *
 * Format: RSS 2.0 XML with g: namespace, optimized for Vehicle Ads.
 */

import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { getCachedInventory } from "@/lib/cache/inventory";
import { buildGoogleMerchantFeed } from "@/lib/feeds/google";
import { feedCacheHeaders } from "@/lib/feeds/shared";

export const runtime = "nodejs";

// Wrap feed generation in unstable_cache so repeated requests within the same
// inventory snapshot don't re-stringify the whole XML. revalidateTag('feeds')
// in /api/sync busts this immediately when inventory changes.
const getGoogleFeed = unstable_cache(
  async () => {
    const cars = await getCachedInventory();
    return buildGoogleMerchantFeed(cars);
  },
  ["feed:google"],
  {
    tags: ["feeds", "inventory"],
    revalidate: 300, // Background refresh every 5 min
  }
);

export async function GET() {
  try {
    const xml = await getGoogleFeed();
    return new NextResponse(xml, {
      status: 200,
      headers: feedCacheHeaders("application/xml; charset=utf-8"),
    });
  } catch (err) {
    console.error("[feed:google] Failed:", err);
    return NextResponse.json(
      { error: "Failed to generate Google Merchant feed" },
      { status: 500 }
    );
  }
}
