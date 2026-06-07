"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/cn";
import { createPortfolio, fetchPortfolio, closeTrade } from "@/lib/quant-api";
import type { PortfolioResponse, Trade, ExitReason } from "@/lib/quant-api";
import { CloseTradeModal } from "@/components/quant/CloseTradeModal";

const STORAGE_KEY = "quant_portfolio_id";
const ACCOUNT_VALUE = 100_000;

// ── helpers ───────────────────────────────────────────────────────────────────

function pnlColor(value: number): string {
  return value >= 0 ? "text-green-700" : "text-red-600";
}

function pnlBg(value: number): string {
  return value >= 0 ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200";
}

function fmtDollar(value: number): string {
  const abs = Math.abs(value);
  const sign = value >= 0 ? "+" : "−";
  return `${sign}$${abs.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtUsd(value: number): string {
  return `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtPct(value: number): string {
  const abs = Math.abs(value * 100);
  const sign = value >= 0 ? "+" : "−";
  return `${sign}${abs.toFixed(2)}%`;
}

// ── Account summary cards ─────────────────────────────────────────────────────

function AccountSummary({ portfolio }: { portfolio: PortfolioResponse }) {
  const openTrades = portfolio.open_trades;
  const realizedPnl = portfolio.performance.total_pnl;

  const totalInvested = openTrades.reduce(
    (sum, t) => sum + t.entry_price * t.shares,
    0
  );
  const totalUnrealized = openTrades.reduce(
    (sum, t) => sum + (t.unrealized_pnl ?? 0),
    0
  );
  const cashAvailable = ACCOUNT_VALUE - totalInvested + realizedPnl;
  const portfolioValue = ACCOUNT_VALUE + totalUnrealized + realizedPnl;

  const cards: { label: string; value: string; sub?: string; color?: string }[] = [
    {
      label: "Portfolio Value",
      value: fmtUsd(portfolioValue),
      sub: fmtPct((portfolioValue - ACCOUNT_VALUE) / ACCOUNT_VALUE),
      color: portfolioValue >= ACCOUNT_VALUE ? "text-green-700" : "text-red-600",
    },
    {
      label: "Cash Available",
      value: fmtUsd(cashAvailable),
      sub: `${((cashAvailable / ACCOUNT_VALUE) * 100).toFixed(1)}% of account`,
    },
    {
      label: "Total Invested",
      value: fmtUsd(totalInvested),
      sub: `${openTrades.length} position${openTrades.length !== 1 ? "s" : ""}`,
    },
    {
      label: "Unrealized P&L",
      value: fmtDollar(totalUnrealized),
      color: pnlColor(totalUnrealized),
    },
    {
      label: "Realized P&L",
      value: fmtDollar(realizedPnl),
      color: pnlColor(realizedPnl),
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
      {cards.map(({ label, value, sub, color }) => (
        <div key={label} className="bg-white border border-surface-3 rounded-xl px-4 py-3">
          <p className="text-xs text-ink-subtle mb-1">{label}</p>
          <p className={cn("text-base font-bold text-ink", color)}>{value}</p>
          {sub && <p className={cn("text-xs mt-0.5", color ?? "text-ink-subtle")}>{sub}</p>}
        </div>
      ))}
    </div>
  );
}

// ── Performance strip ─────────────────────────────────────────────────────────

function PerformanceStrip({ portfolio }: { portfolio: PortfolioResponse }) {
  const p = portfolio.performance;
  const stats: { label: string; value: string }[] = [
    { label: "Win Rate",  value: p.win_rate != null ? `${(p.win_rate * 100).toFixed(0)}%` : "—" },
    { label: "Sharpe",    value: p.sharpe_ratio != null ? p.sharpe_ratio.toFixed(2) : "—" },
    { label: "Max DD",    value: p.max_drawdown != null ? `${(p.max_drawdown * 100).toFixed(1)}%` : "—" },
    { label: "Trades",    value: p.trade_count.toString() },
    { label: "Closed",    value: (p.trade_count - p.open_count).toString() },
  ];

  return (
    <div className="flex gap-6 flex-wrap px-4 py-3 bg-surface-1 border border-surface-3 rounded-xl text-sm">
      {stats.map(({ label, value }) => (
        <div key={label} className="flex items-center gap-2">
          <span className="text-xs text-ink-subtle">{label}</span>
          <span className="font-semibold text-ink">{value}</span>
        </div>
      ))}
    </div>
  );
}

// ── Position card ─────────────────────────────────────────────────────────────

interface PositionCardProps {
  trade: Trade;
  onClose: (trade: Trade) => void;
}

function PositionCard({ trade, onClose }: PositionCardProps) {
  const costBasis     = trade.entry_price * trade.shares;
  const currentValue  = trade.current_price != null ? trade.current_price * trade.shares : null;
  const unrealizedPct = trade.unrealized_pnl != null && costBasis > 0
    ? trade.unrealized_pnl / costBasis
    : null;
  const stopDist = ((trade.entry_price - trade.stop) / trade.entry_price * 100).toFixed(1);
  const targetDist = ((trade.target - trade.entry_price) / trade.entry_price * 100).toFixed(1);

  return (
    <div className="bg-white border border-surface-3 rounded-2xl p-5 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-ink">{trade.ticker}</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-800 border border-green-200">
              {trade.action}
            </span>
          </div>
          <p className="text-xs text-ink-subtle mt-0.5">{trade.shares} shares</p>
        </div>
        {trade.unrealized_pnl != null && (
          <div className={cn("text-right px-3 py-1.5 rounded-xl border", pnlBg(trade.unrealized_pnl))}>
            <p className={cn("text-sm font-bold", pnlColor(trade.unrealized_pnl))}>
              {fmtDollar(trade.unrealized_pnl)}
            </p>
            {unrealizedPct != null && (
              <p className={cn("text-xs", pnlColor(unrealizedPct))}>
                {fmtPct(unrealizedPct)}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Price row */}
      <div className="grid grid-cols-3 gap-2 text-xs text-center">
        <div className="bg-surface-1 rounded-lg py-2">
          <p className="text-ink-subtle mb-0.5">Entry</p>
          <p className="font-semibold text-ink">{fmtUsd(trade.entry_price)}</p>
        </div>
        <div className="bg-surface-1 rounded-lg py-2">
          <p className="text-ink-subtle mb-0.5">Current</p>
          <p className="font-semibold text-ink">
            {trade.current_price != null ? fmtUsd(trade.current_price) : "—"}
          </p>
        </div>
        <div className="bg-surface-1 rounded-lg py-2">
          <p className="text-ink-subtle mb-0.5">Value</p>
          <p className="font-semibold text-ink">
            {currentValue != null ? fmtUsd(currentValue) : fmtUsd(costBasis)}
          </p>
        </div>
      </div>

      {/* Stop / target bar */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center justify-between bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          <span className="text-red-700 font-medium">Stop</span>
          <span className="text-ink font-semibold">{fmtUsd(trade.stop)}</span>
          <span className="text-red-500">−{stopDist}%</span>
        </div>
        <div className="flex items-center justify-between bg-green-50 border border-green-100 rounded-lg px-3 py-2">
          <span className="text-green-700 font-medium">Target</span>
          <span className="text-ink font-semibold">{fmtUsd(trade.target)}</span>
          <span className="text-green-600">+{targetDist}%</span>
        </div>
      </div>

      {/* Cost basis */}
      <div className="flex items-center justify-between text-xs text-ink-subtle border-t border-surface-2 pt-3">
        <span>Cost basis: <span className="text-ink font-medium">{fmtUsd(costBasis)}</span></span>
        <button
          onClick={() => onClose(trade)}
          className="text-xs font-medium px-3 py-1.5 border border-surface-3 rounded-lg text-ink-muted hover:border-quant hover:text-quant transition-colors"
        >
          Close Position
        </button>
      </div>
    </div>
  );
}

// ── Closed trades table ───────────────────────────────────────────────────────

function ClosedTradesTable({ trades }: { trades: PortfolioResponse["closed_trades"] }) {
  if (trades.length === 0) {
    return <p className="text-sm text-ink-muted py-4 text-center">No closed trades yet.</p>;
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
              key={trade.id}
              className={cn("border-b border-surface-2", i % 2 === 0 ? "bg-white" : "bg-surface-1")}
            >
              <td className="px-4 py-3 font-semibold text-ink">{trade.ticker}</td>
              <td className="px-4 py-3 text-ink-muted">
                {fmtUsd(trade.entry_price)} → {fmtUsd(trade.exit_price)}
              </td>
              <td className={cn("px-4 py-3 font-semibold", pnlColor(trade.realized_pnl))}>
                {fmtDollar(trade.realized_pnl)}
              </td>
              <td className="px-4 py-3 text-ink-muted text-xs">{trade.exit_reason}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
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
        Track paper trades against a $100,000 virtual account.
      </p>
      <div className="space-y-3">
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username (optional)"
          className="w-full px-4 py-2.5 text-sm rounded-xl border border-surface-3 bg-surface-1 text-ink placeholder:text-ink-subtle focus:outline-none focus:border-quant focus:bg-white transition-colors"
        />
        {error && <p className="text-xs text-red-600">{error}</p>}
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

// ── Main ──────────────────────────────────────────────────────────────────────

export function PortfolioView() {
  const [portfolio, setPortfolio] = useState<PortfolioResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tradeToClose, setTradeToClose] = useState<Trade | null>(null);
  const [portfolioLink, setPortfolioLink] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);

  const portfolioId = portfolio?.portfolio.id ?? null;

  const loadPortfolio = useCallback(async (id: string) => {
    try {
      setPortfolio(await fetchPortfolio(id));
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      setPortfolio(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("p") ?? localStorage.getItem(STORAGE_KEY);
    if (id) void loadPortfolio(id);
    else setLoading(false);
  }, [loadPortfolio]);

  async function handleCreate(username: string) {
    setCreating(true);
    setError(null);
    try {
      const created = await createPortfolio(username || undefined);
      localStorage.setItem(STORAGE_KEY, created.portfolio_id);
      setPortfolio(await fetchPortfolio(created.portfolio_id));
      setPortfolioLink(`${window.location.origin}${window.location.pathname}?p=${created.portfolio_id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create portfolio.");
    } finally {
      setCreating(false);
    }
  }

  async function handleCloseTrade(tradeId: string, exitPrice: number, exitReason: ExitReason) {
    if (!portfolioId) return;
    await closeTrade(portfolioId, tradeId, exitPrice, exitReason);
    setPortfolio(await fetchPortfolio(portfolioId));
    setTradeToClose(null);
  }

  async function handleCopyLink() {
    if (!portfolioLink) return;
    await navigator.clipboard.writeText(portfolioLink);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  }

  if (loading) return <p className="text-sm text-ink-muted text-center py-10">Loading portfolio...</p>;
  if (!portfolio) return <CreateScreen onCreate={handleCreate} creating={creating} error={error} />;

  return (
    <div className="space-y-6">
      {/* Share link — shown once after creation */}
      {portfolioLink && (
        <div className="flex flex-wrap items-center gap-3 bg-quant-subtle border border-quant rounded-xl px-4 py-3 text-sm">
          <span className="text-ink-muted flex-1 break-all text-xs">{portfolioLink}</span>
          <button
            onClick={handleCopyLink}
            className="shrink-0 text-xs font-medium px-3 py-1.5 bg-quant text-white rounded-lg hover:bg-quant-hover transition-colors"
          >
            {linkCopied ? "Copied!" : "Copy link"}
          </button>
        </div>
      )}

      {/* Account overview */}
      <section>
        <p className="text-xs font-semibold text-ink-subtle uppercase tracking-wide mb-3">Account Overview</p>
        <AccountSummary portfolio={portfolio} />
      </section>

      {/* Performance */}
      <PerformanceStrip portfolio={portfolio} />

      {/* Open positions */}
      <section>
        <p className="text-xs font-semibold text-ink-subtle uppercase tracking-wide mb-3">
          Open Positions ({portfolio.open_trades.length})
        </p>
        {portfolio.open_trades.length === 0 ? (
          <p className="text-sm text-ink-muted py-4 text-center">
            No open positions. Open one from the Picks tab.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {portfolio.open_trades.map((trade) => (
              <PositionCard key={trade.id} trade={trade} onClose={setTradeToClose} />
            ))}
          </div>
        )}
      </section>

      {/* Closed trades */}
      <section>
        <p className="text-xs font-semibold text-ink-subtle uppercase tracking-wide mb-3">
          Closed Trades ({portfolio.closed_trades.length})
        </p>
        <ClosedTradesTable trades={portfolio.closed_trades} />
      </section>

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
