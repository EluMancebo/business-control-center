import type { ReactNode } from "react";

type PanelCardVariant = "default" | "task";

type PanelCardProps = {
  children: ReactNode;
  className?: string;
  variant?: PanelCardVariant;
};

const VARIANT_CLASS: Record<PanelCardVariant, string> = {
  default:
    "rounded-xl border border-border p-6 text-card-foreground shadow-sm [background:var(--surface-2,var(--card))] [color:var(--card-foreground,var(--foreground))]",
  task:
    "rounded-xl border border-border p-6 text-card-foreground shadow-sm ring-1 ring-border/45 [background:var(--surface-3,var(--card))] [color:var(--card-foreground,var(--foreground))]",
};

export default function PanelCard({ children, className, variant = "default" }: PanelCardProps) {
  return (
    <section
      className={[
        VARIANT_CLASS[variant],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </section>
  );
}
