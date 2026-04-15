import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Tag } from "@/components/ui/Tag";

export const metadata: Metadata = {
  title: "Yash Vajifdar — Data Engineering & AI",
  description:
    "Senior data engineering leader who builds teams, platforms, and culture at scale. Currently at Amazon Alexa AI, architecting AI infrastructure at 1.2PB+ daily. Also available for analytics consulting.",
};

const CREDENTIALS = [
  { value: "1.2PB+", label: "processed daily at Amazon" },
  { value: "250+", label: "person org led" },
  { value: "300+", label: "Spark jobs optimized" },
] as const;

const THEMES = [
  "Data Platforms",
  "Agentic AI",
  "ML Infrastructure",
  "Analytics Engineering",
  "Team Building",
  "Operational AI",
] as const;

const PORTFOLIO_PREVIEW = [
  {
    title: "Lumber AI Analytics",
    description:
      "End-to-end operational analytics platform for a mid-market lumber supplier. Ingests POS, inventory, and financial data into a unified warehouse, then layers a natural language query interface on top.",
    tags: ["dbt", "AWS", "LangChain", "Next.js"],
    status: "In Progress" as const,
    href: "/work",
  },
] as const;

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="max-w-content mx-auto px-6 pt-24 pb-20">
        <SectionLabel>Data Engineering & AI Leadership</SectionLabel>

        <h1 className="text-4xl md:text-5xl font-semibold text-ink leading-tight tracking-tight text-balance mb-6">
          I build teams, platforms, and culture at scale.
        </h1>

        <p className="text-lg text-ink-muted leading-relaxed mb-4">
          Senior Data Engineering Leader at Amazon Alexa AI, where I own the
          data engineering function for a 250+ person organization processing
          1.2PB+ daily. My career has been defined by one pattern: walk into
          complexity, build order, and grow people along the way.
        </p>
        <p className="text-lg text-ink-muted leading-relaxed mb-8">
          I also work with mid-market businesses to build the analytics
          infrastructure they need to make decisions from their operational
          data. Not dashboards. Platforms.
        </p>

        <div className="flex flex-wrap gap-3">
          <Button href="/services">Work with me</Button>
          <Button href="/work" variant="secondary">
            See the work
          </Button>
        </div>
      </section>

      {/* Credential anchors */}
      <section className="bg-surface-1 border-y border-surface-3">
        <div className="max-w-wide mx-auto px-6 py-10 grid grid-cols-3 gap-6 text-center">
          {CREDENTIALS.map(({ value, label }) => (
            <div key={value}>
              <p className="text-3xl font-semibold text-ink">{value}</p>
              <p className="text-sm text-ink-muted mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* What I do */}
      <section className="max-w-content mx-auto px-6 py-20">
        <SectionLabel>What I do</SectionLabel>
        <h2 className="text-2xl font-semibold text-ink mb-6">
          Two tracks. One through-line.
        </h2>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="border border-surface-3 rounded-xl p-6">
            <p className="text-xs font-semibold tracking-widest uppercase text-ink-subtle mb-3">
              Enterprise
            </p>
            <h3 className="text-lg font-semibold text-ink mb-3">
              Scaling AI data infrastructure
            </h3>
            <p className="text-ink-muted text-sm leading-relaxed">
              At Amazon, I architect the data systems that Alexa AI trains on,
              evaluates with, and ships from: distributed pipelines, ML feature
              infrastructure, privacy-compliant data availability, and agentic
              AI readiness at 1.2PB+ daily volume.
            </p>
          </div>

          <div className="border border-surface-3 rounded-xl p-6">
            <p className="text-xs font-semibold tracking-widest uppercase text-ink-subtle mb-3">
              Consulting
            </p>
            <h3 className="text-lg font-semibold text-ink mb-3">
              Analytics platforms for mid-market businesses
            </h3>
            <p className="text-ink-muted text-sm leading-relaxed">
              I help businesses in building materials, field services, and local
              distribution connect their operational data and build analytics
              platforms they can use, from correct data models to natural
              language querying.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-8">
          {THEMES.map((theme) => (
            <Tag key={theme} label={theme} />
          ))}
        </div>
      </section>

      {/* Portfolio preview */}
      <section className="bg-surface-1 border-y border-surface-3">
        <div className="max-w-content mx-auto px-6 py-20">
          <SectionLabel>Work</SectionLabel>
          <h2 className="text-2xl font-semibold text-ink mb-8">
            Current portfolio
          </h2>

          {PORTFOLIO_PREVIEW.map((project) => (
            <Link
              key={project.title}
              href={project.href}
              className="block border border-surface-3 bg-white rounded-xl p-6 hover:border-accent transition-colors group"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <h3 className="text-base font-semibold text-ink group-hover:text-accent transition-colors">
                  {project.title}
                </h3>
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
                  {project.status}
                </span>
              </div>
              <p className="text-sm text-ink-muted leading-relaxed mb-4">
                {project.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <Tag key={tag} label={tag} />
                ))}
              </div>
            </Link>
          ))}

          <p className="text-sm text-ink-subtle mt-6">
            More projects shipping in 2026.{" "}
            <Link href="/work" className="text-accent hover:underline">
              See full portfolio
            </Link>
          </p>
        </div>
      </section>

      {/* Consulting CTA */}
      <section className="max-w-content mx-auto px-6 py-20">
        <SectionLabel>Analytics Consulting</SectionLabel>
        <h2 className="text-2xl font-semibold text-ink mb-4">
          Your business has the data. The problem is using it.
        </h2>
        <p className="text-ink-muted leading-relaxed mb-8 max-w-prose">
          Most businesses your size have years of data sitting in spreadsheets,
          POS systems, and accounting tools with no way to connect it, model it
          correctly, or act on it. I build that platform. End-to-end,
          production-grade, and yours to own.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button href="/services">See what I offer</Button>
          <Button href="/contact" variant="secondary">
            Start a conversation
          </Button>
        </div>
      </section>
    </>
  );
}
