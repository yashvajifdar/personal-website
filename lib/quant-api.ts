// All API calls to the Quant Intelligence FastAPI backend.
// Never inline fetch calls in components — all network logic lives here.
//
// Zod schemas are the source of truth for response shapes.
// TypeScript types are derived from schemas via z.infer<>.
// Any mismatch between the API and these schemas throws a ZodError
// immediately at the fetch boundary — before any component renders.

import { z } from "zod";

const QUANT_API_URL =
  process.env.NEXT_PUBLIC_QUANT_API_URL ?? "https://quant-intelligence.onrender.com";

// ── Schemas ───────────────────────────────────────────────────────────────────

const MacroSnapshotSchema = z.object({
  regime: z.enum(["RISK_ON", "TRANSITIONAL", "RISK_OFF", "CRISIS"]),
  vix: z.number().nullable(),
  t10y2y: z.number(),
  fed_funds_rate: z.number(),
  cpi: z.number().optional(),
  as_of_date: z.string().optional(),
});

const RiskParamsSchema = z.object({
  entry: z.number(),
  stop: z.number(),
  target: z.number(),
  reward_risk_ratio: z.number(),
  atr: z.number(),
  suggested_shares: z.number().int(),
  suggested_size_pct: z.number(),
});

const TickerSignalsSchema = z.object({
  momentum_rank: z.number(),
  lowvol_rank: z.number(),
  composite_score: z.number(),
  close: z.number(),
  rsi: z.number(),
  ma50_above_ma200: z.boolean(),
  macd_hist: z.number(),
  volume_ratio: z.number(),
  momentum_return: z.number().nullable().optional(),
  realized_vol: z.number().nullable().optional(),
});

const RecommendationSchema = z.object({
  ticker: z.string(),
  action: z.enum(["BUY", "AVOID", "HOLD"]),
  conviction: z.number().int().min(1).max(5),
  thesis: z.string(),
  risks_to_thesis: z.string().optional(),
  signals: TickerSignalsSchema.optional(),
  risk_params: RiskParamsSchema,
  macro: MacroSnapshotSchema,
  as_of_date: z.string(),
  generated_at: z.string(),
});

const RecommendResponseSchema = z.object({
  recommendations: z.array(RecommendationSchema),
  macro: MacroSnapshotSchema,
  query: z.string().optional(),
  generated_at: z.string().optional(),
});

const PortfolioRowSchema = z.object({
  id: z.string(),
  display_name: z.string().nullable().optional(),
  is_primary: z.boolean().optional(),
  created_at: z.string().optional(),
  last_active_at: z.string().optional(),
});

const TradeSchema = z.object({
  id: z.string(),
  portfolio_id: z.string(),
  ticker: z.string(),
  action: z.string(),
  entry_date: z.string(),
  entry_price: z.number(),
  shares: z.number().int(),
  stop: z.number(),
  target: z.number(),
  thesis: z.string(),
  created_at: z.string().optional(),
});

const ClosedTradeSchema = TradeSchema.extend({
  exit_date: z.string(),
  exit_price: z.number(),
  exit_reason: z.enum(["HIT_TARGET", "HIT_STOP", "MANUAL"]),
  realized_pnl: z.number(),
});

const PortfolioPerformanceSchema = z.object({
  total_pnl: z.number(),
  win_rate: z.number().nullable(),
  sharpe_ratio: z.number().nullable(),
  max_drawdown: z.number().nullable(),
  trade_count: z.number().int(),
  open_count: z.number().int(),
  avg_win: z.number().nullable().optional(),
  avg_loss: z.number().nullable().optional(),
});

const PortfolioResponseSchema = z.object({
  portfolio: PortfolioRowSchema,
  open_trades: z.array(TradeSchema),
  closed_trades: z.array(ClosedTradeSchema),
  performance: PortfolioPerformanceSchema,
});

const SignalTickerSchema = z.object({
  ticker: z.string(),
  company_name: z.string().nullable(),
  sector: z.string().nullable(),
  composite_score: z.number(),
  momentum_rank: z.number(),
  lowvol_rank: z.number(),
});

