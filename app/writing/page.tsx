import type { Metadata } from "next";
import Link from "next/link";
import { getAllArticles } from "@/lib/articles";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Tag } from "@/components/ui/Tag";

export const metadata: Metadata = {
  title: "Writing",
  description:
    "Practitioner writing on data engineering, agentic AI, analytics platforms, and engineering leadership at scale.",
};

// Articles currently in progress — shown as "coming soon" when not yet published
const UPCOMING = [
  {
    title: "Enterprise Agentic AI Readiness: A Framework",
    description:
      "Co-authored with MIT Sloan MBA candidates and Jackfruit.ai researchers. Covers data architecture for agentic workloads, LLM evaluation, and privacy-compliant AI deployment.",
    publication: "MIT x Jackfruit.ai",
    expectedDate: "Summer 2026",
    tags: ["Agentic AI", "Enterprise Architecture", "LLM Evaluation"],
  },
] as const;

export default async function WritingPage() {
  const articles = getAllArticles();
  const hasPublished = articles.length > 0;

  return (
    <div className="max-w-content mx-auto px-6 pt-20 pb-24">
      <SectionLabel>Writing</SectionLabel>
      <h1 className="text-4xl font-semibold text-ink leading-tight tracking-tight mb-4">
        Written from real experience.
      </h1>
      <p className="text-lg text-ink-muted leading-relaxed mb-16">
        I write about what I have actually built and what I have actually seen
        fail. No vendor content. No engagement bait. If you have read something
        here, it is because I have lived it.
      </p>

      {/* Published articles */}
      {hasPublished && (
        <section className="mb-16">
          <SectionLabel>Published</SectionLabel>
          <div className="space-y-6">
            {articles.map((article) => (
              <Link
                key={article.slug}
                href={`/writing/${article.slug}`}
                className="block border border-surface-3 rounded-xl p-6 hover:border-accent transition-colors group"
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h2 className="text-base font-semibold text-ink group-hover:text-accent transition-colors">
                    {article.title}
                  </h2>
                  <span className="text-xs text-ink-subtle shrink-0">
                    {article.readingTime}
                  </span>
                </div>
                {article.publication && (
                  <p className="text-xs font-medium text-accent mb-2">
                    {article.publication}
                  </p>
                )}
                <p className="text-sm text-ink-muted leading-relaxed mb-4">
                  {article.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag) => (
                    <Tag key={tag} label={tag} />
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Upcoming */}
      <section>
        <SectionLabel>In progress</SectionLabel>
        <h2 className="text-2xl font-semibold text-ink mb-6">Coming soon</h2>

        <div className="space-y-6">
          {UPCOMING.map((item) => (
            <div
              key={item.title}
              className="border border-surface-3 rounded-xl p-6 bg-surface-1"
            >
              <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                <h3 className="text-base font-semibold text-ink">
                  {item.title}
                </h3>
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-surface-2 text-ink-subtle border border-surface-3">
                  {item.expectedDate}
                </span>
              </div>
              <p className="text-xs font-medium text-accent mb-3">
                {item.publication}
              </p>
              <p className="text-sm text-ink-muted leading-relaxed mb-4">
                {item.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {item.tags.map((tag) => (
                  <Tag key={tag} label={tag} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* LinkedIn note */}
      <div className="mt-16 border-t border-surface-3 pt-10">
        <p className="text-sm text-ink-muted">
          I write more frequently on LinkedIn: shorter-form takes on data
          engineering, agentic AI, and leadership at scale.{" "}
          <a
            href="https://linkedin.com/in/yash-vajifdar/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline font-medium"
          >
            Follow along →
          </a>
        </p>
      </div>
    </div>
  );
}
