/**
 * Business configuration.
 *
 * Single source of truth for dealer details, fees, and tax rates.
 * Anything that could change (Utah tax rate, doc fee, address) lives here
 * so it's editable in one place — and consumed everywhere consistently.
 */

export const DEALER = {
  name: "ZAMZAM CARS",
  legalName: "ZAMZAM CARS LLC",
  address: "3330 S State St",
  city: "South Salt Lake",
  state: "UT",
  stateFull: "Utah",
  zip: "84115",
  country: "US",
  phone: "(801) 308-8117",
  phoneRaw: "+18013088117",
  email: "sales@zamzamcar.com",
  website: "https://zamzamcar.com",
  established: 2018,
  googleMapsUrl:
    "https://maps.google.com/?q=3330+S+State+St+South+Salt+Lake+UT+84115",
  hours: {
    weekday: "9:00 AM – 7:00 PM",
    saturday: "9:00 AM – 6:00 PM",
    sunday: "Closed",
  },
  geo: {
    latitude: 40.6953,
    longitude: -111.8881,
  },
  social: {
    facebook: "https://facebook.com/zamzamcar",
    instagram: "https://instagram.com/zamzamcar",
    google: "https://g.page/zamzamcar",
  },
} as const;

/**
 * Utah Out-the-Door pricing constants.
 *
 * Tax rate is South Salt Lake combined rate (state + county + local).
 * Doc fee is our dealer fee. License fee covers DMV registration + title.
 *
 * IMPORTANT: If tax rates change (state increases, new local options),
 * update only this file — every car card and calculator recalculates automatically.
 */
export const PRICING = {
  /** Combined Utah state + local sales tax rate for South Salt Lake */
  SALES_TAX_RATE: 0.0765,
  /** Documentation fee charged at signing */
  DOC_FEE: 399,
  /** License, title, and registration fee */
  LICENSE_FEE: 155,
  /** Currency for all monetary displays */
  CURRENCY: "USD",
  /** Country for tax/registration calculations */
  COUNTRY: "US",
  /** State for tax calculations */
  STATE: "UT",
} as const;

export const SITE = {
  name: "ZAMZAM CARS",
  tagline: "Quality used cars, honest prices",
  description:
    "Affordable pre-owned vehicles in South Salt Lake, Utah. Free CARFAX reports, transparent Out-the-Door pricing, all-credit financing approved.",
  url: "https://zamzamcar.com",
  ogImage: "/og-image.jpg",
  keywords: [
    "used cars Salt Lake City",
    "used cars Utah",
    "cars for sale South Salt Lake",
    "bad credit auto loans Utah",
    "trade in value Utah",
    "affordable used cars",
    "ZAMZAM CARS",
  ],
} as const;

/** Filter options surfaced in the hero search widget. */
export const FILTERS = {
  BODY_TYPES: [
    "Any",
    "Sedan",
    "SUV",
    "Truck",
    "Coupe",
    "Hatchback",
    "Convertible",
    "Wagon",
    "Van",
  ],
  MAKES: [
    "Any",
    "Toyota",
    "Honda",
    "Ford",
    "Chevrolet",
    "Nissan",
    "Hyundai",
    "Kia",
    "Mazda",
    "Tesla",
    "BMW",
    "Mercedes-Benz",
  ],
  PRICE_RANGES: [
    "Any",
    "Under $10K",
    "$10K - $15K",
    "$15K - $20K",
    "$20K - $25K",
    "$25K+",
  ],
  YEAR_RANGES: [
    "Any",
    "2020+",
    "2018 - 2019",
    "2015 - 2017",
    "2012 - 2014",
    "Older",
  ],
  MILEAGE_RANGES: [
    "Any",
    "Under 50K",
    "50K - 80K",
    "80K - 100K",
    "100K - 130K",
    "130K+",
  ],
} as const;

/** AI search placeholder suggestions that rotate in the hero search bar. */
export const AI_SEARCH_SUGGESTIONS = [
  "Reliable SUV under $15,000",
  "Sedan with low miles, clean title",
  "AWD vehicle for Utah winters",
  "Family car with good fuel economy",
] as const;
