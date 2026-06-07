"use client";

// Learn tab — accordion glossary of every metric and concept on the platform.
// One term expanded at a time. Search filters by name or definition text.

import { useState, useMemo } from "react";
import { cn } from "@/lib/cn";

interface GlossaryTerm {
  term: string;
  definition: string;
  formula?: string;
}

interface GlossarySection {
  title: string;
  terms: GlossaryTerm[];
}

const GLOSSARY: GlossarySection[] = [
  {
    title: "Factor Signals",
    terms: [
      {
        term: "Factor Investing",
        definition:
          "A strategy that selects stocks based on measurable characteristics — called factors — that have historically produced above-market returns. This platform computes momentum, value, quality, and low-volatility scores for every S&P 500 stock daily, then combines them into a composite ranking.",
      },
      {
        term: "Momentum Factor",
        definition:
          "Stocks that outperformed over the past 12 months tend to keep outperforming over the next 1–3 months. This platform uses 12-1 month momentum: the return from 12 months ago to 1 month ago. The most recent month is excluded because short-term price moves tend to reverse. A momentum rank of 90 means the stock beats 90% of the S&P 500 on this signal.",
        formula: "momentum = (price_21_days_ago / price_252_days_ago) − 1",
      },
      {
        term: "Value Factor",
        definition:
          "Value investing buys stocks trading cheaply relative to their fundamentals, betting the market has mispriced them. This platform uses four metrics: P/E (price per dollar of earnings), P/B (price per dollar of book value), P/S (price per dollar of revenue), and EV/EBITDA. All are ranked within sector — a cheap utility is not comparable to a cheap tech stock.",
        formula: "EV/EBITDA = (market_cap + debt − cash) / EBITDA",
      },
      {
        term: "Quality Factor",
        definition:
          "Quality selects companies with durable businesses: high profitability, low debt, and strong cash generation. Four metrics drive the composite: ROE, gross margin, debt/equity, and free cash flow. Quality is used as a filter — it eliminates the bottom 20% of the value and momentum candidate pools.",
        formula: "FCF = operating_cash_flow − capital_expenditures",
      },
      {
        term: "Low Volatility Anomaly",
        definition:
          "The counterintuitive finding that lower-volatility stocks deliver better risk-adjusted returns over long periods. It persists because institutional managers chase high-volatility winners, leaving low-vol stocks underowned. This platform measures 252-day annualized volatility — lowest vol gets the highest rank.",
        formula: "realized_vol = std_dev(daily_returns, 252 days) × √252",
      },
      {
        term: "Composite Score",
        definition:
          "A single number combining momentum rank (60% weight) and low-volatility rank (40% weight). A composite score of 88 means the stock ranks better than 88% of the S&P 500. The 60/40 split reflects that momentum contributes more alpha historically while low-vol adds defensive stability.",
        formula: "composite = 0.6 × momentum_rank + 0.4 × lowvol_rank",
      },
      {
        term: "Alpha",
        definition:
          "Return above what the market exposure alone would explain. If the S&P 500 returns 10% and a strategy returns 15% with equivalent market sensitivity, the extra 5% is alpha. This platform's signal engine is attempting to generate alpha — returns attributable to signal quality, not just riding a bull market.",
      },
      {
        term: "Alpha Decay",
        definition:
          "The rate at which a signal loses predictive power over time. As more participants discover and trade the same pattern, the edge gets arbitraged away. Momentum signal half-life is roughly 3–12 months. This platform refreshes signals daily to capture the period before alpha decays materially.",
      },
      {
        term: "Cross-Sectional Ranking",
        definition:
          "Ranking all stocks against each other on a single date, rather than comparing a stock to its own history. A momentum rank of 85 means the stock beats 85% of the universe on that day. This normalization makes factor scores comparable across market regimes and across stocks with very different raw return levels.",
      },
    ],
  },
  {
    title: "Technical Indicators",
    terms: [
      {
        term: "Moving Average (MA50 / MA200)",
        definition:
          "A moving average smooths price data by averaging prices over a trailing window. MA50 tracks intermediate trend (~one quarter). MA200 tracks long-term trend (~one year). Price above both signals an uptrend. This platform requires MA50 above MA200 as a minimum condition for all long recommendations.",
        formula: "MA_50 = average(close_price, last 50 days)",
      },
      {
        term: "Golden Cross / Death Cross",
        definition:
          "A golden cross occurs when the 50-day MA crosses above the 200-day MA — a bull signal. A death cross is the inverse: 50-day falls below 200-day — a bear signal. This platform suppresses all long recommendations on a stock showing a death cross, regardless of factor scores.",
      },
      {
        term: "RSI — Relative Strength Index",
        definition:
          "RSI measures whether a stock has moved too far, too fast — between 0 and 100. Below 30 = oversold (potential bounce). Above 70 = overbought (potential pullback). Above 80 = this platform suppresses the recommendation. A healthy long entry is RSI between 45 and 70: trending but not extended.",
        formula: "RSI = 100 − (100 / (1 + avg_gain / avg_loss))  [14-day window]",
      },
      {
        term: "MACD — Moving Average Convergence Divergence",
        definition:
          "MACD measures trend momentum by tracking the gap between a 12-day and 26-day EMA of price. When the histogram is positive, short-term momentum is accelerating — bullish. When negative, momentum is decelerating. This platform uses MACD as an entry timing filter for positions already identified by the factor model.",
        formula: "MACD = EMA(12) − EMA(26)  |  Histogram = MACD − EMA(MACD, 9)",
      },
      {
        term: "ATR — Average True Range",
        definition:
          "ATR measures daily price volatility as the average size of a stock's price swings over 14 days, accounting for overnight gaps. ATR indicates magnitude, not direction. This platform uses ATR for stops (1.25× ATR below entry) and position sizing (same dollar risk regardless of stock volatility).",
        formula:
          "True Range = max(high−low, |high−prev_close|, |low−prev_close|)\nATR_14 = average(True_Range, 14 days)",
      },
      {
        term: "Volume Ratio",
        definition:
          "Today's trading volume divided by the 20-day average volume. A ratio above 1.5 means institutional buyers are involved — the move has conviction. A breakout on normal volume (ratio ~1.0) is suspect and unconfirmed. This platform displays volume ratio on every signal card.",
        formula: "volume_ratio = today_volume / avg_volume_20d",
      },
      {
        term: "Support and Resistance",
        definition:
          "Support is a price level where a stock has historically stopped falling — buyers consistently step in. Resistance is where it historically stopped rising — sellers appear. These are zones, not precise lines. This platform uses prior 52-week pivot highs and lows as context for stop placement.",
      },
      {
        term: "Breakout",
        definition:
          "A breakout occurs when price closes decisively above a resistance level — more than 1% above resistance on volume exceeding 150% of 20-day average. A breakout signals the supply/demand balance has shifted. Breakouts on low volume are flagged as unconfirmed — they frequently fail.",
      },
    ],
  },
  {
    title: "Macro & Market Regime",
    terms: [
      {
        term: "Macro Regime",
        definition:
          "The broad economic environment that determines whether stocks are likely to rise or fall. This platform classifies the regime daily from yield curve shape, VIX level, fed funds rate direction, and S&P 500 position relative to its 200-day MA. The regime gates all recommendations.",
      },
      {
        term: "RISK_ON / TRANSITIONAL / RISK_OFF / CRISIS",
        definition:
          "Four regime states. RISK_ON: VIX <18, normal yield curve, S&P above 200MA — full position sizing. TRANSITIONAL: VIX 18–25 or flattening curve — 70% sizing. RISK_OFF: VIX >25 or inverted yield curve — 50% sizing, increase cash. CRISIS: VIX >35 — no new positions, preserve capital.",
      },
      {
        term: "Yield Curve (T10Y2Y)",
        definition:
          "The difference between the 10-year and 2-year US Treasury yield. Positive = healthy growth expectations. Negative (inverted) = historically the most reliable recession signal — every US recession in the past 50 years was preceded by inversion. This platform reads T10Y2Y from FRED daily.",
        formula: "T10Y2Y = 10-year Treasury yield − 2-year Treasury yield",
      },
      {
        term: "Fed Funds Rate",
        definition:
          "The rate US banks charge each other for overnight loans, set by the Federal Reserve. Rising rates compress stock valuations (future earnings are worth less at a higher discount rate). Falling rates support valuations. This platform reads FEDFUNDS from FRED and uses rate direction as a regime modifier.",
      },
      {
        term: "CPI and Inflation Regime",
        definition:
          "CPI measures how fast prices are rising. High inflation (>4% annualized) is negative for equities because it forces the Fed to raise rates, compresses margins, and erodes purchasing power. This platform reads CPIAUCSL from FRED and classifies inflation as low (<2%), moderate (2–4%), or high (>4%).",
      },
      {
        term: "VIX — Fear Gauge",
        definition:
          "The market's expectation of S&P 500 volatility over the next 30 days, derived from options prices. It rises when investors buy protective puts. Key thresholds: <18 = calm, 18–25 = caution, 25–35 = risk-off, >35 = crisis. VIX above 35 has corresponded to the 2008 financial crisis and the March 2020 COVID crash.",
      },
      {
        term: "Bull Market / Bear Market",
        definition:
          "A bull market is a sustained rise of 20%+ from a recent low. A bear market is a decline of 20%+ from a recent high. These are backward-looking labels — you don't know you're in one until after the fact. This platform uses the S&P 500's position relative to its 200-day MA as a forward-looking proxy.",
      },
      {
        term: "200-Day MA as Regime Gate",
        definition:
          "The single most watched trend indicator in institutional markets. When so many strategies use the same level, it becomes self-fulfilling — a break below triggers systematic selling across the industry. This platform uses the S&P 500's 200-day MA as the primary gate for all long recommendations.",
      },
    ],
  },
  {
    title: "Options Concepts",
    terms: [
      {
        term: "Options (Calls and Puts)",
        definition:
          "An option gives the buyer the right, but not the obligation, to buy or sell a stock at a set price before a set date. A call option profits when the stock rises above the strike. A put option profits when the stock falls below the strike. Institutional players frequently use options to express high-conviction views with defined risk.",
      },
      {
        term: "Strike Price, Expiration, Premium",
        definition:
          "Strike price: the price at which the option buyer can transact. An option with a $150 strike on a $140 stock is out-of-the-money. Expiration: the date the contract expires. Premium: the price paid per share (standard contracts cover 100 shares — a $2.50 premium costs $250 per contract).",
      },
      {
        term: "Options Sweep",
        definition:
          "A large options order broken across multiple exchanges simultaneously to fill as fast as possible, prioritizing speed over price. Sweeps signal urgency — the buyer doesn't want to wait. A bullish call sweep above the ask on multiple exchanges is the highest-conviction options signal on this platform.",
      },
      {
        term: "Open Interest vs Volume",
        definition:
          "Volume = contracts traded today (resets daily). Open interest = total active contracts across all participants (persists until closed or expired). A spike in volume with rising open interest means new directional positions are being opened — more significant than the same spike with flat open interest.",
      },
      {
        term: "Put/Call Ratio",
        definition:
          "Total put volume divided by total call volume. Above 1.0 = more bearish bets. Below 1.0 = more bullish. Also a contrarian indicator: extreme put buying (ratio >1.5) often marks a short-term bottom because fear has peaked.",
        formula: "put_call_ratio = total_put_volume / total_call_volume",
      },
      {
        term: "IV Crush",
        definition:
          "Implied volatility typically expands before earnings (options buyers pay more for the unknown outcome) and collapses immediately after — this collapse is IV crush. This platform flags stocks within 7 days of earnings as elevated risk: IV pricing makes directional options bets expensive and signals less reliable.",
      },
      {
        term: "Dark Pool",
        definition:
          "Private, off-exchange trading venues where large institutional orders execute without revealing intent until after completion. About 35–40% of all US equity volume trades in dark pools. Large dark pool prints at consistent price levels can signal institutional accumulation.",
      },
    ],
  },
  {
    title: "Risk Management",
    terms: [
      {
        term: "ATR-Based Stop Loss",
        definition:
          "The stop is placed 1.25× ATR below the entry price. The 1.25× buffer prevents being stopped by routine noise — only a genuine adverse move triggers it. ATR adjusts automatically: wider stops for volatile stocks, tighter for stable ones. Non-negotiable on every trade on this platform.",
        formula: "stop_price = entry − (1.25 × ATR_14)",
      },
      {
        term: "Position Sizing",
        definition:
          "How many shares to buy — determined by account risk, not conviction. This platform risks 1% of account value ($1,000 on a $100k account) per trade. Combined with the ATR stop distance, this determines share count. Also capped at 10% of portfolio value to prevent concentration.",
        formula:
          "shares = (account × 0.01) / (1.25 × ATR_14)  [capped at 10% of portfolio]",
      },
      {
        term: "Reward/Risk Ratio",
        definition:
          "Profit target divided by stop distance. Minimum 2:1 means for every $1 risked, the target returns $2. At a 50% win rate, 2:1 reward/risk produces positive expected value. This platform rejects any recommendation that doesn't achieve 2:1 at the identified technical target.",
        formula: "R:R = (target − entry) / (entry − stop)  →  minimum 2.0",
      },
      {
        term: "Max Drawdown",
        definition:
          "The largest peak-to-trough decline in portfolio value. A -15% max drawdown means the portfolio fell 15% from its high before recovering. This is the primary measure of downside risk — a high Sharpe with a 40% drawdown is not acceptable in practice. Target for this platform: below -20%.",
        formula: "max_drawdown = (trough_value − peak_value) / peak_value",
      },
      {
        term: "Portfolio Concentration",
        definition:
          "The degree to which returns are driven by a small number of positions. This platform caps individual positions at 10% and requires a minimum of 10 active positions when fully invested. A portfolio of 5 equal positions loses 20% if one position goes to zero.",
      },
      {
        term: "Value Trap",
        definition:
          "A stock that appears cheap on value metrics but is cheap for a legitimate reason — the business is in permanent decline, earnings are about to fall, or the accounting is misleading. This platform defends against value traps by requiring quality factor scores above the 40th percentile before acting on value signals.",
      },
      {
        term: "Momentum Crash",
        definition:
          "Momentum strategies periodically suffer rapid reversals during market recoveries: prior losers bounce violently while prior winners underperform. March 2020 and April 2009 are canonical examples. This platform mitigates crash risk by capping momentum weight in high-VIX regimes.",
      },
    ],
  },
  {
    title: "Performance Metrics",
    terms: [
      {
        term: "Sharpe Ratio",
        definition:
          "Return per unit of total risk — the most widely used risk-adjusted performance measure. Sharpe > 1.0 is good. Above 2.0 is excellent and hard to sustain. Below 0.5 means the strategy barely compensates for its risk. This platform targets a Sharpe above 1.2.",
        formula:
          "Sharpe = (portfolio_return − risk_free_rate) / std_dev(returns)",
      },
      {
        term: "Win Rate",
        definition:
          "Percentage of closed trades that were profitable. Meaningless without the win/loss ratio — a 40% win rate with 3:1 average wins beats a 70% win rate with 0.5:1 average wins. This platform targets win rate above 45% with average win/loss ratio above 2.0.",
        formula: "win_rate = profitable_trades / total_closed_trades",
      },
      {
        term: "Average Win/Loss Ratio",
        definition:
          "Average profit on winning trades divided by average loss on losing trades. Combined with win rate, this determines expected value per trade.",
        formula:
          "EV = (win_rate × avg_win) − ((1 − win_rate) × avg_loss)",
      },
      {
        term: "Total Return vs Annualized Return",
        definition:
          "Total return is the raw percentage change. Annualized return scales it to a per-year rate for fair comparison across periods of different lengths. A strategy up 20% over 3 years has an annualized return of 6.3%, not 20%.",
        formula: "annualized = (1 + total_return)^(365 / days_held) − 1",
      },
      {
        term: "Paper Trading",
        definition:
          "Simulating trades with hypothetical capital — recording entries, exits, and P&L without executing real orders. Used to validate a strategy before risking real money. All positions on this platform are paper trades.",
      },
      {
        term: "Lookahead Bias",
        definition:
          "Using future information that wouldn't have been available at decision time. The most common form: using the day's close to both generate the signal and record the entry. This platform prevents it by generating signals on the prior day's close and logging entries at the current day's close.",
      },
    ],
  },
  {
    title: "Data Sources",
    terms: [
      {
        term: "yfinance",
        definition:
          "A Python library wrapping Yahoo Finance's unofficial API for historical price and fundamental data. Free, no API key required. This platform uses it for daily OHLCV across all S&P 500 constituents. Data latency is 15–30 minutes after market close. Occasional gaps are validated by the ETL layer before writing to the warehouse.",
      },
      {
        term: "OHLCV",
        definition:
          "The standard daily price record: Open (first trade), High (highest price), Low (lowest price), Close (last trade before 4pm ET), Volume (shares traded). All signal computation uses Adjusted Close, which back-adjusts historical prices for splits and dividends.",
      },
      {
        term: "FRED — Federal Reserve Economic Data",
        definition:
          "A free public API from the Federal Reserve Bank of St. Louis with 800,000+ economic time series. This platform reads T10Y2Y (yield curve, daily), FEDFUNDS (fed funds rate, monthly), and CPIAUCSL (CPI, monthly).",
      },
      {
        term: "S&P 500 Universe",
        definition:
          "500 large-cap US companies selected by S&P Global — roughly 80% of total US equity market cap. This platform uses the S&P 500 as its investable universe because the data is free and clean, the companies are liquid, and it is the relevant performance benchmark. The constituent list is loaded from Wikipedia at startup. Survivorship bias (using today's list to analyze historical periods) is a known limitation.",
      },
      {
        term: "Ticker Symbol",
        definition:
          "A 1–5 character abbreviation identifying a publicly traded security on a specific exchange. AAPL = Apple on NASDAQ; BRK.B = Berkshire Hathaway on NYSE. Ticker symbols are the primary join key across all data sources in this platform.",
      },
    ],
  },
];

