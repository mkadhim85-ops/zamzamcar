"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Calculator, DollarSign, Calendar, Percent, TrendingDown,
  BadgeCheck, ArrowRight, Info, CheckCircle2,
} from "lucide-react";
import { calculateLoan, estimateAPR } from "@/lib/utils/loan";
import { formatPrice, formatPriceCents, formatNumber } from "@/lib/utils/format";
import { PRICING } from "@/lib/config";
import { cn } from "@/lib/utils/cn";

interface Props {
  /** Vehicle price in dollars */
  vehiclePrice: number;
}

type CreditTier = "excellent" | "good" | "fair" | "poor";

const CREDIT_TIERS: Array<{ id: CreditTier; label: string; range: string }> = [
  { id: "excellent", label: "Excellent", range: "720+" },
  { id: "good", label: "Good", range: "680–719" },
  { id: "fair", label: "Fair", range: "600–679" },
  { id: "poor", label: "Rebuilding", range: "< 600" },
];

const TERM_OPTIONS = [36, 48, 60, 72, 84] as const;

/**
 * Interactive financing widget for the car detail page.
 *
 * Three live inputs (down payment, term, credit tier) feed the same loan
 * formula used by every bank. Result updates instantly via `useMemo`.
 *
 * Design intent: lower the barrier between "I can't afford this" and "let me
 * try a longer term." Showing the actual math (principal × rate × term)
 * makes the page feel honest. Hiding it makes us look like other dealers
 * who quote "as low as $199/mo" with a $5,000 down payment in fine print.
 *
 * The 4-minute pre-qualification CTA at the bottom is the action goal —
 * everything above it is there to build confidence the buyer can afford this.
 */
