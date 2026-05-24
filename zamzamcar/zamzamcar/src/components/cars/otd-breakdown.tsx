import { Calculator, ShieldCheck } from "lucide-react";
import { calculateOTD } from "@/lib/utils/otd";
import { formatPriceCents } from "@/lib/utils/format";
import { PRICING } from "@/lib/config";

interface Props {
  /** Vehicle sale price in dollars (NOT cents) */
  basePrice: number;
  /** Compact card variant (default) vs full standalone variant */
  variant?: "compact" | "full";
}

/**
 * Out-the-Door price breakdown component.
 *
 * The dynamic formula is the heart of our value proposition:
 *   Base + (Base × 7.65%) + $399 + $155 = Total
 *
 * Two variants:
 *   - `compact`: Embedded in every car card (default)
 *   - `full`: Standalone block for the detail page or hero example
 *
 * The math is delegated to lib/utils/otd.ts so it's identical everywhere
 * and easy to update if Utah tax rates ever change.
 */
export function OTDBreakdown({ basePrice, variant = "compact" }: Props) {
  const otd = calculateOTD(basePrice);
  const taxPct = (PRICING.SALES_TAX_RATE * 100).toFixed(2);

  if (variant === "full") {
    return <FullVariant otd={otd} taxPct={taxPct} />;
  }

  return (
    <div className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-lg p-3 mt-3">
      <header className="flex items-center gap-1.5 mb-2 pb-2 border-b border-slate-200">
        <Calculator className="w-3.5 h-3.5 text-slate-700" strokeWidth={2.5} aria-hidden="true" />
        <span className="text-[10px] tracking-wider uppercase text-slate-700 font-bold">
          Out-the-Door Price
        </span>
        <span className="ml-auto text-[9px] text-slate-500 font-mono">UT</span>
      </header>

      <dl className="space-y-1 text-[11px] font-mono mb-2">
        <div className="flex justify-between text-slate-600">
          <dt>Base price</dt>
          <dd className="text-slate-900">{formatPriceCents(otd.basePrice)}</dd>
        </div>
        <div className="flex justify-between text-slate-600">
          <dt>+ {taxPct}% UT Sales Tax</dt>
          <dd>{formatPriceCents(otd.salesTax)}</dd>
        </div>
        <div className="flex justify-between text-slate-600">
          <dt>+ Doc Fee</dt>
          <dd>{formatPriceCents(otd.docFee)}</dd>
        </div>
        <div className="flex justify-between text-slate-600">
          <dt>+ License/Title/Reg.</dt>
          <dd>{formatPriceCents(otd.licenseFee)}</dd>
        </div>
      </dl>

      <div className="flex items-baseline justify-between pt-2 border-t border-slate-300 bg-white -mx-3 px-3 pb-2 -mb-3 rounded-b-lg">
        <span className="text-[10px] font-bold text-slate-900 uppercase tracking-wider">
          You pay
        </span>
        <span className="font-mono text-base font-black text-emerald-700">
          {formatPriceCents(otd.total)}
        </span>
      </div>

      <p className="mt-3 flex items-center gap-1.5 text-[10px] text-emerald-700">
        <ShieldCheck className="w-3 h-3" strokeWidth={2.5} aria-hidden="true" />
        <span className="font-semibold">No hidden fees. Guaranteed in writing.</span>
      </p>
    </div>
  );
}

function FullVariant({
  otd,
  taxPct,
}: {
  otd: ReturnType<typeof calculateOTD>;
  taxPct: string;
}) {
  return (
    <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-xl shadow-slate-900/10 overflow-hidden">
      <header className="bg-slate-900 px-5 py-3 text-white">
        <div className="flex items-center gap-2">
          <Calculator className="w-4 h-4" strokeWidth={2.5} aria-hidden="true" />
          <span className="text-xs uppercase tracking-wider font-bold">
            Out-the-Door Price Calculator
          </span>
        </div>
        <p className="text-[11px] text-slate-300 mt-0.5">
          Vehicle price {formatPriceCents(otd.basePrice)} in Utah
        </p>
      </header>

      <div className="p-5">
        <dl className="space-y-1.5 font-mono text-xs mb-3">
          <div className="flex justify-between">
            <dt className="text-slate-600">Sale price</dt>
            <dd className="text-slate-900 font-bold">{formatPriceCents(otd.basePrice)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-600">+ Utah tax ({taxPct}%)</dt>
            <dd className="text-slate-900 font-bold">{formatPriceCents(otd.salesTax)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-600">+ Doc fee</dt>
            <dd className="text-slate-900 font-bold">{formatPriceCents(otd.docFee)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-600">+ License/Title/Reg.</dt>
            <dd className="text-slate-900 font-bold">{formatPriceCents(otd.licenseFee)}</dd>
          </div>
        </dl>

        <div className="bg-emerald-50 border-2 border-emerald-200 rounded-lg p-3 flex items-baseline justify-between">
          <span className="text-[10px] font-bold text-emerald-900 uppercase tracking-wider">
            You pay
          </span>
          <span className="font-mono text-xl font-black text-emerald-700">
            {formatPriceCents(otd.total)}
          </span>
        </div>

        <p className="mt-3 flex items-start gap-1.5 text-[11px] text-slate-600 leading-relaxed">
          <ShieldCheck
            className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5"
            strokeWidth={2.5}
            aria-hidden="true"
          />
          <span>
            Exactly what you'll pay. Guaranteed in writing — no surprises at signing.
          </span>
        </p>
      </div>
    </div>
  );
}
