/**
 * DealerCenter feed client.
 *
 * Handles fetching the raw inventory feed from DealerCenter with:
 *   - Auto-detection of XML vs JSON
 *   - Retry on transient failures
 *   - Timeout protection
 *   - Optional auth header support
 *
 * Configuration via env vars:
 *   DEALERCENTER_FEED_URL    — required, the feed endpoint
 *   DEALERCENTER_API_KEY     — optional, if your account requires it
 *   DEALERCENTER_FEED_FORMAT — optional, "xml" | "json" (auto-detected if omitted)
 */

import { XMLParser } from "fast-xml-parser";
import type { DealerCenterFeed, DealerCenterVehicle } from "./types";

const FEED_TIMEOUT_MS = 30_000;
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2_000;

interface FetchOptions {
  signal?: AbortSignal;
}

/**
 * Fetch and parse the DealerCenter inventory feed.
 * Returns a normalized array of raw vehicles, always — never an object,
 * never a single vehicle, never undefined.
 */
export async function fetchDealerCenterInventory(
  options: FetchOptions = {}
): Promise<DealerCenterVehicle[]> {
  const feedUrl = process.env.DEALERCENTER_FEED_URL;
  if (!feedUrl) {
    throw new Error(
      "DEALERCENTER_FEED_URL is not configured. Set it in .env.local"
    );
  }

  const apiKey = process.env.DEALERCENTER_API_KEY;
  const explicitFormat = process.env.DEALERCENTER_FEED_FORMAT?.toLowerCase();

  const headers: Record<string, string> = {
    "User-Agent": "ZamzamCar/1.0 (+https://zamzamcar.com)",
    Accept: "application/xml, application/json;q=0.9, */*;q=0.5",
  };
  if (apiKey) headers["Authorization"] = `Bearer ${apiKey}`;

  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const timeoutController = new AbortController();
      const timeoutId = setTimeout(
        () => timeoutController.abort(),
        FEED_TIMEOUT_MS
      );

      // Combine caller's abort signal with our timeout signal
      const combinedSignal = options.signal
        ? AbortSignal.any([options.signal, timeoutController.signal])
        : timeoutController.signal;

      const response = await fetch(feedUrl, {
        headers,
        signal: combinedSignal,
        // Never cache the feed itself — we control caching at our layer
        cache: "no-store",
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(
          `DealerCenter feed returned ${response.status}: ${response.statusText}`
        );
      }

      const contentType = response.headers.get("content-type") ?? "";
      const rawText = await response.text();

      // Determine format: explicit env > content-type > content sniff
      const isXml =
        explicitFormat === "xml" ||
        (explicitFormat !== "json" &&
          (contentType.includes("xml") || rawText.trimStart().startsWith("<")));

      const parsed = isXml ? parseXmlFeed(rawText) : parseJsonFeed(rawText);
      return normalizeVehicleArray(parsed);
    } catch (err) {
      lastError = err;
      const isAbort = err instanceof Error && err.name === "AbortError";

      // Don't retry if caller cancelled
      if (isAbort && options.signal?.aborted) throw err;

      if (attempt < MAX_RETRIES) {
        const delay = RETRY_DELAY_MS * attempt; // Linear backoff
        await sleep(delay);
        continue;
      }
    }
  }

  throw new Error(
    `Failed to fetch DealerCenter inventory after ${MAX_RETRIES} attempts: ${
      lastError instanceof Error ? lastError.message : String(lastError)
    }`
  );
}

function parseXmlFeed(xml: string): DealerCenterFeed {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "",
    parseTagValue: true,
    trimValues: true,
    // Always treat Vehicle as an array even when only one exists
    isArray: (name) => name === "Vehicle",
  });
  return parser.parse(xml) as DealerCenterFeed;
}

function parseJsonFeed(json: string): DealerCenterFeed {
  try {
    return JSON.parse(json) as DealerCenterFeed;
  } catch (err) {
    throw new Error(
      `Failed to parse DealerCenter JSON feed: ${
        err instanceof Error ? err.message : String(err)
      }`
    );
  }
}

/**
 * Normalize the various shapes DealerCenter feeds come in to a flat array.
 * Handles: { Inventory: { Vehicle: [...] } } | { Vehicles: [...] } | { vehicles: [...] }
 */
function normalizeVehicleArray(
  feed: DealerCenterFeed
): DealerCenterVehicle[] {
  const inventory = feed.Inventory?.Vehicle;
  if (inventory) {
    return Array.isArray(inventory) ? inventory : [inventory];
  }
  if (feed.Vehicles) return feed.Vehicles;
  if (feed.vehicles) return feed.vehicles;
  return [];
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
