/**
 * POST /api/google-merchant/push
 *
 * Triggers a differential push to Google Merchant Center.
 * Called automatically after each DealerCenter sync (see sync route),
 * OR manually for emergency updates.
 *
 * Auth: Bearer CRON_SECRET (same as inventory sync)
 */

import { NextResponse, type NextRequest } from "next/server";
import { getCachedInventory } from "@/lib/cache/inventory";
import { syncMerchantCenter } from "@/lib/google-merchant/diff-sync";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.GOOGLE_MERCHANT_ID || !process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
    return NextResponse.json(
      {
        error:
          "Content API not configured. Set GOOGLE_MERCHANT_ID and GOOGLE_SERVICE_ACCOUNT_KEY.",
      },
      { status: 503 }
    );
  }

  const startedAt = Date.now();
  try {
    const inventory = await getCachedInventory();
    const result = await syncMerchantCenter(inventory);

    return NextResponse.json({
      success: true,
      durationMs: Date.now() - startedAt,
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[merchant-push] Failed:", err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : String(err),
        durationMs: Date.now() - startedAt,
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return POST(request);
}
