"use client";

// Portfolio tab — create/load portfolio, open positions, closed trades, performance summary.

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/cn";
import {
  createPortfolio,
  fetchPortfolio,
  closeTrade,
} from "@/lib/quant-api";
import type { Portfolio, Trade, ExitReason } from "@/lib/quant-api";
import { CloseTradeModal } from "@/components/quant/CloseTradeModal";

const STORAGE_KEY = "quant_portfolio_id";

// ── helpers ───────────────────────────────────────────────────────────────────

function pnlColor(value: number): string {
  return value >= 0 ? "text-green-700" : "text-red-600";
}

function fmt(value: number, prefix = "$"): string {
  return `${prefix}${value.toFixed(2)}`;
}

// ── Create screen ─────────────────────────────────────────────────────────────

interface CreateScreenProps {
  onCreate: (username: string) => Promise<void>;
  creating: boolean;
  error: string | null;
}

function CreateScreen({ onCreate, creating, error }: CreateScreenProps) {
  const [username, setUsername] = useState("");

  return (
    <div className="max-w-sm mx-auto py-16 text-center space-y-6">
      <p className="text-xl font-semibold text-ink">Create Your Portfolio</p>
      <p className="text-sm text-ink-muted">
        Track paper trades and measure your performance. Portfolio data is saved
        server-side and linked to a unique ID stored in your browser.
      </p>
      <div className="space-y-3">
        <label htmlFor="portfolio-username" className="block text-sm text-ink-muted text-left">
          Username (optional)
        </label>
        <input
          id="portfolio-username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="e.g. paper_trader"
          className="w-full px-4 py-2.5 text-sm rounded-xl border border-surface-3 bg-surface-1 text-ink placeholder:text-ink-subtle focus:outline-none focus:border-quant focus:bg-white transition-colors"
        />
        {error && (
          <p className="text-xs text-red-600">{error}</p>
        )}
        <button
          onClick={() => onCreate(username)}
          disabled={creating}
          className="w-full py-2.5 bg-quant text-white text-sm font-medium rounded-xl hover:bg-quant-hover transition-colors disabled:opacity-50"
        >
          {creating ? "Creating..." : "Create Portfolio"}
        </button>
      </div>
    </div>
  );
}

// ── Performance summary row ───────────────────────────────────────────────────

function PerformanceSummary({ portfolio }: { portfolio: Portfolio }) {
  const p = portfolio.performance;
  const stats: [string, string, string?][] = [
    ["Total P&L", fmt(p.total_pnl), pnlColor(p.total_pnl)],
    ["Win Rate", `${(p.win_rate * 100).toFixed(0)}%`],
    ["Sharpe", p.sharpe_ratio.toFixed(2)],
    ["Max DD", `${(p.max_drawdown * 100).toFixed(1)}%`],
    ["Trades", p.trade_count.toString()],
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
      {stats.map(([label, value, colorCls]) => (
        <div key={label} className="bg-surface-1 rounded-xl px-4 py-3 text-center">
          <p className="text-xs text-ink-subtle mb-1">{label}</p>
          <p className={cn("text-base font-bold text-ink", colorCls)}>{value}</p>
        </div>
      ))}
    </div>
  );
}

// ── Open positions table ──────────────────────────────────────────────────────

interface OpenTradesProps {
  trades: Trade[];
  onClose: (trade: Trade) => void;
}

