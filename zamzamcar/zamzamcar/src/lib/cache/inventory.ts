/**
 * Inventory cache layer.
 *
 * Primary store: Vercel KV (Upstash Redis under the hood, free tier is plenty
 * for typical dealer inventory sizes). Falls back to fetching the feed directly
 * if KV is empty/unavailable — useful for local dev before KV is wired up.
 *
 * The cache key holds the full transformed Car[] array as JSON. For most
 * dealers (50-500 cars) this is well under the 5MB key limit. If your
 * inventory grows past that, switch to per-car keys with a separate index.
 *
 * To enable Vercel KV:
 *   1. In Vercel dashboard → Storage → Create KV Database
 *   2. Connect to project — env vars (KV_REST_API_URL, KV_REST_API_TOKEN)
 *      are injected automatically
 *   3. Install: pnpm add @vercel/kv
 */

import type { Car } from "@/types/car";
import { fetchDealerCenterInventory } from "@/lib/dealercenter/client";
import { transformFeed } from "@/lib/dealercenter/transformer";

const KV_INVENTORY_KEY = "inventory:cars:v1";
const KV_LAST_SYNC_KEY = "inventory:last-sync:v1";

/**
 * Returns the cached inventory. Falls back to a live feed fetch if cache empty.
 * This is the function that /api/cars consumes.
 */
export async function getCachedInventory(): Promise<Car[]> {
  // Try KV first
  try {
    const kv = await getKvClient();
    if (kv) {
      const cached = await kv.get<Car[]>(KV_INVENTORY_KEY);
      if (cached && Array.isArray(cached) && cached.length > 0) {
        return cached;
      }
    }
  } catch (err) {
    console.warn("[cache] KV read failed, falling back to feed:", err);
  }

  // Fallback: fetch live and transform. This shouldn't happen in steady state
  // because the sync cron keeps KV warm. It exists for first deploy and for
  // local development.
  console.warn("[cache] Cache miss — fetching feed directly");
  const raw = await fetchDealerCenterInventory();
  const cars = transformFeed(raw);

  // Best-effort write so subsequent reads hit cache
  try {
    await setCachedInventory(cars);
  } catch (err) {
    console.warn("[cache] Failed to populate cache on miss:", err);
  }

  return cars;
}

/**
 * Replace the full cached inventory. Called by /api/sync/dealercenter.
 */
export async function setCachedInventory(cars: Car[]): Promise<void> {
  const kv = await getKvClient();
  if (!kv) {
    console.warn(
      "[cache] No KV configured — inventory not persisted between requests"
    );
    return;
  }
  await Promise.all([
    kv.set(KV_INVENTORY_KEY, cars),
    kv.set(KV_LAST_SYNC_KEY, new Date().toISOString()),
  ]);
}

export async function getLastSyncTime(): Promise<string | null> {
  const kv = await getKvClient();
  if (!kv) return null;
  return (await kv.get<string>(KV_LAST_SYNC_KEY)) ?? null;
}

// ── KV client loader (lazy, optional) ───────────────────────────────────────

interface KvLike {
  get<T>(key: string): Promise<T | null>;
  set(key: string, value: unknown): Promise<unknown>;
}

let kvCache: KvLike | null | undefined; // undefined = not tried, null = unavailable

async function getKvClient(): Promise<KvLike | null> {
  if (kvCache !== undefined) return kvCache;

  // Only attempt if env vars are present — avoids noisy errors locally
  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
    kvCache = null;
    return null;
  }

  try {
    const mod = await import("@vercel/kv");
    kvCache = mod.kv as unknown as KvLike;
    return kvCache;
  } catch {
    console.warn(
      "[cache] @vercel/kv not installed — run: pnpm add @vercel/kv"
    );
    kvCache = null;
    return null;
  }
}
