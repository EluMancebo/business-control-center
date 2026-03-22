import type { ReactNode } from "react";

type PanelCardProps = {
  children: ReactNode;
  className?: string;
};

export default function PanelCard({ children, className }: PanelCardProps) {
  return (
    <section
      className={[
        "rounded-xl border border-border p-6 text-card-foreground shadow-sm [background:var(--surface-2,var(--card))] [color:var(--card-foreground,var(--foreground))]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </section>
  );
}
