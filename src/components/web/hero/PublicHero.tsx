// src/components/web/hero/PublicHero.tsx
"use client";

import { useId, type ChangeEvent, type MouseEvent, type ReactNode } from "react";
import { resolveHeroAppearance } from "./appearance";
import CreatedByMini from "@/components/footer/CreatedByMini";
import type { HeroAppearanceVariant } from "@/lib/web/hero/types";
import type { PublicHeroPayload } from "@/lib/web/hero/publicPayload";

export type BusinessPublic = {
  name?: string;
  slug: string;
  activeHeroVariantKey?: string;
  logoUrl?: string;
  address?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  footerSignature?: string;
};

export type LabHeroPiece =
  | "logo"
  | "headline"
  | "subheadline"
  | "cta-group"
  | "badge"
  | "header-hero"
  | "desktop-nav"
  | "nav-burger"
  | "theme-toggle"
  | "footer-hero"
  | "contact-strip"
  | "animated-signature"
  | "background-media"
  | "overlay-atmosphere";

type PublicHeroProps = {
  data: PublicHeroPayload;
  business?: BusinessPublic;
  mobileMenuStyle?: "opaque" | "integrated";
  forceMobileMenuOpen?: boolean;
  copyWidth?: "narrow" | "normal" | "wide";
  navigationMode?: "auto" | "mobile" | "desktop";
  contentPosition?: "left" | "center-left" | "center" | "right";
  navPosition?: "left" | "center" | "right";
  headlinePosition?: "left" | "center" | "right";
  copyBlockPosition?: "left" | "center-left" | "center" | "right";
  ctaPosition?: "start" | "center" | "end";
  footerPosition?: "left" | "center" | "right";
  visualPosition?: "left" | "center" | "right";
  logoPosition?: "left" | "center" | "right";
  overlayColor?:
    | "blue"
    | "green"
    | "amber"
    | "purple"
    | "smoke"
    | "primary"
    | "secondary"
    | "accent"
    | "neutral"
    | "dark"
    | "none";
  overlayStyleMode?: "gradient" | "solid" | "none";
  backgroundEmphasis?: "low" | "medium" | "high";
  backgroundFit?: "cover" | "contain" | "fill";
  backgroundFocus?: "center" | "top" | "bottom" | "left" | "right";
  labHeadlineTone?:
    | "white"
    | "black"
    | "inverse"
    | "muted-light"
    | "warm-light"
    | "cool-light";
  navTriggerSize?: "sm" | "md" | "lg";
  navTriggerAura?: "none" | "soft" | "strong";
  navTriggerSurface?: "minimal" | "solid" | "glass";
  navTriggerTone?: "inverse" | "primary" | "muted";
  navTriggerHover?: "soft" | "lift" | "glow";
  desktopNavSize?: "sm" | "md" | "lg";
  desktopNavTone?: "inverse" | "primary" | "muted";
  desktopNavSurface?: "minimal" | "solid" | "glass";
  desktopNavHover?: "soft" | "lift" | "glow";
  desktopNavPresence?: "low" | "medium" | "high";
  navOpenBehavior?: "overlay" | "drawer" | "fullscreen";
  navPanelWidth?: "narrow" | "normal" | "wide";
  navPanelOrigin?: "right" | "left" | "center";
  navPanelIncludeLogo?: boolean;
  navPanelStyle?: "solid" | "glass" | "minimal";
  navOverlayDensity?: "low" | "medium" | "high";
  navOverlayStyle?: "tinted" | "neutral" | "none";
  navReadabilityBoost?: "none" | "soft" | "strong";
  navMenuBlockPosition?: "top" | "center" | "bottom";
  navMenuAlignment?: "left" | "center" | "right";
  navMenuItemSize?: "sm" | "md" | "lg";
  navMenuSafeTopOffset?: "tight" | "normal" | "relaxed";
  navMenuSafeSideOffset?: "tight" | "normal" | "relaxed";
  navMenuVerticalSpacing?: "tight" | "normal" | "relaxed";
  navMenuTextTone?: "inverse" | "muted" | "primary";
  headerIntegration?: "integrated" | "separated";
  headerVisualStyle?: "minimal" | "solid" | "glass";
  headerTopSpacing?: "tight" | "normal" | "relaxed";
  headerRelation?: "balanced" | "logo-focus" | "nav-focus";
  headerBandHeight?: "10" | "15" | "20";
  footerIntegration?: "integrated" | "separated";
  footerVisualStyle?: "minimal" | "solid" | "glass";
  footerBandHeight?: "10" | "15" | "20";
  footerDensity?: "compact" | "balanced" | "spacious";
  footerSignatureSeparation?: "tight" | "normal" | "relaxed";
  ctaRegulation?: "balanced" | "primary-focus";
  mobileHeadlineScale?: "compact" | "balanced" | "expressive";
  mobileLogoScale?: "compact" | "balanced" | "expressive";
  gapLogoHeadline?: "tight" | "normal" | "relaxed";
  gapHeadlineSubheadline?: "tight" | "normal" | "relaxed";
  gapTextCta?: "tight" | "normal" | "relaxed";
  gapCtaFooter?: "tight" | "normal" | "relaxed";
  gapFooterDataSignature?: "tight" | "normal" | "relaxed";
  isLabMode?: boolean;
  labSceneOverlayClassName?: string;
  onLabMenuOpenChange?: (open: boolean) => void;
  selectedLabPiece?: LabHeroPiece | null;
  onLabPieceSelect?: (piece: LabHeroPiece) => void;
  showLabLogo?: boolean;
  showLabHeadline?: boolean;
  showLabSubheadline?: boolean;
  showLabCtaGroup?: boolean;
  showLabBadge?: boolean;
  showLabHeaderHero?: boolean;
  showLabNavBurger?: boolean;
  showLabThemeToggle?: boolean;
  showNavLinks?: boolean;
  showLabFooterHero?: boolean;
  showLabContactStrip?: boolean;
  showLabAnimatedSignature?: boolean;
  showLabBackgroundMedia?: boolean;
  showLabOverlayAtmosphere?: boolean;
  themeToggleDefault?: "light" | "dark" | "auto";
  onLabThemeToggleDefaultChange?: (mode: "light" | "dark") => void;
  themeToggleStyle?: "minimal" | "solid" | "glass";
  themeTogglePosition?: "left" | "right";
  labLogoClassName?: string;
  labNavBurgerClassName?: string;
  labThemeToggleClassName?: string;
  labFooterHeroClassName?: string;
  labContactStripClassName?: string;
  labAnimatedSignatureClassName?: string;
  labHeadlineClassName?: string;
  labSubheadlineClassName?: string;
  labCtaGroupClassName?: string;
  labPrimaryCtaClassName?: string;
  labSecondaryCtaClassName?: string;
  showFooterIcons?: boolean;
};

type HeroOverlayColor = NonNullable<PublicHeroProps["overlayColor"]>;
type HeroLabHeadlineTone = NonNullable<PublicHeroProps["labHeadlineTone"]>;
type HeroLabGapLevel = NonNullable<PublicHeroProps["gapLogoHeadline"]>;

const HERO_APPEARANCE_TOKEN_CLASS: Record<HeroAppearanceVariant, string> = {
  transparent:
    "[--hero-overlay-tint-opacity:0.14] [--hero-overlay-no-image-bg:linear-gradient(to_bottom,color-mix(in_oklab,var(--accent,var(--primary))_52%,transparent),color-mix(in_oklab,var(--accent-soft,var(--surface-3,var(--muted)))_46%,transparent),color-mix(in_oklab,var(--accent,var(--primary))_50%,transparent))] [--hero-chrome-surface-bg:color-mix(in_oklab,var(--accent-soft,var(--surface-3,var(--muted)))_8%,transparent)] [--hero-chrome-surface-hover-bg:color-mix(in_oklab,var(--accent,var(--primary))_14%,transparent)] [--hero-frame-surface-bg:color-mix(in_oklab,var(--accent-soft,var(--surface-3,var(--muted)))_4%,transparent)] [--hero-footer-surface-bg:color-mix(in_oklab,var(--accent-soft,var(--surface-3,var(--muted)))_6%,transparent)] [--hero-chrome-surface-border:color-mix(in_oklab,var(--hero-text-inverse)_16%,transparent)]",
  soft:
    "[--hero-overlay-tint-opacity:0.34] [--hero-overlay-no-image-bg:linear-gradient(to_bottom,color-mix(in_oklab,var(--accent,var(--primary))_60%,black),color-mix(in_oklab,var(--accent-soft,var(--surface-3,var(--muted)))_54%,black),color-mix(in_oklab,var(--accent,var(--primary))_62%,black))] [--hero-chrome-surface-bg:color-mix(in_oklab,var(--accent-soft,var(--surface-3,var(--muted)))_14%,transparent)] [--hero-chrome-surface-hover-bg:color-mix(in_oklab,var(--accent,var(--primary))_22%,transparent)] [--hero-frame-surface-bg:color-mix(in_oklab,var(--accent-soft,var(--surface-3,var(--muted)))_10%,transparent)] [--hero-footer-surface-bg:color-mix(in_oklab,var(--accent-soft,var(--surface-3,var(--muted)))_12%,transparent)] [--hero-chrome-surface-border:color-mix(in_oklab,var(--hero-text-inverse)_20%,transparent)]",
  solid:
    "[--hero-overlay-tint-opacity:0.58] [--hero-overlay-no-image-bg:linear-gradient(to_bottom,color-mix(in_oklab,var(--accent,var(--primary))_74%,black),color-mix(in_oklab,var(--accent-soft,var(--surface-3,var(--muted)))_68%,black),color-mix(in_oklab,var(--accent,var(--primary))_76%,black))] [--hero-chrome-surface-bg:color-mix(in_oklab,var(--accent-soft,var(--surface-3,var(--muted)))_44%,black)] [--hero-chrome-surface-hover-bg:color-mix(in_oklab,var(--accent,var(--primary))_56%,black)] [--hero-frame-surface-bg:color-mix(in_oklab,var(--accent-soft,var(--surface-3,var(--muted)))_40%,black)] [--hero-footer-surface-bg:color-mix(in_oklab,var(--accent-soft,var(--surface-3,var(--muted)))_42%,black)] [--hero-chrome-surface-border:color-mix(in_oklab,var(--hero-text-inverse)_28%,transparent)]",
};

