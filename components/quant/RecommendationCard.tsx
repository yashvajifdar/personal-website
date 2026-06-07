"use client";

// Displays a single recommendation with action badge, conviction stars,
// thesis text, price grid, R:R ratio, and Open Position button.

import { cn } from "@/lib/cn";
import type { Recommendation } from "@/lib/quant-api";

interface RecommendationCardProps {
  rec: Recommendation;
  onOpenPosition: (rec: Recommendation) => void;
}

const ACTION_STYLES: Record<string, string> = {
  BUY: "bg-green-100 text-green-800 border border-green-200",
  AVOID: "bg-red-100 text-red-800 border border-red-200",
  HOLD: "bg-surface-3 text-ink-muted border border-surface-3",
};

function ConvictionStars({ value }: { value: number }) {
  return (
    <span className="flex gap-0.5" aria-label={`Conviction: ${value} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={cn(
            "w-3.5 h-3.5",
            i < value ? "text-amber-400" : "text-surface-3"
          )}
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  );
}

function PriceGrid({ rec }: { rec: Recommendation }) {
  const rp = rec.risk_params;
  return (
    <dl className="grid grid-cols-3 gap-2 text-center text-xs">
      {(
        [
          ["Entry", rp.entry],
          ["Stop", rp.stop],
          ["Target", rp.target],
        ] as [string, number][]
      ).map(([label, value]) => (
        <div key={label} className="bg-surface-1 rounded-lg px-2 py-2">
          <dt className="text-ink-subtle mb-0.5">{label}</dt>
          <dd className="font-semibold text-ink">${value.toFixed(2)}</dd>
        </div>
      ))}
    </dl>
  );
}

export function RecommendationCard({
  rec,
  onOpenPosition,
}: RecommendationCardProps) {
  return (
    <article className="bg-white border border-surface-3 rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
      {/* Header: ticker + action badge */}
      <div className="flex items-center justify-between">
        <span className="text-lg font-bold text-ink">{rec.ticker}</span>
        <span
          className={cn(
            "text-xs font-semibold px-2.5 py-1 rounded-full",
            ACTION_STYLES[rec.action] ?? ACTION_STYLES.HOLD
          )}
        >
          {rec.action}
        </span>
      </div>

      {/* Conviction */}
      <ConvictionStars value={rec.conviction} />

      {/* Thesis */}
      <p className="text-sm text-ink-muted leading-relaxed">{rec.thesis}</p>

      {/* Price grid */}
      <PriceGrid rec={rec} />

      {/* R:R + Open Position */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-xs text-ink-subtle">
          R:R{" "}
          <span className="font-semibold text-ink">
            {rec.risk_params.reward_risk_ratio.toFixed(1)}
          </span>
        </span>
        <button
          onClick={() => onOpenPosition(rec)}
          className="text-xs font-medium px-3 py-1.5 bg-quant text-white rounded-lg hover:bg-quant-hover transition-colors"
        >
          Open Position
        </button>
      </div>
    </article>
  );
}
