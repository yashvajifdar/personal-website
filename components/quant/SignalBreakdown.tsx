"use client";

// Picks tab — detailed signal grid for each recommended ticker.

import { cn } from "@/lib/cn";
import type { Recommendation } from "@/lib/quant-api";

interface SignalBreakdownProps {
  recommendations: Recommendation[];
}

interface ScoreBarProps {
  label: string;
  value: number; // 0–100
}

function ScoreBar({ label, value }: ScoreBarProps) {
  const color =
    value >= 70
      ? "bg-green-500"
      : value >= 40
      ? "bg-amber-400"
      : "bg-red-400";

  return (
    <div>
      <div className="flex justify-between text-xs text-ink-muted mb-1">
        <span>{label}</span>
        <span className="font-semibold text-ink">{value}</span>
      </div>
      <div className="h-2 bg-surface-2 rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all", color)}
          style={{ width: `${value}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${label}: ${value}`}
        />
      </div>
    </div>
  );
}

function rsiLabel(rsi: number): { text: string; cls: string } {
  if (rsi < 30) return { text: "Oversold", cls: "text-green-700 bg-green-100" };
  if (rsi > 70) return { text: "Overbought", cls: "text-red-700 bg-red-100" };
  return { text: "Neutral", cls: "text-ink-muted bg-surface-2" };
}

export function SignalBreakdown({ recommendations }: SignalBreakdownProps) {
  if (recommendations.length === 0) {
    return (
      <p className="text-sm text-ink-muted text-center py-10">
        No recommendations loaded yet. Use the Today tab to fetch picks.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {recommendations.map((rec) => {
        const sig = rec.signals;
        if (!sig) {
          return (
            <div
              key={rec.ticker}
              className="bg-white border border-surface-3 rounded-2xl p-5"
            >
              <p className="text-sm font-semibold text-ink mb-1">
                {rec.ticker}
              </p>
              <p className="text-xs text-ink-subtle">
                Detailed signal data not available.
              </p>
            </div>
          );
        }

        const rsi = rsiLabel(sig.rsi);
        const macd =
          sig.macd_histogram >= 0
            ? { text: "Bullish", cls: "text-green-700" }
            : { text: "Bearish", cls: "text-red-600" };
        const vol =
          sig.volume_ratio >= 1.5
            ? { text: "High conviction", cls: "text-green-700" }
            : { text: "Normal", cls: "text-ink-muted" };

        return (
          <article
            key={rec.ticker}
            className="bg-white border border-surface-3 rounded-2xl p-5 space-y-5"
          >
            <h3 className="text-base font-bold text-ink">{rec.ticker}</h3>

            {/* Factor score bars */}
            <section aria-label="Factor scores">
              <p className="text-xs font-semibold text-ink-subtle uppercase tracking-wide mb-3">
                Factor Scores
              </p>
              <div className="space-y-3">
                <ScoreBar label="Momentum Rank" value={sig.momentum_rank} />
                <ScoreBar label="Low-Vol Rank" value={sig.low_vol_rank} />
                <ScoreBar label="Composite Score" value={sig.composite_score} />
              </div>
            </section>

            {/* Technical indicators */}
            <section aria-label="Technical indicators">
              <p className="text-xs font-semibold text-ink-subtle uppercase tracking-wide mb-3">
                Technical Indicators
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                <div className="bg-surface-1 rounded-lg px-3 py-2">
                  <p className="text-xs text-ink-subtle mb-0.5">RSI</p>
                  <p className="font-semibold text-ink">{sig.rsi.toFixed(0)}</p>
                  <span
                    className={cn(
                      "text-xs font-medium px-1.5 py-0.5 rounded-full",
                      rsi.cls
                    )}
                  >
                    {rsi.text}
                  </span>
                </div>

                <div className="bg-surface-1 rounded-lg px-3 py-2">
                  <p className="text-xs text-ink-subtle mb-0.5">MA Trend</p>
                  <p
                    className={cn(
                      "font-semibold text-sm",
                      sig.ma50_above_ma200 ? "text-green-700" : "text-red-600"
                    )}
                  >
                    {sig.ma50_above_ma200 ? "Uptrend ✓" : "Downtrend ✗"}
                  </p>
                </div>

                <div className="bg-surface-1 rounded-lg px-3 py-2">
                  <p className="text-xs text-ink-subtle mb-0.5">MACD</p>
                  <p className={cn("font-semibold text-sm", macd.cls)}>
                    {macd.text}
                  </p>
                  <p className="text-xs text-ink-subtle">
                    {sig.macd_histogram.toFixed(3)}
                  </p>
                </div>

                <div className="bg-surface-1 rounded-lg px-3 py-2">
                  <p className="text-xs text-ink-subtle mb-0.5">Volume Ratio</p>
                  <p className="font-semibold text-ink">
                    {sig.volume_ratio.toFixed(2)}x
                  </p>
                  <p className={cn("text-xs font-medium", vol.cls)}>
                    {vol.text}
                  </p>
                </div>
              </div>
            </section>

            {/* Risk parameters */}
            <section aria-label="Risk parameters">
              <p className="text-xs font-semibold text-ink-subtle uppercase tracking-wide mb-3">
                Risk Parameters
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-xs text-center">
                {(
                  [
                    ["Entry", `$${sig.entry.toFixed(2)}`],
                    ["Stop", `$${sig.stop.toFixed(2)}`],
                    ["Target", `$${sig.target.toFixed(2)}`],
                    ["R:R", sig.reward_risk.toFixed(1)],
                    ["Shares", sig.suggested_shares.toString()],
                    ["Size %", `${sig.size_pct.toFixed(1)}%`],
                  ] as [string, string][]
                ).map(([label, value]) => (
                  <div key={label} className="bg-surface-1 rounded-lg py-2 px-1">
                    <p className="text-ink-subtle mb-0.5">{label}</p>
                    <p className="font-semibold text-ink">{value}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Risks */}
            {rec.risks && (
              <p className="text-xs italic text-ink-muted leading-relaxed border-t border-surface-2 pt-3">
                {rec.risks}
              </p>
            )}
          </article>
        );
      })}
    </div>
  );
}
