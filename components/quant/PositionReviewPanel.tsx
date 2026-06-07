"use client";

import { cn } from "@/lib/cn";
import type { PortfolioReview, PositionReview, HedgeSuggestion } from "@/lib/quant-api";

// ── Verdict styling ────────────────────────────────────────────────────────────

const VERDICT_STYLES: Record<string, { badge: string; border: string; label: string }> = {
  HOLD: {
    badge: "bg-surface-2 text-ink-muted border border-surface-3",
    border: "border-surface-3",
    label: "Hold",
  },
  ADD: {
    badge: "bg-green-100 text-green-800 border border-green-200",
    border: "border-green-200",
    label: "Add",
  },
  TRIM: {
    badge: "bg-amber-100 text-amber-800 border border-amber-200",
    border: "border-amber-200",
    label: "Trim",
  },
  EXIT: {
    badge: "bg-red-100 text-red-800 border border-red-200",
    border: "border-red-200",
    label: "Exit",
  },
};

// ── Per-position card ──────────────────────────────────────────────────────────

function PositionCard({ review }: { review: PositionReview }) {
  const style = VERDICT_STYLES[review.verdict] ?? VERDICT_STYLES.HOLD;
  return (
    <div className={cn("bg-white rounded-2xl border p-5 space-y-3", style.border)}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-lg font-bold text-ink">{review.ticker}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-ink-subtle">Conviction {review.conviction}/5</span>
          <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full", style.badge)}>
            {style.label}
          </span>
        </div>
      </div>

      <p className="text-xs font-medium text-ink-subtle bg-surface-1 rounded-lg px-3 py-2">
        {review.signal_summary}
      </p>

      <p className="text-sm text-ink leading-relaxed">{review.updated_thesis}</p>

      {review.risk_note && (
        <p className="text-xs italic text-ink-muted border-t border-surface-2 pt-3">
          {review.risk_note}
        </p>
      )}
    </div>
  );
}

// ── Suggestion chip ────────────────────────────────────────────────────────────

function SuggestionCard({
  suggestion,
  label,
  color,
}: {
  suggestion: HedgeSuggestion;
  label: string;
  color: string;
}) {
  return (
    <div className="bg-white border border-surface-3 rounded-xl p-4 space-y-1.5">
      <div className="flex items-center gap-2">
        <span className="font-bold text-ink">{suggestion.ticker}</span>
        <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", color)}>
          {label}
        </span>
      </div>
      <p className="text-xs text-ink-muted leading-relaxed">{suggestion.rationale}</p>
    </div>
  );
}

// ── Full panel ────────────────────────────────────────────────────────────────

interface PositionReviewPanelProps {
  review: PortfolioReview;
  generatedAt: string | null;
}

export function PositionReviewPanel({ review, generatedAt }: PositionReviewPanelProps) {
  const { position_reviews, portfolio_insights } = review;
  const hasSuggestions =
    portfolio_insights.hedge_suggestions.length > 0 ||
    portfolio_insights.diversifier_suggestions.length > 0;

  return (
    <div className="space-y-6">
      {/* Macro + regime note */}
      <div className="bg-surface-1 border border-surface-3 rounded-xl px-4 py-3 space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-ink-subtle uppercase tracking-wide">
            Macro Regime
          </span>
          <span className="text-xs font-bold text-ink">{review.macro.regime.replace("_", " ")}</span>
          {review.macro.vix != null && (
            <span className="text-xs text-ink-subtle ml-auto">VIX {review.macro.vix.toFixed(1)}</span>
          )}
        </div>
        {portfolio_insights.regime_impact && (
          <p className="text-sm text-ink-muted">{portfolio_insights.regime_impact}</p>
        )}
      </div>

      {/* Per-position verdicts */}
      <div>
        <p className="text-xs font-semibold text-ink-subtle uppercase tracking-wide mb-3">
          Position Verdicts
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {position_reviews.map((r) => (
            <PositionCard key={r.ticker} review={r} />
          ))}
        </div>
      </div>

      {/* Concentration risk */}
      {portfolio_insights.concentration_risk && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <p className="text-xs font-semibold text-amber-800 uppercase tracking-wide mb-1">
            Concentration Risk
          </p>
          <p className="text-sm text-amber-900">{portfolio_insights.concentration_risk}</p>
        </div>
      )}

      {/* Hedge + diversifier suggestions */}
      {hasSuggestions && (
        <div>
          <p className="text-xs font-semibold text-ink-subtle uppercase tracking-wide mb-3">
            Suggestions to De-risk or Diversify
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {portfolio_insights.hedge_suggestions.map((s) => (
              <SuggestionCard
                key={s.ticker}
                suggestion={s}
                label="Hedge"
                color="bg-blue-100 text-blue-800"
              />
            ))}
            {portfolio_insights.diversifier_suggestions.map((s) => (
              <SuggestionCard
                key={s.ticker}
                suggestion={s}
                label="Diversifier"
                color="bg-purple-100 text-purple-800"
              />
            ))}
          </div>
        </div>
      )}

      {generatedAt && (
        <p className="text-xs text-ink-subtle text-right">
          Reviewed at {new Date(generatedAt).toLocaleTimeString()}
        </p>
      )}
    </div>
  );
}