export function FinancingWidget({ vehiclePrice }: Props) {
  // Default: 10% down, 60 months, "good" credit tier
  const defaultDown = Math.round(vehiclePrice * 0.1);
  const [downPayment, setDownPayment] = useState(defaultDown);
  const [termMonths, setTermMonths] = useState<(typeof TERM_OPTIONS)[number]>(60);
  const [creditTier, setCreditTier] = useState<CreditTier>("good");

  const apr = estimateAPR(creditTier);

  const loan = useMemo(
    () =>
      calculateLoan({
        vehiclePrice,
        downPayment,
        apr,
        termMonths,
        includeTaxesAndFees: true,
        salesTaxRate: PRICING.SALES_TAX_RATE,
        docFee: PRICING.DOC_FEE,
        licenseFee: PRICING.LICENSE_FEE,
      }),
    [vehiclePrice, downPayment, apr, termMonths]
  );

  const maxDownPayment = Math.round(vehiclePrice * 0.5);
  const downPercent = Math.round((downPayment / vehiclePrice) * 100);

  return (
    <aside
      className="bg-white border-2 border-slate-200 rounded-2xl overflow-hidden shadow-xl shadow-slate-900/5"
      aria-labelledby="financing-heading"
    >
      <header className="bg-slate-900 px-5 py-4 text-white">
        <div className="flex items-center gap-2 mb-1">
          <Calculator className="w-4 h-4 text-emerald-400" strokeWidth={2.5} aria-hidden="true" />
          <h2 id="financing-heading" className="text-sm font-bold uppercase tracking-wider">
            Estimate Your Payment
          </h2>
        </div>
        <p className="text-xs text-slate-300">
          Adjust the sliders to see your monthly payment update in real time
        </p>
      </header>

      <div className="p-5 space-y-5">
        {/* Headline payment */}
        <PaymentHeadline monthlyPayment={loan.monthlyPayment} termMonths={termMonths} apr={apr} />

        {/* Down payment slider */}
        <SliderInput
          label="Down Payment"
          icon={DollarSign}
          value={downPayment}
          min={0}
          max={maxDownPayment}
          step={100}
          onChange={setDownPayment}
          formatValue={formatPrice}
          helperText={`${downPercent}% of vehicle price`}
        />

        {/* Term selector */}
        <TermSelector value={termMonths} onChange={setTermMonths} />

        {/* Credit tier selector */}
        <CreditTierSelector value={creditTier} onChange={setCreditTier} apr={apr} />

        {/* Breakdown */}
        <Breakdown loan={loan} />

        {/* CTA */}
        <PreQualifyCTA />

        <Disclaimer />
      </div>
    </aside>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────

function PaymentHeadline({
  monthlyPayment, termMonths, apr,
}: {
  monthlyPayment: number;
  termMonths: number;
  apr: number;
}) {
  return (
    <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-5 text-center">
      <div className="text-[10px] uppercase tracking-wider text-emerald-800 font-bold mb-1">
        Estimated monthly payment
      </div>
      <motion.div
        key={Math.round(monthlyPayment)}
        initial={{ scale: 0.95, opacity: 0.5 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="flex items-baseline justify-center gap-1"
      >
        <span className="text-4xl lg:text-5xl font-black text-emerald-700 font-mono tracking-tight">
          ${formatNumber(Math.round(monthlyPayment))}
        </span>
        <span className="text-lg font-bold text-emerald-700">/mo</span>
      </motion.div>
      <div className="mt-2 text-xs text-emerald-900 font-medium">
        for {termMonths} months at {apr}% APR
      </div>
    </div>
  );
}

interface SliderInputProps {
  label: string;
  icon: typeof DollarSign;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  formatValue: (n: number) => string;
  helperText?: string;
}

function SliderInput({
  label, icon: Icon, value, min, max, step, onChange, formatValue, helperText,
}: SliderInputProps) {
  const percent = ((value - min) / (max - min)) * 100;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
          <Icon className="w-3.5 h-3.5 text-slate-500" strokeWidth={2.5} aria-hidden="true" />
          {label}
        </label>
        <span className="font-mono font-bold text-slate-900 text-sm">{formatValue(value)}</span>
      </div>

      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer bg-slate-200 accent-emerald-600"
          style={{
            background: `linear-gradient(to right, #059669 0%, #059669 ${percent}%, #e2e8f0 ${percent}%, #e2e8f0 100%)`,
          }}
          aria-label={label}
        />
        <div className="flex justify-between mt-1 text-[10px] text-slate-400 font-mono">
          <span>{formatValue(min)}</span>
          <span>{formatValue(max)}</span>
        </div>
      </div>

      {helperText && (
        <div className="mt-1 text-[11px] text-slate-500">{helperText}</div>
      )}
    </div>
  );
}

function TermSelector({
  value,
  onChange,
}: {
  value: (typeof TERM_OPTIONS)[number];
  onChange: (term: (typeof TERM_OPTIONS)[number]) => void;
}) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
        <Calendar className="w-3.5 h-3.5 text-slate-500" strokeWidth={2.5} aria-hidden="true" />
        Loan Term
      </label>
      <div className="grid grid-cols-5 gap-1.5">
        {TERM_OPTIONS.map((term) => {
          const active = value === term;
          return (
            <button
              key={term}
              onClick={() => onChange(term)}
              aria-pressed={active}
              className={cn(
                "px-1 py-2 rounded-lg text-xs font-bold transition-all border-2",
                active
                  ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                  : "bg-white text-slate-700 border-slate-200 hover:border-slate-400",
              )}
            >
              <div className="font-mono">{term}</div>
              <div className="text-[9px] opacity-70 mt-0.5">months</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CreditTierSelector({
  value, onChange, apr,
}: {
  value: CreditTier;
  onChange: (tier: CreditTier) => void;
  apr: number;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
          <Percent className="w-3.5 h-3.5 text-slate-500" strokeWidth={2.5} aria-hidden="true" />
          Credit Tier
        </label>
        <span className="font-mono text-sm font-bold text-emerald-700">{apr}% APR</span>
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {CREDIT_TIERS.map((tier) => {
          const active = value === tier.id;
          return (
            <button
              key={tier.id}
              onClick={() => onChange(tier.id)}
              aria-pressed={active}
              className={cn(
                "px-3 py-2 rounded-lg text-left transition-all border-2",
                active
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-700 border-slate-200 hover:border-slate-400",
              )}
            >
              <div className="text-sm font-bold">{tier.label}</div>
              <div className={cn("text-[10px] mt-0.5 font-mono", active ? "opacity-70" : "text-slate-500")}>
                FICO {tier.range}
              </div>
            </button>
          );
        })}
      </div>
      <div className="mt-2 flex items-start gap-1.5 text-[11px] text-slate-500 leading-relaxed">
        <Info className="w-3 h-3 mt-0.5 flex-shrink-0" strokeWidth={2.5} aria-hidden="true" />
        <span>
          Estimated rates. Your actual APR is determined by lender pre-qualification.
        </span>
      </div>
    </div>
  );
}

function Breakdown({ loan }: { loan: ReturnType<typeof calculateLoan> }) {
  return (
    <div className="pt-4 border-t border-slate-200">
      <h3 className="text-[10px] uppercase tracking-wider text-slate-700 font-bold mb-3">
        Loan Breakdown
      </h3>
      <dl className="space-y-1.5 text-xs font-mono">
        <div className="flex justify-between">
          <dt className="text-slate-600">Out-the-Door price</dt>
          <dd className="text-slate-900 font-bold">{formatPriceCents(loan.outTheDoorPrice)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-600">Amount financed</dt>
          <dd className="text-slate-900 font-bold">{formatPriceCents(loan.amountFinanced)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-600">Total interest</dt>
          <dd className="text-slate-900 font-bold">{formatPriceCents(loan.totalInterest)}</dd>
        </div>
        <div className="flex justify-between pt-1.5 mt-1.5 border-t border-slate-100">
          <dt className="text-slate-900 font-semibold">Total of payments</dt>
          <dd className="text-slate-900 font-bold">{formatPriceCents(loan.totalPayments)}</dd>
        </div>
      </dl>
    </div>
  );
}

function PreQualifyCTA() {
  return (
    <a
      href="/financing/pre-qualify"
      className="block group bg-emerald-600 hover:bg-emerald-700 rounded-xl p-4 text-white transition-all shadow-md hover:shadow-lg"
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-black tracking-tight">Get pre-qualified — 4 minutes</span>
        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" strokeWidth={2.5} aria-hidden="true" />
      </div>
      <ul className="text-[11px] text-emerald-50 space-y-0.5">
        {[
          "No impact to your credit score",
          "15+ lenders, all credit accepted",
          "Same-day approval typical",
        ].map((line) => (
          <li key={line} className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3 h-3" strokeWidth={2.5} aria-hidden="true" />
            {line}
          </li>
        ))}
      </ul>
    </a>
  );
}

function Disclaimer() {
  return (
    <p className="text-[10px] text-slate-500 leading-relaxed">
      Estimated payment shown for informational purposes only. Actual loan terms,
      including APR, depend on your credit profile and lender approval. Tax, title,
      registration, and doc fee included in financed amount. Not a credit decision
      or offer to lend.
    </p>
  );
}
