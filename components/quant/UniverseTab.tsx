"use client";

import { useState, useEffect, useMemo } from "react";
import { fetchSignals } from "@/lib/quant-api";
import type { SignalTicker } from "@/lib/quant-api";
import { cn } from "@/lib/cn";

type SortKey = "composite_score" | "momentum_rank" | "lowvol_rank";

const SECTOR_COLORS: Record<string, string> = {
  "Technology":             "bg-blue-100 text-blue-700",
  "Health Care":            "bg-green-100 text-green-700",
  "Financials":             "bg-amber-100 text-amber-700",
  "Consumer Discretionary": "bg-orange-100 text-orange-700",
  "Industrials":            "bg-slate-100 text-slate-700",
  "Communication Services": "bg-purple-100 text-purple-700",
  "Consumer Staples":       "bg-lime-100 text-lime-700",
  "Energy":                 "bg-red-100 text-red-700",
  "Utilities":              "bg-cyan-100 text-cyan-700",
  "Real Estate":            "bg-pink-100 text-pink-700",
  "Materials":              "bg-stone-100 text-stone-700",
};

function sectorColor(sector: string | null): string {
  return sector ? (SECTOR_COLORS[sector] ?? "bg-surface-2 text-ink-muted") : "bg-surface-2 text-ink-muted";
}

function ScorePill({ value }: { value: number }) {
  const color =
    value >= 70 ? "text-green-700" : value >= 40 ? "text-amber-600" : "text-red-500";
  return <span className={cn("font-semibold tabular-nums", color)}>{value.toFixed(1)}</span>;
}

interface SortButtonProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

function SortButton({ label, active, onClick }: SortButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors",
        active
          ? "bg-quant text-white border-quant"
          : "bg-white text-ink-muted border-surface-3 hover:border-quant hover:text-quant"
      )}
    >
      {label}
    </button>
  );
}

export function UniverseTab() {
  const [tickers, setTickers] = useState<SignalTicker[]>([]);
  const [asOfDate, setAsOfDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("composite_score");
  const [sectorFilter, setSectorFilter] = useState<string>("All");

  useEffect(() => {
    fetchSignals()
      .then((res) => {
        setTickers(res.tickers);
        setAsOfDate(res.as_of_date);
      })
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : "Failed to load signals")
      )
      .finally(() => setLoading(false));
  }, []);

  const sectors = useMemo(() => {
    const set = new Set(tickers.map((t) => t.sector ?? "Unknown"));
    return ["All", ...Array.from(set).sort()];
  }, [tickers]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tickers
      .filter((t) => {
        const matchSearch =
          !q ||
          t.ticker.toLowerCase().includes(q) ||
          (t.company_name ?? "").toLowerCase().includes(q);
        const matchSector =
          sectorFilter === "All" || t.sector === sectorFilter;
        return matchSearch && matchSector;
      })
      .sort((a, b) => b[sortKey] - a[sortKey]);
  }, [tickers, search, sortKey, sectorFilter]);

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-10 bg-surface-2 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-surface-1 border border-surface-3 rounded-xl px-5 py-4 text-sm text-ink-muted">
        Failed to load signal scanner: {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-sm font-semibold text-ink">
            Signal Scanner — {tickers.length} tickers
          </p>
          {asOfDate && (
            <p className="text-xs text-ink-subtle mt-0.5">As of {asOfDate}</p>
          )}
        </div>
        <div className="flex gap-2">
          <SortButton label="Composite" active={sortKey === "composite_score"} onClick={() => setSortKey("composite_score")} />
          <SortButton label="Momentum" active={sortKey === "momentum_rank"}    onClick={() => setSortKey("momentum_rank")} />
          <SortButton label="Low Vol"  active={sortKey === "lowvol_rank"}      onClick={() => setSortKey("lowvol_rank")} />
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search ticker or company…"
          className="flex-1 min-w-40 px-3 py-2 text-sm rounded-lg border border-surface-3 bg-white text-ink placeholder:text-ink-subtle focus:outline-none focus:border-quant transition-colors"
        />
        <select
          value={sectorFilter}
          onChange={(e) => setSectorFilter(e.target.value)}
          className="px-3 py-2 text-sm rounded-lg border border-surface-3 bg-white text-ink focus:outline-none focus:border-quant transition-colors"
        >
          {sectors.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-surface-3">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-surface-1 border-b border-surface-3 text-xs text-ink-subtle uppercase tracking-wide">
              <th className="text-left px-4 py-3 w-8">#</th>
              <th className="text-left px-4 py-3">Ticker</th>
              <th className="text-left px-4 py-3 hidden sm:table-cell">Sector</th>
              <th className="text-right px-4 py-3">Composite</th>
              <th className="text-right px-4 py-3 hidden md:table-cell">Momentum</th>
              <th className="text-right px-4 py-3 hidden md:table-cell">Low Vol</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-2">
            {filtered.map((t, i) => (
              <tr key={t.ticker} className="bg-white hover:bg-surface-1 transition-colors">
                <td className="px-4 py-3 text-xs text-ink-subtle tabular-nums">{i + 1}</td>
                <td className="px-4 py-3">
                  <p className="font-semibold text-ink">{t.ticker}</p>
                  {t.company_name && (
                    <p className="text-xs text-ink-subtle truncate max-w-[160px]">
                      {t.company_name}
                    </p>
                  )}
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  {t.sector && (
                    <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", sectorColor(t.sector))}>
                      {t.sector}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <ScorePill value={t.composite_score} />
                </td>
                <td className="px-4 py-3 text-right hidden md:table-cell">
                  <ScorePill value={t.momentum_rank} />
                </td>
                <td className="px-4 py-3 text-right hidden md:table-cell">
                  <ScorePill value={t.lowvol_rank} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="text-sm text-ink-muted text-center py-8">No tickers match your search.</p>
        )}
      </div>
    </div>
  );
}
