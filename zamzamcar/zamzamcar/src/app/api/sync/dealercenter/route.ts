/**
 * GET /api/sync/dealercenter
 *
 * Cron-triggered job that refreshes the inventory cache from DealerCenter.
 *
 * Schedule via vercel.json:
 *   { "crons": [{ "path": "/api/sync/dealercenter", "schedule": "0,30 * * * *" }] }
 *
 * Security:
 *   Vercel cron requests include a Bearer token (CRON_SECRET). We verify it
 *   so the endpoint can't be spammed by outsiders. For manual sync, send
 *   the same header explicitly.
 *
 * On success:
 *   1. Fetch fresh feed
 *   2. Transform to unified Car shape
 *   3. Replace cached snapshot in KV
 *   4. Trigger ISR revalidation for /inventory and /inventory/[stockNumber]
 *   5. Return sync report
 */

import { NextResponse, type NextRequest } from "next/server";
import { revalidateTag } from "next/cache";
import { fetchDealerCenterInventory } from "@/lib/dealercenter/client";
import { transformFeed } from "@/lib/dealercenter/transformer";
import { setCachedInventory } from "@/lib/cache/inventory";
import { syncMerchantCenter } from "@/lib/google-merchant/diff-sync";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60; // up to 60s for large feeds (Pro plan)

export async function GET(request: NextRequest) {
  const startedAt = Date.now();

  // Auth: accept Vercel's cron header OR an explicit secret for manual triggers
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("[sync] Starting DealerCenter sync...");

    const rawVehicles = await fetchDealerCenterInventory();
    console.log(`[sync] Fetched ${rawVehicles.length} raw vehicles`);

    const cars = transformFeed(rawVehicles);
    const skipped = rawVehicles.length - cars.length;

    await setCachedInventory(cars);

    // Bust ALL feed caches the instant inventory changes. This is the link
    // that keeps Google/Meta/TikTok/Snapchat seeing fresh prices and removes
    // sold cars from active ads within minutes — not hours.
    revalidateTag("inventory");
    revalidateTag("feeds");

    // Push deltas to Merchant Center via Content API.
    // Best-effort: if Google API has issues, log but don't fail the whole sync.
    // The scheduled feed pull is the safety net.
    let merchantResult: Awaited<ReturnType<typeof syncMerchantCenter>> | { skipped: true } | { error: string } =
      { skipped: true };

    if (process.env.GOOGLE_MERCHANT_ID && process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
      try {
        merchantResult = await syncMerchantCenter(cars);
        console.log("[sync] Merchant Center delta push:", merchantResult);
      } catch (err) {
        merchantResult = {
          error: err instanceof Error ? err.message : String(err),
        };
        console.error("[sync] Merchant Center push failed (non-fatal):", err);
      }
    }

    const durationMs = Date.now() - startedAt;
    const report = {
      success: true,
      fetched: rawVehicles.length,
      transformed: cars.length,
      skipped,
      merchantCenter: merchantResult,
      durationMs,
      timestamp: new Date().toISOString(),
    };

    console.log("[sync] Complete:", report);
    return NextResponse.json(report);
  } catch (err) {
    const durationMs = Date.now() - startedAt;
    const message = err instanceof Error ? err.message : String(err);
    console.error("[sync] Failed:", message);

    return NextResponse.json(
      {
        success: false,
        error: message,
        durationMs,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
