"use client";

// Combined picks view — macro banner + full signal breakdown per recommendation.
// Replaces the separate Today (card view) and Picks (signal table) tabs.

import { cn } from "@/lib/cn";
import type { Recommendation, MacroSnapshot, OpenTradePayload } from "@/lib/quant-api";
import { MacroBanner } from "@/components/quant/MacroBanner";

// ── Score bar ─────────────────────────────────────────────────────────────────

function ScoreBar({ label, value }: { label: string; value: number }) {
  const color = value >= 70 ? "bg-green-500" : value >= 40 ? "bg-amber-400" : "bg-red-400";
  return (
    <div>
      <div className="flex justify-between text-xs text-ink-muted mb-1">
        <span>{label}</span>
        <span className="font-semibold text-ink">{value.toFixed(0)}</span>
      </div>
      <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full", color)}
          style={{ width: `${value}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}

// ── Single recommendation card ────────────────────────────────────────────────

interface PickCardProps {
  rec: Recommendation;
  onOpenPosition: (rec: Recommendation) => void;
}

const ACTION_STYLES: Record<string, string> = {
  BUY:   "bg-green-100 text-green-800 border border-green-200",
  AVOID: "bg-red-100 text-red-800 border border-red-200",
  HOLD:  "bg-surface-2 text-ink-muted border border-surface-3",
};

function PickCard({ rec, onOpenPosition }: PickCardProps) {
  const sig = rec.signals;
  const rp  = rec.risk_params;

  const rsiLabel =
    sig && sig.rsi < 30 ? { text: "Oversold", cls: "text-green-700 bg-green-100" }
    : sig && sig.rsi > 70 ? { text: "Overbought", cls: "text-red-700 bg-red-100" }
    : { text: "Neutral", cls: "text-ink-muted bg-surface-2" };

  const macdBullish = sig ? sig.macd_hist >= 0 : false;

  return (
    <article className="bg-white border border-surface-3 rounded-2xl p-6 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-xl font-bold text-ink">{rec.ticker}</h3>
            <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full", ACTION_STYLES[rec.action] ?? ACTION_STYLES.HOLD)}>
              {rec.action}
            </span>
            <span className="text-xs text-ink-subtle">Conviction {rec.conviction}/5</span>
          </div>
          {sig?.composite_score != null && (
            <p className="text-xs text-ink-subtle mt-1">
              Composite score: <span className="font-semibold text-green-700">{sig.composite_score.toFixed(1)}</span> / 100
            </p>
          )}
        </div>
        <button
          onClick={() => onOpenPosition(rec)}
          className="shrink-0 text-xs font-medium px-4 py-2 bg-quant text-white rounded-xl hover:bg-quant-hover transition-colors"
        >
          Open Position
        </button>
      </div>

      {/* Thesis */}
      <p className="text-sm text-ink leading-relaxed">{rec.thesis}</p>

      {sig && (
        <>
          {/* Factor scores */}
          <div className="space-y-2.5">
            <p className="text-xs font-semibold text-ink-subtle uppercase tracking-wide">Factor Scores</p>
            <ScoreBar label="Momentum Rank" value={sig.momentum_rank ?? 0} />
            <ScoreBar label="Low-Vol Rank"  value={sig.lowvol_rank ?? 0} />
            <ScoreBar label="Composite"     value={sig.composite_score ?? 0} />
          </div>

          {/* Technicals */}
          <div>
            <p className="text-xs font-semibold text-ink-subtle uppercase tracking-wide mb-3">Technicals</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="bg-surface-1 rounded-lg px-3 py-2">
                <p className="text-ink-subtle mb-1">RSI</p>
                <p className="font-semibold text-ink">{sig.rsi.toFixed(0)}</p>
                <span className={cn("text-xs font-medium px-1.5 py-0.5 rounded-full", rsiLabel.cls)}>
                  {rsiLabel.text}
                </span>
              </div>
              <div className="bg-surface-1 rounded-lg px-3 py-2">
                <p className="text-ink-subtle mb-1">MA Trend</p>
                <p className={cn("font-semibold", sig.ma50_above_ma200 ? "text-green-700" : "text-red-600")}>
                  {sig.ma50_above_ma200 ? "Uptrend ✓" : "Downtrend ✗"}
                </p>
              </div>
              <div className="bg-surface-1 rounded-lg px-3 py-2">
                <p className="text-ink-subtle mb-1">MACD</p>
                <p className={cn("font-semibold", macdBullish ? "text-green-700" : "text-red-600")}>
                  {macdBullish ? "Bullish" : "Bearish"}
                </p>
                <p className="text-ink-subtle">{sig.macd_hist.toFixed(3)}</p>
              </div>
              <div className="bg-surface-1 rounded-lg px-3 py-2">
                <p className="text-ink-subtle mb-1">Volume</p>
                <p className="font-semibold text-ink">{sig.volume_ratio.toFixed(2)}x</p>
                <p className={cn("font-medium", sig.volume_ratio >= 1.5 ? "text-green-700" : "text-ink-muted")}>
                  {sig.volume_ratio >= 1.5 ? "High" : "Normal"}
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Risk parameters */}
      <div>
        <p className="text-xs font-semibold text-ink-subtle uppercase tracking-wide mb-3">Risk Parameters</p>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-xs text-center">
          {(
            [
              ["Entry",   `$${rp.entry.toFixed(2)}`],
              ["Stop",    `$${rp.stop.toFixed(2)}`],
              ["Target",  `$${rp.target.toFixed(2)}`],
              ["R:R",     rp.reward_risk_ratio.toFixed(1)],
              ["Shares",  rp.suggested_shares.toString()],
              ["Size %",  `${rp.suggested_size_pct.toFixed(1)}%`],
            ] as [string, string][]
          ).map(([label, value]) => (
            <div key={label} className="bg-surface-1 rounded-lg py-2 px-1">
              <p className="text-ink-subtle mb-0.5">{label}</p>
              <p className="font-semibold text-ink">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Risks */}
      {rec.risks_to_thesis && (
        <p className="text-xs italic text-ink-muted leading-relaxed border-t border-surface-2 pt-4">
          Risk: {rec.risks_to_thesis}
        </p>
      )}
    </article>
  );
}

// ── Tab ───────────────────────────────────────────────────────────────────────

interface PicksTabProps {
  recommendations: Recommendation[];
  macro: MacroSnapshot | null;
  loading: boolean;
  error: string | null;
  note: string | null;
  onRefresh: () => void;
  onOpenPosition: (rec: Recommendation) => void;
}

export function PicksTab({
  recommendations,
  macro,
  loading,
  error,
  note,
  onRefresh,
  onOpenPosition,
}: PicksTabProps) {
  return (
    <div className="space-y-6">
      {/* Macro banner */}
      {macro && <MacroBanner macro={macro} />}
      {!macro && loading && (
        <div className="h-16 bg-surface-2 rounded-xl animate-pulse" />
      )}

      {/* Loading skeletons */}
      {loading && recommendations.length === 0 && (
        <div className="space-y-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-64 bg-surface-2 rounded-2xl animate-pulse" />
          ))}
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="bg-surface-1 border border-surface-3 rounded-xl px-5 py-4 text-sm text-ink-muted">
          {error}
        </div>
      )}

      {/* Off-topic note (engine returned no picks) */}
      {!loading && !error && note && recommendations.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 text-sm text-amber-800">
          {note}
        </div>
      )}

      {/* Empty state — no note */}
      {!loading && !error && !note && recommendations.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center space-y-2">
          <p className="text-sm font-medium text-ink">No picks yet</p>
          <p className="text-xs text-ink-subtle max-w-xs">
            Click Refresh to run the signal engine and fetch this week&apos;s top factor picks.
          </p>
        </div>
      )}

      {/* Picks */}
      {recommendations.length > 0 && (
        <div className="space-y-5">
          {recommendations.map((rec) => (
            <PickCard key={rec.ticker} rec={rec} onOpenPosition={onOpenPosition} />
          ))}
        </div>
      )}

      {/* Refresh button */}
      <div className="flex flex-col items-center gap-2 pt-2">
        <button
          onClick={onRefresh}
          disabled={loading}
          className="px-6 py-2.5 bg-quant text-white text-sm font-medium rounded-xl hover:bg-quant-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? "Loading…" : "Refresh Picks"}
        </button>
        <p className="text-xs text-ink-subtle">Takes ~30 seconds — runs 3 signal tools + AI synthesis</p>
        <p className="text-xs text-ink-subtle">Not financial advice. Paper trading only.</p>
      </div>
    </div>
  );
}
