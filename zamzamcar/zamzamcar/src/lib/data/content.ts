/**
 * Static content: testimonials and FAQs.
 *
 * These are editorial assets, not pulled from an API. Editing requires a
 * code deploy — which is correct, because we want this content reviewed
 * before publishing.
 *
 * In a future iteration, this could move to a headless CMS (Sanity, Contentful)
 * for non-technical editing, but at our current size that's overhead without payoff.
 */

import type { Testimonial, FAQ } from "@/types/ui";

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "1",
    quote:
      "Found my Honda Accord here for $2,000 less than other dealers in Salt Lake. They walked me through every fee before I signed — no surprises at the end. That's rare.",
    author: "Maria Hernandez",
    role: "Bought a 2015 Honda Accord EX-L",
    rating: 5,
    location: "West Valley City, UT",
    daysAgo: 18,
    verified: "Google",
  },
  {
    id: "2",
    quote:
      "I have less-than-perfect credit and got approved in under an hour. The Out-The-Door price was exactly what they quoted online. Best car-buying experience I've had.",
    author: "David Chen",
    role: "Bought a 2017 Ford Escape SE",
    rating: 5,
    location: "South Salt Lake, UT",
    daysAgo: 31,
    verified: "CarGurus",
  },
  {
    id: "3",
    quote:
      "They were upfront about the rebuilt title on my Tesla and showed me the inspection report. Saved thousands, runs perfectly. Honest people, no high-pressure sales.",
    author: "Aisha Williams",
    role: "Bought a 2016 Tesla Model S 70D",
    rating: 5,
    location: "Murray, UT",
    daysAgo: 47,
    verified: "Google",
  },
];

export const AGGREGATE_RATING = {
  ratingValue: 4.8,
  reviewCount: 312,
  bestRating: 5,
  worstRating: 1,
} as const;

export const FAQS: FAQ[] = [
  {
    q: 'What does "Out-The-Door" price actually include at ZAMZAM CARS?',
    a: "Our Out-The-Door price includes the vehicle's base price plus Utah state sales tax (7.65%), a $399 documentation fee, and $155 for license, title, and registration. That's it — no hidden fees, no surprise add-ons at signing. You see the exact total on every car card before you ever step into the lot at 3330 S State St.",
  },
  {
    q: "Do you offer financing for buyers with bad credit or no credit?",
    a: "Yes. We work with 15+ lenders, including subprime specialists and credit unions that approve buyers with credit challenges, bankruptcies, or no credit history. Get pre-qualified online in about 4 minutes with no impact to your credit score. Most approvals come back the same day.",
  },
  {
    q: "What is the difference between Clean, Rebuilt, and Salvage Title vehicles?",
    a: "A Clean Title means the vehicle has never been declared a total loss by an insurance company. A Rebuilt Title means the car was previously totaled, then repaired and inspected by the state of Utah. Rebuilt vehicles often sell for thousands less but may have insurance and financing limitations. We disclose title status on every vehicle and provide full inspection records for rebuilt cars.",
  },
  {
    q: "Can I see a CARFAX or AutoCheck report before visiting the lot?",
    a: "Absolutely. Every vehicle on our website includes a free vehicle history report — no email required, no signup wall. The report shows accident history, ownership records, service history, and title brands. We believe full transparency upfront saves everyone time.",
  },
  {
    q: "Do you take trade-ins, and how is the value calculated?",
    a: "Yes — we accept trade-ins on any running vehicle, even if you don't buy from us. We use Kelley Blue Book and current Utah auction values to make a fair offer in about 20 minutes. Bring your title, registration, and keys. Our offers are typically $500-$2,000 higher than instant online quotes from CarMax or Carvana.",
  },
  {
    q: "Are your used cars inspected before being sold?",
    a: "Every vehicle goes through our 120-point mechanical and cosmetic inspection before listing. We check engine, transmission, brakes, suspension, electrical systems, tires, and fluids. Any issues are either repaired or fully disclosed. Reconditioning records stay on file for every car — ask to see them.",
  },
  {
    q: "How long does the buying process take?",
    a: "Most customers drive home in 1–2 hours after selecting a vehicle. Pre-qualified buyers move faster — sometimes in under 45 minutes. We handle title transfer, temporary tags, and registration paperwork in-house so you can drive away legally the same day.",
  },
];
