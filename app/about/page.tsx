import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { SectionLabel } from "@/components/ui/SectionLabel";

export const metadata: Metadata = {
  title: "About",
  description:
    "Senior data engineering leader who builds teams, platforms, and culture at scale. Currently at Amazon Alexa AI, architecting AI infrastructure at 1.2PB+ daily.",
};

const PRINCIPLES = [
  {
    title: "The data model is the product",
    body: "AI and dashboards are interfaces. If the underlying model is wrong, everything built on top is confidently wrong.",
  },
  {
    title: "Privacy and security are architecture decisions",
    body: "Access controls, data classification, and compliance aren't post-launch fixes. They're constraints you design around from day one.",
  },
  {
    title: "Modular by design",
    body: "Every component must be replaceable without rewriting the system around it: cloud provider, storage layer, AI model, data source. Monoliths create dependency. Modularity creates resilience.",
  },
  {
    title: "Operationally owned, not just shipped",
    body: "Monitoring, alerting, automated recovery, and runbooks aren't optional. A platform you can't operate alone isn't finished.",
  },
  {
    title: "Test before you trust",
    body: "Unit tests, integration tests, automated rollback, and CI/CD aren't process overhead. They're the feedback loop that makes fast iteration safe, for engineers and AI agents alike.",
  },
  {
    title: "Institutional knowledge belongs in the system",
    body: "Good platforms reduce dependency on the person who built them. Documentation, code standards, and shared engineering sessions are infrastructure, not overhead.",
  },
] as const;

interface CareerEntry {
  company: string;
  role: string;
  period: string;
  story: string;
  outcomes: readonly string[];
}

const CAREER: readonly CareerEntry[] = [
  {
    company: "Amazon — Alexa AI",
    role: "Senior Data Engineering Leader",
    period: "June 2022 — Present",
    story:
      "When I got to Amazon, I chose Alexa AI. Not just the company. That team specifically. The Iron Man Jarvis vision had been in my head for years: an always-on AI that knows you, learns your habits, anticipates what you need. Alexa was the closest real version of it. As the data engineering leader for a 250+ person org, every infrastructure decision I made touched model training, A/B testing, and executive reporting simultaneously. In the Proactive org, that was the single source of truth pipeline for Alexa's personalization: when Alexa tells you a Taylor Swift album drops tonight or the Patriots game is on Prime Video, it's drawing on engagement signals from Echo, mobile, and Fire TV unified into one layer. When the team moved under AIDo, the work shifted to evaluation infrastructure: measuring whether Alexa+ regresses across 20+ behavioral quality dimensions as prompts and models change, with a dedicated LLM Judge owning each metric.",
    outcomes: [
      "Built and scaled a petabyte-scale data platform spanning interests, affinities, engagement, feedback, and inferencing data across Classic Alexa and Alexa+, orchestrating 300+ Spark jobs processing 1.2PB+ daily",
      "Led cross-org curtailment automation across 6 teams, cutting regression detection from 30 days to 4–5 days",
      "Founded the Data Engineering Exchange, now active across 12+ teams across AGI",
      "Led Director and VP-level weekly and monthly business reviews, surfacing trends, anomalies, root cause analysis, and next steps via QuickSight and Tableau",
      "100% DMA, GDPR, and COPPA compliance across all pipelines in 16 locales",
    ],
  },
  {
    company: "SquareTrade (an Allstate Company)",
    role: "Lead Data Engineer",
    period: "June 2021 — June 2022",
    story:
      "SquareTrade sells extended warranties on electronics, appliances, and furniture through partners like Walmart and SoftBank. The data problem was more layered than it looked. Warranty claims had to route through repair-or-replace logic, vendor inventory had to reconcile, and the financial picture was unusual: warranty revenue doesn't legally belong to SquareTrade until each policy expires, with Allstate holding it in the interim. I owned the claims processing, inventory, and AP/AR reconciliation pipelines, and built two engineering teams from scratch in the twelve months I was there.",
    outcomes: [
      "Built two engineering teams from the ground up, growing capacity 150% in 12 months",
      "Led transition from monolithic to event-driven architecture across the warranty supply chain",
      "Reduced environment deployment time from one week to hours through CI/CD automation",
    ],
  },
  {
    company: "Embrace Home Loans",
    role: "Data Engineer",
    period: "November 2020 — June 2021",
    story:
      "Embrace Home Loans provides mortgages and refinancing for homeowners and businesses. Marketing and sales were running campaigns across multiple tools with no way to see the full picture: a lead would come in through HubSpot, get nurtured through email, and either convert through an inbound call or a sales follow-up, but that entire journey lived in disconnected systems. I built the event-driven architecture that tied it together, collecting data from internal tools, feeding it into HubSpot, then capturing downstream engagement: email opens, clicks, views, and whether the person ultimately became a customer. Snowflake served as the central data layer. The funnel analytics on top gave marketing and sales a closed loop they didn't have before.",
    outcomes: [
      "Built end-to-end marketing funnel analytics from lead capture to loan conversion",
      "Architected event-driven integrations across HubSpot, Empower, Velocify, and Snowflake using Boomi",
      "Increased campaign optimization efficiency by 40% through closed-loop reporting dashboards",
    ],
  },
  {
    company: "Retail Solutions (A Circana Company)",
    role: "Data Engineer",
    period: "November 2017 — November 2020",
    story:
      "Retail Solutions sits between retailers and CPG brands, ingesting POS, inventory, and distribution data and serving analytics back to companies like Pepsi, Coca-Cola, Kraft, Walmart, and Target as a managed service. My role was building the pipelines that made that work, including an alerting system for on-shelf availability and distribution voids: the signal that tells a retailer a product has disappeared from the shelf before a customer notices it. Three years in, I flew to Pune to build and train the offshore team that would own these systems going forward.",
    outcomes: [
      "Improved alert accuracy from below 20% to over 60%, directly driving client sales",
      "Delivered dashboards reducing inventory inefficiencies by 25% across major CPG clients",
      "Built and trained a 6-person offshore team through a 3-week on-site engagement in Pune",
    ],
  },
];

