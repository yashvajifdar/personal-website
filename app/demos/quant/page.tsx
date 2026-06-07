"use client";

// Quant Intelligence dashboard — 5 tabs: Today, Picks, Portfolio, Universe, Learn.
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
import { MacroBanner } from "@/components/quant/MacroBanner";
import { RecommendationCard } from "@/components/quant/RecommendationCard";
import { SignalBreakdown } from "@/components/quant/SignalBreakdown";
import { PortfolioView } from "@/components/quant/PortfolioView";
import { OpenPositionModal } from "@/components/quant/OpenPositionModal";
import { GlossaryTab } from "@/components/quant/GlossaryTab";
import { UniverseTab } from "@/components/quant/UniverseTab";

const STORAGE_KEY = "quant_portfolio_id";
const DEFAULT_QUESTION = "What should I buy this week?";

// ── Tab definition ────────────────────────────────────────────────────────────

type TabId = "today" | "picks" | "portfolio" | "universe" | "learn";

interface Tab {
  id: TabId;
  label: string;
}

const TABS: Tab[] = [
  { id: "today", label: "Today" },
  { id: "picks", label: "Picks" },
  { id: "portfolio", label: "Portfolio" },
  { id: "universe", label: "Universe" },
  { id: "learn", label: "Learn" },
];

// ── Tab nav ───────────────────────────────────────────────────────────────────

interface TabNavProps {
  active: TabId;
  onChange: (id: TabId) => void;
}

function TabNav({ active, onChange }: TabNavProps) {
  return (
    <nav
      className="flex gap-1 border-b border-surface-3 overflow-x-auto"
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

// ── Today tab ─────────────────────────────────────────────────────────────────

interface TodayTabProps {
  recommendations: Recommendation[];
  macro: MacroSnapshot | null;
  loading: boolean;
  error: string | null;
  question: string;
  onQuestionChange: (q: string) => void;
  onAsk: (q: string) => void;
  onOpenPosition: (rec: Recommendation) => void;
}

function TodayTab({
  recommendations,
  macro,
  loading,
  error,
  question,
  onQuestionChange,
  onAsk,
  onOpenPosition,
}: TodayTabProps) {
  return (
    <div className="space-y-6">
      {/* Macro regime banner */}
      {macro && <MacroBanner macro={macro} />}
      {!macro && loading && (
        <div className="h-16 bg-surface-2 rounded-xl animate-pulse" />
      )}

      {/* Recommendation cards */}
      {loading && recommendations.length === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-64 bg-surface-2 rounded-2xl animate-pulse" />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="bg-surface-1 border border-surface-3 rounded-xl px-5 py-4 text-sm text-ink-muted">
          Failed to load recommendations: {error}
        </div>
      )}

      {!loading && !error && recommendations.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center space-y-2">
          <p className="text-sm font-medium text-ink">No recommendations yet</p>
          <p className="text-xs text-ink-subtle max-w-xs">
            Ask a question below to fetch this week&apos;s picks from the signal engine.
          </p>
        </div>
      )}

      {recommendations.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recommendations.map((rec) => (
            <RecommendationCard
              key={rec.ticker}
              rec={rec}
              onOpenPosition={onOpenPosition}
            />
          ))}
        </div>
      )}

      {/* Ask input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onAsk(question);
        }}
        className="flex gap-3"
      >
        <label htmlFor="quant-question" className="sr-only">
          Ask a question about this week's picks
        </label>
        <input
          id="quant-question"
          type="text"
          value={question}
          onChange={(e) => onQuestionChange(e.target.value)}
          placeholder="Ask about this week's picks..."
          disabled={loading}
          className="flex-1 px-4 py-2.5 text-sm rounded-xl border border-surface-3 bg-surface-1 text-ink placeholder:text-ink-subtle focus:outline-none focus:border-quant focus:bg-white transition-colors disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading || !question.trim()}
          className="px-4 py-2.5 bg-quant text-white text-sm font-medium rounded-xl hover:bg-quant-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? "Loading..." : "Ask"}
        </button>
      </form>

      {/* Disclaimer */}
      <p className="text-xs text-ink-subtle text-center">
        Not financial advice. For paper trading and educational purposes only.
      </p>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function QuantDashboardPage() {
  const [activeTab, setActiveTab] = useState<TabId>("today");
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [macro, setMacro] = useState<MacroSnapshot | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [question, setQuestion] = useState(DEFAULT_QUESTION);
  const [pendingRec, setPendingRec] = useState<Recommendation | null>(null);
  const [portfolioId, setPortfolioId] = useState<string | null>(null);

  // Read portfolio ID from localStorage on mount so OpenPositionModal knows
  // whether a portfolio exists without rendering the full PortfolioView.
  useEffect(() => {
    setPortfolioId(localStorage.getItem(STORAGE_KEY));
  }, []);

  const loadRecommendations = useCallback(async (q: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchRecommendations(q);
      setRecommendations(res.recommendations ?? []);
      setMacro(res.macro ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-fetch on mount with the default question.
  useEffect(() => {
    void loadRecommendations(DEFAULT_QUESTION);
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
        {activeTab === "today" && (
          <TodayTab
            recommendations={recommendations}
            macro={macro}
            loading={loading}
            error={error}
            question={question}
            onQuestionChange={setQuestion}
            onAsk={(q) => void loadRecommendations(q)}
            onOpenPosition={setPendingRec}
          />
        )}

        {activeTab === "picks" && (
          <SignalBreakdown recommendations={recommendations} />
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
