type Platform = "cargurus" | "carscom" | "edmunds";

interface Props {
  platforms: Platform[];
}

const PLATFORM_META: Record<Platform, { label: string; color: string }> = {
  cargurus: { label: "CarGurus", color: "#f97316" },
  carscom: { label: "Cars.com", color: "#1e40af" },
  edmunds: { label: "Edmunds", color: "#e11d48" },
};

/**
 * Tiny colored dots showing which third-party listing sites carry this vehicle.
 *
 * Why bother? Two reasons:
 *   1. Buyers Google "[year] [make] [model] for sale" — finding our listing
 *      on multiple sites builds credibility ("they're a real dealer, not a flip")
 *   2. It signals to other dealers that we have a serious syndication strategy
 *      (helpful for B2B / wholesale relationships)
 */
export function SyndicationDots({ platforms }: Props) {
  const allPlatforms: Platform[] = ["cargurus", "carscom", "edmunds"];
  const titleLabel = `Listed on: ${platforms.map((p) => PLATFORM_META[p].label).join(", ")}`;

  return (
    <div className="flex items-center gap-1" title={titleLabel}>
      {allPlatforms.map((p) => {
        const active = platforms.includes(p);
        return (
          <span
            key={p}
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: active ? PLATFORM_META[p].color : "#cbd5e1" }}
            aria-label={`${PLATFORM_META[p].label} ${active ? "listed" : "not listed"}`}
          />
        );
      })}
    </div>
  );
}
