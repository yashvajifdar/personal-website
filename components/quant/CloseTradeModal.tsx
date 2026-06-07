"use client";

// Shared confirmation modal for closing a paper trade position.

import { useState } from "react";
import type { Trade, ExitReason } from "@/lib/quant-api";

interface CloseTradeModalProps {
  trade: Trade;
  onConfirm: (
    tradeId: string,
    exitPrice: number,
    exitReason: ExitReason
  ) => Promise<void>;
  onCancel: () => void;
}

const EXIT_REASONS: { value: ExitReason; label: string }[] = [
  { value: "HIT_TARGET", label: "Hit Target" },
  { value: "HIT_STOP", label: "Hit Stop" },
  { value: "MANUAL", label: "Manual Close" },
];

export function CloseTradeModal({
  trade,
  onConfirm,
  onCancel,
}: CloseTradeModalProps) {
  const [exitPrice, setExitPrice] = useState(trade.target.toString());
  const [exitReason, setExitReason] = useState<ExitReason>("MANUAL");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    const price = parseFloat(exitPrice);
    if (isNaN(price) || price <= 0) {
      setError("Enter a valid exit price.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onConfirm(trade.trade_id, price, exitReason);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to close position.");
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="close-modal-title"
    >
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 space-y-5">
        <h2 id="close-modal-title" className="text-base font-semibold text-ink">
          Close Position — {trade.ticker}
        </h2>

        {/* Trade summary */}
        <div className="grid grid-cols-3 gap-2 text-xs text-center">
          {(
            [
              ["Entry", `$${trade.entry_price.toFixed(2)}`],
              ["Stop", `$${trade.stop.toFixed(2)}`],
              ["Target", `$${trade.target.toFixed(2)}`],
            ] as [string, string][]
          ).map(([label, value]) => (
            <div key={label} className="bg-surface-1 rounded-lg py-2 px-1">
              <p className="text-ink-subtle mb-0.5">{label}</p>
              <p className="font-semibold text-ink">{value}</p>
            </div>
          ))}
        </div>

        {/* Exit price */}
        <div className="space-y-1">
          <label htmlFor="exit-price" className="block text-sm text-ink-muted">
            Exit price
          </label>
          <input
            id="exit-price"
            type="number"
            step="0.01"
            min="0"
            value={exitPrice}
            onChange={(e) => setExitPrice(e.target.value)}
            className="w-full px-4 py-2.5 text-sm rounded-xl border border-surface-3 bg-surface-1 text-ink focus:outline-none focus:border-quant focus:bg-white transition-colors"
          />
        </div>

        {/* Exit reason */}
        <div className="space-y-1">
          <label htmlFor="exit-reason" className="block text-sm text-ink-muted">
            Exit reason
          </label>
          <select
            id="exit-reason"
            value={exitReason}
            onChange={(e) => setExitReason(e.target.value as ExitReason)}
            className="w-full px-4 py-2.5 text-sm rounded-xl border border-surface-3 bg-surface-1 text-ink focus:outline-none focus:border-quant transition-colors"
          >
            {EXIT_REASONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

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
            {submitting ? "Closing..." : "Confirm Close"}
          </button>
        </div>
      </div>
    </div>
  );
}
