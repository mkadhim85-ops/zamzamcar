/**
 * GET /api/feeds/status
 *
 * Health check for all marketing feeds. Returns metadata about each feed:
 *   - URL to submit to the ad platform
 *   - Number of eligible vehicles
 *   - Last inventory sync time
 *   - Content hash (changes when inventory changes)
 *
 * Useful for:
 *   - Internal admin dashboard
 *   - Monitoring / alerting if feeds go stale
 *   - Verifying that a sync actually changed the feeds
 */

import { NextResponse } from "next/server";
import { getCachedInventory, getLastSyncTime } from "@/lib/cache/inventory";
import { computeInventoryHash, isFeedEligible } from "@/lib/feeds/shared";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://zamzamcar.com";

export async function GET() {
  try {
    const cars = await getCachedInventory();
    const lastSync = await getLastSyncTime();
    const eligibleCount = cars.filter(isFeedEligible).length;
    const hash = computeInventoryHash(cars);

    return NextResponse.json({
      ok: true,
      inventory: {
        total: cars.length,
        eligibleForAds: eligibleCount,
        excluded: cars.length - eligibleCount,
        lastSyncAt: lastSync,
        contentHash: hash,
      },
      feeds: [
        {
          platform: "google_merchant",
          format: "RSS 2.0 XML",
          url: `${SITE_URL}/api/feeds/google`,
          vehicles: eligibleCount,
        },
        {
          platform: "meta",
          format: "CSV",
          url: `${SITE_URL}/api/feeds/meta`,
          vehicles: eligibleCount,
        },
        {
          platform: "tiktok",
          format: "CSV",
          url: `${SITE_URL}/api/feeds/tiktok`,
          vehicles: eligibleCount,
        },
        {
          platform: "snapchat",
          format: "CSV",
          url: `${SITE_URL}/api/feeds/snapchat`,
          vehicles: eligibleCount,
        },
      ],
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
