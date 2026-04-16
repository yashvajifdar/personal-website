import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Tag } from "@/components/ui/Tag";

export const metadata: Metadata = {
  title: "Yash Vajifdar — Data Engineering & AI",
  description:
    "Senior data engineering leader at Amazon Alexa AI. Building AI infrastructure at scale and analytics platforms for mid-market businesses.",
};

const CREDENTIALS = [
  { value: "1.2PB+", label: "processed daily" },
  { value: "250+", label: "person org" },
  { value: "8+ yrs", label: "in engineering" },
] as const;

const PROJECTS = [
  {
    title: "Lumber AI Analytics",
    category: "Consulting Demo",
    description:
      "Operational analytics platform for a mid-market building supply company. Natural language querying over a trusted metrics layer — no SQL, no dashboards to learn.",
    tags: ["Python", "Anthropic", "SQLite", "Streamlit"],
    status: "Live",
    statusStyle: "bg-green-50 text-green-700 border-green-200",
    href: "/work",
  },
  {
    title: "Enterprise Agentic AI Readiness",
    category: "Research · MIT x Jackfruit.ai",
    description:
      "Co-authored framework for enterprise agentic AI readiness with MIT Sloan MBA candidates. Covers data architecture, LLM evaluation, and privacy-compliant deployment.",
    tags: ["Agentic AI", "LLM Evaluation", "Enterprise Architecture"],
    status: "In Progress",
    statusStyle: "bg-amber-50 text-amber-700 border-amber-200",
    href: "/work",
  },
] as const;

// LinkedIn SVG icon — inline to avoid adding an icon library dependency
function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

export default function HomePage() {
  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="max-w-content mx-auto px-6 pt-20 pb-16 text-center">

        {/* Profile photo — add your photo to /public/profile.jpg */}
        <div className="flex justify-center mb-6">
          <Image
            src="/profile.jpg"
            alt="Yash Vajifdar"
            width={96}
            height={96}
            className="rounded-full ring-2 ring-surface-3 object-cover"
            priority
          />
        </div>

        <h1 className="text-4xl md:text-5xl font-semibold text-ink tracking-tight mb-2">
          Yash Vajifdar
        </h1>

        <p className="text-base text-ink-muted mb-4">
          Senior Data Engineering Leader ·{" "}
          <span className="text-ink font-medium">Amazon Alexa AI</span>
        </p>

        {/* Social links */}
        <div className="flex justify-center gap-4 mb-8">
          <a
            href="https://linkedin.com/in/yash-vajifdar/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-ink-muted hover:text-accent transition-colors"
            aria-label="LinkedIn profile"
          >
            <LinkedInIcon className="w-4 h-4" />
            <span>LinkedIn</span>
          </a>
        </div>

        <p className="text-lg text-ink-muted leading-relaxed max-w-prose mx-auto">
          I build data platforms and AI infrastructure at scale — and help
          mid-market businesses turn their operational data into decisions.
        </p>
      </section>

      {/* ── Two-path fork ─────────────────────────────────────────────── */}
      <section className="max-w-wide mx-auto px-6 pb-20">
        <p className="text-xs font-semibold tracking-widest uppercase text-ink-subtle text-center mb-6">
          What brings you here?
        </p>

        <div className="grid md:grid-cols-2 gap-5">
          {/* Path 1 — Hiring manager / recruiter */}
          <Link
            href="/about"
            className="group border border-surface-3 rounded-2xl p-8 bg-white hover:border-accent hover:shadow-sm transition-all"
          >
            <p className="text-xs font-semibold tracking-widest uppercase text-ink-subtle mb-3">
              Enterprise
            </p>
            <h2 className="text-xl font-semibold text-ink mb-3 group-hover:text-accent transition-colors">
              Looking for a technical leader?
            </h2>
            <p className="text-sm text-ink-muted leading-relaxed mb-6">
              Director-level data engineering and AI infrastructure leadership.
              Built and scaled the data platform for Alexa AI — 1.2PB+ daily,
              250+ person org, petabyte-scale pipelines.
            </p>
            <span className="text-sm font-medium text-accent">
              See my background →
            </span>
          </Link>

          {/* Path 2 — Consulting prospect */}
          <Link
            href="/services"
            className="group border border-surface-3 rounded-2xl p-8 bg-white hover:border-accent hover:shadow-sm transition-all"
          >
            <p className="text-xs font-semibold tracking-widest uppercase text-ink-subtle mb-3">
              Consulting
            </p>
            <h2 className="text-xl font-semibold text-ink mb-3 group-hover:text-accent transition-colors">
              Need to make sense of your data?
            </h2>
            <p className="text-sm text-ink-muted leading-relaxed mb-6">
              I help building supply, field services, and distribution
              businesses connect their operational data and build analytics
              platforms they can actually use.
            </p>
            <span className="text-sm font-medium text-accent">
              See what I offer →
            </span>
          </Link>
        </div>
      </section>

      {/* ── Credential strip ──────────────────────────────────────────── */}
      <section className="border-y border-surface-3 bg-surface-1">
        <div className="max-w-wide mx-auto px-6 py-8 grid grid-cols-3 gap-6 text-center">
          {CREDENTIALS.map(({ value, label }) => (
            <div key={value}>
              <p className="text-2xl font-semibold text-ink">{value}</p>
              <p className="text-xs text-ink-muted mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Featured work ─────────────────────────────────────────────── */}
      <section className="max-w-content mx-auto px-6 py-20">
        <p className="text-xs font-semibold tracking-widest uppercase text-ink-subtle mb-2">
          Work
        </p>
        <h2 className="text-2xl font-semibold text-ink mb-8">
          What I've been building
        </h2>

        <div className="space-y-5">
          {PROJECTS.map((project) => (
            <Link
              key={project.title}
              href={project.href}
              className="block border border-surface-3 rounded-xl p-6 bg-white hover:border-accent transition-colors group"
            >
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <p className="text-xs font-semibold tracking-widest uppercase text-ink-subtle mb-1">
                    {project.category}
                  </p>
                  <h3 className="text-base font-semibold text-ink group-hover:text-accent transition-colors">
                    {project.title}
                  </h3>
                </div>
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full border shrink-0 ${project.statusStyle}`}
                >
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
        </div>

        <p className="text-sm text-ink-subtle mt-6">
          <Link href="/work" className="text-accent hover:underline">
            See full portfolio →
          </Link>
        </p>
      </section>

      {/* ── Writing teaser ────────────────────────────────────────────── */}
      <section className="border-t border-surface-3 bg-surface-1">
        <div className="max-w-content mx-auto px-6 py-12 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-base font-semibold text-ink mb-1">
              Thinking in public
            </p>
            <p className="text-sm text-ink-muted">
              Writing on data engineering, agentic AI, and building analytics
              platforms. First piece publishing summer 2026.
            </p>
          </div>
          <Button href="/writing" variant="secondary">
            Browse writing
          </Button>
        </div>
      </section>
    </>
  );
}
