"use client";

// Quant Intelligence dashboard — 4 tabs: Picks, Portfolio, Universe, Learn.
// Communicates with the FastAPI backend at NEXT_PUBLIC_QUANT_API_URL.
// All network calls are in lib/quant-api.ts. Sub-components live in components/quant/.

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/cn";
import {
  fetchRecommendations,
  openTrade,
} from "@/lib/quant-api";
import type {
  Recommendation,
  MacroSnapshot,
  OpenTradePayload,
} from "@/lib/quant-api";
import { PicksTab } from "@/components/quant/PicksTab";
import { PortfolioView } from "@/components/quant/PortfolioView";
import { OpenPositionModal } from "@/components/quant/OpenPositionModal";
import { GlossaryTab } from "@/components/quant/GlossaryTab";
import { UniverseTab } from "@/components/quant/UniverseTab";

const STORAGE_KEY = "quant_portfolio_id";
const DEFAULT_QUESTION = "What should I buy this week?";

// ── Tab definition ────────────────────────────────────────────────────────────

type TabId = "picks" | "portfolio" | "universe" | "learn";

interface Tab {
  id: TabId;
  label: string;
}

const TABS: Tab[] = [
  { id: "picks",     label: "Picks" },
  { id: "portfolio", label: "Portfolio" },
  { id: "universe",  label: "Universe" },
  { id: "learn",     label: "Learn" },
];

// ── Tab nav ───────────────────────────────────────────────────────────────────

interface TabNavProps {
  active: TabId;
  onChange: (id: TabId) => void;
}

function TabNav({ active, onChange }: TabNavProps) {
  return (
    <nav
      className="flex gap-1 border-b border-surface-3"
      aria-label="Dashboard tabs"
    >
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          aria-selected={active === tab.id}
          role="tab"
          className={cn(
            "shrink-0 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors",
            active === tab.id
              ? "border-quant text-quant"
              : "border-transparent text-ink-muted hover:text-ink"
          )}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function QuantDashboardPage() {
  // If a portfolio ID is in the URL (?p=...), default to the Portfolio tab
  const initialTab: TabId =
    typeof window !== "undefined" && new URLSearchParams(window.location.search).get("p")
      ? "portfolio"
      : "picks";
  const [activeTab, setActiveTab] = useState<TabId>(initialTab);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [macro, setMacro] = useState<MacroSnapshot | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingRec, setPendingRec] = useState<Recommendation | null>(null);
  const [portfolioId, setPortfolioId] = useState<string | null>(null);

  // Read portfolio ID from localStorage on mount so OpenPositionModal knows
  // whether a portfolio exists without rendering the full PortfolioView.
  useEffect(() => {
    setPortfolioId(localStorage.getItem(STORAGE_KEY));
  }, []);

  const loadRecommendations = useCallback(async () => {
    setLoading(true);
    setError(null);
    setNote(null);
    try {
      const res = await fetchRecommendations(DEFAULT_QUESTION);
      setRecommendations(res.recommendations ?? []);
      setMacro(res.macro ?? null);
      setNote(res.note ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-fetch on mount.
  useEffect(() => {
    void loadRecommendations();
  }, [loadRecommendations]);

  async function handleOpenTrade(trade: OpenTradePayload) {
    if (!portfolioId) return;
    await openTrade(portfolioId, trade);
    setPendingRec(null);
  }

  function handleNeedPortfolio() {
    setPendingRec(null);
    setActiveTab("portfolio");
  }

  return (
    <div className="min-h-screen bg-surface-1">
      {/* Page header */}
      <div className="border-b border-surface-3 bg-white">
        <div className="max-w-wide mx-auto px-6 py-5">
          <h1 className="text-base font-semibold text-ink leading-tight">
            Quant Intelligence
          </h1>
          <p className="text-xs text-ink-muted mt-0.5">
            Factor-driven signals on the S&amp;P 500 — paper trading platform
          </p>
        </div>
      </div>

      {/* Tab nav */}
      <div className="bg-white border-b border-surface-3">
        <div className="max-w-wide mx-auto px-6">
          <TabNav active={activeTab} onChange={setActiveTab} />
        </div>
      </div>

      {/* Tab content */}
      <div className="max-w-wide mx-auto px-6 py-8">
        {activeTab === "picks" && (
          <PicksTab
            recommendations={recommendations}
            macro={macro}
            loading={loading}
            error={error}
            note={note}
            onRefresh={loadRecommendations}
            onOpenPosition={(rec) => {
            // Re-read localStorage in case the portfolio was created after page mount
            const freshId = localStorage.getItem(STORAGE_KEY);
            if (freshId !== portfolioId) setPortfolioId(freshId);
            setPendingRec(rec);
          }}
          />
        )}

        {activeTab === "portfolio" && <PortfolioView />}

        {activeTab === "universe" && <UniverseTab />}

        {activeTab === "learn" && <GlossaryTab />}
      </div>

      {/* Open position confirmation modal */}
      {pendingRec && (
        <OpenPositionModal
          rec={pendingRec}
          portfolioId={portfolioId}
          onConfirm={handleOpenTrade}
          onCancel={() => setPendingRec(null)}
          onNeedPortfolio={handleNeedPortfolio}
        />
      )}
    </div>
  );
}

// Next.js requires a default export for page.tsx route files.
// We use a named export for the component and re-export it as default here.
export default QuantDashboardPage;
