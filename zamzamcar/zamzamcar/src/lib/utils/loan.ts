/**
 * Auto loan payment calculator.
 *
 * Uses the standard amortization formula every bank and lender uses:
 *
 *   M = P × [r(1+r)^n] / [(1+r)^n - 1]
 *
 * Where:
 *   M = monthly payment
 *   P = principal (loan amount = price - down payment)
 *   r = monthly interest rate (APR / 12 / 100)
 *   n = number of payments (term in months)
 *
 * Why a dedicated module? The financing widget on the car detail page lets
 * users adjust 3 inputs (down payment, term, APR) and see the monthly payment
 * update instantly. Keeping this pure makes it trivial to test and reuse
 * on future financing pages or pre-qual flows.
 */

export interface LoanInputs {
  /** Vehicle price in dollars */
  vehiclePrice: number;
  /** Cash down payment in dollars */
  downPayment: number;
  /** Trade-in value applied to the loan, in dollars */
  tradeInValue?: number;
  /** Annual percentage rate, e.g. 8.99 (not 0.0899) */
  apr: number;
  /** Loan term in months — typical: 36, 48, 60, 72, 84 */
  termMonths: number;
  /** Include taxes & fees in the financed amount (default true) */
  includeTaxesAndFees?: boolean;
  /** Sales tax rate as decimal (e.g. 0.0765 for Utah) */
  salesTaxRate?: number;
  /** Doc fee in dollars */
  docFee?: number;
  /** License/title/registration fee in dollars */
  licenseFee?: number;
}

export interface LoanResult {
  /** Total amount financed (principal) */
  amountFinanced: number;
  /** Monthly payment in dollars */
  monthlyPayment: number;
  /** Total of all payments over the loan term */
  totalPayments: number;
  /** Total interest paid over the life of the loan */
  totalInterest: number;
  /** Out-the-door price (what the buyer "pays" including taxes/fees) */
  outTheDoorPrice: number;
}

/**
 * Calculate a monthly auto loan payment with full breakdown.
 *
 * Special cases:
 *   - APR of 0 returns straight-line payment (P / n) with zero interest
 *   - Negative or zero principal returns all-zero result (edge case for
 *     when down payment equals or exceeds vehicle price)
 */
export function calculateLoan(inputs: LoanInputs): LoanResult {
  const {
    vehiclePrice,
    downPayment,
    tradeInValue = 0,
    apr,
    termMonths,
    includeTaxesAndFees = true,
    salesTaxRate = 0,
    docFee = 0,
    licenseFee = 0,
  } = inputs;

  // Calculate taxes & fees on the vehicle price (before down payment)
  const salesTax = vehiclePrice * salesTaxRate;
  const totalFees = salesTax + docFee + licenseFee;
  const outTheDoorPrice = vehiclePrice + totalFees;

  // Principal to finance = (vehicle + fees if included) - down payment - trade-in
  const baseAmount = includeTaxesAndFees ? outTheDoorPrice : vehiclePrice;
  const principal = Math.max(0, baseAmount - downPayment - tradeInValue);

  // Edge case: nothing to finance
  if (principal <= 0) {
    return {
      amountFinanced: 0,
      monthlyPayment: 0,
      totalPayments: 0,
      totalInterest: 0,
      outTheDoorPrice: roundCents(outTheDoorPrice),
    };
  }

  // Edge case: 0% APR financing
  if (apr === 0) {
    const monthlyPayment = principal / termMonths;
    return {
      amountFinanced: roundCents(principal),
      monthlyPayment: roundCents(monthlyPayment),
      totalPayments: roundCents(principal),
      totalInterest: 0,
      outTheDoorPrice: roundCents(outTheDoorPrice),
    };
  }

  // Standard amortization
  const monthlyRate = apr / 100 / 12;
  const numerator = monthlyRate * Math.pow(1 + monthlyRate, termMonths);
  const denominator = Math.pow(1 + monthlyRate, termMonths) - 1;
  const monthlyPayment = principal * (numerator / denominator);
  const totalPayments = monthlyPayment * termMonths;
  const totalInterest = totalPayments - principal;

  return {
    amountFinanced: roundCents(principal),
    monthlyPayment: roundCents(monthlyPayment),
    totalPayments: roundCents(totalPayments),
    totalInterest: roundCents(totalInterest),
    outTheDoorPrice: roundCents(outTheDoorPrice),
  };
}

function roundCents(amount: number): number {
  return Math.round(amount * 100) / 100;
}

/**
 * Estimate a reasonable APR for a given credit tier.
 * These are conservative estimates for used vehicles in 2025.
 *
 * Real APRs come from lender pre-qualification, but this gives the widget
 * a sensible default before the user has spoken to a lender.
 */
export function estimateAPR(creditTier: "excellent" | "good" | "fair" | "poor"): number {
  return {
    excellent: 6.49, // 720+ FICO
    good: 8.99,      // 680-719 FICO
    fair: 13.99,     // 600-679 FICO
    poor: 19.99,     // < 600 FICO (subprime)
  }[creditTier];
}
