import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";

type BaseProps = {
  children: ReactNode;
  className?: string;
  variant?: Variant;
};

type PanelButtonAsButtonProps = BaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children"> & {
    href?: undefined;
  };

type PanelButtonAsLinkProps = BaseProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "className" | "children"> & {
    href: string;
  };

type PanelButtonProps = PanelButtonAsButtonProps | PanelButtonAsLinkProps;

const VARIANT_CLASS: Record<Variant, string> = {
  primary:
    "border border-transparent [background:var(--cta-primary,var(--primary))] [color:var(--cta-primary-foreground,var(--primary-foreground))] hover:[background:var(--cta-primary-hover,var(--primary))]",
  secondary:
    "border border-border [background:var(--cta-secondary,var(--background))] [color:var(--cta-secondary-foreground,var(--foreground))] hover:[background:var(--cta-secondary-hover,var(--muted))]",
  ghost:
    "border border-transparent bg-transparent [color:var(--text-subtle,var(--muted-foreground))] hover:[background:var(--surface-2,var(--muted))] hover:[color:var(--link,var(--foreground))]",
};

function buildClassName(variant: Variant, className?: string) {
  return [
    "inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
    "disabled:pointer-events-none disabled:opacity-60",
    VARIANT_CLASS[variant],
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

export default function PanelButton(props: PanelButtonProps) {
  const variant = props.variant ?? "secondary";
  const className = buildClassName(variant, props.className);

  if ("href" in props && typeof props.href === "string") {
    const { children, className: classNameProp, variant: variantProp, href, ...rest } = props;
    void classNameProp;
    void variantProp;
    return (
      <Link href={href} className={className} {...rest}>
        {children}
      </Link>
    );
  }

  const { children, className: classNameProp, variant: variantProp, type, ...rest } = props;
  void classNameProp;
  void variantProp;
  return (
    <button type={type ?? "button"} className={className} {...rest}>
      {children}
    </button>
  );
}
