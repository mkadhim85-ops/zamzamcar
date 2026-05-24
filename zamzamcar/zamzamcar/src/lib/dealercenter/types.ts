/**
 * DealerCenter raw feed types.
 *
 * DealerCenter offers inventory exports in two common shapes:
 *   1. XML feed (most common — pulled from a static URL on a schedule)
 *   2. JSON feed (newer dealers, or via a syndication partner)
 *
 * These types describe the RAW shape from DealerCenter. Do not import them
 * outside lib/dealercenter — the transformer converts to the unified Car type.
 *
 * NOTE: Field names below match DealerCenter's most common export schema.
 * Some dealer accounts have custom field names — adjust here once you receive
 * your actual feed sample. Common variations are documented inline.
 */

export interface DealerCenterVehicle {
  // Identification
  StockNumber: string;
  VIN: string;
  Status?: string;          // "Available" | "Sold" | "Pending"

  // Vehicle basics
  Year: string | number;
  Make: string;
  Model: string;
  Trim?: string;
  BodyStyle?: string;
  VehicleType?: string;     // "New" | "Used" | "Certified Pre-Owned"

  // Pricing (DealerCenter sends as string with $ sometimes)
  Price?: string | number;
  InternetPrice?: string | number;
  MSRP?: string | number;

  // Mechanical
  Mileage?: string | number;
  Odometer?: string | number; // Alternate field name
  FuelType?: string;
  Transmission?: string;
  Drivetrain?: string;
  Engine?: string;
  CityMPG?: string | number;
  HighwayMPG?: string | number;

  // Appearance
  ExteriorColor?: string;
  InteriorColor?: string;

  // Marketing
  Features?: string | string[];  // Sometimes comma-separated string
  Description?: string;
  Comments?: string;             // Some feeds use this instead of Description

  // Media — DealerCenter often sends as "Photo1", "Photo2"... or as an array
  Photos?: string[] | string;
  Photo1?: string;
  Photo2?: string;
  Photo3?: string;
  // ... up to Photo40 in some feeds
  VideoURL?: string;
  CarfaxURL?: string;

  // Timestamps
  DateAdded?: string;
  LastUpdated?: string;
}

export interface DealerCenterFeed {
  Inventory?: {
    Vehicle: DealerCenterVehicle[] | DealerCenterVehicle;
  };
  // Alternate root keys seen in the wild
  Vehicles?: DealerCenterVehicle[];
  vehicles?: DealerCenterVehicle[];
}
