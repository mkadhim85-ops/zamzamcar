/**
 * GET /api/cars/[stockNumber]
 *
 * Returns a single car by stock number. Used by the detail page and by
 * any future AI features that need to fetch a specific vehicle.
 */

import { NextResponse } from "next/server";
import { getCachedInventory } from "@/lib/cache/inventory";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ stockNumber: string }> }
) {
  try {
    const { stockNumber } = await context.params;
    const inventory = await getCachedInventory();
    const car = inventory.find(
      (c) => c.stockNumber.toLowerCase() === stockNumber.toLowerCase()
    );

    if (!car) {
      return NextResponse.json(
        { error: "Vehicle not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { car },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (err) {
    console.error("[GET /api/cars/[stockNumber]] Error:", err);
    return NextResponse.json(
      { error: "Failed to fetch vehicle" },
      { status: 500 }
    );
  }
}
