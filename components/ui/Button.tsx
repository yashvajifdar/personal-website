import { cn } from "@/lib/cn";
import Link from "next/link";

type Variant = "primary" | "secondary" | "ghost";

interface ButtonProps {
  variant?: Variant;
  href?: string;
  external?: boolean;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const variantStyles: Record<Variant, string> = {
  primary:
    "bg-accent text-white hover:bg-accent-hover focus-visible:ring-accent",
  secondary:
    "border border-surface-3 text-ink hover:bg-surface-1 focus-visible:ring-ink",
  ghost: "text-accent hover:underline focus-visible:ring-accent",
};

const base =
  "inline-flex items-center gap-2 text-sm font-medium rounded-md px-5 py-2.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50";

export function Button({
  variant = "primary",
  href,
  external,
  children,
  className,
  onClick,
}: ButtonProps) {
  const styles = cn(base, variantStyles[variant], className);

  if (href) {
    return external ? (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={styles}
      >
        {children}
      </a>
    ) : (
      <Link href={href} className={styles}>
        {children}
      </Link>
    );
  }

  return (
    <button className={styles} onClick={onClick}>
      {children}
    </button>
  );
}
