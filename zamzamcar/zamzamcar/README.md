# ZAMZAM CARS — Production Next.js Site

Production-ready Next.js 15 (App Router) website for ZAMZAM CARS, a used car dealership in South Salt Lake, Utah.

## Quick Start

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm type-check   # Verify TypeScript
pnpm build        # Production build
```

## Tech Stack

- **Next.js 15** (App Router, React Server Components, Turbopack)
- **TypeScript** (strict mode)
- **Tailwind CSS v4** (CSS-first config via `@theme`)
- **Framer Motion** (animations)
- **Lucide React** (icons)
- **Vercel KV** (inventory cache)

## Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout + AutoDealer JSON-LD
│   ├── page.tsx                 # Homepage
│   ├── loading.tsx              # Skeleton loader
│   ├── error.tsx                # Error boundary
│   ├── sitemap.ts               # Dynamic sitemap.xml
│   ├── robots.ts                # robots.txt
│   └── api/                     # Backend endpoints
│       ├── cars/                # GET inventory (cached)
│       ├── sync/dealercenter/   # Cron-triggered feed sync
│       ├── feeds/               # Google/Meta/TikTok/Snapchat feeds
│       └── google-merchant/     # Content API push
│
├── components/
│   ├── layout/                  # TopBar, MainNav, Footer
│   ├── home/                    # Hero, FeaturedInventory, TrustBlocks, Testimonials, FAQ
│   ├── cars/                    # CarCard, OTDBreakdown
│   └── ui/                      # CarGurusBadge, TitleBadge, CarFaxBadge, SyndicationDots
│
├── lib/
│   ├── config.ts                # DEALER, PRICING, SITE, FILTERS constants
│   ├── data/
│   │   ├── inventory.ts        # Featured inventory (mock; replaced by API in prod)
│   │   └── content.ts          # Testimonials & FAQs (editorial)
│   ├── utils/
│   │   ├── cn.ts               # Tailwind class merger
│   │   ├── format.ts           # Price/number/date formatters
│   │   └── otd.ts              # ⭐ Out-the-Door price calculator
│   ├── seo/
│   │   └── schema.ts           # JSON-LD Schema.org generators
│   ├── dealercenter/            # DealerCenter XML/JSON feed integration
│   ├── feeds/                   # 4 marketing platform feed generators
│   ├── google-merchant/         # Google Merchant Content API
│   └── cache/                   # Vercel KV cache layer
│
├── types/
│   ├── car.ts                   # Core Car type (backend shape)
│   └── ui.ts                    # DisplayCar (UI-enriched), OTDBreakdown, FilterState
│
└── styles/
    └── globals.css              # Tailwind v4 @theme tokens + base styles
```

## Key Concepts

### 🔢 Out-the-Door Price (OTD)

The most important calculation in the app — appears on **every** car card.

```
Base Price + (Base × 7.65% UT Tax) + $399 Doc Fee + $155 License = Total
```

Single source of truth lives in **`src/lib/utils/otd.ts`**. If Utah ever changes its sales tax rate, that's the only file to update.

### 🎨 CarGurus Deal Badge Colors

Exact hex per CarGurus brand guidelines (do not change):
- **Great Deal**: `#00a061`
- **Good Deal**: `#16a34a`
- **Fair Deal**: `#eab308` (dark text for contrast)

### 📊 Title Status Disclosure

Every car card discloses title status (Clean / Rebuilt / Salvage). This is intentional — buyers filter on this and we want full transparency, not surprises at the lot.

### 🔍 SEO Strategy

Three layers of structured data:
1. **JSON-LD** in root layout (AutoDealer) — Schema.org gold standard
2. **JSON-LD** per page (FAQPage, Vehicle, etc.) — page-specific
3. **Microdata** inline in HTML — backup for crawlers that miss JSON-LD

Combined with proper canonical URLs, Open Graph, dynamic sitemap, and robots.txt = aggressive SEO posture.

## Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```
DEALERCENTER_FEED_URL=...
DEALERCENTER_API_KEY=...
KV_REST_API_URL=...
KV_REST_API_TOKEN=...
GOOGLE_MERCHANT_ID=5745773224
GOOGLE_SERVICE_ACCOUNT_EMAIL=...
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY=...
CRON_SECRET=...
```

## Deployment

Built for Vercel — push to main triggers production deploy. Cron job in `vercel.json` runs feed sync every 30 minutes.

## Updating Business Info

All dealer details (address, phone, hours, tax rate, fees) live in **`src/lib/config.ts`**. Edit there and changes propagate everywhere automatically.
