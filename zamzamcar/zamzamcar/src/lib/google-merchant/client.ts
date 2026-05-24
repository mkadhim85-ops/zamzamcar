/**
 * Google Content API for Shopping client.
 *
 * Lets us push product updates DIRECTLY to Merchant Center without waiting
 * for Google's scheduled feed crawl. This is the difference between:
 *   - Feed approach: sold car still shows in ads for 1-24 hours
 *   - API approach: sold car disappears in 30 seconds
 *
 * We use the Google Auth Library for service-account auth — much simpler than
 * OAuth user flow because this is server-to-server communication.
 *
 * Setup steps (one-time):
 *   1. Google Cloud Console → Create project (or use existing)
 *   2. Enable "Content API for Shopping"
 *   3. Create service account → Download JSON key
 *   4. Merchant Center → Settings → Linked accounts → Link service account
 *   5. Grant the service account "Standard" access to MC
 *   6. Set env var GOOGLE_SERVICE_ACCOUNT_KEY to the JSON content
 *
 * Spec: https://developers.google.com/shopping-content/v2.1/quickstart
 */

import type { Car } from "@/types/car";
import {
  buildAdDescription,
  buildAdTitle,
  formatPriceWithCurrency,
  getAdditionalImageUrls,
  getPrimaryImageUrl,
  getTaggedUrl,
} from "@/lib/feeds/shared";

const API_BASE = "https://shoppingcontent.googleapis.com/content/v2.1";
const SCOPE = "https://www.googleapis.com/auth/content";
const TOKEN_URL = "https://oauth2.googleapis.com/token";

// Token cache — Google access tokens last 1 hour, refresh proactively at 55 min
interface CachedToken {
  token: string;
  expiresAt: number;
}
let tokenCache: CachedToken | null = null;

interface ServiceAccountKey {
  client_email: string;
  private_key: string;
  project_id: string;
}

/**
 * Push a single vehicle update to Merchant Center.
 * Use this when one car's data changed but most of inventory is unchanged.
 */
