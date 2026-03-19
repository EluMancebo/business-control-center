import type { ReactNode } from "react";

type PanelCardProps = {
  children: ReactNode;
  className?: string;
};

export default function PanelCard({ children, className }: PanelCardProps) {
  return (
    <section
      className={[
        "rounded-xl border border-border bg-card p-6 text-card-foreground shadow-sm",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </section>
  );
}
