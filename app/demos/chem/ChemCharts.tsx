"use client";

// ChemCharts is the only "use client" boundary on this page.
// All Recharts components must live here because ResponsiveContainer
// reads DOM dimensions at runtime — a browser-only operation.
// The efficiency table also lives here as it is passed as co-located data.

import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { ValueType } from "recharts/types/component/DefaultTooltipContent";

// Recharts SVG fills cannot consume Tailwind utility classes — they are SVG
// attributes, not CSS class names. These hex values mirror the design tokens
// defined in tailwind.config.ts (accent: #1a56db, green-600: #16a34a, ink-subtle: #9ca3af).
const CHART_COLORS = ["#1a56db", "#16a34a", "#9ca3af"] as const;

// ── prop types ────────────────────────────────────────────────────────────────

interface ChannelDatum {
  name: string;
  value: number;
  pct: number;
}

interface SkuDatum {
  sku: string;
  revenue: number;
  orders: number;
}

interface EfficiencyRow {
  label: string;
  rev_per_order: number;
  tier: "high" | "low";
}

interface ChemChartsProps {
  channelData: ChannelDatum[];
  topSkus: SkuDatum[];
  efficiency: EfficiencyRow[];
}

// ── helpers ───────────────────────────────────────────────────────────────────

function fmtRevenue(v: number): string {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
  return `$${v}`;
}

// Recharts Tooltip formatter receives ValueType | undefined in strict mode.
// Guard required — returning undefined falls back to Recharts' default display.
function tooltipFmt(v: ValueType | undefined): string | undefined {
  if (typeof v !== "number") return undefined;
  return fmtRevenue(v);
}

// ── pie label ─────────────────────────────────────────────────────────────────

// Custom label rendered outside each pie slice.
// Recharts injects these props via its internal render prop — types must be explicit.
interface PieLabelProps {
  cx?: number;
  cy?: number;
  midAngle?: number;
  outerRadius?: number;
  name?: string;
  payload?: { pct?: number };
}

function PieSliceLabel({
  cx = 0,
  cy = 0,
  midAngle = 0,
  outerRadius = 0,
  name = "",
  payload,
}: PieLabelProps) {
  const RADIAN = Math.PI / 180;
  const radius = outerRadius + 28;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x}
      y={y}
      // ink-muted token value (#4b5563) — SVG attribute, not a Tailwind class
      fill="#4b5563"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      fontSize={11}
    >
      {name} {payload?.pct ?? 0}%
    </text>
  );
}

// ── channel pie chart ─────────────────────────────────────────────────────────

interface ChannelChartProps {
  channelData: ChannelDatum[];
}

function ChannelChart({ channelData }: ChannelChartProps) {
  return (
    <div className="bg-white border border-surface-3 rounded-xl p-5">
      <p className="text-xs font-semibold tracking-widest uppercase text-ink-subtle mb-1">
        Revenue by channel
      </p>
      <p className="text-sm font-semibold text-ink mb-4">Amazon vs. Direct</p>
      <div
        className="h-56"
        role="img"
        aria-label="Pie chart showing revenue split: Amazon 52.8%, DIYChemicals.com 46.6%, Other 0.7%"
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={channelData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={72}
              labelLine={false}
              label={(props: PieLabelProps) => (
                <PieSliceLabel
                  cx={props.cx}
                  cy={props.cy}
                  midAngle={props.midAngle}
                  outerRadius={props.outerRadius}
                  name={props.name}
                  payload={props.payload}
                />
              )}
            >
              {channelData.map((_, i) => (
                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={tooltipFmt} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-ink-subtle mt-3">
        Amazon likely carries 10-15% fees. Direct DTC margin is meaningfully higher.
      </p>
    </div>
  );
}

// ── top SKU bar chart ─────────────────────────────────────────────────────────

interface TopSkusChartProps {
  topSkus: SkuDatum[];
}

function TopSkusChart({ topSkus }: TopSkusChartProps) {
  return (
    <div className="bg-white border border-surface-3 rounded-xl p-5">
      <p className="text-xs font-semibold tracking-widest uppercase text-ink-subtle mb-1">
        Top SKUs
      </p>
      <p className="text-sm font-semibold text-ink mb-4">Revenue by product</p>
      <div
        className="h-56"
        role="img"
        aria-label="Horizontal bar chart showing top 8 SKUs by revenue"
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={topSkus}
            layout="vertical"
            margin={{ top: 0, right: 16, left: 4, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#F1F5F9"
              horizontal={false}
            />
            <XAxis
              type="number"
              tickFormatter={(v: number) => fmtRevenue(v)}
              tick={{ fontSize: 10 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              type="category"
              dataKey="sku"
              tick={{ fontSize: 9 }}
              tickLine={false}
              axisLine={false}
              width={160}
            />
            <Tooltip formatter={tooltipFmt} />
            <Bar
              dataKey="revenue"
              fill={CHART_COLORS[0]}
              radius={[0, 3, 3, 0]}
              name="Revenue"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ── efficiency table ──────────────────────────────────────────────────────────

interface EfficiencyTableProps {
  rows: EfficiencyRow[];
}

function EfficiencyTable({ rows }: EfficiencyTableProps) {
  return (
    <section aria-label="Order efficiency by SKU">
      <div className="bg-white border border-surface-3 rounded-xl p-5">
        <p className="text-xs font-semibold tracking-widest uppercase text-ink-subtle mb-1">
          Order efficiency
        </p>
        <p className="text-sm font-semibold text-ink mb-1">
          Revenue per order -- bulk vs. small unit
        </p>
        <p className="text-xs text-ink-muted mb-4">
          Every order costs similar labor to pick, pack, and ship. Bulk SKUs
          earn 10x more per order.
        </p>
        <div className="overflow-x-auto rounded-lg border border-surface-3">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-1 border-b border-surface-3">
                <th
                  scope="col"
                  className="px-4 py-3 text-left font-semibold text-ink-muted"
                >
                  Product
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-right font-semibold text-ink-muted"
                >
                  Rev / order
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left font-semibold text-ink-muted"
                >
                  Tier
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr
                  key={row.label}
                  className={i % 2 === 0 ? "bg-white" : "bg-surface-1"}
                >
                  <td className="px-4 py-2.5 text-ink-muted">{row.label}</td>
                  <td className="px-4 py-2.5 text-right font-medium text-ink">
                    ${row.rev_per_order}
                  </td>
                  <td className="px-4 py-2.5">
                    <span
                      className={
                        row.tier === "high"
                          ? "text-xs font-medium px-2 py-0.5 rounded-full border bg-green-50 text-green-700 border-green-200"
                          : "text-xs font-medium px-2 py-0.5 rounded-full border bg-red-50 text-red-700 border-red-200"
                      }
                    >
                      {row.tier === "high" ? "High value" : "Labor drain"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

// ── exported component ────────────────────────────────────────────────────────

export function ChemCharts({ channelData, topSkus, efficiency }: ChemChartsProps) {
  return (
    <>
      <div className="grid md:grid-cols-2 gap-6">
        <ChannelChart channelData={channelData} />
        <TopSkusChart topSkus={topSkus} />
      </div>
      <EfficiencyTable rows={efficiency} />
    </>
  );
}
