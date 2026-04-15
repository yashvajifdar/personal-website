import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { SectionLabel } from "@/components/ui/SectionLabel";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Analytics platform consulting for mid-market businesses. I connect your operational data, model it correctly, and build the interface that lets you ask your business questions in plain English.",
};

const DELIVERABLES = [
  {
    title: "Data audit & architecture",
    description:
      "Map every system you have: POS, QuickBooks, inventory, CRM, spreadsheets. Before any build begins, you get a written architecture document: stack recommendations, cloud tradeoffs, and the reasoning behind every decision.",
  },
  {
    title: "ETL & data warehouse",
    description:
      "Build the pipelines that pull your operational data into a unified warehouse. Production-grade, documented, and yours to own.",
  },
  {
    title: "Semantic data model",
    description:
      "Model your business logic correctly in dbt: margin, inventory turnover, customer behavior, whatever drives your decisions. This is the foundation. Everything else builds on it.",
  },
  {
    title: "Analytics dashboard",
    description:
      "10–20 KPIs you actually care about, updated automatically. No more manual reports. No more pulling numbers from three different places.",
  },
  {
    title: "Natural language query interface",
    description:
      "Ask your business questions in plain English and get correct answers, because the underlying model is correct. This is not a chatbot on top of messy data.",
  },
  {
    title: "Ongoing support & iteration",
    description:
      "Monthly retainer to handle new questions, data refreshes, and additions as your business evolves. Not a one-time project.",
  },
] as const;

const WHO_THIS_IS_FOR = [
  "You run a $2M–$20M business in building materials, field services, or distribution",
  "Your reporting is manual. Someone pulls numbers from multiple systems every week.",
  "You know you have margin problems but cannot pinpoint where",
  "You have tried off-the-shelf BI tools and they did not fit your business",
  'You want an analytics platform, not another subscription to a tool you will not use',
] as const;

const WHO_THIS_IS_NOT_FOR = [
  "Businesses that need a basic spreadsheet solution. You do not need me for that.",
  "Enterprises with existing data teams. You need an internal hire, not a consultant.",
  "Clients who want a one-time report with no ongoing relationship",
] as const;

export default function ServicesPage() {
  return (
    <div className="max-w-content mx-auto px-6 pt-20 pb-24">
      <SectionLabel>Analytics Consulting</SectionLabel>
      <h1 className="text-4xl font-semibold text-ink leading-tight tracking-tight mb-6">
        Your business has the data. The problem is using it.
      </h1>
      <p className="text-lg text-ink-muted leading-relaxed mb-4">
        Most businesses your size have years of operational data sitting in POS
        systems, QuickBooks, and inventory tools with no way to connect it,
        model it correctly, or act on it. They run on instinct and lagging
        reports.
      </p>
      <p className="text-lg text-ink-muted leading-relaxed mb-16">
        I build the platform that changes that. Not a dashboard bolted onto raw
        data. A production-grade analytics infrastructure: modeled correctly,
        automated, and queryable in plain English.
      </p>

      {/* Who it's for */}
      <div className="mb-16">
        <SectionLabel>Fit</SectionLabel>
        <h2 className="text-2xl font-semibold text-ink mb-6">
          This is for you if…
        </h2>
        <ul className="space-y-3">
          {WHO_THIS_IS_FOR.map((item) => (
            <li key={item} className="flex items-start gap-3 text-sm text-ink-muted">
              <span className="text-accent mt-0.5 shrink-0">—</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <h2 className="text-xl font-semibold text-ink mt-10 mb-4">
          This is not for you if…
        </h2>
        <ul className="space-y-3">
          {WHO_THIS_IS_NOT_FOR.map((item) => (
            <li key={item} className="flex items-start gap-3 text-sm text-ink-subtle">
              <span className="mt-0.5 shrink-0">—</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Deliverables */}
      <SectionLabel>What I deliver</SectionLabel>
      <h2 className="text-2xl font-semibold text-ink mb-8">
        End-to-end. Not piecemeal.
      </h2>

      <div className="grid md:grid-cols-2 gap-5 mb-16">
        {DELIVERABLES.map(({ title, description }) => (
          <div
            key={title}
            className="border border-surface-3 rounded-xl p-5 bg-surface-1"
          >
            <h3 className="text-sm font-semibold text-ink mb-2">{title}</h3>
            <p className="text-sm text-ink-muted leading-relaxed">
              {description}
            </p>
          </div>
        ))}
      </div>

      {/* Engagement model */}
      <SectionLabel>Engagement model</SectionLabel>
      <h2 className="text-2xl font-semibold text-ink mb-6">How it works</h2>

      <div className="grid md:grid-cols-2 gap-6 mb-12">
        <div className="border border-surface-3 rounded-xl p-6">
          <p className="text-xs font-semibold tracking-widest uppercase text-ink-subtle mb-2">
            Phase 1
          </p>
          <h3 className="text-base font-semibold text-ink mb-2">
            Setup & build
          </h3>
          <p className="text-sm text-ink-muted leading-relaxed mb-3">
            Data audit, ETL build, semantic model, dashboard, and AI query layer.
            One-time engagement delivered over 6–10 weeks.
          </p>
          <p className="text-sm font-medium text-ink">$5,000 – $15,000</p>
          <p className="text-xs text-ink-subtle">Depending on data complexity</p>
        </div>

        <div className="border border-surface-3 rounded-xl p-6">
          <p className="text-xs font-semibold tracking-widest uppercase text-ink-subtle mb-2">
            Phase 2
          </p>
          <h3 className="text-base font-semibold text-ink mb-2">
            Monthly retainer
          </h3>
          <p className="text-sm text-ink-muted leading-relaxed mb-3">
            Ongoing data refreshes, new metrics, support, and iteration as your
            business evolves. Not set-it-and-forget-it.
          </p>
          <p className="text-sm font-medium text-ink">$1,500 – $3,000 / month</p>
          <p className="text-xs text-ink-subtle">Cancel anytime</p>
        </div>
      </div>

      {/* Why me */}
      <div className="bg-surface-1 border border-surface-3 rounded-xl p-6 mb-16">
        <h3 className="text-base font-semibold text-ink mb-3">
          Why hire someone from Amazon for this?
        </h3>
        <p className="text-sm text-ink-muted leading-relaxed mb-3">
          Because I have shipped data platforms at a scale most consultants have
          never operated at. 1.2PB daily. 300+ Spark jobs. 16 international
          locales. That experience makes the failure modes easy to spot.
        </p>
        <p className="text-sm text-ink-muted leading-relaxed mb-3">
          The data model is wrong from day one, so no metric built on it can be
          trusted. Governance and access controls are skipped, so compliance
          becomes a retrofit that breaks the architecture. Nothing is tested or
          monitored, so a broken pipeline goes undetected for days. Then AI gets
          layered on top of all of it, producing confident wrong answers. These
          are not edge cases. They are the default.
        </p>
        <p className="text-sm text-ink-muted leading-relaxed">
          The work I do for you is designed against all four. Production-grade,
          documented, and built to run without me.
        </p>
      </div>

      {/* CTA */}
      <div className="border-t border-surface-3 pt-12">
        <h2 className="text-2xl font-semibold text-ink mb-4">
          Ready to talk?
        </h2>
        <p className="text-ink-muted mb-6">
          The first conversation is a diagnostic. I will tell you what you have,
          what is possible, and whether this engagement makes sense. No pressure,
          no sales process.
        </p>
        <Button href="/contact">Start a conversation</Button>
      </div>
    </div>
  );
}
