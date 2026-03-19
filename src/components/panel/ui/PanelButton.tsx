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
    "border border-transparent bg-primary text-primary-foreground hover:opacity-90",
  secondary:
    "border border-border bg-background text-foreground hover:bg-muted",
  ghost:
    "border border-transparent bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground",
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
