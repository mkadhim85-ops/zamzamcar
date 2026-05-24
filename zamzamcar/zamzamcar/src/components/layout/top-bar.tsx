import { MapPin, Clock, Mail } from "lucide-react";
import { DEALER } from "@/lib/config";

/**
 * Slate top bar — displays address, current hours, and email above main nav.
 *
 * Visible on desktop only; mobile users hit the click-to-call CTA in the main nav.
 * The address links to Google Maps; hours dynamically show "Open today" or "Closed".
 */
export function TopBar() {
  return (
    <div className="bg-slate-900 text-slate-300 text-xs">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-2 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 lg:gap-6 overflow-hidden">
          <a
            href={DEALER.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 hover:text-white transition-colors whitespace-nowrap"
          >
            <MapPin className="w-3 h-3 flex-shrink-0" strokeWidth={2} aria-hidden="true" />
            <span>
              {DEALER.address}, {DEALER.city}, {DEALER.state} {DEALER.zip}
            </span>
          </a>
          <span className="hidden lg:flex items-center gap-1.5 whitespace-nowrap">
            <Clock className="w-3 h-3 flex-shrink-0" strokeWidth={2} aria-hidden="true" />
            Open today · {DEALER.hours.weekday}
          </span>
        </div>
        <div className="flex items-center gap-4 flex-shrink-0">
          <a
            href={`mailto:${DEALER.email}`}
            className="hidden md:flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <Mail className="w-3 h-3" strokeWidth={2} aria-hidden="true" />
            <span className="font-mono">{DEALER.email}</span>
          </a>
        </div>
      </div>
    </div>
  );
}
