// All API calls to the Quant Intelligence FastAPI backend.
// Never inline fetch calls in components — all network logic lives here.

const QUANT_API_URL =
  process.env.NEXT_PUBLIC_QUANT_API_URL ?? "https://quant-intelligence.onrender.com";

// ── Shared types ──────────────────────────────────────────────────────────────

export type MacroRegime = "RISK_ON" | "TRANSITIONAL" | "RISK_OFF" | "CRISIS";

export interface MacroSnapshot {
  regime: MacroRegime;
  vix: number;
  t10y2y: number; // Yield curve spread
  fed_funds_rate: number;
}

export interface RiskParams {
  entry: number;
  stop: number;
  target: number;
  reward_risk_ratio: number;
  atr: number;
  suggested_shares: number;
  suggested_size_pct: number;
}

export interface TickerSignals {
  momentum_rank: number;    // 0–100
  lowvol_rank: number;      // 0–100
  composite_score: number;  // 0–100
  close: number;
  rsi: number;
  ma50_above_ma200: boolean;
  macd_hist: number;
  volume_ratio: number;
}

export interface Recommendation {
  ticker: string;
  action: "BUY" | "AVOID" | "HOLD";
  conviction: number; // 1–5
  thesis: string;
  risks_to_thesis?: string;
  signals?: TickerSignals;
  risk_params: RiskParams;
  macro: MacroSnapshot;
  as_of_date: string;
  generated_at: string;
}

export interface RecommendResponse {
  recommendations: Recommendation[];
  macro: MacroSnapshot;
  question: string;
}

export interface Portfolio {
  id: string;
  username?: string;
  open_trades: Trade[];
  closed_trades: ClosedTrade[];
  performance: PortfolioPerformance;
}

export interface Trade {
  trade_id: string;
  ticker: string;
  action: "BUY" | "AVOID" | "HOLD";
  entry_price: number;
  stop: number;
  target: number;
  reward_risk: number;
  shares: number;
  opened_at: string;
}

export interface ClosedTrade {
  trade_id: string;
  ticker: string;
  action: "BUY" | "AVOID" | "HOLD";
  entry_price: number;
  exit_price: number;
  realized_pnl: number;
  exit_reason: "HIT_TARGET" | "HIT_STOP" | "MANUAL";
  opened_at: string;
  closed_at: string;
}

export interface PortfolioPerformance {
  total_pnl: number;
  win_rate: number;
  sharpe_ratio: number;
  max_drawdown: number;
  trade_count: number;
}

export type ExitReason = "HIT_TARGET" | "HIT_STOP" | "MANUAL";

export interface SignalTicker {
  ticker: string;
  company_name: string | null;
  sector: string | null;
  composite_score: number;
  momentum_rank: number;
  lowvol_rank: number;
}

export interface SignalsResponse {
  tickers: SignalTicker[];
  count: number;
  as_of_date: string | null;
}

// ── API functions ─────────────────────────────────────────────────────────────

/**
 * Fetch recommendations for a given question.
 * Called on page load with the default question and when the user submits a custom one.
 */
export async function fetchRecommendations(
  question: string
): Promise<RecommendResponse> {
  const res = await fetch(`${QUANT_API_URL}/recommend`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  });

  if (!res.ok) {
    const body: unknown = await res.json().catch(() => ({}));
    const detail =
      typeof body === "object" && body !== null && "detail" in body
        ? String((body as Record<string, unknown>).detail)
        : `Server error ${res.status}`;
    throw new Error(detail);
  }

  return res.json() as Promise<RecommendResponse>;
}

/**
 * Create a new portfolio. Returns the portfolio with its generated ID.
 * The caller must persist portfolio_id to localStorage.
 */
export async function createPortfolio(username?: string): Promise<Portfolio> {
  const res = await fetch(`${QUANT_API_URL}/portfolio`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: username ?? null }),
  });

  if (!res.ok) {
    const body: unknown = await res.json().catch(() => ({}));
    const detail =
      typeof body === "object" && body !== null && "detail" in body
        ? String((body as Record<string, unknown>).detail)
        : `Server error ${res.status}`;
    throw new Error(detail);
  }

  return res.json() as Promise<Portfolio>;
}

/**
 * Fetch an existing portfolio by ID.
 */
export async function fetchPortfolio(portfolioId: string): Promise<Portfolio> {
  const res = await fetch(`${QUANT_API_URL}/portfolio/${portfolioId}`);

  if (!res.ok) {
    const body: unknown = await res.json().catch(() => ({}));
    const detail =
      typeof body === "object" && body !== null && "detail" in body
        ? String((body as Record<string, unknown>).detail)
        : `Server error ${res.status}`;
    throw new Error(detail);
  }

  return res.json() as Promise<Portfolio>;
}

/**
 * Open a paper trade position in the portfolio.
 */
export async function openTrade(
  portfolioId: string,
  trade: Omit<Trade, "trade_id" | "opened_at">
): Promise<Portfolio> {
  const res = await fetch(`${QUANT_API_URL}/portfolio/${portfolioId}/trades`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(trade),
  });

  if (!res.ok) {
    const body: unknown = await res.json().catch(() => ({}));
    const detail =
      typeof body === "object" && body !== null && "detail" in body
        ? String((body as Record<string, unknown>).detail)
        : `Server error ${res.status}`;
    throw new Error(detail);
  }

  return res.json() as Promise<Portfolio>;
}

/**
 * Fetch all 503 S&P 500 tickers ranked by composite factor score.
 * Results are cached on the server for 4 hours.
 */
export async function fetchSignals(): Promise<SignalsResponse> {
  const res = await fetch(`${QUANT_API_URL}/signals`);

  if (!res.ok) {
    const body: unknown = await res.json().catch(() => ({}));
    const detail =
      typeof body === "object" && body !== null && "detail" in body
        ? String((body as Record<string, unknown>).detail)
        : `Server error ${res.status}`;
    throw new Error(detail);
  }

  return res.json() as Promise<SignalsResponse>;
}

/**
 * Close a paper trade position with exit price and reason.
 */
export async function closeTrade(
  portfolioId: string,
  tradeId: string,
  exitPrice: number,
  exitReason: ExitReason
): Promise<Portfolio> {
  const res = await fetch(
    `${QUANT_API_URL}/portfolio/${portfolioId}/trades/${tradeId}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ exit_price: exitPrice, exit_reason: exitReason }),
    }
  );

  if (!res.ok) {
    const body: unknown = await res.json().catch(() => ({}));
    const detail =
      typeof body === "object" && body !== null && "detail" in body
        ? String((body as Record<string, unknown>).detail)
        : `Server error ${res.status}`;
    throw new Error(detail);
  }

  return res.json() as Promise<Portfolio>;
}
