"use client";

// ChemCharts is the only "use client" boundary on this page.
// All Recharts components must live here because ResponsiveContainer
// reads DOM dimensions at runtime — a browser-only operation.
// The efficiency table also lives here as it is passed as co-located data.

import { useState } from "react";
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

// Discriminated union for which chart, if any, is currently expanded in the modal.
type ExpandedChart = "channel" | "skus" | null;

// Inline SVG expand icon — no icon library dependency.
// Two arrows pointing outward from center, 16×16 viewBox.
function ExpandIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2 6V2h4M2 2l4 4M14 10v4h-4M14 14l-4-4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
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
  // Called when the user clicks the expand button; parent owns modal state.
  onExpand: () => void;
}

function ChannelChart({ channelData, onExpand }: ChannelChartProps) {
  return (
    // relative positioning is required for the absolute-positioned expand button.
    <div className="relative bg-white border border-surface-3 rounded-xl p-5">
      <p className="text-xs font-semibold tracking-widest uppercase text-ink-subtle mb-1">
        Revenue by channel
      </p>
      <p className="text-sm font-semibold text-ink mb-4">
        Revenue by channel — before fees
      </p>
      {/* Expand button: absolute top-right, visually subtle, accent on hover */}
      <button
        type="button"
        onClick={onExpand}
        className="absolute top-4 right-4 text-ink-subtle hover:text-accent transition-colors"
        aria-label="Expand channel revenue chart"
      >
        <ExpandIcon />
      </button>
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
        Amazon charges ~15% seller fees. DIYChemicals.com orders net ~68% more per shipment after fees.
      </p>
    </div>
  );
}

// ── top SKU bar chart ─────────────────────────────────────────────────────────

interface TopSkusChartProps {
  topSkus: SkuDatum[];
  // Called when the user clicks the expand button; parent owns modal state.
  onExpand: () => void;
}

function TopSkusChart({ topSkus, onExpand }: TopSkusChartProps) {
  return (
    // relative positioning is required for the absolute-positioned expand button.
    <div className="relative bg-white border border-surface-3 rounded-xl p-5">
      <p className="text-xs font-semibold tracking-widest uppercase text-ink-subtle mb-1">
        Top SKUs
      </p>
      <p className="text-sm font-semibold text-ink mb-4">Revenue by product</p>
      {/* Expand button: absolute top-right, visually subtle, accent on hover */}
      <button
        type="button"
        onClick={onExpand}
        className="absolute top-4 right-4 text-ink-subtle hover:text-accent transition-colors"
        aria-label="Expand top SKUs revenue chart"
      >
        <ExpandIcon />
      </button>
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

// ── chart modal ───────────────────────────────────────────────────────────────

interface ChartModalProps {
  // Which chart is currently expanded; null means the modal is closed.
  expanded: ExpandedChart;
  channelData: ChannelDatum[];
  topSkus: SkuDatum[];
  onClose: () => void;
}

// Renders the expanded chart in a full-screen overlay.
// Clicking the dark backdrop or the X button closes it.
// role="dialog" + aria-modal="true" satisfies WCAG 2.1 AA modal pattern.
function ChartModal({ expanded, channelData, topSkus, onClose }: ChartModalProps) {
  if (expanded === null) return null;

  const title =
    expanded === "channel"
      ? "Revenue by channel — before fees"
      : "Revenue by product — top SKUs";

  return (
    // Backdrop: semi-transparent dark overlay. Click outside the card closes the modal.
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      {/* Card: stopPropagation prevents backdrop click handler from firing when clicking inside the card */}
      <div
        className="relative bg-white rounded-2xl shadow-xl w-full max-w-3xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-ink-subtle hover:text-accent transition-colors"
          aria-label="Close expanded chart"
        >
          {/* Inline X icon — no icon library */}
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3 3l12 12M15 3L3 15"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <p className="text-sm font-semibold text-ink mb-4">{title}</p>

        {/* h-[500px] gives the modal chart significantly more vertical space than the card's h-56 */}
        <div className="h-[500px]">
          {expanded === "channel" ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={channelData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={160}
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
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topSkus}
                layout="vertical"
                margin={{ top: 0, right: 24, left: 4, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#F1F5F9"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  tickFormatter={(v: number) => fmtRevenue(v)}
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="sku"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  width={180}
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
          )}
        </div>
      </div>
    </div>
  );
}

// ── exported component ────────────────────────────────────────────────────────

export function ChemCharts({ channelData, topSkus, efficiency }: ChemChartsProps) {
  // expandedChart is null when no modal is open, "channel" or "skus" when one is.
  const [expandedChart, setExpandedChart] = useState<ExpandedChart>(null);

  return (
    <>
      <div className="grid md:grid-cols-2 gap-6">
        <ChannelChart
          channelData={channelData}
          onExpand={() => setExpandedChart("channel")}
        />
        <TopSkusChart
          topSkus={topSkus}
          onExpand={() => setExpandedChart("skus")}
        />
      </div>
      <EfficiencyTable rows={efficiency} />
      <ChartModal
        expanded={expandedChart}
        channelData={channelData}
        topSkus={topSkus}
        onClose={() => setExpandedChart(null)}
      />
    </>
  );
}
