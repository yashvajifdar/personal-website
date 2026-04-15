import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getAllArticles, getArticle } from "@/lib/articles";
import { Tag } from "@/components/ui/Tag";

interface PageProps {
  // Next.js 15+ passes params as a Promise
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllArticles().map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return {};
  return {
    title: article.title,
    description: article.description,
  };
}

// Must be async — next-mdx-remote v6 RSC renders asynchronously
export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  return (
    <article className="max-w-content mx-auto px-6 pt-16 pb-24">
      {/* Breadcrumb */}
      <nav className="mb-8">
        <Link
          href="/writing"
          className="text-sm text-ink-muted hover:text-ink transition-colors"
        >
          ← Writing
        </Link>
      </nav>

      {/* Header */}
      <header className="mb-12">
        {article.publication && (
          <p className="text-xs font-semibold tracking-widest uppercase text-accent mb-3">
            {article.publication}
          </p>
        )}
        <h1 className="text-3xl md:text-4xl font-semibold text-ink leading-tight tracking-tight mb-4 text-balance">
          {article.title}
        </h1>
        <div className="flex flex-wrap items-center gap-3 text-xs text-ink-subtle mb-6">
          <time dateTime={article.date}>
            {new Date(article.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
          <span>·</span>
          <span>{article.readingTime}</span>
          {article.coAuthors && article.coAuthors.length > 0 && (
            <>
              <span>·</span>
              <span>With {article.coAuthors.join(", ")}</span>
            </>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {article.tags.map((tag) => (
            <Tag key={tag} label={tag} />
          ))}
        </div>
      </header>

      {/* Body */}
      <div className="prose prose-slate max-w-none">
        <MDXRemote source={article.content} />
      </div>

      {/* Footer */}
      <footer className="mt-16 pt-8 border-t border-surface-3">
        <p className="text-sm text-ink-muted">
          Thoughts?{" "}
          <a
            href="https://linkedin.com/in/yash-vajifdar/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline"
          >
            Find me on LinkedIn
          </a>
          .
        </p>
      </footer>
    </article>
  );
}
