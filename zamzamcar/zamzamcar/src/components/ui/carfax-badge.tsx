import { BadgeCheck } from "lucide-react";

interface Props {
  accidents: number;
  /** URL to the CARFAX/AutoCheck report. Optional fallback for cars without one. */
  reportUrl?: string;
}

/**
 * CARFAX vehicle history report badge.
 *
 * Style matches CARFAX's own brand badges (monospace bold logo + separator).
 * Shows a green checkmark when the report is "clean" — defined as zero
 * reported accidents.
 *
 * Clicking should open the actual CARFAX report. For now, this is a # link
 * that should be replaced with the real URL during DealerCenter integration.
 */
export function CarFaxBadge({ accidents, reportUrl = "#" }: Props) {
  const clean = accidents === 0;

  return (
    <a
      href={reportUrl}
      target={reportUrl !== "#" ? "_blank" : undefined}
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-300 rounded-md transition-all shadow-sm"
      aria-label={`View free CARFAX history report. ${clean ? "Clean history confirmed." : ""}`}
    >
      <span className="font-mono text-[10px] font-black tracking-tight text-slate-900">
        CARFAX
      </span>
      <span className="w-px h-3 bg-slate-300" aria-hidden="true" />
      <span className="text-[10px] font-semibold text-slate-700">Free Report</span>
      {clean && (
        <BadgeCheck
          className="w-3 h-3 text-emerald-600"
          strokeWidth={2.5}
          aria-hidden="true"
        />
      )}
    </a>
  );
}
