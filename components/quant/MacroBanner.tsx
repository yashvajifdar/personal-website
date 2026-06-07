"use client";

// Displays the current macro regime as a colored pill with supporting data points.

import { cn } from "@/lib/cn";
import type { MacroRegime, MacroSnapshot } from "@/lib/quant-api";

interface MacroBannerProps {
  macro: MacroSnapshot;
}

const REGIME_CONFIG: Record<
  MacroRegime,
  { label: string; pill: string; border: string }
> = {
  RISK_ON: {
    label: "Risk On",
    pill: "bg-green-100 text-green-800 border border-green-200",
    border: "border-green-200 bg-green-50",
  },
  TRANSITIONAL: {
    label: "Transitional",
    pill: "bg-yellow-100 text-yellow-800 border border-yellow-200",
    border: "border-yellow-200 bg-yellow-50",
  },
  RISK_OFF: {
    label: "Risk Off",
    pill: "bg-orange-100 text-orange-800 border border-orange-200",
    border: "border-orange-200 bg-orange-50",
  },
  CRISIS: {
    label: "Crisis",
    pill: "bg-red-100 text-red-800 border border-red-200",
    border: "border-red-200 bg-red-50",
  },
};

export function MacroBanner({ macro }: MacroBannerProps) {
  const cfg = REGIME_CONFIG[macro.regime];

  return (
    <div
      className={cn(
        "rounded-xl border px-5 py-4 flex flex-wrap items-center gap-4",
        cfg.border
      )}
      role="status"
      aria-label={`Current macro regime: ${cfg.label}`}
    >
      <span
        className={cn(
          "inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold",
          cfg.pill
        )}
      >
        {cfg.label}
      </span>

      <div className="flex flex-wrap gap-5 text-sm text-ink-muted">
        <span>
          <span className="font-medium text-ink">VIX</span>{" "}
          {macro.vix != null ? macro.vix.toFixed(1) : "—"}
        </span>
        <span>
          <span className="font-medium text-ink">10Y–2Y</span>{" "}
          {macro.t10y2y >= 0 ? "+" : ""}
          {macro.t10y2y.toFixed(2)}%
        </span>
        <span>
          <span className="font-medium text-ink">Fed Funds</span>{" "}
          {macro.fed_funds_rate.toFixed(2)}%
        </span>
      </div>
    </div>
  );
}
