import type { Metadata } from "next";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Tag } from "@/components/ui/Tag";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Work",
  description:
    "Portfolio of data engineering and AI projects: enterprise-scale data platforms and operational analytics for mid-market businesses.",
};

type ProjectStatus = "In Progress" | "Complete" | "Upcoming";

interface Project {
  title: string;
  category: "Consulting Demo" | "Enterprise" | "Research";
  description: string;
  detail: string;
  tags: string[];
  status: ProjectStatus;
  href?: string;
}

const STATUS_STYLES: Record<ProjectStatus, string> = {
  "In Progress": "bg-amber-50 text-amber-700 border-amber-200",
  Complete: "bg-green-50 text-green-700 border-green-200",
  Upcoming: "bg-surface-2 text-ink-subtle border-surface-3",
};

const PROJECTS: Project[] = [
  {
    title: "Lumber AI Analytics",
    category: "Consulting Demo",
    description:
      "End-to-end operational analytics platform for a mid-market lumber supplier.",
    detail:
      "Ingests data from POS, inventory management, and QuickBooks into a unified data warehouse on AWS. A dbt-modeled semantic layer drives dashboards covering margin by product line, inventory turnover, customer behavior, and sales rep performance. A LangChain-powered query layer enables natural language querying against the semantic model, not the raw tables.",
    tags: ["dbt", "BigQuery", "LangChain", "Next.js", "Python", "TypeScript"],
    status: "In Progress",
  },
  {
    title: "Enterprise Agentic AI Readiness",
    category: "Research",
    description:
      "Co-authored case study with MIT Sloan MBA candidates and Jackfruit.ai researchers.",
    detail:
      "A generalized framework for evaluating enterprise readiness for agentic AI workloads. Covers data architecture requirements, LLM evaluation and observability, and privacy-compliant AI deployment. Targeting publication through MIT Sloan, Jackfruit.ai, and Kodi Connect channels.",
    tags: [
      "Agentic AI",
      "Enterprise Architecture",
      "LLM Evaluation",
      "Privacy",
    ],
    status: "In Progress",
  },
];

export default function WorkPage() {
  return (
    <div className="max-w-content mx-auto px-6 pt-20 pb-24">
      <SectionLabel>Portfolio</SectionLabel>
      <h1 className="text-4xl font-semibold text-ink leading-tight tracking-tight mb-4">
        Real systems. Real problems.
      </h1>
      <p className="text-lg text-ink-muted leading-relaxed mb-16">
        I build projects to demonstrate what I actually do. Not tutorials, not
        toy examples. Every project here is designed to solve a real business
        problem and show the full stack.
      </p>

      {/* Project list */}
      <div className="space-y-8">
        {PROJECTS.map((project) => (
          <article
            key={project.title}
            className="border border-surface-3 rounded-xl p-6 bg-white"
          >
            <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
              <div>
                <p className="text-xs font-semibold tracking-widest uppercase text-ink-subtle mb-1">
                  {project.category}
                </p>
                <h2 className="text-lg font-semibold text-ink">
                  {project.title}
                </h2>
              </div>
              <span
                className={`text-xs font-medium px-2.5 py-1 rounded-full border ${STATUS_STYLES[project.status]}`}
              >
                {project.status}
              </span>
            </div>

            <p className="text-sm font-medium text-ink mb-2">
              {project.description}
            </p>
            <p className="text-sm text-ink-muted leading-relaxed mb-5">
              {project.detail}
            </p>

            <div className="flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <Tag key={tag} label={tag} />
              ))}
            </div>
          </article>
        ))}
      </div>

      {/* What's coming */}
      <div className="mt-16 border-t border-surface-3 pt-12">
        <SectionLabel>Roadmap</SectionLabel>
        <h2 className="text-2xl font-semibold text-ink mb-4">
          2–3 public projects by mid-2026
        </h2>
        <p className="text-ink-muted leading-relaxed mb-8">
          The goal is to have concrete, working systems across multiple
          consulting verticals, plus published thought leadership anchored in
          the MIT research collaboration.
        </p>
        <Button href="/contact" variant="secondary">
          Interested in being an early client?
        </Button>
      </div>
    </div>
  );
}
