/**
 * GET /api/feeds/snapchat
 *
 * Submit to Snapchat Ads Manager:
 *   Catalogs → Create catalog → Add data source → Scheduled fetch
 *   URL: https://zamzamcar.com/api/feeds/snapchat
 *   Frequency: Daily (Snapchat's max is daily on most plans)
 */

import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { getCachedInventory } from "@/lib/cache/inventory";
import { buildSnapchatFeed } from "@/lib/feeds/snapchat";
import { feedCacheHeaders } from "@/lib/feeds/shared";

export const runtime = "nodejs";

const getSnapchatFeed = unstable_cache(
  async () => {
    const cars = await getCachedInventory();
    return buildSnapchatFeed(cars);
  },
  ["feed:snapchat"],
  { tags: ["feeds", "inventory"], revalidate: 300 }
);

export async function GET() {
  try {
    const csv = await getSnapchatFeed();
    return new NextResponse(csv, {
      status: 200,
      headers: {
        ...feedCacheHeaders("text/csv; charset=utf-8"),
        "Content-Disposition": 'inline; filename="zamzamcar-snapchat.csv"',
      },
    });
  } catch (err) {
    console.error("[feed:snapchat] Failed:", err);
    return NextResponse.json(
      { error: "Failed to generate Snapchat catalog feed" },
      { status: 500 }
    );
  }
}
