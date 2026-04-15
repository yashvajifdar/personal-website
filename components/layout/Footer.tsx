import Link from "next/link";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-surface-3 mt-24">
      <div className="max-w-wide mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-ink-subtle">
        <span>© {year} Yash Vajifdar. All rights reserved.</span>
        <nav className="flex items-center gap-6">
          <a
            href="https://linkedin.com/in/yash-vajifdar/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-ink transition-colors"
          >
            LinkedIn
          </a>
          <Link href="/work" className="hover:text-ink transition-colors">
            Work
          </Link>
          <Link href="/services" className="hover:text-ink transition-colors">
            Services
          </Link>
          <Link href="/contact" className="hover:text-ink transition-colors">
            Contact
          </Link>
        </nav>
      </div>
    </footer>
  );
}
