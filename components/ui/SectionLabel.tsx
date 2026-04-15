import { cn } from "@/lib/cn";

interface SectionLabelProps {
  children: React.ReactNode;
  className?: string;
}

// Small uppercase label above section headings — used consistently across pages
export function SectionLabel({ children, className }: SectionLabelProps) {
  return (
    <p
      className={cn(
        "text-xs font-semibold tracking-widest uppercase text-accent mb-3",
        className
      )}
    >
      {children}
    </p>
  );
}