export async function pushVehicleToMerchant(car: Car): Promise<{
  success: boolean;
  productId: string;
  error?: string;
}> {
  const merchantId = getMerchantId();
  const product = buildContentApiProduct(car);

  try {
    const token = await getAccessToken();
    const response = await fetch(
      `${API_BASE}/${merchantId}/products`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(product),
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      return {
        success: false,
        productId: product.offerId,
        error: `${response.status}: ${errorBody}`,
      };
    }

    return { success: true, productId: product.offerId };
  } catch (err) {
    return {
      success: false,
      productId: product.offerId,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/**
 * Delete a vehicle from Merchant Center (e.g., when sold).
 * This is the critical one — sold cars disappearing from ads in seconds.
 */
export async function deleteVehicleFromMerchant(
  stockNumber: string
): Promise<{ success: boolean; error?: string }> {
  const merchantId = getMerchantId();
  const productId = buildProductId(stockNumber);

  try {
    const token = await getAccessToken();
    const response = await fetch(
      `${API_BASE}/${merchantId}/products/${encodeURIComponent(productId)}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    // 404 means it was already gone — treat as success
    if (response.status === 404) return { success: true };

    if (!response.ok) {
      const errorBody = await response.text();
      return {
        success: false,
        error: `${response.status}: ${errorBody}`,
      };
    }
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/**
 * Batch push multiple vehicles. Use Content API's `custombatch` endpoint
 * which accepts up to 1000 operations per call — far faster than N individual
 * requests for the same result.
 */
export async function batchPushVehicles(
  inserts: Car[],
  deletes: string[]
): Promise<{
  total: number;
  succeeded: number;
  failed: number;
  errors: Array<{ id: string; error: string }>;
}> {
  const merchantId = getMerchantId();
  const merchantIdNum = parseInt(merchantId, 10);

  const entries = [
    ...inserts.map((car, idx) => ({
      batchId: idx,
      merchantId: merchantIdNum,
      method: "insert" as const,
      product: buildContentApiProduct(car),
    })),
    ...deletes.map((stock, idx) => ({
      batchId: inserts.length + idx,
      merchantId: merchantIdNum,
      method: "delete" as const,
      productId: buildProductId(stock),
    })),
  ];

  if (entries.length === 0) {
    return { total: 0, succeeded: 0, failed: 0, errors: [] };
  }

  try {
    const token = await getAccessToken();
    const response = await fetch(`${API_BASE}/products/batch`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ entries }),
    });

    if (!response.ok) {
      throw new Error(`Batch request failed: ${response.status}`);
    }

    const result = (await response.json()) as {
      entries: Array<{
        batchId: number;
        errors?: { errors: Array<{ message: string }> };
        product?: { offerId: string };
      }>;
    };

    const errors: Array<{ id: string; error: string }> = [];
    let succeeded = 0;

    for (const entry of result.entries ?? []) {
      const source = entries[entry.batchId];
      const id =
        source.method === "insert"
          ? source.product.offerId
          : source.productId;

      if (entry.errors?.errors?.length) {
        errors.push({
          id,
          error: entry.errors.errors.map((e) => e.message).join("; "),
        });
      } else {
        succeeded++;
      }
    }

    return {
      total: entries.length,
      succeeded,
      failed: errors.length,
      errors,
    };
  } catch (err) {
    return {
      total: entries.length,
      succeeded: 0,
      failed: entries.length,
      errors: [
        {
          id: "batch",
          error: err instanceof Error ? err.message : String(err),
        },
      ],
    };
  }
}

/**
 * Get the current status of a product in Merchant Center.
 * Returns approval state, warnings, and disapproval reasons if any.
 * Critical for catching feed issues before they tank your campaigns.
 */
export async function getProductStatus(stockNumber: string): Promise<{
  found: boolean;
  destinationStatuses?: Array<{ destination: string; status: string }>;
  issues?: Array<{ code: string; description: string; severity: string }>;
}> {
  const merchantId = getMerchantId();
  const productId = buildProductId(stockNumber);

  try {
    const token = await getAccessToken();
    const response = await fetch(
      `${API_BASE}/${merchantId}/productstatuses/${encodeURIComponent(productId)}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (response.status === 404) return { found: false };
    if (!response.ok) {
      throw new Error(`Status fetch failed: ${response.status}`);
    }

    const data = (await response.json()) as {
      destinationStatuses?: Array<{ destination: string; status: string }>;
      itemLevelIssues?: Array<{
        code: string;
        description: string;
        severity: string;
      }>;
    };

    return {
      found: true,
      destinationStatuses: data.destinationStatuses,
      issues: data.itemLevelIssues,
    };
  } catch (err) {
    throw new Error(
      `Failed to get product status: ${err instanceof Error ? err.message : err}`
    );
  }
}

// ── Product builder ─────────────────────────────────────────────────────────

interface ContentApiProduct {
  offerId: string;
  title: string;
  description: string;
  link: string;
  imageLink: string;
  additionalImageLinks?: string[];
  contentLanguage: string;
  targetCountry: string;
  channel: "online" | "local";
  availability: "in stock" | "out of stock" | "preorder";
  condition: "new" | "used" | "refurbished";
  price: { value: string; currency: string };
  brand: string;
  identifierExists: boolean;
  mpn?: string;
  productTypes: string[];
  googleProductCategory: string;
  customAttributes?: Array<{ name: string; value: string }>;
}

function buildContentApiProduct(car: Car): ContentApiProduct {
  const targetCountry = process.env.GOOGLE_TARGET_COUNTRY ?? "US";
  const currency = process.env.FEED_CURRENCY ?? "USD";

  return {
    offerId: buildProductId(car.stockNumber),
    title: buildAdTitle(car),
    description: buildAdDescription(car),
    link: getTaggedUrl(car, "google", "cpc"),
    imageLink: getPrimaryImageUrl(car),
    additionalImageLinks: getAdditionalImageUrls(car, 10),
    contentLanguage: "en",
    targetCountry,
    channel: "online",
    availability: "in stock",
    condition: car.condition === "new" ? "new" : "used",
    price: {
      value: (car.price / 100).toFixed(2),
      currency,
    },
    brand: car.make,
    identifierExists: true,
    mpn: car.vin,
    productTypes: ["Vehicles & Parts > Vehicles"],
    googleProductCategory: "Vehicles & Parts > Vehicles",
    customAttributes: [
      { name: "vehicle_fulfillment", value: car.condition === "new" ? "new" : "used" },
      { name: "vehicle_year", value: String(car.year) },
      { name: "vehicle_make", value: car.make },
      { name: "vehicle_model", value: car.model },
      ...(car.trim ? [{ name: "vehicle_trim", value: car.trim }] : []),
      { name: "vehicle_vin", value: car.vin },
      { name: "vehicle_mileage", value: `${car.mileage} mi` },
      { name: "vehicle_color", value: car.exteriorColor },
      { name: "vehicle_body_style", value: mapBody(car.bodyStyle) },
      { name: "vehicle_transmission", value: car.transmission === "manual" ? "Manual" : "Automatic" },
      { name: "vehicle_drivetrain", value: car.drivetrain.toUpperCase() },
      { name: "vehicle_fuel_type", value: mapFuel(car.fuelType) },
    ],
  };
}

function mapBody(b: string): string {
  const map: Record<string, string> = {
    sedan: "Sedan", suv: "SUV", truck: "Truck", coupe: "Coupe",
    convertible: "Convertible", hatchback: "Hatchback",
    wagon: "Wagon", van: "Van", minivan: "Van",
  };
  return map[b] ?? "Other";
}

function mapFuel(f: string): string {
  const map: Record<string, string> = {
    gasoline: "Gasoline", diesel: "Diesel", electric: "Electric",
    hybrid: "Hybrid", "plug-in-hybrid": "Plug-in Hybrid",
  };
  return map[f] ?? "Other";
}

/**
 * Google Content API offer IDs must be unique per merchant. We prefix with
 * "online:en:US:" to match the format Google expects when looking up products.
 */
function buildProductId(stockNumber: string): string {
  const lang = "en";
  const country = process.env.GOOGLE_TARGET_COUNTRY ?? "US";
  return `online:${lang}:${country}:${stockNumber}`;
}

function getMerchantId(): string {
  const id = process.env.GOOGLE_MERCHANT_ID;
  if (!id) {
    throw new Error(
      "GOOGLE_MERCHANT_ID is not configured. Set it in .env.local to use Content API."
    );
  }
  return id;
}

// ── Service account auth (JWT → access token) ──────────────────────────────

/**
 * Get a Google OAuth2 access token using service account credentials.
 * Returns cached token if still valid; otherwise mints a fresh JWT and exchanges.
 */
async function getAccessToken(): Promise<string> {
  if (tokenCache && Date.now() < tokenCache.expiresAt) {
    return tokenCache.token;
  }

  const keyJson = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!keyJson) {
    throw new Error(
      "GOOGLE_SERVICE_ACCOUNT_KEY is not configured. " +
      "Paste the full service account JSON into .env.local"
    );
  }

  const key = JSON.parse(keyJson) as ServiceAccountKey;
  const jwt = await createSignedJwt(key);

  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!response.ok) {
    throw new Error(`Token exchange failed: ${await response.text()}`);
  }

  const data = (await response.json()) as {
    access_token: string;
    expires_in: number;
  };

  tokenCache = {
    token: data.access_token,
    // Refresh 5 min before actual expiry
    expiresAt: Date.now() + (data.expires_in - 300) * 1000,
  };

  return data.access_token;
}

/**
 * Build and sign a JWT for service-account auth.
 * Uses Node's built-in crypto.subtle (Web Crypto API) — works in Node 18+.
 */
async function createSignedJwt(key: ServiceAccountKey): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss: key.client_email,
    scope: SCOPE,
    aud: TOKEN_URL,
    exp: now + 3600,
    iat: now,
  };

  const headerB64 = base64UrlEncode(JSON.stringify(header));
  const payloadB64 = base64UrlEncode(JSON.stringify(payload));
  const signingInput = `${headerB64}.${payloadB64}`;

  const privateKey = await importPkcs8(key.private_key);
  const signature = await crypto.subtle.sign(
    { name: "RSASSA-PKCS1-v1_5" },
    privateKey,
    new TextEncoder().encode(signingInput)
  );

  const signatureB64 = base64UrlEncodeBytes(new Uint8Array(signature));
  return `${signingInput}.${signatureB64}`;
}

async function importPkcs8(pem: string): Promise<CryptoKey> {
  // Strip PEM headers/footers and whitespace, decode base64 to bytes
  const pemContents = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\s+/g, "");
  const binary = Uint8Array.from(atob(pemContents), (c) => c.charCodeAt(0));

  return crypto.subtle.importKey(
    "pkcs8",
    binary.buffer as ArrayBuffer,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );
}

function base64UrlEncode(str: string): string {
  return base64UrlEncodeBytes(new TextEncoder().encode(str));
}

function base64UrlEncodeBytes(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}
