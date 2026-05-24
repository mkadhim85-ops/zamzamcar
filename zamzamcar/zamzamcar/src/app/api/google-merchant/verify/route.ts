/**
 * GET /api/google-merchant/verify?stock=12345
 * GET /api/google-merchant/verify?summary=true
 *
 * Checks the actual status of products in Merchant Center.
 *
 *   - With ?stock=N: returns approval state + any issues for one car
 *   - With ?summary=true: returns counts across the whole inventory
 *
 * This is what catches problems like:
 *   - "Disapproved: Image quality too low"
 *   - "Warning: Price doesn't match landing page"
 *   - "Pending: Awaiting review"
 *
 * Without this, ad spend can go to disapproved products silently.
 */

import { NextResponse, type NextRequest } from "next/server";
import { getCachedInventory } from "@/lib/cache/inventory";
import { getProductStatus } from "@/lib/google-merchant/client";
import { isFeedEligible } from "@/lib/feeds/shared";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Result of checking one car's MC status.
 *
 * Discriminated union: every variant has a literal `kind` field so TypeScript
 * can narrow the type after a single check. This is more robust than `in`
 * checks, which only narrow object shape — not field types.
 */
type CheckResult =
  | {
      kind: "ok";
      stockNumber: string;
      found: boolean;
      approved: boolean;
      issueCount: number;
      topIssue: string | undefined;
    }
  | {
      kind: "error";
      stockNumber: string;
      error: string;
    };

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const stockNumber = params.get("stock");
  const wantSummary = params.get("summary") === "true";

  if (!process.env.GOOGLE_MERCHANT_ID || !process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
    return NextResponse.json(
      { error: "Content API not configured" },
      { status: 503 }
    );
  }

  try {
    if (stockNumber) {
      const status = await getProductStatus(stockNumber);
      return NextResponse.json({ stockNumber, ...status });
    }

    if (wantSummary) {
      return await buildSummary();
    }

    return NextResponse.json(
      {
        error: "Provide either ?stock=N or ?summary=true",
      },
      { status: 400 }
    );
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}

/**
 * Summary check — samples up to 20 eligible cars and reports their statuses.
 * We don't check all because that would hit API quotas hard. The sample is
 * representative enough to catch systemic issues.
 */
async function buildSummary() {
  const inventory = await getCachedInventory();
  const eligible = inventory.filter(isFeedEligible);
  const sample = eligible.slice(0, 20);

  const results: CheckResult[] = await Promise.all(
    sample.map(async (car): Promise<CheckResult> => {
      try {
        const status = await getProductStatus(car.stockNumber);
        return {
          kind: "ok",
          stockNumber: car.stockNumber,
          found: status.found,
          approved:
            status.destinationStatuses?.some(
              (d) => d.destination === "Shopping" && d.status === "approved"
            ) ?? false,
          issueCount: status.issues?.length ?? 0,
          topIssue: status.issues?.[0]?.description,
        };
      } catch (err) {
        return {
          kind: "error",
          stockNumber: car.stockNumber,
          error: err instanceof Error ? err.message : String(err),
        };
      }
    })
  );

  // Each filter below uses the `kind` discriminator so TypeScript narrows
  // the type correctly inside the predicate — no `possibly undefined` errors.
  const found = results.filter((r) => r.kind === "ok" && r.found).length;
  const approved = results.filter((r) => r.kind === "ok" && r.approved).length;
  const withIssues = results.filter(
    (r) => r.kind === "ok" && r.issueCount > 0
  ).length;

  return NextResponse.json({
    inventoryTotal: inventory.length,
    adsEligible: eligible.length,
    sampled: sample.length,
    found,
    approved,
    withIssues,
    notFound: sample.length - found,
    sampleDetails: results,
  });
}
