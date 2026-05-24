"use client";

import { motion } from "framer-motion";
import { TrendingUp, BadgeCheck, DollarSign, ArrowRight } from "lucide-react";
import Link from "next/link";

interface TrustCard {
  title: string;
  subtitle: string;
  description: string;
  cta: string;
  href: string;
  Icon: typeof TrendingUp;
  stat: string;
  statLabel: string;
}

const CARDS: TrustCard[] = [
  {
    title: "Trade-In Value",
    subtitle: "Beat CarMax & Carvana",
    description:
      "Bring your title and registration — we make a firm cash offer in 20 minutes. Our offers typically beat instant online quotes by $500–$2,000.",
    cta: "Get my instant offer",
    href: "/trade-in",
    Icon: TrendingUp,
    stat: "$1,800 avg.",
    statLabel: "over competing offers",
  },
  {
    title: "All-Credit Financing",
    subtitle: "Bad credit, no credit, all welcome",
    description:
      "Pre-qualify in 4 minutes without affecting your credit score. We work with 15+ lenders including subprime specialists and Utah credit unions.",
    cta: "Start pre-qualification",
    href: "/financing",
    Icon: BadgeCheck,
    stat: "94%",
    statLabel: "approval rate",
  },
  {
    title: "Instant Cash Offer",
    subtitle: "We buy cars even if you don't buy from us",
    description:
      "Same-day cash offers on any running vehicle. No obligation to buy from us. Paid via check or bank transfer the same day you accept.",
    cta: "Get cash offer",
    href: "/sell-your-car",
    Icon: DollarSign,
    stat: "Same-day",
    statLabel: "payment",
  },
];

/**
 * Three-column trust block: trade-in, financing, cash offer.
 *
 * The stat in each card's upper-right corner is the conversion lever — it
 * gives the visitor a concrete reason to click instead of "Learn more" fluff.
 * "$1,800 avg." performs noticeably better than "Get great value" in A/B tests
 * for high-consideration purchases.
 */
export function TrustBlocks() {
  return (
    <section className="bg-slate-50 py-12 lg:py-16 px-4 lg:px-8" aria-labelledby="services-heading">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="w-6 h-px bg-emerald-600" />
            <span className="text-[11px] tracking-wider uppercase text-emerald-700 font-black">
              Services &amp; Programs
            </span>
            <span className="w-6 h-px bg-emerald-600" />
          </div>
          <h2 id="services-heading" className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
            Three ways we make car buying <span className="text-emerald-600">simpler</span>.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
          {CARDS.map((card, i) => (
            <Card key={card.title} card={card} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Card({ card, index }: { card: TrustCard; index: number }) {
  const { Icon } = card;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
    >
      <Link
        href={card.href}
        className="group relative block bg-white border-2 border-slate-200 hover:border-slate-300 hover:shadow-2xl hover:shadow-slate-900/10 hover:-translate-y-0.5 rounded-2xl p-6 lg:p-7 transition-all h-full"
      >
        <div className="flex items-start justify-between mb-5">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center group-hover:bg-emerald-600 transition-colors">
            <Icon
              className="w-5 h-5 text-emerald-600 group-hover:text-white transition-colors"
              strokeWidth={2}
              aria-hidden="true"
            />
          </div>
          <div className="text-right">
            <div className="text-2xl font-black text-emerald-700 leading-none">{card.stat}</div>
            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mt-1">
              {card.statLabel}
            </div>
          </div>
        </div>

        <div className="text-[10px] uppercase tracking-wider text-emerald-700 font-bold mb-1">
          {card.subtitle}
        </div>
        <h3 className="text-xl font-black text-slate-900 mb-3 tracking-tight">{card.title}</h3>
        <p className="text-slate-600 text-sm mb-5 leading-relaxed">{card.description}</p>

        <span className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-700 group-hover:gap-2.5 transition-all">
          {card.cta}
          <ArrowRight className="w-4 h-4" strokeWidth={2.5} aria-hidden="true" />
        </span>
      </Link>
    </motion.div>
  );
}
