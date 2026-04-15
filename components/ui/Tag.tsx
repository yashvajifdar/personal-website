import { cn } from "@/lib/cn";

interface TagProps {
  label: string;
  className?: string;
}

export function Tag({ label, className }: TagProps) {
  return (
    <span
      className={cn(
        "inline-block text-xs font-medium px-2.5 py-1 rounded-full bg-surface-2 text-ink-muted",
        className
      )}
    >
      {label}
    </span>
  );
}
