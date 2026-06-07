"use client";

// Shared confirmation modal for opening a paper trade position.

import { useState } from "react";
import type { Recommendation, OpenTradePayload } from "@/lib/quant-api";

interface OpenPositionModalProps {
  rec: Recommendation;
  portfolioId: string | null;
  onConfirm: (trade: OpenTradePayload) => Promise<void>;
  onCancel: () => void;
  onNeedPortfolio: () => void;
}

export function OpenPositionModal({
  rec,
  portfolioId,
  onConfirm,
  onCancel,
  onNeedPortfolio,
}: OpenPositionModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If no portfolio exists yet, prompt the user to create one first.
  if (!portfolioId) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="open-modal-title"
      >
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 space-y-5">
          <h2 id="open-modal-title" className="text-base font-semibold text-ink">
            Portfolio required
          </h2>
          <p className="text-sm text-ink-muted">
            You need a portfolio before you can log paper trades. Create one in
            the Portfolio tab.
          </p>
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 py-2.5 border border-surface-3 text-ink-muted text-sm font-medium rounded-xl hover:border-quant hover:text-quant transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onNeedPortfolio}
              className="flex-1 py-2.5 bg-quant text-white text-sm font-medium rounded-xl hover:bg-quant-hover transition-colors"
            >
              Go to Portfolio
            </button>
          </div>
        </div>
      </div>
    );
  }

  async function handleConfirm() {
    setSubmitting(true);
    setError(null);
    try {
      await onConfirm({
        ticker: rec.ticker,
        action: rec.action,
        entry_price: rec.risk_params.entry,
        shares: rec.risk_params.suggested_shares,
        stop: rec.risk_params.stop,
        target: rec.risk_params.target,
        signal_snapshot: (rec.signals ?? {}) as Record<string, unknown>,
        thesis: rec.thesis,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to open position.");
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="open-modal-title"
    >
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 space-y-5">
        <h2 id="open-modal-title" className="text-base font-semibold text-ink">
          Open Position — {rec.ticker}
        </h2>

        {/* Trade summary */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          {(
            [
              ["Action", rec.action],
              ["Entry", `$${rec.risk_params.entry.toFixed(2)}`],
              ["Stop", `$${rec.risk_params.stop.toFixed(2)}`],
              ["Target", `$${rec.risk_params.target.toFixed(2)}`],
              ["R:R", rec.risk_params.reward_risk_ratio.toFixed(1)],
              ["Shares", rec.risk_params.suggested_shares.toString()],
            ] as [string, string][]
          ).map(([label, value]) => (
            <div key={label} className="bg-surface-1 rounded-lg py-2 px-3">
              <p className="text-ink-subtle mb-0.5">{label}</p>
              <p className="font-semibold text-ink">{value}</p>
            </div>
          ))}
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-ink-muted leading-relaxed bg-surface-1 rounded-xl px-4 py-3">
          This will log a paper trade at the current closing price. You are
          responsible for verifying the price is today&apos;s close.
        </p>

        {error && (
          <p className="text-xs text-red-600">{error}</p>
        )}

        <div className="flex gap-3 pt-1">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 border border-surface-3 text-ink-muted text-sm font-medium rounded-xl hover:border-quant hover:text-quant transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={submitting}
            className="flex-1 py-2.5 bg-quant text-white text-sm font-medium rounded-xl hover:bg-quant-hover transition-colors disabled:opacity-50"
          >
            {submitting ? "Logging..." : "Confirm Open"}
          </button>
        </div>
      </div>
    </div>
  );
}
