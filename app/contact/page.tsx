import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { SectionLabel } from "@/components/ui/SectionLabel";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch for consulting inquiries, speaking, or recruiting.",
};

export default function ContactPage() {
  return (
    <div className="max-w-content mx-auto px-6 pt-20 pb-24">
      <SectionLabel>Get in touch</SectionLabel>
      <h1 className="text-4xl font-semibold text-ink leading-tight tracking-tight mb-6">
        Let's talk.
      </h1>

      <p className="text-lg text-ink-muted leading-relaxed mb-16">
        I respond within 48 hours. Be direct about what you are looking for.
      </p>

      {/* Two-column contact paths */}
      <div className="grid md:grid-cols-2 gap-6 mb-16">
        {/* Consulting */}
        <div className="border border-surface-3 rounded-xl p-6">
          <p className="text-xs font-semibold tracking-widest uppercase text-ink-subtle mb-3">
            Consulting
          </p>
          <h2 className="text-lg font-semibold text-ink mb-3">
            Analytics platform inquiry
          </h2>
          <p className="text-sm text-ink-muted leading-relaxed mb-6">
            You run a mid-market business and want to discuss what an analytics
            platform would look like for your operation. The first conversation
            is a diagnostic. I will tell you what is realistic and whether it
            makes sense to work together.
          </p>
          <Button
            href={
              "mailto:yash.vajifdar@gmail.com" +
              "?subject=Consulting%20Inquiry" +
              "&body=Hi%20Yash%2C%0D%0A%0D%0A" +
              "ABOUT%20MY%20BUSINESS%0D%0A" +
              "Company%20name%3A%20%0D%0A" +
              "Industry%3A%20%0D%0A" +
              "Approximate%20revenue%20or%20team%20size%3A%20%0D%0A" +
              "Number%20of%20locations%3A%20%0D%0A" +
              "Website%3A%20%0D%0A" +
              "%0D%0A" +
              "CURRENT%20SYSTEMS%0D%0A" +
              "Accounting%20(e.g.%20QuickBooks%2C%20NetSuite)%3A%20%0D%0A" +
              "POS%20%2F%20order%20management%3A%20%0D%0A" +
              "Inventory%3A%20%0D%0A" +
              "CRM%3A%20%0D%0A" +
              "Other%3A%20%0D%0A" +
              "%0D%0A" +
              "WHAT%20I%20AM%20TRYING%20TO%20SOLVE%0D%0A" +
              "The%20question%20I%20wish%20I%20could%20answer%20right%20now%20but%20can%27t%3A%20%0D%0A" +
              "%0D%0A" +
              "How%20we%20report%20today%20(manual%20pulls%2C%20spreadsheets%2C%20BI%20tool%2C%20other)%3A%20%0D%0A" +
              "%0D%0A" +
              "Who%20on%20the%20team%20would%20use%20this%20day%20to%20day%3A%20%0D%0A"
            }
            external
          >
            Email me
          </Button>
        </div>

        {/* Recruiting / professional */}
        <div className="border border-surface-3 rounded-xl p-6">
          <p className="text-xs font-semibold tracking-widest uppercase text-ink-subtle mb-3">
            Recruiting / Professional
          </p>
          <h2 className="text-lg font-semibold text-ink mb-3">
            Director-level opportunities
          </h2>
          <p className="text-sm text-ink-muted leading-relaxed mb-6">
            I am exploring Director of Data Engineering and Director of AI
            Engineering roles at top-tier companies. If you are building
            something at scale and think there is a fit, I am open to the
            conversation.
          </p>
          <Button
            href="https://linkedin.com/in/yash-vajifdar/"
            variant="secondary"
            external
          >
            Connect on LinkedIn
          </Button>
        </div>
      </div>

      {/* Direct contact */}
      <div className="border-t border-surface-3 pt-12">
        <SectionLabel>Direct</SectionLabel>
        <h2 className="text-2xl font-semibold text-ink mb-6">
          Prefer a direct line?
        </h2>
        <div className="space-y-4 text-sm">
          <div className="flex items-center gap-3">
            <span className="text-ink-subtle w-20">Email</span>
            <a
              href="mailto:yash.vajifdar@gmail.com"
              className="text-accent hover:underline"
            >
              yash.vajifdar@gmail.com
            </a>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-ink-subtle w-20">LinkedIn</span>
            <a
              href="https://linkedin.com/in/yash-vajifdar/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              linkedin.com/in/yash-vajifdar
            </a>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-ink-subtle w-20">Location</span>
            <span className="text-ink-muted">Rhode Island, USA</span>
          </div>
        </div>
      </div>
    </div>
  );
}
