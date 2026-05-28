// Server Component -- no "use client" directive.
// All sections are static; only the Recharts charts require a client boundary,
// which is isolated in ChemCharts.tsx.

import type { Metadata } from "next";
import { CHANNEL_DATA, EFFICIENCY, FINDINGS, KPI, TOP_SKUS } from "./data";
import { ChemCharts } from "./ChemCharts";

export const metadata: Metadata = {
  title: "Chemical Distribution Analytics | Yash Vajifdar",
  description:
    "ShipStation analytics case study for a chemical distribution business: revenue by channel, top SKUs, and order efficiency insights.",
};

// ── helpers ───────────────────────────────────────────────────────────────────

function fmtRevenue(v: number): string {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
  return `$${v}`;
}

// ── sub-components (all Server Components) ────────────────────────────────────

function ChemHeader() {
  return (
    <div className="border-b border-surface-3 bg-white">
      <div className="max-w-wide mx-auto px-6 py-5 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="text-2xl">&#9879;&#65039;</span>
          <div>
            <h1 className="text-base font-semibold text-ink leading-tight">
              ShipStation Analytics
            </h1>
            <p className="text-xs text-ink-muted">
              Chemical distribution &middot; 24-day snapshot &middot; {KPI.period}
            </p>
          </div>
        </div>
        <span className="text-xs font-medium px-2.5 py-1 rounded-full border bg-surface-1 text-ink-muted border-surface-3 shrink-0">
          Static analysis
        </span>
      </div>
    </div>
  );
}

interface KpiTile {
  label: string;
  value: string;
}

interface KpiStripProps {
  tiles: KpiTile[];
}

function KpiStrip({ tiles }: KpiStripProps) {
  return (
    <section aria-label="Key metrics">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {tiles.map(({ label, value }) => (
          <div
            key={label}
            className="bg-white border border-surface-3 rounded-xl p-4"
          >
            <p className="text-2xl font-semibold text-ink">{value}</p>
            <p className="text-xs text-ink-muted mt-1">{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

interface FindingCardProps {
  number: string;
  title: string;
  body: string;
  tag: string;
  tagColor: string;
}

function FindingCard({ number, title, body, tag, tagColor }: FindingCardProps) {
  return (
    <article className="bg-white border border-surface-3 rounded-xl p-6">
      <div className="flex items-start gap-4">
        <span
          className="text-2xl font-semibold text-ink-subtle shrink-0 leading-none mt-0.5"
          aria-hidden="true"
        >
          {number}
        </span>
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <h3 className="text-base font-semibold text-ink">{title}</h3>
            <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${tagColor}`}>
              {tag}
            </span>
          </div>
          <p className="text-sm text-ink-muted leading-relaxed">{body}</p>
        </div>
      </div>
    </article>
  );
}

interface FindingsSectionProps {
  findings: typeof FINDINGS;
}

function FindingsSection({ findings }: FindingsSectionProps) {
  return (
    <section aria-label="Key findings and recommendations">
      <p className="text-xs font-semibold tracking-widest uppercase text-ink-subtle mb-2">
        Findings
      </p>
      <h2 className="text-xl font-semibold text-ink mb-6">
        {findings.length} things worth acting on
      </h2>
      <div className="space-y-4">
        {findings.map((f) => (
          <FindingCard
            key={f.number}
            number={f.number}
            title={f.title}
            body={f.body}
            tag={f.tag}
            tagColor={f.tagColor}
          />
        ))}
      </div>
    </section>
  );
}

function ChemFooter() {
  return (
    <footer className="border-t border-surface-3 pt-6 pb-2">
      <p className="text-xs text-ink-subtle">
        Built from a 2,712-row ShipStation export &middot; Python analysis &middot; Recharts &middot; Next.js &middot;{" "}
        <span className="text-ink-muted">
          AI layer coming soon -- ask questions like &ldquo;which SKUs keep running out?&rdquo;
        </span>
      </p>
    </footer>
  );
}

// ── page ──────────────────────────────────────────────────────────────────────
// Named export satisfies the "named exports only" rule.
// The default export below is required by Next.js App Router for routing.

const KPI_TILES: KpiTile[] = [
  { label: "Revenue", value: fmtRevenue(KPI.revenue) },
  { label: "Unique orders", value: KPI.orders.toLocaleString() },
  { label: "Active SKUs", value: `~${KPI.skus}` },
  { label: "Channels", value: "2 main" },
];

export function ChemDemoPage() {
  return (
    <div className="min-h-screen bg-surface-1">
      <ChemHeader />
      <main className="max-w-wide mx-auto px-6 py-10 space-y-10">
        <KpiStrip tiles={KPI_TILES} />
        {/* Context note: framing shift — ShipStation surfaces the data; this layer shows what it means */}
        <p className="text-sm text-ink-muted -mt-4">
          ShipStation shows volume. The analysis below shows what drives value.
        </p>
        {/* ChemCharts is the only client boundary -- receives pre-computed data as props */}
        <ChemCharts
          channelData={CHANNEL_DATA}
          topSkus={TOP_SKUS}
          efficiency={EFFICIENCY}
        />
        <FindingsSection findings={FINDINGS} />
        <ChemFooter />
      </main>
    </div>
  );
}

export default ChemDemoPage;
