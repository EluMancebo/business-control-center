import type { ReactNode } from "react";

type PanelBadgeTone = "neutral" | "processing" | "success" | "warning" | "danger";
type PanelBadgeSize = "sm" | "md";

type PanelBadgeProps = {
  children: ReactNode;
  className?: string;
  tone?: PanelBadgeTone;
  size?: PanelBadgeSize;
};

const TONE_CLASS: Record<PanelBadgeTone, string> = {
  neutral:
    "border border-border [background:var(--badge-bg,var(--muted))] [color:var(--badge-fg,var(--muted-foreground))] [border-color:var(--badge-bg,var(--border))]",
  processing:
    "border border-border [background:var(--processing-soft,var(--surface-2,var(--muted)))] [color:var(--processing-foreground,var(--foreground))]",
  success:
    "border border-border [background:var(--success-soft,var(--surface-2,var(--muted)))] [color:var(--success-foreground,var(--foreground))]",
  warning:
    "border border-border [background:var(--warning-soft,var(--surface-2,var(--muted)))] [color:var(--warning-foreground,var(--foreground))]",
  danger:
    "border border-border [background:var(--danger-soft,var(--surface-2,var(--muted)))] [color:var(--danger-foreground,var(--foreground))]",
};

const SIZE_CLASS: Record<PanelBadgeSize, string> = {
  sm: "h-5 px-2 text-[10px]",
  md: "h-6 px-2.5 text-xs",
};

export default function PanelBadge({
  children,
  className,
  tone = "neutral",
  size = "sm",
}: PanelBadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full font-medium leading-none",
        TONE_CLASS[tone],
        SIZE_CLASS[size],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </span>
  );
}