const SignalsResponseSchema = z.object({
  tickers: z.array(SignalTickerSchema),
  count: z.number().int(),
  as_of_date: z.string().nullable(),
});

// ── Derived types (do not write these manually) ───────────────────────────────

export type MacroRegime = z.infer<typeof MacroSnapshotSchema>["regime"];
export type MacroSnapshot = z.infer<typeof MacroSnapshotSchema>;
export type RiskParams = z.infer<typeof RiskParamsSchema>;
export type TickerSignals = z.infer<typeof TickerSignalsSchema>;
export type Recommendation = z.infer<typeof RecommendationSchema>;
export type RecommendResponse = z.infer<typeof RecommendResponseSchema>;
export type PortfolioRow = z.infer<typeof PortfolioRowSchema>;
export type Trade = z.infer<typeof TradeSchema>;
export type ClosedTrade = z.infer<typeof ClosedTradeSchema>;
export type PortfolioPerformance = z.infer<typeof PortfolioPerformanceSchema>;
export type PortfolioResponse = z.infer<typeof PortfolioResponseSchema>;
export type SignalTicker = z.infer<typeof SignalTickerSchema>;
export type SignalsResponse = z.infer<typeof SignalsResponseSchema>;
export type ExitReason = "HIT_TARGET" | "HIT_STOP" | "MANUAL";

// Explicit payload type for openTrade — separate from the Trade response shape.
export interface OpenTradePayload {
  ticker: string;
  action: string;
  entry_price: number;
  shares: number;
  stop: number;
  target: number;
  signal_snapshot: Record<string, unknown>;
  thesis: string;
}

// ── Shared error extraction ───────────────────────────────────────────────────

async function extractError(res: Response): Promise<string> {
  const body: unknown = await res.json().catch(() => ({}));
  return typeof body === "object" && body !== null && "detail" in body
    ? String((body as Record<string, unknown>).detail)
    : `Server error ${res.status}`;
}

// ── API functions ─────────────────────────────────────────────────────────────

export async function fetchRecommendations(
  question: string
): Promise<RecommendResponse> {
  const res = await fetch(`${QUANT_API_URL}/recommend`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  });
  if (!res.ok) throw new Error(await extractError(res));
  return RecommendResponseSchema.parse(await res.json());
}

export async function createPortfolio(
  displayName?: string
): Promise<{ portfolio_id: string; display_name: string | null }> {
  const res = await fetch(`${QUANT_API_URL}/portfolio`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ display_name: displayName ?? null }),
  });
  if (!res.ok) throw new Error(await extractError(res));
  return res.json() as Promise<{ portfolio_id: string; display_name: string | null }>;
}

export async function fetchPortfolio(portfolioId: string): Promise<PortfolioResponse> {
  const res = await fetch(`${QUANT_API_URL}/portfolio/${portfolioId}`);
  if (!res.ok) throw new Error(await extractError(res));
  return PortfolioResponseSchema.parse(await res.json());
}

export async function openTrade(
  portfolioId: string,
  trade: OpenTradePayload
): Promise<{ trade_id: string }> {
  const res = await fetch(`${QUANT_API_URL}/portfolio/${portfolioId}/trades`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(trade),
  });
  if (!res.ok) throw new Error(await extractError(res));
  return res.json() as Promise<{ trade_id: string }>;
}

export async function closeTrade(
  portfolioId: string,
  tradeId: string,
  exitPrice: number,
  exitReason: ExitReason
): Promise<{ trade_id: string; realized_pnl: number }> {
  const res = await fetch(
    `${QUANT_API_URL}/portfolio/${portfolioId}/trades/${tradeId}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ exit_price: exitPrice, exit_reason: exitReason }),
    }
  );
  if (!res.ok) throw new Error(await extractError(res));
  return res.json() as Promise<{ trade_id: string; realized_pnl: number }>;
}

export async function fetchSignals(): Promise<SignalsResponse> {
  const res = await fetch(`${QUANT_API_URL}/signals`);
  if (!res.ok) throw new Error(await extractError(res));
  return SignalsResponseSchema.parse(await res.json());
}
