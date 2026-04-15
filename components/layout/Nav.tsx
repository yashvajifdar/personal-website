"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const NAV_LINKS = [
  { href: "/about", label: "About" },
  { href: "/work", label: "Work" },
  { href: "/services", label: "Services" },
  { href: "/writing", label: "Writing" },
  { href: "/contact", label: "Contact" },
] as const;

export function Nav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-surface-3">
      <div className="max-w-wide mx-auto px-6 py-4 flex items-center justify-between">
        {/* Wordmark */}
        <Link
          href="/"
          className="text-ink font-semibold tracking-tight hover:text-accent transition-colors"
        >
          Yash Vajifdar
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map(({ href, label }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "text-sm transition-colors",
                  active
                    ? "text-accent font-medium"
                    : "text-ink-muted hover:text-ink"
                )}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Mobile: simple text links stacked — replace with hamburger if needed later */}
        <nav className="flex md:hidden items-center gap-4">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-xs text-ink-muted hover:text-ink transition-colors"
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