const PARTNERSHIPS = [
  {
    org: "MIT x Jackfruit.ai",
    role: "Research Collaborator",
    description:
      "Co-authoring a case study on enterprise agentic AI readiness with MIT Sloan MBA candidates and Jackfruit.ai researchers. Focus areas: data architecture for agentic workloads, LLM evaluation, and privacy-compliant AI deployment.",
    status: "Active — publishing summer 2026",
  },
  {
    org: "Kodi Connect",
    role: "Advisory Board Member",
    description:
      "Named advisory board member for a national CIO and IT Executive Networking organization. Contributing content and serving as city ambassador for the Boston market.",
    status: "Active — April 2026",
  },
] as const;

const COMMUNITY = [
  {
    org: "The Leukemia & Lymphoma Society",
    role: "Leadership Committee Member",
    description:
      "Led the 10-week 2025 Rhode Island Visionaries of the Year campaign alongside LLS staff, raising over $300K for blood cancer research and patient support. Recruited and mentored candidates, shaped campaign strategy, and supported community fundraising events.",
    status: "Active — Oct 2024",
  },
  {
    org: "A Wish Come True",
    role: "Emerging Leaders Program — Founding Member",
    description:
      "Founding member of the inaugural Emerging Leaders Program at Rhode Island's oldest wish-granting organization. Supporting fundraising and events for children with life-threatening illnesses across RI, Southeastern MA, and Eastern CT.",
    status: "Active — Jan 2026",
  },
  {
    org: "University of Rhode Island",
    role: "Career Panelist",
    description:
      "Recurring career panels and mentorship events for URI students. Focused on academic planning, skill-building, and the transition into professional roles in tech and data.",
    status: "Active — Apr 2022",
  },
] as const;

