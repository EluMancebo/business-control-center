import type { ReactNode } from "react";

type PanelCardVariant = "default" | "interactive" | "task" | "overlay";

type PanelCardProps = {
  children: ReactNode;
  className?: string;
  variant?: PanelCardVariant;
};

const VARIANT_CLASS: Record<PanelCardVariant, string> = {
  default:
    "rounded-xl border border-border p-6 text-card-foreground [box-shadow:var(--elevation-base,var(--panel-shadow-1))] [background:var(--surface-2,var(--card))] [color:var(--card-foreground,var(--foreground))]",
  interactive:
    "rounded-xl border border-border p-6 text-card-foreground transition-[box-shadow,background-color] duration-150 [box-shadow:var(--elevation-base,var(--panel-shadow-1))] hover:[box-shadow:var(--elevation-interactive,var(--panel-shadow-2))] [background:var(--surface-2,var(--card))] [color:var(--card-foreground,var(--foreground))]",
  task:
    "rounded-xl border border-border p-6 text-card-foreground ring-1 ring-border/45 [box-shadow:var(--elevation-task,var(--panel-shadow-2))] [background:var(--task-surface,var(--surface-3,var(--card)))] [color:var(--task-surface-foreground,var(--card-foreground,var(--foreground)))]",
  overlay:
    "rounded-xl border border-border p-6 text-card-foreground [box-shadow:var(--elevation-overlay,var(--panel-shadow-3))] [background:var(--surface-3,var(--card))] [color:var(--card-foreground,var(--foreground))]",
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
