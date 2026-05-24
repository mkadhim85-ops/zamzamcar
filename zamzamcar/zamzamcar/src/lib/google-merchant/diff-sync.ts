/**
 * Differential sync to Google Merchant Center.
 *
 * The point: don't push 500 unchanged products to Google every 30 minutes.
 * Instead, on each inventory sync we:
 *   1. Compare new inventory to last snapshot
 *   2. Identify added, modified, removed cars
 *   3. Push ONLY those deltas via Content API batch
 *
 * Benefits:
 *   - Far fewer API calls (Google has per-day quotas)
 *   - Faster sync (skip 95% of products that didn't change)
 *   - Cleaner audit trail (logs show exactly what changed)
 */

import type { Car } from "@/types/car";
import { batchPushVehicles } from "./client";
import { isFeedEligible } from "@/lib/feeds/shared";

const SNAPSHOT_KEY = "merchant:last-snapshot:v1";

interface VehicleSignature {
  stockNumber: string;
  hash: string;
}

interface DiffResult {
  added: Car[];
  modified: Car[];
  removed: string[]; // stock numbers
  unchanged: number;
}

/**
 * Compute a fingerprint of every car's ad-relevant fields.
 * If this hash changes, the product needs to be re-pushed.
 * Fields included are the ones that appear in Google ads and affect bidding.
 */
function signatureOf(car: Car): VehicleSignature {
  const fields = [
    car.price,
    car.status,
    car.mileage,
    car.images.length,
    car.images[0]?.url ?? "",
    car.exteriorColor,
    car.year,
    car.make,
    car.model,
    car.trim ?? "",
    car.condition,
  ].join("|");

  return {
    stockNumber: car.stockNumber,
    hash: simpleHash(fields),
  };
}

function simpleHash(input: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16);
}

/**
 * Compare a fresh inventory snapshot to the last one and identify changes.
 * Cars not eligible for ads (sold, missing data, etc.) appear in `removed`
 * because they should be pulled from Merchant Center even if they still
 * technically exist in DealerCenter.
 */
export function diffInventory(
  newInventory: Car[],
  oldSignatures: VehicleSignature[]
): DiffResult {
  const newEligible = newInventory.filter(isFeedEligible);
  const newSigs = newEligible.map(signatureOf);
  const newByStock = new Map(newSigs.map((s) => [s.stockNumber, s]));
  const oldByStock = new Map(oldSignatures.map((s) => [s.stockNumber, s]));
  const newCarByStock = new Map(newEligible.map((c) => [c.stockNumber, c]));

  const added: Car[] = [];
  const modified: Car[] = [];
  const removed: string[] = [];
  let unchanged = 0;

  // Find added and modified
  for (const sig of newSigs) {
    const old = oldByStock.get(sig.stockNumber);
    const car = newCarByStock.get(sig.stockNumber);
    if (!car) continue;

    if (!old) {
      added.push(car);
    } else if (old.hash !== sig.hash) {
      modified.push(car);
    } else {
      unchanged++;
    }
  }

  // Find removed — in old snapshot but not in new (or now ineligible)
  for (const sig of oldSignatures) {
    if (!newByStock.has(sig.stockNumber)) {
      removed.push(sig.stockNumber);
    }
  }

  return { added, modified, removed, unchanged };
}

/**
 * Execute the differential sync end to end:
 *   1. Load previous snapshot from KV
 *   2. Diff against new inventory
 *   3. Push deltas via batch API
 *   4. Save new snapshot for next time
 */
export async function syncMerchantCenter(newInventory: Car[]): Promise<{
  diff: { added: number; modified: number; removed: number; unchanged: number };
  pushResult: {
    total: number;
    succeeded: number;
    failed: number;
    errors: Array<{ id: string; error: string }>;
  };
}> {
  const oldSignatures = await loadSnapshot();
  const diff = diffInventory(newInventory, oldSignatures);

  // Skip API call entirely if nothing changed — saves quota
  if (diff.added.length === 0 && diff.modified.length === 0 && diff.removed.length === 0) {
    return {
      diff: {
        added: 0,
        modified: 0,
        removed: 0,
        unchanged: diff.unchanged,
      },
      pushResult: { total: 0, succeeded: 0, failed: 0, errors: [] },
    };
  }

  const pushResult = await batchPushVehicles(
    [...diff.added, ...diff.modified],
    diff.removed
  );

  // Only update snapshot if push succeeded; otherwise we'd lose track of
  // what's actually in Merchant Center.
  if (pushResult.failed === 0) {
    const newSignatures = newInventory.filter(isFeedEligible).map(signatureOf);
    await saveSnapshot(newSignatures);
  }

  return {
    diff: {
      added: diff.added.length,
      modified: diff.modified.length,
      removed: diff.removed.length,
      unchanged: diff.unchanged,
    },
    pushResult,
  };
}

// ── Snapshot persistence (uses same KV as inventory cache) ─────────────────

interface KvLike {
  get<T>(key: string): Promise<T | null>;
  set(key: string, value: unknown): Promise<unknown>;
}

let kvCache: KvLike | null | undefined;

async function getKv(): Promise<KvLike | null> {
  if (kvCache !== undefined) return kvCache;
  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
    kvCache = null;
    return null;
  }
  try {
    const mod = await import("@vercel/kv");
    kvCache = mod.kv as unknown as KvLike;
    return kvCache;
  } catch {
    kvCache = null;
    return null;
  }
}

async function loadSnapshot(): Promise<VehicleSignature[]> {
  const kv = await getKv();
  if (!kv) return [];
  return (await kv.get<VehicleSignature[]>(SNAPSHOT_KEY)) ?? [];
}

async function saveSnapshot(signatures: VehicleSignature[]): Promise<void> {
  const kv = await getKv();
  if (!kv) return;
  await kv.set(SNAPSHOT_KEY, signatures);
}