export default function AboutPage() {
  return (
    <div className="max-w-content mx-auto px-6 pt-20 pb-24">

      <SectionLabel>About</SectionLabel>
      <h1 className="text-4xl font-semibold text-ink leading-tight tracking-tight mb-6">
        I build teams, platforms, and culture at scale.
      </h1>

      {/* Primary bio — adapted from LinkedIn, serves both audiences */}
      <p className="text-lg text-ink-muted leading-relaxed mb-5">
        My career has been defined by a pattern: walk into complexity, build
        order, and grow people along the way. At Amazon, that meant leading
        cross-organizational initiatives spanning 6+ organizations, founding the
        Data Engineering Exchange to drive engineering culture across AGI,
        mentoring engineers from intern to full-time conversion, and building a
        Toronto-based team from scratch post-reorg.
      </p>
      <p className="text-lg text-ink-muted leading-relaxed mb-5">
        Before Amazon, at SquareTrade I built two engineering teams from the
        ground up and grew capacity 150% in twelve months. At Circana I flew to
        Pune to train a six-person offshore team and coached distributed teams
        across four countries as Scrum Master.
      </p>
      <p className="text-lg text-ink-muted leading-relaxed mb-12">
        Outside of Amazon, I work with mid-market businesses to build the
        analytics infrastructure they need to make decisions from their
        operational data. The problems are different in scale. The discipline is
        the same.
      </p>

      {/* What drives the work */}
      <div className="bg-surface-1 border border-surface-3 rounded-xl p-6 mb-16">
        <p className="text-sm font-semibold text-ink mb-3">What drives this work</p>
        <p className="text-sm text-ink-muted leading-relaxed">
          I got into data because I read that it was the new crude oil and
          believed it. The draw wasn't technology for its own sake. Most
          businesses sit on years of operational data and make decisions blind
          because they don't have the infrastructure to use it, and most don't
          have the resources to build it. The goal has always been to close that
          gap: building systems that work as an always-on intelligence layer,
          making a business continuously smarter, not just producing cleaner
          reports.
        </p>
      </div>

      {/* Principles */}
      <SectionLabel>How I work</SectionLabel>
      <h2 className="text-2xl font-semibold text-ink mb-8">
        Principles that show up in the work
      </h2>

      <div className="grid md:grid-cols-2 gap-6 mb-16">
        {PRINCIPLES.map(({ title, body }) => (
          <div
            key={title}
            className="border border-surface-3 rounded-xl p-5 bg-surface-1"
          >
            <h3 className="text-sm font-semibold text-ink mb-2">{title}</h3>
            <p className="text-sm text-ink-muted leading-relaxed">{body}</p>
          </div>
        ))}
      </div>

      {/* Career detail */}
      <SectionLabel>Career</SectionLabel>
      <h2 className="text-2xl font-semibold text-ink mb-8">
        Where the experience comes from
      </h2>

      <div className="space-y-8 mb-16">
        {CAREER.map(({ company, role, period, story, outcomes }) => (
          <div key={company} className="border border-surface-3 rounded-xl p-6">
            <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
              <p className="text-base font-semibold text-ink">{company}</p>
              <span className="text-xs text-ink-subtle">{period}</span>
            </div>
            <p className="text-sm text-ink-subtle mb-4">{role}</p>
            <p className="text-sm text-ink-muted leading-relaxed mb-5">{story}</p>
            <ul className="space-y-2">
              {outcomes.map((o) => (
                <li key={o} className="flex items-start gap-3 text-sm text-ink-muted">
                  <span className="text-accent shrink-0 mt-0.5">—</span>
                  <span>{o}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Partnerships */}
      <SectionLabel>Current work</SectionLabel>
      <h2 className="text-2xl font-semibold text-ink mb-8">
        Partnerships and research
      </h2>

      <div className="space-y-6 mb-16">
        {PARTNERSHIPS.map(({ org, role, description, status }) => (
          <div key={org} className="border border-surface-3 rounded-xl p-6">
            <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
              <div>
                <h3 className="text-base font-semibold text-ink">{org}</h3>
                <p className="text-sm text-ink-muted">{role}</p>
              </div>
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-200">
                {status}
              </span>
            </div>
            <p className="text-sm text-ink-muted leading-relaxed">
              {description}
            </p>
          </div>
        ))}
      </div>

      {/* Community */}
      <SectionLabel>Community</SectionLabel>
      <h2 className="text-2xl font-semibold text-ink mb-8">
        Outside of work
      </h2>

      <div className="space-y-6 mb-16">
        {COMMUNITY.map(({ org, role, description, status }) => (
          <div key={org} className="border border-surface-3 rounded-xl p-6">
            <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
              <div>
                <h3 className="text-base font-semibold text-ink">{org}</h3>
                <p className="text-sm text-ink-muted">{role}</p>
              </div>
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-200">
                {status}
              </span>
            </div>
            <p className="text-sm text-ink-muted leading-relaxed">
              {description}
            </p>
          </div>
        ))}
      </div>

      {/* Education */}
      <div className="border-t border-surface-3 pt-10 mb-12">
        <p className="text-sm text-ink-muted">
          Dual BS in Mathematics and Business Entrepreneurial Management,
          University of Rhode Island.
        </p>
      </div>

      {/* CTA */}
      <div className="flex flex-wrap gap-4">
        <Button href="/services">Work with me</Button>
        <Button
          href="https://linkedin.com/in/yash-vajifdar/"
          variant="secondary"
          external
        >
          Connect on LinkedIn
        </Button>
      </div>
    </div>
  );
}
