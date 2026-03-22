import type { ReactNode } from "react";

type PanelActionBarProps = {
  children: ReactNode;
  className?: string;
};

export default function PanelActionBar({
  children,
  className,
}: PanelActionBarProps) {
  return (
    <div
      className={[
        "flex flex-wrap items-center gap-2 rounded-xl border border-border p-2 shadow-sm [background:var(--surface-2,var(--card))] [color:var(--foreground,var(--foreground))]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}