const HERO_OVERLAY_GRADIENT_TINT_TOKEN_CLASS: Record<HeroOverlayColor, string> = {
  blue:
    "[--hero-overlay-tint-bg:linear-gradient(140deg,color-mix(in_oklab,var(--processing,var(--accent,var(--primary)))_74%,var(--hero-overlay-strong,var(--foreground))),color-mix(in_oklab,var(--accent-soft,var(--surface-3,var(--muted)))_58%,var(--hero-overlay-strong,var(--foreground)))_50%,color-mix(in_oklab,var(--hero-overlay-strong,var(--foreground))_72%,var(--foreground)))]",
  green:
    "[--hero-overlay-tint-bg:linear-gradient(140deg,color-mix(in_oklab,var(--success,var(--accent,var(--primary)))_74%,var(--hero-overlay-strong,var(--foreground))),color-mix(in_oklab,var(--accent-soft,var(--surface-3,var(--muted)))_58%,var(--hero-overlay-strong,var(--foreground)))_50%,color-mix(in_oklab,var(--hero-overlay-strong,var(--foreground))_72%,var(--foreground)))]",
  amber:
    "[--hero-overlay-tint-bg:linear-gradient(140deg,color-mix(in_oklab,var(--warning,var(--accent,var(--primary)))_74%,var(--hero-overlay-strong,var(--foreground))),color-mix(in_oklab,var(--accent-soft,var(--surface-3,var(--muted)))_58%,var(--hero-overlay-strong,var(--foreground)))_50%,color-mix(in_oklab,var(--hero-overlay-strong,var(--foreground))_72%,var(--foreground)))]",
  purple:
    "[--hero-overlay-tint-bg:linear-gradient(140deg,color-mix(in_oklab,var(--accent-strong,var(--accent,var(--primary)))_74%,var(--hero-overlay-strong,var(--foreground))),color-mix(in_oklab,var(--accent-soft,var(--surface-3,var(--muted)))_58%,var(--hero-overlay-strong,var(--foreground)))_50%,color-mix(in_oklab,var(--hero-overlay-strong,var(--foreground))_72%,var(--foreground)))]",
  smoke:
    "[--hero-overlay-tint-bg:linear-gradient(140deg,color-mix(in_oklab,var(--foreground,var(--primary))_74%,var(--hero-overlay-strong,var(--foreground))),color-mix(in_oklab,var(--surface-3,var(--muted))_58%,var(--hero-overlay-strong,var(--foreground)))_50%,color-mix(in_oklab,var(--hero-overlay-strong,var(--foreground))_72%,var(--foreground)))]",
  primary:
    "[--hero-overlay-tint-bg:linear-gradient(140deg,color-mix(in_oklab,var(--primary)_74%,var(--hero-overlay-strong,var(--foreground))),color-mix(in_oklab,var(--primary)_56%,var(--hero-overlay-strong,var(--foreground)))_50%,color-mix(in_oklab,var(--hero-overlay-strong,var(--foreground))_70%,var(--foreground)))]",
  secondary:
    "[--hero-overlay-tint-bg:linear-gradient(140deg,color-mix(in_oklab,var(--secondary)_74%,var(--hero-overlay-strong,var(--foreground))),color-mix(in_oklab,var(--secondary)_56%,var(--hero-overlay-strong,var(--foreground)))_50%,color-mix(in_oklab,var(--hero-overlay-strong,var(--foreground))_70%,var(--foreground)))]",
  accent:
    "[--hero-overlay-tint-bg:linear-gradient(140deg,color-mix(in_oklab,var(--accent,var(--primary))_74%,var(--hero-overlay-strong,var(--foreground))),color-mix(in_oklab,var(--accent,var(--primary))_56%,var(--hero-overlay-strong,var(--foreground)))_50%,color-mix(in_oklab,var(--hero-overlay-strong,var(--foreground))_70%,var(--foreground)))]",
  neutral:
    "[--hero-overlay-tint-bg:linear-gradient(140deg,color-mix(in_oklab,var(--surface-3,var(--card))_78%,var(--hero-overlay-strong,var(--foreground))),color-mix(in_oklab,var(--surface-2,var(--card))_62%,var(--hero-overlay-strong,var(--foreground)))_50%,color-mix(in_oklab,var(--hero-overlay-strong,var(--foreground))_70%,var(--foreground)))]",
  dark:
    "[--hero-overlay-tint-bg:linear-gradient(140deg,color-mix(in_oklab,var(--foreground)_80%,var(--hero-overlay-strong,var(--foreground))),color-mix(in_oklab,var(--foreground)_66%,var(--hero-overlay-strong,var(--foreground)))_50%,color-mix(in_oklab,var(--hero-overlay-strong,var(--foreground))_72%,black))]",
  none:
    "[--hero-overlay-tint-bg:linear-gradient(140deg,transparent,transparent)] [--hero-overlay-tint-opacity:0]",
};

const HERO_OVERLAY_SOLID_TINT_TOKEN_CLASS: Record<HeroOverlayColor, string> = {
  blue:
    "[--hero-overlay-tint-bg:color-mix(in_oklab,var(--processing,var(--accent,var(--primary)))_76%,var(--hero-overlay-strong,var(--foreground)))]",
  green:
    "[--hero-overlay-tint-bg:color-mix(in_oklab,var(--success,var(--accent,var(--primary)))_76%,var(--hero-overlay-strong,var(--foreground)))]",
  amber:
    "[--hero-overlay-tint-bg:color-mix(in_oklab,var(--warning,var(--accent,var(--primary)))_76%,var(--hero-overlay-strong,var(--foreground)))]",
  purple:
    "[--hero-overlay-tint-bg:color-mix(in_oklab,var(--accent-strong,var(--accent,var(--primary)))_76%,var(--hero-overlay-strong,var(--foreground)))]",
  smoke:
    "[--hero-overlay-tint-bg:color-mix(in_oklab,var(--foreground,var(--primary))_78%,var(--hero-overlay-strong,var(--foreground)))]",
  primary:
    "[--hero-overlay-tint-bg:color-mix(in_oklab,var(--primary)_78%,var(--hero-overlay-strong,var(--foreground)))]",
  secondary:
    "[--hero-overlay-tint-bg:color-mix(in_oklab,var(--secondary)_78%,var(--hero-overlay-strong,var(--foreground)))]",
  accent:
    "[--hero-overlay-tint-bg:color-mix(in_oklab,var(--accent,var(--primary))_78%,var(--hero-overlay-strong,var(--foreground)))]",
  neutral:
    "[--hero-overlay-tint-bg:color-mix(in_oklab,var(--surface-3,var(--card))_78%,var(--hero-overlay-strong,var(--foreground)))]",
  dark:
    "[--hero-overlay-tint-bg:color-mix(in_oklab,var(--foreground)_82%,var(--hero-overlay-strong,var(--foreground)))]",
  none:
    "[--hero-overlay-tint-bg:transparent] [--hero-overlay-tint-opacity:0]",
};

const HERO_OVERLAY_STYLE_NONE_TOKEN_CLASS =
  "[--hero-overlay-tint-bg:transparent] [--hero-overlay-tint-opacity:0]";

const HERO_SURFACE_MODE_TOKEN_CLASS = {
  lab: "[--hero-chrome-surface-bg-fallback:color-mix(in_oklab,var(--surface-3,var(--card))_76%,transparent)] [--hero-footer-surface-bg-fallback:color-mix(in_oklab,var(--surface-3,var(--card))_72%,transparent)] [--hero-chrome-surface-hover-bg-fallback:color-mix(in_oklab,var(--surface-3,var(--card))_88%,transparent)] [--hero-frame-surface-bg:color-mix(in_oklab,var(--surface-3,var(--card))_68%,transparent)] [--hero-chrome-surface-border:color-mix(in_oklab,var(--border)_88%,transparent)] [--hero-chrome-surface-bg-safe:var(--hero-chrome-surface-bg,var(--hero-chrome-surface-bg-fallback))] [--hero-footer-surface-bg-safe:var(--hero-footer-surface-bg,var(--hero-footer-surface-bg-fallback))] [--hero-chrome-surface-hover-bg-safe:var(--hero-chrome-surface-hover-bg,var(--hero-chrome-surface-hover-bg-fallback))]",
  runtime:
    "[--hero-chrome-surface-bg-safe:var(--hero-chrome-surface-bg)] [--hero-footer-surface-bg-safe:var(--hero-footer-surface-bg)] [--hero-chrome-surface-hover-bg-safe:var(--hero-chrome-surface-hover-bg)]",
} as const;

const HERO_MENU_MODE_TOKEN_CLASS = {
  lab: "[--hero-menu-backdrop-bg-fallback:color-mix(in_oklab,var(--hero-overlay-strong,var(--foreground))_94%,transparent)] [--hero-menu-opaque-bg-fallback:color-mix(in_oklab,color-mix(in_oklab,var(--surface-3,var(--card))_58%,var(--hero-overlay-strong,var(--foreground))_42%)_74%,var(--accent,var(--primary))_26%)] [--hero-menu-opaque-shadow:var(--elevation-overlay,var(--panel-shadow-3))] [--hero-menu-border:color-mix(in_oklab,var(--hero-text-inverse)_40%,transparent)] [--hero-menu-text-shadow:0_2px_12px_color-mix(in_oklab,var(--foreground)_46%,transparent)] [--hero-menu-backdrop-bg-safe:var(--hero-menu-backdrop-bg,var(--hero-menu-backdrop-bg-fallback))] [--hero-menu-opaque-bg-safe:var(--hero-menu-opaque-bg,var(--hero-menu-opaque-bg-fallback))]",
  runtime:
    "[--hero-menu-backdrop-bg:color-mix(in_oklab,var(--hero-overlay-strong,var(--foreground))_92%,transparent)] [--hero-menu-opaque-bg:color-mix(in_oklab,var(--surface-3,var(--card))_42%,var(--hero-overlay-strong,var(--foreground))_58%)] [--hero-menu-opaque-shadow:var(--elevation-overlay,var(--panel-shadow-3))] [--hero-menu-border:color-mix(in_oklab,var(--hero-text-inverse)_34%,transparent)] [--hero-menu-text-shadow:0_2px_18px_color-mix(in_oklab,var(--foreground)_56%,transparent)] [--hero-menu-backdrop-bg-safe:var(--hero-menu-backdrop-bg)] [--hero-menu-opaque-bg-safe:var(--hero-menu-opaque-bg)]",
} as const;

const HERO_LAB_HEADLINE_TONE_TOKEN_CLASS: Record<HeroLabHeadlineTone, string> = {
  white: "[--hero-lab-headline:var(--hero-text-inverse)]",
  black: "[--hero-lab-headline:var(--foreground)]",
  inverse: "[--hero-lab-headline:var(--hero-text-inverse)]",
  "muted-light":
    "[--hero-lab-headline:color-mix(in_oklab,var(--hero-text-inverse)_88%,var(--muted,var(--surface-3,var(--card)))_12%)]",
  "warm-light":
    "[--hero-lab-headline:color-mix(in_oklab,var(--warning,var(--accent,var(--primary)))_18%,var(--hero-text-inverse)_82%)]",
  "cool-light":
    "[--hero-lab-headline:color-mix(in_oklab,var(--processing,var(--accent,var(--primary)))_18%,var(--hero-text-inverse)_82%)]",
};

const HERO_RUNTIME_FALLBACK_TOKEN_CLASS =
  "[--hero-text-inverse:var(--fg-dark,var(--text-inverse,var(--foreground)))] [--hero-text-90:color-mix(in_oklab,var(--hero-text-inverse)_90%,transparent)] [--hero-text-88:color-mix(in_oklab,var(--hero-text-inverse)_88%,transparent)] [--hero-text-85:color-mix(in_oklab,var(--hero-text-inverse)_85%,transparent)] [--hero-text-82:color-mix(in_oklab,var(--hero-text-inverse)_82%,transparent)] [--hero-text-80:color-mix(in_oklab,var(--hero-text-inverse)_80%,transparent)] [--hero-text-50:color-mix(in_oklab,var(--hero-text-inverse)_50%,transparent)] [--hero-integrated-chrome-text:var(--hero-text-inverse)] [--hero-integrated-chrome-shadow:0_2px_10px_color-mix(in_oklab,var(--hero-overlay-strong,var(--foreground))_34%,transparent)] [--hero-chrome-surface-border-safe:var(--hero-chrome-surface-border,var(--border))] [--hero-cta-primary-safe:var(--hero-cta-primary,var(--cta-primary,var(--primary)))] [--hero-cta-primary-foreground-safe:var(--hero-cta-primary-foreground,var(--cta-primary-foreground,var(--primary-foreground)))] [--hero-cta-primary-hover-safe:var(--hero-cta-primary-hover,var(--cta-primary-hover,var(--primary)))] [--hero-cta-secondary-safe:var(--hero-cta-secondary,var(--cta-secondary,var(--secondary,var(--background))))] [--hero-cta-secondary-foreground-safe:var(--hero-cta-secondary-foreground,var(--cta-secondary-foreground,var(--foreground)))] [--hero-cta-secondary-hover-safe:var(--hero-cta-secondary-hover,var(--cta-secondary-hover,var(--muted)))]";

function normalizeAssetUrl(url?: string): string | undefined {
  if (typeof url !== "string") return undefined;
  const u = url.trim();
  if (!u) return undefined;

  if (
    u.startsWith("http://") ||
    u.startsWith("https://") ||
    u.startsWith("blob:") ||
    u.startsWith("data:")
  ) {
    return u;
  }

  if (u.startsWith("/")) return u;
  return `/${u}`;
}

function splitTitleForAccent(raw: string): { lead: string; accent?: string } {
  const t = String(raw ?? "").trim();
  if (!t) return { lead: "" };

  const idx = t.indexOf(".");
  if (idx === -1) return { lead: t };

  const lead = t.slice(0, idx + 1).trim();
  const rest = t.slice(idx + 1).trim();
  if (!rest) return { lead };

  return { lead, accent: rest };
}

