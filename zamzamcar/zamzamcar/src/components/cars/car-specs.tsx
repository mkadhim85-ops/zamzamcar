import {
  Gauge, Fuel, Settings2, Zap, Calendar, Palette, Car,
  Cog, ShieldCheck, FileText, Award, MapPin,
} from "lucide-react";
import { formatMileage, formatNumber } from "@/lib/utils/format";
import type { DisplayCar } from "@/types/ui";

interface Props {
  car: DisplayCar;
}

interface SpecGroup {
  title: string;
  Icon: typeof Gauge;
  rows: Array<{ label: string; value: string | number | undefined }>;
}

/**
 * Vehicle specifications table.
 *
 * Organized in 4 logical groups (Identification, Engine, Vehicle, History)
 * because a flat 30-row table makes buyers scan past important info.
 * Groups put related data side-by-side for easier mental comparison
 * against other listings.
 *
 * Rows with undefined values are filtered out — never show "N/A" or empty
 * cells, which makes the dealer look careless about their inventory data.
 */
export function CarSpecs({ car }: Props) {
  const groups: SpecGroup[] = [
    {
      title: "Identification",
      Icon: FileText,
      rows: [
        { label: "Year", value: car.year },
        { label: "Make", value: car.make },
        { label: "Model", value: car.model },
        { label: "Trim", value: car.trim },
        { label: "Body Style", value: capitalize(car.bodyStyle) },
        { label: "Stock #", value: car.stockNumber },
        { label: "VIN", value: car.vin },
      ],
    },
    {
      title: "Engine & Performance",
      Icon: Cog,
      rows: [
        { label: "Engine", value: car.engine },
        { label: "Fuel Type", value: capitalize(car.fuelType) },
        { label: "Transmission", value: capitalize(car.transmission) },
        { label: "Drivetrain", value: car.drivetrain.toUpperCase() },
        {
          label: "Fuel Economy",
          value:
            car.mpgCity && car.mpgHighway
              ? `${car.mpgCity} city / ${car.mpgHighway} hwy MPG`
              : undefined,
        },
      ],
    },
    {
      title: "Vehicle Details",
      Icon: Car,
      rows: [
        { label: "Mileage", value: formatMileage(car.mileage) },
        { label: "Exterior Color", value: car.exteriorColor },
        { label: "Interior Color", value: car.interiorColor },
        { label: "Condition", value: capitalize(car.condition) },
        { label: "Days on Market", value: car.daysListed },
        { label: "Photos", value: car.photoCount },
      ],
    },
    {
      title: "Title & History",
      Icon: ShieldCheck,
      rows: [
        { label: "Title Status", value: capitalize(car.titleStatus) },
        { label: "Accident History", value: car.accidents === 0 ? "No accidents reported" : `${car.accidents} reported` },
        { label: "Previous Owners", value: car.ownerCount === 1 ? "1 (single owner)" : `${car.ownerCount}` },
        { label: "Service Records", value: `${car.serviceRecords} on file` },
        { label: "CARFAX Available", value: car.carfaxAvailable ? "Yes — free report" : "Not available" },
      ],
    },
  ];

  return (
    <section aria-labelledby="specs-heading">
      <header className="mb-6">
        <h2 id="specs-heading" className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
          Vehicle <span className="text-emerald-600">Specifications</span>
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Full details for stock #{car.stockNumber}. All information verified by our 120-point inspection.
        </p>
      </header>

      <div className="grid sm:grid-cols-2 gap-5">
        {groups.map((group) => (
          <SpecGroupCard key={group.title} group={group} />
        ))}
      </div>
    </section>
  );
}

function SpecGroupCard({ group }: { group: SpecGroup }) {
  const { Icon } = group;
  const rows = group.rows.filter((r) => r.value !== undefined && r.value !== "");

  if (rows.length === 0) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <header className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center gap-2">
        <Icon className="w-4 h-4 text-emerald-600" strokeWidth={2.5} aria-hidden="true" />
        <h3 className="text-sm font-bold text-slate-900 tracking-tight">{group.title}</h3>
      </header>
      <dl className="divide-y divide-slate-100">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-baseline justify-between gap-4 px-4 py-2.5 text-sm hover:bg-slate-50/50 transition-colors"
          >
            <dt className="text-slate-500 font-medium">{row.label}</dt>
            <dd className="text-slate-900 font-semibold text-right font-mono text-[13px] break-all">
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Features grid — separate from specs because features are sales-y
 * (Apple CarPlay, Heated Seats) while specs are factual (3.5L V6).
 * Surface them side-by-side in the page layout but as distinct sections.
 */
export function CarFeatures({ car }: Props) {
  if (!car.features || car.features.length === 0) return null;

  return (
    <section aria-labelledby="features-heading" className="mt-10">
      <header className="mb-5">
        <h2 id="features-heading" className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
          Features &amp; <span className="text-emerald-600">Equipment</span>
        </h2>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {car.features.map((feature) => (
          <div
            key={feature}
            className="flex items-center gap-2 px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 hover:border-emerald-200 hover:bg-emerald-50/30 transition-colors"
          >
            <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full flex-shrink-0" aria-hidden="true" />
            <span className="font-medium">{feature}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