export function GlossaryTab() {
  const [query, setQuery] = useState("");
  const [openTerm, setOpenTerm] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return GLOSSARY;
    return GLOSSARY.map((section) => ({
      ...section,
      terms: section.terms.filter(
        (t) =>
          t.term.toLowerCase().includes(q) ||
          t.definition.toLowerCase().includes(q)
      ),
    })).filter((s) => s.terms.length > 0);
  }, [query]);

  const totalTerms = GLOSSARY.reduce((n, s) => n + s.terms.length, 0);

  function toggle(term: string) {
    setOpenTerm((prev) => (prev === term ? null : term));
  }

  return (
    <div className="space-y-6">
      {/* Header + search */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1">
          <h2 className="text-base font-semibold text-ink">Glossary</h2>
          <p className="text-xs text-ink-subtle mt-0.5">
            {totalTerms} terms across 7 sections — click any term to expand
          </p>
        </div>
        <div>
          <label htmlFor="glossary-search" className="sr-only">
            Search terms
          </label>
          <input
            id="glossary-search"
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpenTerm(null);
            }}
            placeholder="Search terms..."
            className="w-full sm:w-64 px-4 py-2 text-sm rounded-xl border border-surface-3 bg-surface-1 text-ink placeholder:text-ink-subtle focus:outline-none focus:border-quant focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* Sections */}
      {filtered.length === 0 ? (
        <p className="text-sm text-ink-subtle text-center py-10">
          No terms match &ldquo;{query}&rdquo;
        </p>
      ) : (
        <div className="space-y-8">
          {filtered.map((section) => (
            <div key={section.title}>
              <h3 className="text-xs font-semibold text-ink-subtle uppercase tracking-widest mb-2 px-1">
                {section.title}
              </h3>
              <div className="border border-surface-3 rounded-2xl overflow-hidden divide-y divide-surface-3 bg-white">
                {section.terms.map((item) => {
                  const isOpen = openTerm === item.term;
                  return (
                    <div key={item.term}>
                      <button
                        onClick={() => toggle(item.term)}
                        aria-expanded={isOpen}
                        className="w-full flex items-center justify-between px-5 py-3.5 text-left hover:bg-surface-1 transition-colors"
                      >
                        <span className="text-sm font-medium text-ink">
                          {item.term}
                        </span>
                        <span
                          className={cn(
                            "text-ink-subtle transition-transform duration-200 shrink-0 ml-4 text-xs",
                            isOpen && "rotate-180"
                          )}
                          aria-hidden
                        >
                          ▾
                        </span>
                      </button>

                      {isOpen && (
                        <div className="px-5 pb-4 pt-3 space-y-3 bg-quant-subtle border-t border-surface-3">
                          <p className="text-sm text-ink-muted leading-relaxed">
                            {item.definition}
                          </p>
                          {item.formula && (
                            <pre className="text-xs bg-white border border-surface-3 text-ink-muted rounded-lg px-4 py-3 font-mono overflow-x-auto whitespace-pre-wrap">
                              {item.formula}
                            </pre>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