function OpenTradesTable({ trades, onClose }: OpenTradesProps) {
  if (trades.length === 0) {
    return (
      <p className="text-sm text-ink-muted py-4 text-center">
        No open positions. Open one from the Today tab.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-surface-3">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-surface-1 border-b border-surface-3 text-left text-xs text-ink-subtle">
            <th className="px-4 py-3 font-semibold">Ticker</th>
            <th className="px-4 py-3 font-semibold">Action</th>
            <th className="px-4 py-3 font-semibold">Entry</th>
            <th className="px-4 py-3 font-semibold">Stop</th>
            <th className="px-4 py-3 font-semibold">Target</th>
            <th className="px-4 py-3 font-semibold">Unreal. P&amp;L</th>
            <th className="px-4 py-3 font-semibold"></th>
          </tr>
        </thead>
        <tbody>
          {trades.map((trade, i) => (
            <tr
              key={trade.trade_id}
              className={cn(
                "border-b border-surface-2",
                i % 2 === 0 ? "bg-white" : "bg-surface-1"
              )}
            >
              <td className="px-4 py-3 font-semibold text-ink">{trade.ticker}</td>
              <td className="px-4 py-3 text-ink-muted">{trade.action}</td>
              <td className="px-4 py-3 text-ink-muted">${trade.entry_price.toFixed(2)}</td>
              <td className="px-4 py-3 text-ink-muted">${trade.stop.toFixed(2)}</td>
              <td className="px-4 py-3 text-ink-muted">${trade.target.toFixed(2)}</td>
              <td className="px-4 py-3 text-ink-subtle">—</td>
              <td className="px-4 py-3">
                <button
                  onClick={() => onClose(trade)}
                  className="text-xs font-medium px-3 py-1.5 border border-surface-3 rounded-lg text-ink-muted hover:border-quant hover:text-quant transition-colors"
                >
                  Close Position
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Closed trades table ───────────────────────────────────────────────────────

function ClosedTradesTable({ trades }: { trades: Portfolio["closed_trades"] }) {
  if (trades.length === 0) {
    return (
      <p className="text-sm text-ink-muted py-4 text-center">
        No closed trades yet.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-surface-3">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-surface-1 border-b border-surface-3 text-left text-xs text-ink-subtle">
            <th className="px-4 py-3 font-semibold">Ticker</th>
            <th className="px-4 py-3 font-semibold">Entry → Exit</th>
            <th className="px-4 py-3 font-semibold">Realized P&amp;L</th>
            <th className="px-4 py-3 font-semibold">Exit Reason</th>
          </tr>
        </thead>
        <tbody>
          {trades.map((trade, i) => (
            <tr
              key={trade.trade_id}
              className={cn(
                "border-b border-surface-2",
                i % 2 === 0 ? "bg-white" : "bg-surface-1"
              )}
            >
              <td className="px-4 py-3 font-semibold text-ink">{trade.ticker}</td>
              <td className="px-4 py-3 text-ink-muted">
                ${trade.entry_price.toFixed(2)} → ${trade.exit_price.toFixed(2)}
              </td>
              <td
                className={cn(
                  "px-4 py-3 font-semibold",
                  pnlColor(trade.realized_pnl)
                )}
              >
                {trade.realized_pnl >= 0 ? "+" : ""}
                {fmt(trade.realized_pnl)}
              </td>
              <td className="px-4 py-3 text-ink-muted text-xs">{trade.exit_reason}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Main portfolio view ───────────────────────────────────────────────────────

export function PortfolioView() {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tradeToClose, setTradeToClose] = useState<Trade | null>(null);
  const [portfolioLink, setPortfolioLink] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);

  const loadPortfolio = useCallback(async (id: string) => {
    try {
      const p = await fetchPortfolio(id);
      setPortfolio(p);
    } catch {
      // If the stored ID is invalid (e.g. server reset), clear it so the user
      // can create a fresh portfolio.
      localStorage.removeItem(STORAGE_KEY);
      setPortfolio(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Check URL for shared portfolio link first (?p=<uuid>)
    const params = new URLSearchParams(window.location.search);
    const urlId = params.get("p");
    const storedId = localStorage.getItem(STORAGE_KEY);
    const id = urlId ?? storedId;

    if (id) {
      void loadPortfolio(id);
    } else {
      setLoading(false);
    }
  }, [loadPortfolio]);

  async function handleCreate(username: string) {
    setCreating(true);
    setError(null);
    try {
      const p = await createPortfolio(username || undefined);
      localStorage.setItem(STORAGE_KEY, p.id);
      setPortfolio(p);
      const link = `${window.location.origin}${window.location.pathname}?p=${p.id}`;
      setPortfolioLink(link);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create portfolio.");
    } finally {
      setCreating(false);
    }
  }

  async function handleCloseTrade(
    tradeId: string,
    exitPrice: number,
    exitReason: ExitReason
  ) {
    if (!portfolio) return;
    const updated = await closeTrade(portfolio.id, tradeId, exitPrice, exitReason);
    setPortfolio(updated);
    setTradeToClose(null);
  }

  async function handleCopyLink() {
    if (!portfolioLink) return;
    await navigator.clipboard.writeText(portfolioLink);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  }

  if (loading) {
    return (
      <p className="text-sm text-ink-muted text-center py-10">
        Loading portfolio...
      </p>
    );
  }

  if (!portfolio) {
    return (
      <CreateScreen
        onCreate={handleCreate}
        creating={creating}
        error={error}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Share link prompt — shown once after creation */}
      {portfolioLink && (
        <div className="flex flex-wrap items-center gap-3 bg-quant-subtle border border-quant rounded-xl px-4 py-3 text-sm">
          <span className="text-ink-muted flex-1 break-all">{portfolioLink}</span>
          <button
            onClick={handleCopyLink}
            className="shrink-0 text-xs font-medium px-3 py-1.5 bg-quant text-white rounded-lg hover:bg-quant-hover transition-colors"
          >
            {linkCopied ? "Copied!" : "Copy link"}
          </button>
        </div>
      )}

      {/* Performance summary */}
      <section aria-label="Performance summary">
        <p className="text-xs font-semibold text-ink-subtle uppercase tracking-wide mb-3">
          Performance
        </p>
        <PerformanceSummary portfolio={portfolio} />
      </section>

      {/* Open positions */}
      <section aria-label="Open positions">
        <p className="text-xs font-semibold text-ink-subtle uppercase tracking-wide mb-3">
          Open Positions ({portfolio.open_trades.length})
        </p>
        <OpenTradesTable
          trades={portfolio.open_trades}
          onClose={setTradeToClose}
        />
      </section>

      {/* Closed trades */}
      <section aria-label="Closed trades">
        <p className="text-xs font-semibold text-ink-subtle uppercase tracking-wide mb-3">
          Closed Trades ({portfolio.closed_trades.length})
        </p>
        <ClosedTradesTable trades={portfolio.closed_trades} />
      </section>

      {/* Close trade modal */}
      {tradeToClose && (
        <CloseTradeModal
          trade={tradeToClose}
          onConfirm={handleCloseTrade}
          onCancel={() => setTradeToClose(null)}
        />
      )}
    </div>
  );
}
