/**
 * GET /api/feeds/tiktok
 *
 * Submit to TikTok Ads Manager:
 *   Assets → Catalog → Create catalog → Vehicle vertical
 *   Data feed → Scheduled feed URL
 *   URL: https://zamzamcar.com/api/feeds/tiktok
 *   Frequency: Hourly recommended
 */

import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { getCachedInventory } from "@/lib/cache/inventory";
import { buildTikTokFeed } from "@/lib/feeds/tiktok";
import { feedCacheHeaders } from "@/lib/feeds/shared";

export const runtime = "nodejs";

const getTikTokFeed = unstable_cache(
  async () => {
    const cars = await getCachedInventory();
    return buildTikTokFeed(cars);
  },
  ["feed:tiktok"],
  { tags: ["feeds", "inventory"], revalidate: 300 }
);

export async function GET() {
  try {
    const csv = await getTikTokFeed();
    return new NextResponse(csv, {
      status: 200,
      headers: {
        ...feedCacheHeaders("text/csv; charset=utf-8"),
        "Content-Disposition": 'inline; filename="zamzamcar-tiktok.csv"',
      },
    });
  } catch (err) {
    console.error("[feed:tiktok] Failed:", err);
    return NextResponse.json(
      { error: "Failed to generate TikTok catalog feed" },
      { status: 500 }
    );
  }
}
