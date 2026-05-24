"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, Phone, Mail } from "lucide-react";
import { FAQS } from "@/lib/data/content";
import { DEALER } from "@/lib/config";
import { cn } from "@/lib/utils/cn";
import type { FAQ } from "@/types/ui";

/**
 * FAQ section with accordion.
 *
 * Schema.org FAQPage microdata is embedded inline; the parent page also emits
 * JSON-LD via faqPageSchema(). Both work — having both improves Google's
 * confidence in surfacing the FAQ accordion in search results.
 *
 * The first FAQ defaults to open so users see content even if they scroll
 * past without interacting.
 */
export function FAQSection() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section
      className="bg-slate-50 py-14 lg:py-20 px-4 lg:px-8"
      aria-labelledby="faq-heading"
      itemScope
      itemType="https://schema.org/FAQPage"
    >
      <div className="max-w-5xl mx-auto">
        <div className="grid lg:grid-cols-[1fr_1.5fr] gap-10 lg:gap-14">
          <Sidebar />

          <div className="bg-white rounded-2xl border-2 border-slate-200 px-6 lg:px-8 shadow-sm">
            {FAQS.map((faq, i) => (
              <FAQItem
                key={i}
                faq={faq}
                index={i}
                isOpen={openIndex === i}
                onToggle={() => setOpenIndex(openIndex === i ? -1 : i)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Sidebar() {
  return (
    <div>
      <div className="inline-flex items-center gap-2 mb-4">
        <span className="w-6 h-px bg-emerald-600" />
        <span className="text-[11px] tracking-wider uppercase text-emerald-700 font-black">
          Answers
        </span>
      </div>

      <h2 id="faq-heading" className="text-3xl lg:text-4xl font-black text-slate-900 leading-[1.1] tracking-tight">
        Common <span className="text-emerald-600">questions</span>.
      </h2>

      <p className="mt-4 text-slate-600 leading-relaxed">
        Buying a used car should feel simple, not stressful. Here are honest answers to questions we hear every day.
      </p>

      <div className="mt-6 space-y-2">
        <a
          href={`tel:${DEALER.phoneRaw}`}
          className="group flex items-center gap-2 text-sm font-bold text-emerald-700 hover:text-emerald-800"
        >
          <Phone className="w-4 h-4" strokeWidth={2.5} aria-hidden="true" />
          {DEALER.phone}
        </a>
        <a
          href={`mailto:${DEALER.email}`}
          className="group flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
        >
          <Mail className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
          {DEALER.email}
        </a>
      </div>
    </div>
  );
}

function FAQItem({
  faq,
  index,
  isOpen,
  onToggle,
}: {
  faq: FAQ;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.04 }}
      className="border-b border-slate-200 last:border-b-0"
      itemScope
      itemProp="mainEntity"
      itemType="https://schema.org/Question"
    >
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        className="w-full flex items-start justify-between gap-6 py-5 lg:py-6 text-left group"
      >
        <h3
          itemProp="name"
          className={cn(
            "text-base lg:text-lg font-bold tracking-tight transition-colors",
            isOpen ? "text-emerald-700" : "text-slate-900 group-hover:text-emerald-700",
          )}
        >
          {faq.q}
        </h3>
        <div
          className={cn(
            "flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all mt-0.5",
            isOpen
              ? "bg-emerald-600 border-emerald-600 text-white"
              : "border-slate-300 text-slate-700 group-hover:border-emerald-600 group-hover:text-emerald-700",
          )}
        >
          {isOpen ? (
            <Minus className="w-3.5 h-3.5" strokeWidth={2.5} aria-hidden="true" />
          ) : (
            <Plus className="w-3.5 h-3.5" strokeWidth={2.5} aria-hidden="true" />
          )}
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
            itemScope
            itemProp="acceptedAnswer"
            itemType="https://schema.org/Answer"
          >
            <p itemProp="text" className="pb-5 lg:pb-6 pr-12 text-slate-600 leading-relaxed">
              {faq.a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