function pickFirstString(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (typeof value !== "string") continue;
    const normalized = value.trim();
    if (normalized) return normalized;
  }
  return undefined;
}

function Pill({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={[
        "inline-flex items-center rounded-full border px-3 py-1 text-xs",
        "[border-color:var(--hero-chrome-surface-border-safe)]",
        "[background:var(--hero-chrome-surface-bg-safe)] [color:var(--hero-text-inverse)]",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

function FooterInlineItem({
  icon,
  text,
  showIcon = true,
}: {
  icon: string;
  text: string;
  showIcon?: boolean;
}) {
  return (
    <span className="inline-flex max-w-full items-start gap-2 text-xs [color:var(--hero-text-85)]">
      {showIcon ? (
        <span aria-hidden="true" className="pt-0.5">
          {icon}
        </span>
      ) : null}
      <span className="min-w-0 break-words">{text}</span>
    </span>
  );
}

function mapGapLevelToClass(
  level: HeroLabGapLevel,
  options: {
    tight: string;
    normal: string;
    relaxed: string;
  }
): string {
  if (level === "tight") return options.tight;
  if (level === "relaxed") return options.relaxed;
  return options.normal;
}

export default function PublicHero({
  data,
  business,
  mobileMenuStyle = "integrated",
  forceMobileMenuOpen,
  copyWidth = "normal",
  navigationMode = "auto",
  contentPosition = "left",
  navPosition = "right",
  headlinePosition = "left",
  copyBlockPosition,
  ctaPosition = "start",
  footerPosition = "center",
  visualPosition = "right",
  logoPosition = "center",
  overlayColor = "blue",
  overlayStyleMode = "gradient",
  backgroundEmphasis = "medium",
  backgroundFit = "cover",
  backgroundFocus = "center",
  labHeadlineTone = "white",
  navTriggerSize = "md",
  navTriggerAura = "soft",
  navTriggerSurface = "glass",
  navTriggerTone = "inverse",
  navTriggerHover = "soft",
  desktopNavSize = "md",
  desktopNavTone = "muted",
  desktopNavSurface = "solid",
  desktopNavHover = "soft",
  desktopNavPresence = "medium",
  navOpenBehavior = "overlay",
  navPanelWidth = "normal",
  navPanelOrigin = "right",
  navPanelIncludeLogo = true,
  navPanelStyle = "solid",
  navOverlayDensity = "medium",
  navOverlayStyle = "tinted",
  navReadabilityBoost = "soft",
  navMenuBlockPosition = "top",
  navMenuAlignment = "left",
  navMenuItemSize = "md",
  navMenuSafeTopOffset = "normal",
  navMenuSafeSideOffset = "normal",
  navMenuVerticalSpacing = "normal",
  navMenuTextTone = "inverse",
  headerIntegration = "integrated",
  headerVisualStyle = "solid",
  headerTopSpacing = "normal",
  headerRelation = "balanced",
  headerBandHeight = "15",
  footerIntegration = "integrated",
  footerVisualStyle = "solid",
  footerBandHeight = "15",
  footerDensity = "balanced",
  footerSignatureSeparation = "normal",
  ctaRegulation = "balanced",
  mobileHeadlineScale = "balanced",
  mobileLogoScale = "balanced",
  gapLogoHeadline = "normal",
  gapHeadlineSubheadline = "normal",
  gapTextCta = "normal",
  gapCtaFooter = "normal",
  gapFooterDataSignature = "normal",
  isLabMode = false,
  labSceneOverlayClassName,
  onLabMenuOpenChange,
  selectedLabPiece = null,
  onLabPieceSelect,
  showLabLogo = true,
  showLabHeadline = true,
  showLabSubheadline = true,
  showLabCtaGroup = true,
  showLabBadge = true,
  showLabHeaderHero = true,
  showLabNavBurger = true,
  showLabThemeToggle = true,
  showNavLinks = true,
  showLabFooterHero = true,
  showLabContactStrip = true,
  showLabAnimatedSignature = true,
  showLabBackgroundMedia = true,
  showLabOverlayAtmosphere = true,
  themeToggleDefault = "auto",
  onLabThemeToggleDefaultChange,
  themeToggleStyle = "glass",
  themeTogglePosition = "right",
  labLogoClassName,
  labNavBurgerClassName,
  labThemeToggleClassName,
  labFooterHeroClassName,
  labContactStripClassName,
  labAnimatedSignatureClassName,
  labHeadlineClassName,
  labSubheadlineClassName,
  labCtaGroupClassName,
  labPrimaryCtaClassName,
  labSecondaryCtaClassName,
  showFooterIcons = true,
}: PublicHeroProps) {
  const mobileMenuInputId = useId();
  const themeToggleInputId = useId();
  const titleRaw = data.title ?? "El centro de mando de tu negocio";
  const { lead: titleLead, accent: titleAccent } = splitTitleForAccent(titleRaw);

  const subtitle =
    data.description ??
    "Publica ofertas, popups, heros por eventos, campañas y recordatorios.";

  const badge = data.badge ?? "Barbería Premium";
  const showBadge =
    showLabBadge && (typeof badge === "string" ? badge.trim().length > 0 : Boolean(badge));

  const cta1 = (data.primaryCtaLabel as string) ?? "Pedir cita";
  const cta2 = (data.secondaryCtaLabel as string) ?? "Servicios";
  const href1 = (data.primaryCtaHref as string) ?? "#";
  const href2 = (data.secondaryCtaHref as string) ?? "#";
  const dataRecord = data as unknown as Record<string, unknown>;

  const rawBg = normalizeAssetUrl(data.backgroundImageUrl);
  const bg = showLabBackgroundMedia ? rawBg : undefined;
  const hasLabSceneOverlay = Boolean(labSceneOverlayClassName?.trim());
  const heroAppearance = resolveHeroAppearance(data as unknown);
  const heroAppearanceTokenClassName =
    HERO_APPEARANCE_TOKEN_CLASS[heroAppearance.variant];
  const heroOverlayTintTokenClassName =
    !showLabOverlayAtmosphere || overlayStyleMode === "none"
      ? HERO_OVERLAY_STYLE_NONE_TOKEN_CLASS
      : overlayStyleMode === "solid"
        ? HERO_OVERLAY_SOLID_TINT_TOKEN_CLASS[overlayColor]
        : HERO_OVERLAY_GRADIENT_TINT_TOKEN_CLASS[overlayColor];
  const heroSurfaceModeTokenClassName = hasLabSceneOverlay
    ? HERO_SURFACE_MODE_TOKEN_CLASS.lab
    : HERO_SURFACE_MODE_TOKEN_CLASS.runtime;
  const heroMenuModeTokenClassName = HERO_MENU_MODE_TOKEN_CLASS[
    isLabMode ? "lab" : "runtime"
  ];
  const heroLabHeadlineToneTokenClassName = isLabMode
    ? HERO_LAB_HEADLINE_TONE_TOKEN_CLASS[labHeadlineTone]
    : "";
  const headlineToneClassName = isLabMode
    ? "[color:var(--hero-lab-headline,var(--hero-text-inverse))]"
    : "[color:var(--hero-text-inverse)]";

  const headerLogoUrl =
    normalizeAssetUrl(business?.logoUrl) ?? normalizeAssetUrl(data.logoUrl);
  const heroLogoUrl =
    normalizeAssetUrl(data.logoUrl) ?? normalizeAssetUrl(business?.logoUrl);
  const footerLogoUrl = heroLogoUrl ?? headerLogoUrl;
  const footerBusinessName = pickFirstString(
    dataRecord.footerBusinessName,
    dataRecord.businessName,
    business?.name,
    "Caballeros Barbería"
  ) as string;
  const footerSignatureText = pickFirstString(
    dataRecord.footerSignature,
    dataRecord.signature,
    business?.footerSignature,
    "Created by ELU"
  ) as string;
  const footerAddress = pickFirstString(
    dataRecord.footerAddress,
    dataRecord.address,
    business?.address,
    "Dirección (pendiente)"
  ) as string;
  const footerPhone = pickFirstString(
    dataRecord.footerPhone,
    dataRecord.phone,
    business?.phone,
    "Teléfono"
  ) as string;
  const footerWhatsapp = pickFirstString(
    dataRecord.footerWhatsapp,
    dataRecord.whatsapp,
    business?.whatsapp,
    "WhatsApp"
  ) as string;
  const footerEmail = pickFirstString(
    dataRecord.footerEmail,
    dataRecord.email,
    business?.email,
    "email@cliente.com"
  ) as string;
  const footerContactItems = [
    { id: "address", icon: "Dir.", text: footerAddress },
    { id: "phone", icon: "Tel.", text: footerPhone },
    { id: "whatsapp", icon: "WA", text: footerWhatsapp },
    { id: "email", icon: "Mail", text: footerEmail },
  ];
  const isMenuControlled = typeof forceMobileMenuOpen === "boolean";
  const shouldBindLabMenuHandlers = isLabMode && isMenuControlled;
  const resolvedCopyPosition = copyBlockPosition ?? contentPosition;
  const isLogoFocusComposition =
    isLabMode &&
    visualPosition === "center" &&
    logoPosition === "center" &&
    resolvedCopyPosition === "center-left";
  const isMediaHeavyComposition =
    isLabMode &&
    visualPosition === "left" &&
    resolvedCopyPosition === "right" &&
    ctaPosition === "end";
  const isSplitComposition =
    isLabMode &&
    visualPosition === "right" &&
    resolvedCopyPosition === "left" &&
    ctaPosition === "start";
  const menuLayerPositionClass = isLabMode ? "absolute" : "fixed";
  const menuBackdropZClass = isLabMode ? "z-20" : "z-40";
  const menuPanelZClass = isLabMode ? "z-30" : "z-50";
  const effectiveNavTriggerSize = isLabMode ? navTriggerSize : "md";
  const effectiveNavTriggerAura = isLabMode ? navTriggerAura : "none";
  const effectiveNavTriggerSurface = isLabMode
    ? navTriggerSurface
    : mobileMenuStyle === "opaque"
      ? "solid"
      : "minimal";
  const effectiveNavTriggerTone = isLabMode ? navTriggerTone : "inverse";
  const effectiveNavTriggerHover = isLabMode ? navTriggerHover : "soft";
  const effectiveNavOpenBehavior = isLabMode ? navOpenBehavior : "overlay";
  const effectiveNavPanelWidth = isLabMode ? navPanelWidth : "normal";
  const effectiveNavPanelOrigin = isLabMode
    ? navPanelOrigin
    : "right";
  const effectiveNavPanelIncludeLogo = isLabMode ? navPanelIncludeLogo : true;
  const effectiveNavPanelStyle = isLabMode
    ? navPanelStyle
    : mobileMenuStyle === "opaque"
      ? "solid"
      : "minimal";
  const effectiveNavOverlayDensity = isLabMode ? navOverlayDensity : "medium";
  const effectiveNavOverlayStyle = isLabMode
    ? navOverlayStyle
    : mobileMenuStyle === "opaque"
      ? "tinted"
      : "none";
  const effectiveNavReadabilityBoost = isLabMode ? navReadabilityBoost : "soft";
  const effectiveNavMenuBlockPosition = isLabMode ? navMenuBlockPosition : "top";
  const effectiveNavMenuAlignment = isLabMode ? navMenuAlignment : "left";
  const effectiveNavMenuItemSize = isLabMode ? navMenuItemSize : "md";
  const effectiveNavMenuSafeTopOffset = isLabMode ? navMenuSafeTopOffset : "normal";
  const effectiveNavMenuSafeSideOffset = isLabMode ? navMenuSafeSideOffset : "normal";
  const effectiveNavMenuVerticalSpacing = isLabMode ? navMenuVerticalSpacing : "normal";
  const effectiveNavMenuTextTone = isLabMode ? navMenuTextTone : "inverse";
  const effectiveHeaderIntegration = isLabMode ? headerIntegration : "integrated";
  const effectiveHeaderVisualStyle = isLabMode ? headerVisualStyle : "solid";
  const effectiveHeaderTopSpacing = isLabMode ? headerTopSpacing : "normal";
  const effectiveHeaderRelation = isLabMode ? headerRelation : "balanced";
  const effectiveFooterIntegration = isLabMode ? footerIntegration : "integrated";
  const effectiveFooterVisualStyle = isLabMode ? footerVisualStyle : "solid";
  const effectiveFooterDensity = isLabMode ? footerDensity : "balanced";
  const effectiveFooterSignatureSeparation = isLabMode ? footerSignatureSeparation : "normal";
  const isHeaderIntegrated = effectiveHeaderIntegration === "integrated";
  const isFooterIntegrated = effectiveFooterIntegration === "integrated";
  const normalizedHeaderVisualStyle =
    isHeaderIntegrated ? "minimal" : effectiveHeaderVisualStyle;
  const normalizedFooterVisualStyle =
    isFooterIntegrated ? "minimal" : effectiveFooterVisualStyle;
  const isHeaderSeparated = !isHeaderIntegrated;
  const isFooterSeparated = !isFooterIntegrated;
  const headerBandHeightClass =
    headerBandHeight === "10"
      ? "h-[10vh]"
      : headerBandHeight === "20"
        ? "h-[20vh]"
        : "h-[15vh]";
  const footerBandHeightClass =
    footerBandHeight === "10"
      ? "min-h-[14vh] md:min-h-[10vh]"
      : footerBandHeight === "20"
        ? "min-h-[22vh] md:min-h-[20vh]"
        : "min-h-[18vh] md:min-h-[15vh]";
  const headerBandSurfaceClass = isHeaderSeparated
    ? "[background:var(--hero-header-band-bg,transparent)]"
    : "";
  const footerBandSurfaceClass = isFooterSeparated
    ? "[background:var(--hero-footer-band-bg,transparent)]"
    : "";
  const headerShellClass = isHeaderSeparated
    ? `w-full ${headerBandHeightClass}`
    : "mx-auto w-full max-w-6xl px-6";
  const mainShellClass = "mx-auto w-full max-w-6xl px-6";
  const footerShellFrameClass = isFooterSeparated ? "" : "mx-auto w-full max-w-6xl px-6";
  const headerContentSizingClass = isHeaderSeparated ? "h-full w-full" : "";
  const footerContentSizingClass = isFooterSeparated ? "w-full min-h-full" : "";
  const hasHeaderRootSurface =
    isHeaderSeparated && normalizedHeaderVisualStyle !== "minimal";
  const effectiveDesktopNavSize = isLabMode ? desktopNavSize : "md";
  const effectiveDesktopNavTone = isLabMode ? desktopNavTone : "muted";
  const effectiveDesktopNavSurface = isLabMode ? desktopNavSurface : "solid";
  const effectiveDesktopNavHover = isLabMode ? desktopNavHover : "soft";
  const effectiveDesktopNavPresence = isLabMode ? desktopNavPresence : "medium";
  const labNavPanelWidthClass =
    effectiveNavPanelWidth === "narrow"
      ? "w-[76%] min-w-[14rem] max-w-[24rem]"
      : effectiveNavPanelWidth === "wide"
        ? "w-full min-w-0 max-w-none"
        : "w-[86%] min-w-[16rem] max-w-[30rem]";
  const navPanelWidthClass =
    effectiveNavPanelWidth === "narrow"
      ? isLabMode
        ? labNavPanelWidthClass
        : "w-[min(100vw,20rem)]"
      : effectiveNavPanelWidth === "wide"
        ? isLabMode
          ? labNavPanelWidthClass
          : "w-[min(100vw,30rem)]"
        : isLabMode
          ? labNavPanelWidthClass
          : "w-[min(100vw,24rem)]";
  const heroRootClass = isLabMode
    ? "relative isolate h-full w-full overflow-hidden"
    : "relative isolate min-h-svh w-full overflow-hidden";
  const heroContentClass = isLabMode
    ? "relative z-10 flex h-full w-full flex-col"
    : "relative z-10 mx-auto flex min-h-svh w-full max-w-6xl flex-col px-6";

  const navOverlayOpacityClass =
    effectiveNavOverlayDensity === "low"
      ? "peer-checked:opacity-45"
      : effectiveNavOverlayDensity === "high"
        ? "peer-checked:opacity-100"
        : "peer-checked:opacity-75";
  const navOverlayStyleClass =
    effectiveNavOverlayStyle === "none"
      ? "bg-transparent"
      : "[background:var(--hero-menu-backdrop-bg-safe)]";
  const navOverlayReadabilityClass =
    effectiveNavReadabilityBoost === "none"
      ? ""
      : effectiveNavReadabilityBoost === "strong"
        ? effectiveNavOverlayDensity === "high"
          ? "saturate-[1.08]"
          : "backdrop-blur-[4px] saturate-[1.12]"
        : effectiveNavOverlayDensity === "high"
          ? "saturate-[1.04]"
          : "backdrop-blur-[2px]";
  const menuBackdropClass =
    effectiveNavOpenBehavior === "drawer"
      ? "pointer-events-none hidden"
      : `pointer-events-none invisible ${menuLayerPositionClass} inset-0 ${menuBackdropZClass} opacity-0 transition-opacity duration-300 peer-checked:pointer-events-auto peer-checked:visible ${navOverlayOpacityClass} ${navOverlayStyleClass} ${navOverlayReadabilityClass}`;

  const navTriggerSizeClass =
    effectiveNavTriggerSize === "sm"
      ? "rounded-md p-1"
      : effectiveNavTriggerSize === "lg"
        ? "rounded-xl p-2.5"
        : "rounded-lg p-2";
  const navTriggerBarClass =
    effectiveNavTriggerSize === "sm"
      ? "h-0.5 w-5"
      : effectiveNavTriggerSize === "lg"
        ? "h-0.5 w-7"
        : "h-0.5 w-6";
  const navTriggerAuraClass =
    hasHeaderRootSurface || effectiveNavTriggerAura === "none"
      ? "shadow-none"
      : effectiveNavTriggerAura === "strong"
        ? "[box-shadow:0_0_0_1px_color-mix(in_oklab,var(--hero-chrome-surface-border-safe)_72%,transparent),var(--hero-menu-opaque-shadow)]"
        : "[box-shadow:var(--elevation-base,var(--panel-shadow-1))]";
  const navTriggerSurfaceClass =
    hasHeaderRootSurface || effectiveNavTriggerSurface === "minimal"
      ? "border border-transparent [background:transparent]"
      : effectiveNavTriggerSurface === "glass"
        ? "border [border-color:color-mix(in_oklab,var(--hero-chrome-surface-border-safe)_72%,transparent)] [background:color-mix(in_oklab,var(--hero-chrome-surface-bg-safe)_54%,transparent)] backdrop-blur-[2px]"
        : "border [border-color:var(--hero-chrome-surface-border-safe)] [background:var(--hero-chrome-surface-bg-safe)]";
  const isMinimalTriggerSurface =
    hasHeaderRootSurface || effectiveNavTriggerSurface === "minimal";
  const navTriggerToneClass =
    effectiveNavTriggerTone === "primary"
      ? "[--hero-nav-trigger-fg:var(--accent-strong,var(--primary))]"
      : effectiveNavTriggerTone === "muted"
        ? "[--hero-nav-trigger-fg:var(--hero-text-85)]"
        : "[--hero-nav-trigger-fg:var(--hero-text-inverse)]";
  const navTriggerHoverClass =
    effectiveNavTriggerHover === "lift"
      ? isMinimalTriggerSurface
        ? "hover:-translate-y-0.5"
        : "hover:-translate-y-0.5 hover:[background:var(--hero-chrome-surface-hover-bg-safe)]"
      : effectiveNavTriggerHover === "glow"
        ? isMinimalTriggerSurface
          ? "hover:[filter:drop-shadow(0_2px_10px_color-mix(in_oklab,var(--hero-text-inverse)_24%,transparent))]"
          : "hover:[background:var(--hero-chrome-surface-hover-bg-safe)] hover:[box-shadow:0_0_0_1px_color-mix(in_oklab,var(--hero-chrome-surface-border-safe)_68%,transparent),var(--hero-menu-opaque-shadow)]"
        : isMinimalTriggerSurface
          ? "hover:opacity-90"
          : "hover:[background:var(--hero-chrome-surface-hover-bg-safe)]";
  const menuTriggerVisibilityClass = isLabMode
    ? ""
    : "peer-checked:pointer-events-none peer-checked:hidden";
  const menuTriggerClass = `cursor-pointer transition duration-200 ${menuTriggerVisibilityClass} ${navTriggerSizeClass} ${navTriggerAuraClass} ${navTriggerSurfaceClass} ${navTriggerToneClass} ${navTriggerHoverClass}`;
  const menuCloseClass =
    [
      "cursor-pointer rounded-lg border transition [border-color:var(--hero-chrome-surface-border-safe)] [background:var(--hero-chrome-surface-bg-safe)] hover:[background:var(--hero-chrome-surface-hover-bg-safe)]",
      isLabMode ? "px-3 py-1.5 text-sm font-semibold" : "px-3 py-1 text-xs",
    ]
      .filter(Boolean)
      .join(" ");
  const desktopNavSizeClass =
    effectiveDesktopNavSize === "sm"
      ? "px-3 py-1.5 text-[11px]"
      : effectiveDesktopNavSize === "lg"
        ? "px-5 py-2.5 text-sm"
        : "px-4 py-2 text-xs";
  const desktopNavToneClass =
    effectiveDesktopNavTone === "primary"
      ? "[color:var(--accent-strong,var(--primary))]"
      : effectiveDesktopNavTone === "inverse"
        ? "[color:var(--hero-text-inverse)]"
        : "[color:var(--hero-text-90)]";
  const desktopNavSurfaceClass =
    hasHeaderRootSurface || effectiveDesktopNavSurface === "minimal"
      ? "border border-transparent [background:transparent]"
      : effectiveDesktopNavSurface === "glass"
        ? "border [border-color:color-mix(in_oklab,var(--hero-chrome-surface-border-safe)_70%,transparent)] [background:color-mix(in_oklab,var(--hero-chrome-surface-bg-safe)_58%,transparent)] backdrop-blur-[2px]"
        : "border [border-color:var(--hero-chrome-surface-border-safe)] [background:var(--hero-chrome-surface-bg-safe)]";
  const desktopNavPresenceClass =
    hasHeaderRootSurface
      ? ""
      : effectiveDesktopNavPresence === "low"
      ? "opacity-[0.84]"
      : effectiveDesktopNavPresence === "high"
        ? "[box-shadow:0_0_0_1px_color-mix(in_oklab,var(--hero-chrome-surface-border-safe)_56%,transparent),var(--elevation-base,var(--panel-shadow-1))]"
        : "";
  const desktopNavHoverClass =
    hasHeaderRootSurface
      ? "hover:opacity-90"
      : effectiveDesktopNavHover === "lift"
      ? "hover:-translate-y-0.5 hover:[background:var(--hero-chrome-surface-hover-bg-safe)]"
      : effectiveDesktopNavHover === "glow"
        ? "hover:[background:var(--hero-chrome-surface-hover-bg-safe)] hover:[box-shadow:0_0_0_1px_color-mix(in_oklab,var(--hero-chrome-surface-border-safe)_58%,transparent),var(--elevation-base,var(--panel-shadow-1))]"
        : "hover:[background:var(--hero-chrome-surface-hover-bg-safe)]";
  const desktopNavItemClass =
    `rounded-full font-semibold transition ${desktopNavSizeClass} ${desktopNavToneClass} ${desktopNavSurfaceClass} ${desktopNavPresenceClass} ${desktopNavHoverClass}`;

  const navPanelVisualClass =
    effectiveNavOverlayStyle === "none"
      ? "[background:transparent] shadow-none border-transparent backdrop-blur-0"
      : effectiveNavOverlayDensity === "high"
        ? effectiveNavPanelStyle === "minimal"
          ? "[background:var(--hero-menu-opaque-bg-safe)] shadow-none border-transparent backdrop-blur-0"
          : effectiveNavPanelStyle === "glass"
            ? "[background:var(--hero-menu-opaque-bg-safe)] [box-shadow:var(--hero-menu-opaque-shadow)] [border-color:var(--hero-menu-border)] backdrop-blur-0"
            : "[background:var(--hero-menu-opaque-bg-safe)] [box-shadow:var(--hero-menu-opaque-shadow)] [border-color:var(--hero-menu-border)]"
        : effectiveNavOverlayDensity === "medium"
          ? effectiveNavPanelStyle === "minimal"
            ? isLabMode
              ? "[background:color-mix(in_oklab,var(--hero-menu-opaque-bg-safe)_88%,transparent)] shadow-none border-transparent backdrop-blur-0"
              : "[background:color-mix(in_oklab,var(--hero-menu-opaque-bg-safe)_76%,transparent)] shadow-none border-transparent backdrop-blur-0"
            : effectiveNavPanelStyle === "glass"
              ? isLabMode
                ? "[background:color-mix(in_oklab,var(--hero-menu-opaque-bg-safe)_92%,transparent)] [box-shadow:var(--hero-menu-opaque-shadow)] [border-color:color-mix(in_oklab,var(--hero-menu-border)_90%,transparent)] backdrop-blur-[2px]"
                : "[background:color-mix(in_oklab,var(--hero-menu-opaque-bg-safe)_84%,transparent)] [box-shadow:var(--hero-menu-opaque-shadow)] [border-color:color-mix(in_oklab,var(--hero-menu-border)_84%,transparent)] backdrop-blur-[2px]"
              : isLabMode
                ? "[background:color-mix(in_oklab,var(--hero-menu-opaque-bg-safe)_94%,transparent)] [box-shadow:var(--hero-menu-opaque-shadow)] [border-color:color-mix(in_oklab,var(--hero-menu-border)_92%,transparent)]"
                : "[background:color-mix(in_oklab,var(--hero-menu-opaque-bg-safe)_88%,transparent)] [box-shadow:var(--hero-menu-opaque-shadow)] [border-color:color-mix(in_oklab,var(--hero-menu-border)_88%,transparent)]"
          : effectiveNavPanelStyle === "minimal"
            ? isLabMode
              ? "[background:color-mix(in_oklab,var(--hero-menu-opaque-bg-safe)_74%,transparent)] shadow-none border-transparent backdrop-blur-0"
              : "[background:color-mix(in_oklab,var(--hero-menu-opaque-bg-safe)_52%,transparent)] shadow-none border-transparent backdrop-blur-0"
            : effectiveNavPanelStyle === "glass"
              ? isLabMode
                ? "[background:color-mix(in_oklab,var(--hero-menu-opaque-bg-safe)_84%,transparent)] [box-shadow:var(--hero-menu-opaque-shadow)] [border-color:color-mix(in_oklab,var(--hero-menu-border)_84%,transparent)] backdrop-blur-[2px]"
                : "[background:color-mix(in_oklab,var(--hero-menu-opaque-bg-safe)_66%,transparent)] [box-shadow:var(--hero-menu-opaque-shadow)] [border-color:color-mix(in_oklab,var(--hero-menu-border)_70%,transparent)] backdrop-blur-[2px]"
              : isLabMode
                ? "[background:color-mix(in_oklab,var(--hero-menu-opaque-bg-safe)_88%,transparent)] [box-shadow:var(--hero-menu-opaque-shadow)] [border-color:color-mix(in_oklab,var(--hero-menu-border)_88%,transparent)]"
                : "[background:color-mix(in_oklab,var(--hero-menu-opaque-bg-safe)_72%,transparent)] [box-shadow:var(--hero-menu-opaque-shadow)] [border-color:color-mix(in_oklab,var(--hero-menu-border)_76%,transparent)]";
  const isWideLabPanel = isLabMode && effectiveNavPanelWidth === "wide";
  const labMenuPanelPositionClass =
    effectiveNavOpenBehavior === "fullscreen"
      ? isWideLabPanel
        ? "inset-0 w-full max-w-none translate-y-full rounded-none peer-checked:translate-y-0"
        : "inset-2 w-auto max-w-none translate-y-full rounded-xl peer-checked:translate-y-0"
      : effectiveNavOpenBehavior === "drawer"
        ? effectiveNavPanelOrigin === "left"
          ? isWideLabPanel
            ? `inset-y-0 inset-x-0 ${navPanelWidthClass} -translate-x-full rounded-none border-x-0 peer-checked:translate-x-0`
            : `inset-y-2 left-0 ${navPanelWidthClass} -translate-x-full rounded-r-2xl border-l-0 peer-checked:translate-x-0`
          : isWideLabPanel
            ? `inset-y-0 inset-x-0 ${navPanelWidthClass} translate-x-full rounded-none border-x-0 peer-checked:translate-x-0`
            : `inset-y-2 right-0 ${navPanelWidthClass} translate-x-full rounded-l-2xl border-r-0 peer-checked:translate-x-0`
        : effectiveNavPanelOrigin === "left"
          ? isWideLabPanel
            ? `top-3 bottom-3 inset-x-0 ${navPanelWidthClass} opacity-0 scale-[0.98] rounded-none peer-checked:opacity-100 peer-checked:scale-100`
            : `top-3 bottom-3 left-3 ${navPanelWidthClass} opacity-0 scale-[0.98] rounded-2xl peer-checked:opacity-100 peer-checked:scale-100`
          : effectiveNavPanelOrigin === "right"
            ? isWideLabPanel
              ? `top-3 bottom-3 inset-x-0 ${navPanelWidthClass} opacity-0 scale-[0.98] rounded-none peer-checked:opacity-100 peer-checked:scale-100`
              : `top-3 bottom-3 right-3 ${navPanelWidthClass} opacity-0 scale-[0.98] rounded-2xl peer-checked:opacity-100 peer-checked:scale-100`
            : isWideLabPanel
              ? `top-3 bottom-3 inset-x-0 ${navPanelWidthClass} opacity-0 scale-[0.98] rounded-none peer-checked:opacity-100 peer-checked:scale-100`
              : `top-3 bottom-3 left-1/2 ${navPanelWidthClass} -translate-x-1/2 opacity-0 scale-[0.98] rounded-2xl peer-checked:opacity-100 peer-checked:scale-100`;
  const menuPanelClass =
    `${menuLayerPositionClass} ${isLabMode
      ? labMenuPanelPositionClass
      : effectiveNavOpenBehavior === "fullscreen"
        ? "inset-0 w-full max-w-none translate-y-full peer-checked:translate-y-0"
        : effectiveNavPanelOrigin === "left"
          ? `inset-y-0 left-0 ${navPanelWidthClass} -translate-x-full peer-checked:translate-x-0`
          : effectiveNavPanelOrigin === "center"
            ? `top-3 bottom-3 left-1/2 ${navPanelWidthClass} -translate-x-1/2 opacity-0 scale-[0.98] peer-checked:opacity-100 peer-checked:scale-100`
            : `inset-y-0 right-0 ${navPanelWidthClass} translate-x-full peer-checked:translate-x-0`} ${menuPanelZClass} invisible flex flex-col overflow-y-auto border p-4 transition-all duration-300 ease-out peer-checked:visible [color:var(--hero-text-inverse)] ${navPanelVisualClass}`;

  const copyWidthClass =
    copyWidth === "narrow" ? "max-w-lg" : copyWidth === "wide" ? "max-w-2xl" : "max-w-xl";
  const useLabMobileComposition = isLabMode && navigationMode === "mobile";
  const heroGridClass = useLabMobileComposition
    ? "grid grid-cols-1 items-start gap-4"
    : isMediaHeavyComposition
      ? "grid grid-cols-1 items-center gap-5 md:grid-cols-[0.82fr_1.18fr] md:gap-9"
      : isSplitComposition
        ? "grid grid-cols-1 items-center gap-5 md:grid-cols-2 md:gap-10"
        : "grid grid-cols-1 items-center gap-5 md:grid-cols-2 md:gap-8";
  const frameSurfaceClass = isLabMode
    ? "[background:transparent]"
    : "[background:var(--hero-frame-surface-bg)]";
  const visualFrameSurfaceClass = frameSurfaceClass;
  const bgFitClass = backgroundFit === "contain" ? "object-contain" : backgroundFit === "fill" ? "object-fill" : "object-cover";
  const bgFocusClass = backgroundFocus === "top" ? "object-top" : backgroundFocus === "bottom" ? "object-bottom" : backgroundFocus === "left" ? "object-left" : backgroundFocus === "right" ? "object-right" : "object-center";
  const backgroundImageClass =
    backgroundEmphasis === "low"
      ? `absolute inset-0 z-0 h-full w-full ${bgFitClass} ${bgFocusClass} brightness-[0.48] saturate-[0.78] scale-[1.02]`
      : backgroundEmphasis === "high"
        ? `absolute inset-0 z-0 h-full w-full ${bgFitClass} ${bgFocusClass} brightness-[1.04] saturate-[1.2] scale-[1.08]`
        : `absolute inset-0 z-0 h-full w-full ${bgFitClass} ${bgFocusClass} brightness-[0.9] saturate-[1.03]`;
  const headerNavRelationClass =
    effectiveHeaderRelation === "logo-focus"
      ? "opacity-90"
      : effectiveHeaderRelation === "nav-focus"
        ? "opacity-100"
        : "";

  const isMobileNavigation = navigationMode === "mobile";
  const isDesktopNavigation = navigationMode === "desktop";
  const navDesktopPositionClass =
    navPosition === "left"
      ? "mr-auto ml-4"
      : navPosition === "center"
        ? "mx-auto"
        : "ml-auto";
  const desktopNavClass = isMobileNavigation
    ? "hidden"
    : isDesktopNavigation
      ? `flex items-center gap-3 ${navDesktopPositionClass} ${headerNavRelationClass}`
      : `hidden items-center gap-3 md:flex ${navDesktopPositionClass} ${headerNavRelationClass}`;
  const mobileNavClass = isDesktopNavigation ? "hidden" : isMobileNavigation ? "block" : "md:hidden";
  const mobileNavPositionClass =
    navPosition === "left" ? "mr-auto" : navPosition === "center" ? "mx-auto" : "ml-auto";
  const themeTogglePositionClass =
    themeTogglePosition === "left" ? "order-[-1] mr-auto" : "order-[3]";
  const themeToggleStyleClass =
    themeToggleStyle === "minimal"
      ? "border-transparent [background:transparent]"
      : themeToggleStyle === "glass"
        ? "[background:color-mix(in_oklab,var(--hero-chrome-surface-bg-safe)_54%,transparent)] backdrop-blur-[2px]"
        : "[background:var(--hero-chrome-surface-bg-safe)]";
  const themeToggleDefaultChecked = themeToggleDefault === "dark";
  const isThemeModeAuto = themeToggleDefault === "auto";

  const copyPositionClass =
    resolvedCopyPosition === "center-left"
      ? `${copyWidthClass} mx-auto text-center md:mx-0 md:text-left`
      : resolvedCopyPosition === "center"
        ? `${copyWidthClass} mx-auto text-center`
        : resolvedCopyPosition === "right"
          ? `${copyWidthClass} md:ml-auto text-right`
          : copyWidthClass;
  const headlinePositionClass =
    headlinePosition === "center"
      ? "mx-auto text-center"
      : headlinePosition === "right"
        ? "md:ml-auto text-right"
        : "text-left";
  const ctaDesktopAlignClass = ctaPosition === "center" ? "justify-center" : ctaPosition === "end" ? "justify-end" : "justify-start";
  const ctaMobilePositionClass =
    ctaPosition === "center"
      ? "mx-auto max-w-sm sm:max-w-md"
      : ctaPosition === "end"
        ? "ml-auto max-w-sm sm:max-w-md"
        : "mr-auto max-w-sm sm:max-w-md";
  const logoHeadlineGapClass = mapGapLevelToClass(gapLogoHeadline, {
    tight: "mb-2",
    normal: "mb-4",
    relaxed: "mb-6",
  });
  const headlineSubheadlineGapClass = mapGapLevelToClass(gapHeadlineSubheadline, {
    tight: "mt-1",
    normal: "mt-2",
    relaxed: "mt-4",
  });
  const textCtaGapClass = mapGapLevelToClass(gapTextCta, {
    tight: "mt-2",
    normal: "mt-4",
    relaxed: "mt-6",
  });
  const ctaFooterGapClass = mapGapLevelToClass(gapCtaFooter, {
    tight: "pb-4",
    normal: "pb-5",
    relaxed: "pb-7",
  });
  const footerDataSignatureGapClass = mapGapLevelToClass(gapFooterDataSignature, {
    tight: "mt-1.5 gap-1.5",
    normal: "mt-2 gap-2",
    relaxed: "mt-3 gap-3",
  });
  const ctaMobileLayoutClass = useLabMobileComposition
    ? `${textCtaGapClass} mb-6 grid grid-cols-1 gap-2 sm:grid-cols-2 ${ctaMobilePositionClass}`
    : `mt-4 mb-6 grid grid-cols-2 gap-3 md:hidden ${ctaMobilePositionClass}`;
  const mobileSubtitleClass = useLabMobileComposition
    ? `${headlineSubheadlineGapClass} max-w-xl rounded-xl px-3 py-2 text-[13px] leading-snug ${frameSurfaceClass} [color:var(--hero-text-90)]`
    : `mt-0.5 max-w-lg rounded-xl px-3 py-2 text-[13px] leading-snug md:hidden ${frameSurfaceClass} [color:var(--hero-text-90)]`;
  const desktopSubtitleClass = useLabMobileComposition
    ? "hidden"
    : "mt-3 hidden max-w-lg text-sm sm:text-base md:block md:text-lg [color:var(--hero-text-82)]";
  const desktopCtaClass = useLabMobileComposition
    ? "hidden"
    : `mt-5 hidden flex-wrap items-center gap-3 md:flex ${ctaDesktopAlignClass}`;
  const headerTopSpacingClass =
    effectiveHeaderTopSpacing === "tight"
      ? "pt-3"
      : effectiveHeaderTopSpacing === "relaxed"
        ? "pt-7"
        : "pt-5";
  const headerVisualClass =
    normalizedHeaderVisualStyle === "minimal"
      ? "border-0 [background:transparent] shadow-none"
      : normalizedHeaderVisualStyle === "glass"
        ? "border [border-color:color-mix(in_oklab,var(--hero-chrome-surface-border-safe)_58%,transparent)] [background:color-mix(in_oklab,var(--hero-chrome-surface-bg-safe)_52%,transparent)] shadow-none"
        : "border [border-color:var(--hero-chrome-surface-border-safe)] [background:var(--hero-chrome-surface-bg-safe)] [box-shadow:var(--elevation-base,var(--panel-shadow-1))]";
  const headerRegionClass =
    isHeaderSeparated
      ? `h-full w-full rounded-none px-3 py-2 ${headerVisualClass}`
      : "px-0 py-0 border-0 [background:transparent] [color:var(--hero-integrated-chrome-text,var(--hero-text-inverse))] [text-shadow:var(--hero-integrated-chrome-shadow,none)]";
  const headerInnerOverflowClass = isLabMode ? "overflow-visible" : "overflow-hidden";
  const headerLogoGroupClass =
    effectiveHeaderRelation === "logo-focus"
      ? "flex items-center gap-4"
      : effectiveHeaderRelation === "nav-focus"
        ? "flex items-center gap-2 opacity-90"
        : "flex items-center gap-3";
  const heroMainClass = useLabMobileComposition
    ? `min-h-0 flex-1 pt-4 ${ctaFooterGapClass}`
    : "min-h-0 flex-1 pt-5 pb-36 md:pb-0";
  const footerShellClass =
    isFooterSeparated
      ? `mt-auto w-full ${footerBandHeightClass}`
      : "mt-auto pt-2 pb-2";
  const footerVisualClass =
    normalizedFooterVisualStyle === "minimal"
      ? "border-0 [background:transparent] shadow-none"
      : normalizedFooterVisualStyle === "glass"
        ? "border [border-color:color-mix(in_oklab,var(--hero-chrome-surface-border-safe)_58%,transparent)] [background:color-mix(in_oklab,var(--hero-footer-surface-bg-safe)_58%,transparent)] shadow-none"
        : "border [border-color:var(--hero-chrome-surface-border-safe)] [background:var(--hero-footer-surface-bg-safe)] [box-shadow:var(--elevation-base,var(--panel-shadow-1))]";
  const footerToneClass = isFooterSeparated
    ? "[color:var(--hero-text-88)]"
    : "[color:var(--hero-integrated-chrome-text,var(--hero-text-inverse))] [text-shadow:var(--hero-integrated-chrome-shadow,none)]";
  const footerRadiusClass = isFooterSeparated ? "rounded-none" : "rounded-none";
  const isFooterCompact = effectiveFooterDensity === "compact";
  const footerDensityClass =
    isFooterCompact
      ? "px-2 py-1.5 sm:px-3 sm:py-2"
      : effectiveFooterDensity === "spacious"
        ? "px-5 py-4"
        : "px-4 py-3";
  const footerSignatureSeparationClass =
    effectiveFooterSignatureSeparation === "tight"
      ? "mt-2"
      : effectiveFooterSignatureSeparation === "relaxed"
        ? "mt-5"
        : "mt-3";
  const footerMetaDividerClass = "border-0";
  const footerMetaRowClass = useLabMobileComposition
    ? `${footerDataSignatureGapClass} ${footerSignatureSeparationClass} flex flex-col items-center ${isFooterCompact ? "gap-1.5 pt-2 text-[10px] sm:gap-2" : "gap-2 pt-3 text-[11px]"} ${footerMetaDividerClass} sm:flex-row sm:justify-between sm:gap-3 md:text-xs`
    : `${footerDataSignatureGapClass} ${footerSignatureSeparationClass} flex items-center justify-between ${isFooterCompact ? "gap-2 pt-2 text-[10px]" : "gap-3 pt-3 text-[11px]"} ${footerMetaDividerClass} md:text-xs`;
  const footerBrandClass = useLabMobileComposition
    ? "min-w-0 text-center sm:text-left"
    : footerPosition === "left"
      ? "min-w-0 text-left"
      : footerPosition === "right"
        ? "min-w-0 text-right"
        : "min-w-0 text-center";
  const footerIdentityClass = useLabMobileComposition
    ? `flex min-w-0 max-w-full flex-wrap items-center justify-center ${isFooterCompact ? "gap-1.5" : "gap-2"} text-center sm:justify-start sm:text-left`
    : footerPosition === "left"
      ? `flex min-w-0 max-w-full items-center ${isFooterCompact ? "gap-1.5" : "gap-2"} text-left`
      : footerPosition === "right"
        ? `ml-auto flex min-w-0 max-w-full items-center justify-end ${isFooterCompact ? "gap-1.5" : "gap-2"} text-right`
        : `mx-auto flex min-w-0 max-w-full items-center justify-center ${isFooterCompact ? "gap-1.5" : "gap-2"} text-center`;
  const footerContactGridClass = useLabMobileComposition
    ? `grid w-full max-w-xl grid-cols-1 ${isFooterCompact ? "gap-1.5" : "gap-2"} sm:grid-cols-2`
    : "grid w-full max-w-5xl grid-cols-2 gap-x-6 gap-y-2 md:grid-cols-4";
  const copyPaneOrderClass = visualPosition === "left" ? "md:order-2" : "md:order-1";
  const copyPaneSpacingClass = isSplitComposition
    ? "md:pr-6"
    : isMediaHeavyComposition
      ? "md:pl-4"
      : "";
  const logoAlignClass = logoPosition === "left" ? "justify-start" : logoPosition === "right" ? "justify-end" : "justify-center";
  const logoTextAlignClass = logoPosition === "left" ? "text-left" : logoPosition === "right" ? "text-right" : "text-center";
  const logoFramePaddingClass = logoPosition === "center" ? "" : "px-6";
  const visualPaneClass = useLabMobileComposition
    ? "hidden"
    : visualPosition === "left"
      ? isMediaHeavyComposition
        ? "mx-auto hidden w-full max-w-md md:order-1 md:-ml-6 md:block md:w-[112%] md:max-w-none"
        : "mx-auto hidden w-full max-w-md md:order-1 md:mr-auto md:block md:max-w-xl"
      : visualPosition === "center"
        ? isLogoFocusComposition
          ? "mx-auto hidden w-full max-w-md md:order-2 md:block md:max-w-2xl"
          : "mx-auto hidden w-full max-w-md md:order-2 md:block md:max-w-xl"
        : "mx-auto hidden w-full max-w-md md:order-2 md:ml-auto md:block md:max-w-xl";
  const headlineSizeClass = isLogoFocusComposition
    ? "text-balance text-2xl font-bold leading-[1.06] tracking-tight sm:text-4xl md:text-5xl"
    : "text-balance text-3xl font-extrabold leading-[1.02] tracking-tight sm:text-5xl md:text-6xl";
  const mobileHeadlineSizeClass = isLogoFocusComposition
    ? "text-balance font-bold leading-[1.14] tracking-tight"
    : isMediaHeavyComposition
      ? "text-balance font-extrabold leading-[1.12] tracking-tight"
      : "text-balance font-extrabold leading-[1.12] tracking-tight";
  const mobileHeadlineScaleClass = mobileHeadlineScale === "compact"
    ? "text-[1.48rem] sm:text-[1.7rem]"
    : mobileHeadlineScale === "expressive"
      ? "text-[1.86rem] sm:text-[2.14rem]"
      : "text-[1.66rem] sm:text-[1.92rem]";
  const resolvedHeadlineSizeClass = useLabMobileComposition
    ? `${mobileHeadlineSizeClass} ${mobileHeadlineScaleClass}`
    : headlineSizeClass;
  const visualFrameAspectClass = isLogoFocusComposition
    ? "sm:aspect-[2/1] md:aspect-[12/5]"
    : isMediaHeavyComposition
      ? "sm:aspect-[16/9] md:aspect-[16/9]"
      : "sm:aspect-video md:aspect-[16/10]";
  const logoMobileSizeClass = mobileLogoScale === "compact"
    ? "max-h-14 w-auto opacity-95 sm:max-h-16"
    : mobileLogoScale === "expressive"
      ? "max-h-24 w-auto opacity-95 sm:max-h-28"
      : isLogoFocusComposition
        ? "max-h-20 w-auto opacity-95 sm:max-h-24"
        : "max-h-16 w-auto opacity-95 sm:max-h-20";
  const mobileLogoFrameClass = isLogoFocusComposition
    ? "aspect-[16/8] max-w-sm"
    : isMediaHeavyComposition
      ? "aspect-[16/6] max-w-[18rem]"
      : "aspect-[16/7] max-w-xs sm:max-w-sm";
  const logoDesktopSizeClass = isLogoFocusComposition
    ? "max-h-56 w-auto opacity-95 md:max-h-80"
    : isMediaHeavyComposition
      ? "max-h-48 w-auto opacity-95 md:max-h-72"
      : "max-h-44 w-auto opacity-95 md:max-h-64";
  const footerDesktopAlignClass =
    footerPosition === "left"
      ? "md:justify-start"
      : footerPosition === "right"
        ? "md:justify-end"
        : "md:justify-center";
  const menuContentPositionClass =
    effectiveNavMenuBlockPosition === "center"
      ? "justify-center"
      : effectiveNavMenuBlockPosition === "bottom"
        ? "justify-end"
        : "justify-start";
  const menuContentAlignClass =
    effectiveNavMenuAlignment === "center"
      ? "items-center text-center"
      : effectiveNavMenuAlignment === "right"
        ? "items-end text-right"
        : "items-start text-left";
  const menuItemWidthClass =
    effectiveNavMenuAlignment === "center" ? "w-fit min-w-[10rem]" : "w-full";
  const menuItemSizeClass =
    effectiveNavMenuItemSize === "sm"
      ? isLabMode
        ? "px-3 py-2 text-sm"
        : "px-2 py-1.5 text-xs"
      : effectiveNavMenuItemSize === "lg"
        ? isLabMode
          ? "px-4 py-3.5 text-lg"
          : "px-4 py-3 text-base"
        : isLabMode
          ? "px-3.5 py-2.5 text-base"
          : "px-3 py-2 text-sm";
  const menuSafeTopClass =
    effectiveNavMenuSafeTopOffset === "tight"
      ? "pt-1"
      : effectiveNavMenuSafeTopOffset === "relaxed"
        ? "pt-6"
        : "pt-3";
  const menuSafeSideClass =
    effectiveNavMenuSafeSideOffset === "tight"
      ? "px-1"
      : effectiveNavMenuSafeSideOffset === "relaxed"
        ? "px-5"
        : "px-3";
  const menuVerticalSpacingClass =
    effectiveNavMenuVerticalSpacing === "tight"
      ? isLabMode
        ? "gap-2.5"
        : "gap-1.5"
      : effectiveNavMenuVerticalSpacing === "relaxed"
        ? isLabMode
          ? "gap-5"
          : "gap-4"
        : isLabMode
          ? "gap-3.5"
          : "gap-2.5";
  const menuItemToneClass =
    effectiveNavMenuTextTone === "primary"
      ? "[color:var(--accent-strong,var(--primary))]"
      : effectiveNavMenuTextTone === "muted"
        ? "[color:var(--hero-text-88)]"
        : "[color:var(--hero-text-inverse)]";
  const menuItemClass =
    effectiveNavPanelStyle === "minimal"
      ? `block rounded-xl font-semibold transition hover:opacity-85 ${menuItemSizeClass} ${menuItemWidthClass} ${menuItemToneClass}`
      : effectiveNavPanelStyle === "glass"
        ? `block rounded-xl border border-transparent font-semibold transition hover:[border-color:color-mix(in_oklab,var(--hero-chrome-surface-border-safe)_68%,transparent)] hover:[background:color-mix(in_oklab,var(--hero-chrome-surface-bg-safe)_58%,transparent)] ${menuItemSizeClass} ${menuItemWidthClass} ${menuItemToneClass}`
        : `block rounded-xl border border-transparent font-semibold transition hover:[background:var(--hero-chrome-surface-bg-safe)] ${menuItemSizeClass} ${menuItemWidthClass} ${menuItemToneClass}`;
  const ctaRegulationClassName =
    ctaRegulation === "primary-focus"
      ? {
          primary:
            "!scale-[1.02] !shadow-[0_16px_30px_color-mix(in_oklab,var(--foreground)_26%,transparent)]",
          secondary: "opacity-80",
        }
      : { primary: "", secondary: "" };

  const handleMenuStateChange = (open: boolean) => {
    if (isMenuControlled) onLabMenuOpenChange?.(open);
  };

  const handleLabNavItemClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!isLabMode || !isMenuControlled) return;
    event.preventDefault();
    event.stopPropagation();
    onLabMenuOpenChange?.(false);
  };

  const handleLabPieceClick = (
    event: MouseEvent<HTMLElement>,
    piece: LabHeroPiece
  ) => {
    if (!isLabMode || !onLabPieceSelect) return;
    event.preventDefault();
    event.stopPropagation();
    onLabPieceSelect(piece);
  };
  const selectLabPiece = (piece: LabHeroPiece) => {
    if (!isLabMode || !onLabPieceSelect) return;
    onLabPieceSelect(piece);
  };
  const handleHeaderPieceClick = (event: MouseEvent<HTMLElement>) => {
    if (!showLabHeaderHero) return;
    const target = event.target;
    if (target instanceof HTMLElement) {
      const nestedPiece = target.closest("[data-lab-piece]");
      if (nestedPiece && nestedPiece.getAttribute("data-lab-piece") !== "header-hero") {
        return;
      }
    }
    handleLabPieceClick(event, "header-hero");
  };
  const handleThemeToggleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!isLabMode) return;
    if (!onLabThemeToggleDefaultChange) return;
    if (isThemeModeAuto) {
      onLabThemeToggleDefaultChange("dark");
      return;
    }
    onLabThemeToggleDefaultChange(event.target.checked ? "dark" : "light");
  };
  const handleLabBurgerClick = (event: MouseEvent<HTMLLabelElement>) => {
    event.stopPropagation();
    selectLabPiece("nav-burger");
  };
  const handleLabMenuCloseClick = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    if (isMenuControlled) {
      event.preventDefault();
      onLabMenuOpenChange?.(false);
      return;
    }
  };
  const stopMenuEventPropagation = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
  };

  const getLabPieceClassName = (piece: LabHeroPiece): string => {
    if (!isLabMode || !onLabPieceSelect) return "";
    return selectedLabPiece === piece
      ? "cursor-pointer rounded-xl ring-2 ring-sky-300/90 ring-offset-2 ring-offset-transparent [background:color-mix(in_oklab,var(--surface-1,var(--background))_24%,transparent)] shadow-[0_2px_10px_color-mix(in_oklab,var(--foreground)_16%,transparent)] transition"
      : "cursor-pointer rounded-xl ring-1 ring-transparent transition hover:ring-sky-200/75 hover:[background:color-mix(in_oklab,var(--surface-1,var(--background))_14%,transparent)]";
  };

  const mobilePrimaryCtaClassName = [
    "inline-flex w-full items-center justify-center rounded-xl px-3 py-2 text-xs font-semibold transition [background:var(--hero-cta-primary-safe)] [color:var(--hero-cta-primary-foreground-safe)] hover:[background:var(--hero-cta-primary-hover-safe)]",
    labPrimaryCtaClassName,
    ctaRegulationClassName.primary,
  ]
    .filter(Boolean)
    .join(" ");
  const mobileSecondaryCtaClassName = [
    "inline-flex w-full items-center justify-center rounded-xl px-3 py-2 text-xs font-semibold transition [background:var(--hero-cta-secondary-safe)] [color:var(--hero-cta-secondary-foreground-safe)] hover:[background:var(--hero-cta-secondary-hover-safe)]",
    labSecondaryCtaClassName,
    ctaRegulationClassName.secondary,
  ]
    .filter(Boolean)
    .join(" ");
  const desktopPrimaryCtaClassName = [
    "inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold transition [background:var(--hero-cta-primary-safe)] [color:var(--hero-cta-primary-foreground-safe)] hover:[background:var(--hero-cta-primary-hover-safe)]",
    labPrimaryCtaClassName,
    ctaRegulationClassName.primary,
  ]
    .filter(Boolean)
    .join(" ");
  const desktopSecondaryCtaClassName = [
    "inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold transition [background:var(--hero-cta-secondary-safe)] [color:var(--hero-cta-secondary-foreground-safe)] hover:[background:var(--hero-cta-secondary-hover-safe)]",
    labSecondaryCtaClassName,
    ctaRegulationClassName.secondary,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section
      className={[
        heroRootClass,
        heroAppearanceTokenClassName,
        heroOverlayTintTokenClassName,
        heroSurfaceModeTokenClassName,
        heroMenuModeTokenClassName,
        heroLabHeadlineToneTokenClassName,
        HERO_RUNTIME_FALLBACK_TOKEN_CLASS,
      ]
        .filter(Boolean)
        .join(" ")}
      data-hero-appearance={heroAppearance.variant}
    >
      <input
        id={themeToggleInputId}
        type="checkbox"
        className="peer/theme sr-only"
        {...(isLabMode
          ? {
              checked: isThemeModeAuto ? false : themeToggleDefault === "dark",
              onChange: handleThemeToggleChange,
            }
          : {
              defaultChecked: themeToggleDefaultChecked,
            })}
      />

      {bg ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={bg}
            alt=""
            data-lab-piece="background-media"
            onClick={(event) => handleLabPieceClick(event, "background-media")}
            className={`${backgroundImageClass} peer-checked/theme:brightness-[0.76] peer-checked/theme:saturate-[0.82] ${getLabPieceClassName("background-media")}`}
          />
          {!hasLabSceneOverlay && showLabOverlayAtmosphere ? (
            <div
              data-lab-piece="overlay-atmosphere"
              onClick={(event) => handleLabPieceClick(event, "overlay-atmosphere")}
              className={`absolute inset-0 z-[2] [background:var(--hero-overlay-tint-bg)] [opacity:var(--hero-overlay-tint-opacity)] ${getLabPieceClassName("overlay-atmosphere")}`}
            />
          ) : null}
        </>
      ) : (
        <div className="pointer-events-none absolute inset-0 z-0 [background:var(--hero-overlay-no-image-bg)]" />
      )}

      {labSceneOverlayClassName ? (
        <div
          className={`pointer-events-none absolute inset-0 z-[5] ${labSceneOverlayClassName}`}
        />
      ) : null}

      <div className={`${heroContentClass} peer-checked/theme:[filter:saturate(0.9)]`}>
        <header
          className={`${isHeaderSeparated ? "pt-0" : headerTopSpacingClass} ${headerShellClass} ${headerBandSurfaceClass} ${showLabHeaderHero ? getLabPieceClassName("header-hero") : ""}`}
          data-lab-piece={showLabHeaderHero ? "header-hero" : undefined}
          onClick={showLabHeaderHero ? handleHeaderPieceClick : undefined}
        >
          <div
            className={`flex items-center justify-between ${headerInnerOverflowClass} ${headerContentSizingClass} ${headerRegionClass}`}
          >
            <div
              className={`${headerLogoGroupClass} ${getLabPieceClassName("logo")}`}
              data-lab-piece="logo"
              onClick={(event) => handleLabPieceClick(event, "logo")}
            >
              {headerLogoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={headerLogoUrl}
                  alt={business?.name ?? "Logo"}
                  className={
                    useLabMobileComposition
                      ? "hidden h-10 w-auto opacity-95 sm:block sm:h-11"
                      : "h-11 w-auto opacity-95 sm:h-12"
                  }
                />
              ) : null}

              <div
                className={
                  useLabMobileComposition
                    ? "hidden"
                    : "hidden text-sm font-semibold [color:var(--hero-text-90)] sm:block"
                }
              >
                {business?.name ?? "Business Control Center"}
              </div>
            </div>

            {showNavLinks ? (
              <nav
                className={`${desktopNavClass} ${getLabPieceClassName("desktop-nav")}`}
                data-lab-piece="desktop-nav"
                onClick={(event) => handleLabPieceClick(event, "desktop-nav")}
              >
                <a
                  href="#"
                  className={desktopNavItemClass}
                >
                  Home
                </a>
                <a
                  href="#"
                  className={desktopNavItemClass}
                >
                  Services
                </a>
                <a
                  href="#"
                  className={desktopNavItemClass}
                >
                  Contact
                </a>
              </nav>
            ) : null}

            {showLabThemeToggle ? (
              <label
                htmlFor={themeToggleInputId}
                data-lab-piece="theme-toggle"
                onClick={() => selectLabPiece("theme-toggle")}
                className={[
                  "relative inline-flex h-8 min-w-[6.7rem] items-center rounded-full border px-1.5 transition md:h-9",
                  "cursor-pointer [border-color:var(--hero-chrome-surface-border-safe)] [color:var(--hero-text-inverse)]",
                  themeTogglePositionClass,
                  themeToggleStyleClass,
                  "peer-checked/theme:[background:color-mix(in_oklab,var(--hero-overlay-strong,var(--foreground))_22%,var(--hero-chrome-surface-bg-safe))]",
                  getLabPieceClassName("theme-toggle"),
                  labThemeToggleClassName,
                ].join(" ")}
                title="Alternar modo oscuro/claro"
                aria-label="Alternar modo oscuro/claro"
              >
                <span className="pointer-events-none relative z-10 grid w-full grid-cols-3 items-center text-center text-[9px] font-semibold uppercase leading-none tracking-[0.03em]">
                  <span
                    className={
                      themeToggleDefault === "light"
                        ? "opacity-100"
                        : "opacity-70 peer-checked/theme:opacity-100"
                    }
                  >
                    Sol
                  </span>
                  <span className={themeToggleDefault === "auto" ? "opacity-100" : "opacity-55"}>
                    Auto
                  </span>
                  <span
                    className={
                      themeToggleDefault === "dark"
                        ? "opacity-100"
                        : "opacity-70 peer-checked/theme:opacity-100"
                    }
                  >
                    Noche
                  </span>
                </span>
                <span
                  aria-hidden="true"
                  className={[
                    "pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border [border-color:var(--hero-chrome-surface-border-safe)] [background:color-mix(in_oklab,var(--hero-text-inverse)_88%,transparent)] [box-shadow:0_1px_6px_color-mix(in_oklab,var(--foreground)_24%,transparent)] transition-transform duration-200",
                    themeToggleDefault === "auto"
                      ? "left-1/2 -translate-x-1/2"
                      : "left-1.5 peer-checked/theme:translate-x-[2.8rem]",
                  ].join(" ")}
                />
              </label>
            ) : null}

            <input
              id={mobileMenuInputId}
              type="checkbox"
              className="peer sr-only"
              onClick={isLabMode ? stopMenuEventPropagation : undefined}
              {...(shouldBindLabMenuHandlers
                ? {
                    checked: Boolean(forceMobileMenuOpen),
                    onChange: (event: ChangeEvent<HTMLInputElement>) =>
                      handleMenuStateChange(event.target.checked),
                  }
                : {})}
            />

            <label
              htmlFor={mobileMenuInputId}
              className={[
                showLabNavBurger ? mobileNavClass : "hidden",
                mobileNavPositionClass,
                menuTriggerClass,
                getLabPieceClassName("nav-burger"),
                labNavBurgerClassName,
              ]
                .filter(Boolean)
                .join(" ")}
              data-lab-piece="nav-burger"
              onClick={handleLabBurgerClick}
              aria-label="Abrir menú"
            >
              <span
                className={`block ${navTriggerBarClass} [background:var(--hero-nav-trigger-fg,var(--hero-text-inverse))]`}
              />
              <span
                className={`mt-1 block ${navTriggerBarClass} [background:var(--hero-nav-trigger-fg,var(--hero-text-inverse))]`}
              />
              <span
                className={`mt-1 block ${navTriggerBarClass} [background:var(--hero-nav-trigger-fg,var(--hero-text-inverse))]`}
              />
            </label>

            <label
              htmlFor={mobileMenuInputId}
              className={`${menuBackdropClass} ${isDesktopNavigation ? "hidden" : isMobileNavigation ? "" : "md:hidden"}`}
              aria-label="Cerrar menú"
              onClick={handleLabMenuCloseClick}
            />

            <div
              className={`${menuPanelClass} ${isDesktopNavigation ? "hidden" : isMobileNavigation ? "" : "md:hidden"}`}
              onClick={stopMenuEventPropagation}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {effectiveNavPanelIncludeLogo && headerLogoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={headerLogoUrl}
                      alt={business?.name ?? "Logo"}
                      className="h-7 w-auto opacity-95"
                    />
                  ) : null}
                  <div className="text-sm font-semibold">{business?.name ?? "Menú"}</div>
                </div>

                {shouldBindLabMenuHandlers ? (
                  <button
                    type="button"
                    className={menuCloseClass}
                    onClick={handleLabMenuCloseClick}
                  >
                    Cerrar
                  </button>
                ) : (
                  <label
                    htmlFor={mobileMenuInputId}
                    className={menuCloseClass}
                    onClick={stopMenuEventPropagation}
                  >
                    Cerrar
                  </label>
                )}
              </div>

              <div
                className={`mt-2 flex flex-1 flex-col ${menuContentPositionClass} ${menuSafeTopClass} ${menuSafeSideClass}`}
              >
                {showNavLinks ? (
                  <div className={`flex w-full flex-col ${menuContentAlignClass} ${menuVerticalSpacingClass}`}>
                    <a
                      href="#"
                      className={menuItemClass}
                      {...(shouldBindLabMenuHandlers ? { onClick: handleLabNavItemClick } : {})}
                    >
                      Home
                    </a>
                    <a
                      href="#"
                      className={menuItemClass}
                      {...(shouldBindLabMenuHandlers ? { onClick: handleLabNavItemClick } : {})}
                    >
                      Services
                    </a>
                    <a
                      href="#"
                      className={menuItemClass}
                      {...(shouldBindLabMenuHandlers ? { onClick: handleLabNavItemClick } : {})}
                    >
                      Contact
                    </a>
                  </div>
                ) : (
                  <div className="text-sm [color:var(--hero-text-82)]">Links de navegación ocultos.</div>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className={`${heroMainClass} ${mainShellClass}`}>
          <div className={heroGridClass}>
            <div className={`${copyPositionClass} ${copyPaneOrderClass} ${copyPaneSpacingClass}`}>
              {showLabLogo && useLabMobileComposition ? (
                <div className={logoHeadlineGapClass}>
                  <div
                    className={`relative mx-auto flex w-full items-center rounded-3xl ${mobileLogoFrameClass} ${logoAlignClass} ${logoFramePaddingClass} ${visualFrameSurfaceClass} ${getLabPieceClassName("logo")} ${labLogoClassName || ""}`}
                    data-lab-piece="logo"
                    onClick={(event) => handleLabPieceClick(event, "logo")}
                  >
                    {heroLogoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={heroLogoUrl}
                        alt={business?.name ?? "Logo"}
                        className={logoMobileSizeClass}
                      />
                    ) : (
                      <div className={`${logoTextAlignClass} [color:var(--hero-text-80)]`}>
                        <div className="text-sm">Logo principal</div>
                        <div className="mt-2 text-xs [color:var(--hero-text-50)]">
                          (pendiente de asset)
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : null}

              {showBadge ? (
                <div
                  className={getLabPieceClassName("badge")}
                  data-lab-piece="badge"
                  onClick={(event) => handleLabPieceClick(event, "badge")}
                >
                  <Pill className={useLabMobileComposition ? logoHeadlineGapClass : "mb-3"}>{badge}</Pill>
                </div>
              ) : null}

              {showLabHeadline ? (
                <h1
                  className={`${resolvedHeadlineSizeClass} ${headlineToneClassName} ${headlinePositionClass} ${getLabPieceClassName("headline")} ${labHeadlineClassName || ""}`}
                  data-lab-piece="headline"
                  onClick={(event) => handleLabPieceClick(event, "headline")}
                >
                  <span>{titleLead || titleRaw}</span>
                  {titleAccent ? (
                    <>
                      <br />
                      <span className="[color:var(--accent-strong,var(--primary))]">
                        {titleAccent}
                      </span>
                    </>
                  ) : null}
                </h1>
              ) : null}

              <div className={useLabMobileComposition || !showLabLogo ? "hidden" : "mt-1.5 md:hidden"}>
                <div
                  className={`relative mx-auto flex aspect-[16/7] w-full max-w-sm items-center rounded-3xl ${logoAlignClass} ${logoFramePaddingClass} ${visualFrameSurfaceClass} ${getLabPieceClassName("logo")} ${labLogoClassName || ""}`}
                  data-lab-piece="logo"
                  onClick={(event) => handleLabPieceClick(event, "logo")}
                >
                  {heroLogoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={heroLogoUrl}
                      alt={business?.name ?? "Logo"}
                      className={logoMobileSizeClass}
                    />
                  ) : (
                    <div className={`${logoTextAlignClass} [color:var(--hero-text-80)]`}>
                      <div className="text-sm">Logo principal</div>
                      <div className="mt-2 text-xs [color:var(--hero-text-50)]">
                        (pendiente de asset)
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {showLabSubheadline ? (
                <p
                  className={`${mobileSubtitleClass} ${getLabPieceClassName("subheadline")} ${labSubheadlineClassName || ""}`}
                  data-lab-piece="subheadline"
                  onClick={(event) => handleLabPieceClick(event, "subheadline")}
                >
                  {subtitle}
                </p>
              ) : null}

              {showLabCtaGroup ? (
                <div
                  className={`${ctaMobileLayoutClass} ${getLabPieceClassName("cta-group")} ${labCtaGroupClassName || ""}`}
                  data-lab-piece="cta-group"
                  onClick={(event) => handleLabPieceClick(event, "cta-group")}
                >
                  <a
                    href={href1}
                    className={mobilePrimaryCtaClassName}
                    onClick={(event) => handleLabPieceClick(event, "cta-group")}
                  >
                    {cta1}
                  </a>

                  <a
                    href={href2}
                    className={mobileSecondaryCtaClassName}
                    onClick={(event) => handleLabPieceClick(event, "cta-group")}
                  >
                    {cta2}
                  </a>
                </div>
              ) : null}

              {showLabSubheadline ? (
                <p
                  className={`${desktopSubtitleClass} ${getLabPieceClassName("subheadline")} ${labSubheadlineClassName || ""}`}
                  data-lab-piece="subheadline"
                  onClick={(event) => handleLabPieceClick(event, "subheadline")}
                >
                  {subtitle}
                </p>
              ) : null}

              {showLabCtaGroup ? (
                <div
                  className={`${desktopCtaClass} ${getLabPieceClassName("cta-group")} ${labCtaGroupClassName || ""}`}
                  data-lab-piece="cta-group"
                  onClick={(event) => handleLabPieceClick(event, "cta-group")}
                >
                  <a
                    href={href1}
                    className={desktopPrimaryCtaClassName}
                    onClick={(event) => handleLabPieceClick(event, "cta-group")}
                  >
                    {cta1}
                  </a>

                  <a
                    href={href2}
                    className={desktopSecondaryCtaClassName}
                    onClick={(event) => handleLabPieceClick(event, "cta-group")}
                  >
                    {cta2}
                  </a>
                </div>
              ) : null}
            </div>

            <div className={showLabLogo ? visualPaneClass : "hidden"}>
              <div
                className={`relative mx-auto flex aspect-[16/7] w-full items-center rounded-[28px] ${logoAlignClass} ${logoFramePaddingClass} ${visualFrameSurfaceClass} ${visualFrameAspectClass} ${getLabPieceClassName("logo")} ${labLogoClassName || ""}`}
                data-lab-piece="logo"
                onClick={(event) => handleLabPieceClick(event, "logo")}
              >
                {heroLogoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={heroLogoUrl}
                    alt={business?.name ?? "Logo"}
                    className={logoDesktopSizeClass}
                  />
                ) : (
                  <div className={`${logoTextAlignClass} [color:var(--hero-text-80)]`}>
                    <div className="text-sm">Logo principal</div>
                    <div className="mt-2 text-xs [color:var(--hero-text-50)]">
                      (pendiente de asset)
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>

        {showLabFooterHero ? (
        <footer
          className={`${footerShellClass} ${footerBandSurfaceClass} ${getLabPieceClassName("footer-hero")} ${labFooterHeroClassName || ""}`}
          data-lab-piece="footer-hero"
          onClick={(event) => handleLabPieceClick(event, "footer-hero")}
        >
          <div className={footerShellFrameClass}>
            <div
              className={`${footerRadiusClass} ${footerDensityClass} ${footerVisualClass} ${footerContentSizingClass} ${footerToneClass}`}
            >
            <div className={`mx-auto flex w-full max-w-5xl flex-col gap-2 ${footerDesktopAlignClass}`}>
              {showLabContactStrip ? (
                <div
                  className={`${footerContactGridClass} ${getLabPieceClassName("contact-strip")} ${labContactStripClassName || ""}`}
                  data-lab-piece="contact-strip"
                  onClick={(event) => handleLabPieceClick(event, "contact-strip")}
                >
                  {footerContactItems.map((item) => (
                    <div
                      key={item.id}
                      data-footer-part={item.id}
                      className={useLabMobileComposition ? "min-w-0 text-center sm:text-left" : "min-w-0"}
                    >
                      <FooterInlineItem icon={item.icon} text={item.text} showIcon={showFooterIcons} />
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            <div className={footerMetaRowClass}>
              <div className={`${footerBrandClass} ${footerIdentityClass}`} data-footer-part="identity">
                {footerLogoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={footerLogoUrl}
                    alt={footerBusinessName}
                    className="h-5 w-auto opacity-90"
                  />
                ) : null}
                <span className="min-w-0 break-words">
                  {"\u00A9"} 2026{" "}
                  <span className="font-semibold [color:var(--hero-text-inverse)]">
                    {footerBusinessName}
                  </span>
                </span>
              </div>

              {showLabAnimatedSignature ? (
                <div
                  className={`min-w-0 shrink-0 text-right ${getLabPieceClassName("animated-signature")} ${labAnimatedSignatureClassName || ""}`}
                  data-footer-part="signature"
                  data-lab-piece="animated-signature"
                  onClick={(event) => handleLabPieceClick(event, "animated-signature")}
                >
                  <span className="sr-only">{footerSignatureText}</span>
                  <CreatedByMini />
                </div>
              ) : null}
            </div>
            </div>
          </div>
        </footer>
        ) : null}
      </div>
    </section>
  );
}
