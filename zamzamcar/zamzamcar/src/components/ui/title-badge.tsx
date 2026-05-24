import { CheckCircle2, AlertTriangle } from "lucide-react";
import type { TitleStatus } from "@/types/ui";

interface Props {
  status: TitleStatus;
}

/**
 * Vehicle title status badge.
 *
 * Critical disclosure for buyers — title status affects:
 *   - Insurance availability (some carriers refuse salvage titles)
 *   - Financing options (most banks won't finance rebuilt cars at standard rates)
 *   - Resale value (typically 20-40% lower for rebuilt)
 *
 * Showing this badge prominently on EVERY car card builds buyer trust and
 * pre-qualifies leads — people who only want clean titles can skip past
 * rebuilt cars without calling.
 */
export function TitleBadge({ status }: Props) {
  const config = {
    clean: {
      label: "Clean Title",
      bg: "bg-emerald-50",
      text: "text-emerald-900",
      border: "border-emerald-200",
      Icon: CheckCircle2,
      iconColor: "text-emerald-600",
    },
    rebuilt: {
      label: "Rebuilt Title",
      bg: "bg-amber-50",
      text: "text-amber-900",
      border: "border-amber-200",
      Icon: AlertTriangle,
      iconColor: "text-amber-600",
    },
    salvage: {
      label: "Salvage Title",
      bg: "bg-rose-50",
      text: "text-rose-900",
      border: "border-rose-200",
      Icon: AlertTriangle,
      iconColor: "text-rose-600",
    },
  }[status];

  const { Icon } = config;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 ${config.bg} ${config.border} border rounded-md`}
      role="status"
      aria-label={`Title status: ${config.label}`}
    >
      <Icon className={`w-3 h-3 ${config.iconColor}`} strokeWidth={2.5} aria-hidden="true" />
      <span className={`text-[11px] font-bold tracking-tight ${config.text}`}>
        {config.label}
      </span>
    </div>
  );
}
