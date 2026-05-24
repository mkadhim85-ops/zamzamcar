import { Sparkles } from "lucide-react";
import type { DealRating } from "@/types/ui";

interface Props {
  rating: DealRating;
  score?: number;
}

/**
 * CarGurus deal tier badge.
 *
 * Uses the EXACT CarGurus hex colors per their brand guidelines:
 *   - Great Deal: #00a061 (vibrant emerald)
 *   - Good Deal: #16a34a (light green)
 *   - Fair Deal: #eab308 (amber, with dark text for contrast)
 *
 * These badges appear on every car card and detail page. Their presence
 * signals to buyers that we've benchmarked our pricing — even when CarGurus
 * isn't visible elsewhere on the page.
 */
export function CarGurusBadge({ rating, score }: Props) {
  const config = {
    great: {
      label: "Great Deal",
      bgColor: "#00a061",
      textColor: "#ffffff",
    },
    good: {
      label: "Good Deal",
      bgColor: "#16a34a",
      textColor: "#ffffff",
    },
    fair: {
      label: "Fair Deal",
      bgColor: "#eab308",
      textColor: "#422006",
    },
  }[rating];

  return (
    <div
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md shadow-sm"
      style={{ backgroundColor: config.bgColor, color: config.textColor }}
      role="status"
      aria-label={`CarGurus rating: ${config.label}${score ? `, score ${score}` : ""}`}
    >
      <Sparkles className="w-3 h-3" strokeWidth={2.5} aria-hidden="true" />
      <span className="text-[11px] font-bold tracking-tight">{config.label}</span>
      {score !== undefined && (
        <span className="text-[10px] font-mono opacity-90 ml-0.5">{score}</span>
      )}
    </div>
  );
}
