// src/components/web/hero/PublicHero.tsx
import type { ChangeEvent, MouseEvent, ReactNode } from "react";
import CreatedByMini from "@/components/footer/CreatedByMini";
import { resolveHeroAppearance } from "./appearance";
import type { HeroAppearanceVariant } from "@/lib/web/hero/types";

export type HeroData = {
  badge?: string;
  title?: string;
  description?: string;

  primaryCtaLabel?: string;
  primaryCtaHref?: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;

  backgroundImageUrl?: string;
  logoUrl?: string;
  logoSvg?: string;
  heroAppearanceVariant?: HeroAppearanceVariant;
};

export type BusinessPublic = {
  name?: string;
  slug: string;
  activeHeroVariantKey?: string;
  logoUrl?: string;
};

type PublicHeroProps = {
  data: HeroData;
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
  overlayColor?: "blue" | "green" | "amber" | "purple" | "smoke" | "none";
  backgroundEmphasis?: "low" | "medium" | "high";
  isLabMode?: boolean;
  labSceneOverlayClassName?: string;
  onLabMenuOpenChange?: (open: boolean) => void;
};

type HeroOverlayColor = NonNullable<PublicHeroProps["overlayColor"]>;

const HERO_APPEARANCE_TOKEN_CLASS: Record<HeroAppearanceVariant, string> = {
  transparent:
    "[--hero-overlay-tint-opacity:0.14] [--hero-overlay-no-image-bg:linear-gradient(to_bottom,color-mix(in_oklab,var(--accent,var(--primary))_52%,transparent),color-mix(in_oklab,var(--accent-soft,var(--surface-3,var(--muted)))_46%,transparent),color-mix(in_oklab,var(--accent,var(--primary))_50%,transparent))] [--hero-chrome-surface-bg:color-mix(in_oklab,var(--accent-soft,var(--surface-3,var(--muted)))_8%,transparent)] [--hero-chrome-surface-hover-bg:color-mix(in_oklab,var(--accent,var(--primary))_14%,transparent)] [--hero-frame-surface-bg:color-mix(in_oklab,var(--accent-soft,var(--surface-3,var(--muted)))_4%,transparent)] [--hero-footer-surface-bg:color-mix(in_oklab,var(--accent-soft,var(--surface-3,var(--muted)))_6%,transparent)] [--hero-chrome-surface-border:color-mix(in_oklab,var(--hero-text-inverse)_16%,transparent)]",
  soft:
    "[--hero-overlay-tint-opacity:0.34] [--hero-overlay-no-image-bg:linear-gradient(to_bottom,color-mix(in_oklab,var(--accent,var(--primary))_60%,black),color-mix(in_oklab,var(--accent-soft,var(--surface-3,var(--muted)))_54%,black),color-mix(in_oklab,var(--accent,var(--primary))_62%,black))] [--hero-chrome-surface-bg:color-mix(in_oklab,var(--accent-soft,var(--surface-3,var(--muted)))_14%,transparent)] [--hero-chrome-surface-hover-bg:color-mix(in_oklab,var(--accent,var(--primary))_22%,transparent)] [--hero-frame-surface-bg:color-mix(in_oklab,var(--accent-soft,var(--surface-3,var(--muted)))_10%,transparent)] [--hero-footer-surface-bg:color-mix(in_oklab,var(--accent-soft,var(--surface-3,var(--muted)))_12%,transparent)] [--hero-chrome-surface-border:color-mix(in_oklab,var(--hero-text-inverse)_20%,transparent)]",
  solid:
    "[--hero-overlay-tint-opacity:0.58] [--hero-overlay-no-image-bg:linear-gradient(to_bottom,color-mix(in_oklab,var(--accent,var(--primary))_74%,black),color-mix(in_oklab,var(--accent-soft,var(--surface-3,var(--muted)))_68%,black),color-mix(in_oklab,var(--accent,var(--primary))_76%,black))] [--hero-chrome-surface-bg:color-mix(in_oklab,var(--accent-soft,var(--surface-3,var(--muted)))_44%,black)] [--hero-chrome-surface-hover-bg:color-mix(in_oklab,var(--accent,var(--primary))_56%,black)] [--hero-frame-surface-bg:color-mix(in_oklab,var(--accent-soft,var(--surface-3,var(--muted)))_40%,black)] [--hero-footer-surface-bg:color-mix(in_oklab,var(--accent-soft,var(--surface-3,var(--muted)))_42%,black)] [--hero-chrome-surface-border:color-mix(in_oklab,var(--hero-text-inverse)_28%,transparent)]",
};

const HERO_OVERLAY_TINT_TOKEN_CLASS: Record<HeroOverlayColor, string> = {
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
  none:
    "[--hero-overlay-tint-bg:linear-gradient(140deg,transparent,transparent)] [--hero-overlay-tint-opacity:0]",
};

const HERO_SURFACE_MODE_TOKEN_CLASS = {
  lab: "[--hero-chrome-surface-bg:color-mix(in_oklab,var(--surface-3,var(--card))_76%,transparent)] [--hero-chrome-surface-hover-bg:color-mix(in_oklab,var(--surface-3,var(--card))_88%,transparent)] [--hero-frame-surface-bg:color-mix(in_oklab,var(--surface-3,var(--card))_68%,transparent)] [--hero-footer-surface-bg:color-mix(in_oklab,var(--surface-3,var(--card))_72%,transparent)] [--hero-chrome-surface-border:color-mix(in_oklab,var(--border)_88%,transparent)]",
  runtime: "",
} as const;

const HERO_MENU_MODE_TOKEN_CLASS = {
  lab: "[--hero-menu-backdrop-bg:linear-gradient(to_left,color-mix(in_oklab,var(--hero-overlay-strong,var(--foreground))_96%,transparent),color-mix(in_oklab,var(--hero-overlay-strong,var(--foreground))_78%,transparent)_36%,color-mix(in_oklab,var(--hero-overlay,var(--foreground))_42%,transparent)_68%,transparent_100%)] [--hero-menu-opaque-bg:color-mix(in_oklab,var(--surface-3,var(--card))_52%,var(--hero-overlay-strong,var(--foreground))_48%)] [--hero-menu-opaque-shadow:var(--elevation-task,var(--panel-shadow-2))] [--hero-menu-border:color-mix(in_oklab,var(--hero-text-inverse)_34%,transparent)] [--hero-menu-text-shadow:0_2px_12px_color-mix(in_oklab,var(--foreground)_46%,transparent)]",
  runtime:
    "[--hero-menu-backdrop-bg:color-mix(in_oklab,var(--hero-overlay-strong,var(--foreground))_92%,transparent)] [--hero-menu-opaque-bg:color-mix(in_oklab,var(--surface-3,var(--card))_42%,var(--hero-overlay-strong,var(--foreground))_58%)] [--hero-menu-opaque-shadow:var(--elevation-overlay,var(--panel-shadow-3))] [--hero-menu-border:color-mix(in_oklab,var(--hero-text-inverse)_34%,transparent)] [--hero-menu-text-shadow:0_2px_18px_color-mix(in_oklab,var(--foreground)_56%,transparent)]",
} as const;

const HERO_RUNTIME_FALLBACK_TOKEN_CLASS =
  "[--hero-text-inverse:var(--fg-dark,var(--text-inverse,var(--foreground)))] [--hero-text-90:color-mix(in_oklab,var(--hero-text-inverse)_90%,transparent)] [--hero-text-88:color-mix(in_oklab,var(--hero-text-inverse)_88%,transparent)] [--hero-text-85:color-mix(in_oklab,var(--hero-text-inverse)_85%,transparent)] [--hero-text-82:color-mix(in_oklab,var(--hero-text-inverse)_82%,transparent)] [--hero-text-80:color-mix(in_oklab,var(--hero-text-inverse)_80%,transparent)] [--hero-text-50:color-mix(in_oklab,var(--hero-text-inverse)_50%,transparent)] [--hero-chrome-surface-border-safe:var(--hero-chrome-surface-border,var(--border))] [--hero-cta-primary:var(--cta-primary,var(--primary))] [--hero-cta-primary-foreground:var(--cta-primary-foreground,var(--primary-foreground))] [--hero-cta-primary-hover:var(--cta-primary-hover,var(--primary))] [--hero-cta-secondary:var(--cta-secondary,var(--secondary,var(--background)))] [--hero-cta-secondary-foreground:var(--cta-secondary-foreground,var(--foreground))] [--hero-cta-secondary-hover:var(--cta-secondary-hover,var(--muted))]";

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
        "[background:var(--hero-chrome-surface-bg)] [color:var(--hero-text-inverse)]",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

function FooterInlineItem({ icon, text }: { icon: string; text: string }) {
  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap text-xs [color:var(--hero-text-85)]">
      <span aria-hidden="true">{icon}</span>
      <span>{text}</span>
    </span>
  );
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
  backgroundEmphasis = "medium",
  isLabMode = false,
  labSceneOverlayClassName,
  onLabMenuOpenChange,
}: PublicHeroProps) {
  const titleRaw = data.title ?? "El centro de mando de tu negocio";
  const { lead: titleLead, accent: titleAccent } = splitTitleForAccent(titleRaw);

  const subtitle =
    data.description ??
    "Publica ofertas, popups, heros por eventos, campañas y recordatorios.";

  const badge = data.badge ?? "Barbería Premium";
  const showBadge = typeof badge === "string" ? badge.trim().length > 0 : Boolean(badge);

  const cta1 = (data.primaryCtaLabel as string) ?? "Pedir cita";
  const cta2 = (data.secondaryCtaLabel as string) ?? "Servicios";
  const href1 = (data.primaryCtaHref as string) ?? "#";
  const href2 = (data.secondaryCtaHref as string) ?? "#";

  const bg = normalizeAssetUrl(data.backgroundImageUrl);
  const hasLabSceneOverlay = Boolean(labSceneOverlayClassName?.trim());
  const heroAppearance = resolveHeroAppearance(data as unknown);
  const heroAppearanceTokenClassName =
    HERO_APPEARANCE_TOKEN_CLASS[heroAppearance.variant];
  const heroOverlayTintTokenClassName = HERO_OVERLAY_TINT_TOKEN_CLASS[overlayColor];
  const heroSurfaceModeTokenClassName = hasLabSceneOverlay
    ? HERO_SURFACE_MODE_TOKEN_CLASS.lab
    : HERO_SURFACE_MODE_TOKEN_CLASS.runtime;
  const heroMenuModeTokenClassName = HERO_MENU_MODE_TOKEN_CLASS[
    isLabMode ? "lab" : "runtime"
  ];

  const headerLogoUrl =
    normalizeAssetUrl(business?.logoUrl) ?? normalizeAssetUrl(data.logoUrl);
  const heroLogoUrl =
    normalizeAssetUrl(data.logoUrl) ?? normalizeAssetUrl(business?.logoUrl);
  const isMenuControlled = typeof forceMobileMenuOpen === "boolean";
  const shouldBindLabMenuHandlers = isLabMode && isMenuControlled;
  const resolvedCopyPosition = copyBlockPosition ?? contentPosition;
  const menuLayerPositionClass = isLabMode ? "absolute" : "fixed";
  const menuBackdropZClass = isLabMode ? "z-20" : "z-40";
  const menuPanelZClass = isLabMode ? "z-30" : "z-50";
  const opaqueMenuWidthClass = isLabMode ? "w-full max-w-[26rem]" : "w-[min(100vw,26rem)]";
  const integratedMenuWidthClass = isLabMode ? "w-[min(92%,24rem)]" : "w-[min(92vw,24rem)]";
  const heroRootClass = isLabMode
    ? "relative h-full w-full overflow-hidden"
    : "relative min-h-svh w-full overflow-hidden";
  const heroContentClass = isLabMode
    ? "relative z-10 mx-auto flex h-full w-full max-w-6xl flex-col px-6"
    : "relative z-10 mx-auto flex min-h-svh w-full max-w-6xl flex-col px-6";

  const menuBackdropClass =
    mobileMenuStyle === "opaque"
      ? isLabMode
        ? `pointer-events-none ${menuLayerPositionClass} inset-0 ${menuBackdropZClass} opacity-0 transition-opacity duration-300 peer-checked:pointer-events-auto peer-checked:opacity-100 [background:var(--hero-menu-backdrop-bg)]`
        : `pointer-events-none ${menuLayerPositionClass} inset-0 ${menuBackdropZClass} opacity-0 transition-opacity duration-300 peer-checked:pointer-events-auto peer-checked:opacity-100 [background:var(--hero-menu-backdrop-bg)] backdrop-blur-[2px]`
      : `pointer-events-none ${menuLayerPositionClass} inset-0 ${menuBackdropZClass} opacity-0 transition-opacity duration-300 peer-checked:pointer-events-auto peer-checked:opacity-100 bg-transparent`;

  const opaqueMenuSurfaceClass =
    "[background:var(--hero-menu-opaque-bg)] [box-shadow:var(--hero-menu-opaque-shadow)]";
  const integratedMenuTextShadowClass = "[text-shadow:var(--hero-menu-text-shadow)]";

  const menuPanelClass =
    mobileMenuStyle === "opaque"
      ? `${menuLayerPositionClass} inset-y-0 right-0 ${menuPanelZClass} ${opaqueMenuWidthClass} translate-x-full border-l [border-color:var(--hero-menu-border)] p-4 transition-transform duration-300 ease-out peer-checked:translate-x-0 [color:var(--hero-text-inverse)] ${opaqueMenuSurfaceClass}`
      : `${menuLayerPositionClass} inset-y-0 right-0 ${menuPanelZClass} ${integratedMenuWidthClass} translate-x-full border-transparent p-4 shadow-none transition-transform duration-300 ease-out peer-checked:translate-x-0 [background:transparent] [color:var(--hero-text-inverse)] ${integratedMenuTextShadowClass}`;

  const copyWidthClass =
    copyWidth === "narrow" ? "max-w-lg" : copyWidth === "wide" ? "max-w-2xl" : "max-w-xl";
  const frameSurfaceClass = isLabMode
    ? "[background:transparent]"
    : "[background:var(--hero-frame-surface-bg)]";
  const visualFrameSurfaceClass = frameSurfaceClass;
  const footerSurfaceClass = isLabMode
    ? "[background:transparent]"
    : "[background:var(--hero-footer-surface-bg)]";
  const backgroundImageClass =
    backgroundEmphasis === "low"
      ? "absolute inset-0 h-full w-full object-cover brightness-[0.48] saturate-[0.78] scale-[1.02]"
      : backgroundEmphasis === "high"
        ? "absolute inset-0 h-full w-full object-cover brightness-[1.04] saturate-[1.2] scale-[1.08]"
        : "absolute inset-0 h-full w-full object-cover brightness-[0.9] saturate-[1.03]";

  const isMobileNavigation = navigationMode === "mobile";
  const isDesktopNavigation = navigationMode === "desktop";
  const navDesktopPositionClass =
    navPosition === "left"
      ? "mr-auto ml-4"
      : navPosition === "center"
        ? "mx-auto"
        : "ml-4";
  const desktopNavClass = isMobileNavigation
    ? "hidden"
    : isDesktopNavigation
      ? `flex items-center gap-3 ${navDesktopPositionClass}`
      : `hidden items-center gap-3 md:flex ${navDesktopPositionClass}`;
  const mobileNavClass = isDesktopNavigation ? "hidden" : isMobileNavigation ? "block" : "md:hidden";

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
  const ctaMobilePositionClass = ctaPosition === "center" ? "mx-auto max-w-sm" : ctaPosition === "end" ? "ml-auto max-w-sm" : "mr-auto max-w-sm";
  const copyPaneOrderClass = visualPosition === "left" ? "md:order-2" : "md:order-1";
  const logoAlignClass = logoPosition === "left" ? "justify-start" : logoPosition === "right" ? "justify-end" : "justify-center";
  const logoTextAlignClass = logoPosition === "left" ? "text-left" : logoPosition === "right" ? "text-right" : "text-center";
  const logoFramePaddingClass = logoPosition === "center" ? "" : "px-6";
  const visualPaneClass =
    visualPosition === "left"
      ? "mx-auto hidden w-full max-w-md md:order-1 md:mr-auto md:block md:max-w-xl"
      : visualPosition === "center"
        ? "mx-auto hidden w-full max-w-md md:order-2 md:block md:max-w-xl"
        : "mx-auto hidden w-full max-w-md md:order-2 md:ml-auto md:block md:max-w-xl";
  const footerDesktopAlignClass =
    footerPosition === "left"
      ? "md:justify-start"
      : footerPosition === "right"
        ? "md:justify-end"
        : "md:justify-center";
  const footerBottomAlignClass =
    footerPosition === "left"
      ? "justify-start"
      : footerPosition === "right"
        ? "justify-end"
        : "justify-center";
  const footerBrandAlignClass =
    footerPosition === "left"
      ? "text-left"
      : footerPosition === "right"
        ? "text-right"
        : "text-center";
  const menuItemClass =
    mobileMenuStyle === "integrated"
      ? "block rounded-xl px-2 py-2 transition hover:opacity-85"
      : "block rounded-xl px-3 py-2 transition hover:[background:var(--hero-chrome-surface-bg)]";

  const handleMenuStateChange = (open: boolean) => {
    if (isMenuControlled) onLabMenuOpenChange?.(open);
  };

  const handleLabNavItemClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!isLabMode || !isMenuControlled) return;
    event.preventDefault();
    onLabMenuOpenChange?.(false);
  };

  return (
    <section
      className={[
        heroRootClass,
        heroAppearanceTokenClassName,
        heroOverlayTintTokenClassName,
        heroSurfaceModeTokenClassName,
        heroMenuModeTokenClassName,
        HERO_RUNTIME_FALLBACK_TOKEN_CLASS,
      ]
        .filter(Boolean)
        .join(" ")}
      data-hero-appearance={heroAppearance.variant}
    >
      {bg ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={bg} alt="" className={backgroundImageClass} />
          {!hasLabSceneOverlay ? (
            <div className="absolute inset-0 [background:var(--hero-overlay-tint-bg)] [opacity:var(--hero-overlay-tint-opacity)]" />
          ) : null}
        </>
      ) : (
        <div className="absolute inset-0 [background:var(--hero-overlay-no-image-bg)]" />
      )}

      {labSceneOverlayClassName ? (
        <div
          className={`pointer-events-none absolute inset-0 z-[5] ${labSceneOverlayClassName}`}
        />
      ) : null}

      <div className={heroContentClass}>
        <header className="flex items-center justify-between pt-5">
          <div className="flex items-center gap-3">
            {headerLogoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={headerLogoUrl}
                alt={business?.name ?? "Logo"}
                className="h-11 w-auto opacity-95 sm:h-12"
              />
            ) : null}

            <div className="hidden text-sm font-semibold [color:var(--hero-text-90)] sm:block">
              {business?.name ?? "Business Control Center"}
            </div>
          </div>

          <nav className={desktopNavClass}>
            <a
              href="#"
              className="rounded-full border px-4 py-2 text-xs font-semibold transition [border-color:var(--hero-chrome-surface-border-safe)] [background:var(--hero-chrome-surface-bg)] [color:var(--hero-text-90)] hover:[background:var(--hero-chrome-surface-hover-bg)]"
            >
              Home
            </a>
            <a
              href="#"
              className="rounded-full border px-4 py-2 text-xs font-semibold transition [border-color:var(--hero-chrome-surface-border-safe)] [background:var(--hero-chrome-surface-bg)] [color:var(--hero-text-90)] hover:[background:var(--hero-chrome-surface-hover-bg)]"
            >
              Services
            </a>
            <a
              href="#"
              className="rounded-full border px-4 py-2 text-xs font-semibold transition [border-color:var(--hero-chrome-surface-border-safe)] [background:var(--hero-chrome-surface-bg)] [color:var(--hero-text-90)] hover:[background:var(--hero-chrome-surface-hover-bg)]"
            >
              Contact
            </a>
          </nav>

          <div className={mobileNavClass}>
            <input
              id="bcc-mobile-menu"
              type="checkbox"
              className="peer sr-only"
              {...(shouldBindLabMenuHandlers
                ? {
                    checked: Boolean(forceMobileMenuOpen),
                    onChange: (event: ChangeEvent<HTMLInputElement>) =>
                      handleMenuStateChange(event.target.checked),
                  }
                : {})}
            />

            <label
              htmlFor="bcc-mobile-menu"
              className="cursor-pointer rounded-xl border p-2 transition peer-checked:pointer-events-none peer-checked:opacity-0 [border-color:var(--hero-chrome-surface-border-safe)] [background:var(--hero-chrome-surface-bg)] hover:[background:var(--hero-chrome-surface-hover-bg)]"
              aria-label="Abrir menú"
            >
              <span className="block h-0.5 w-6 [background:var(--hero-text-inverse)]" />
              <span className="mt-1 block h-0.5 w-6 [background:var(--hero-text-inverse)]" />
              <span className="mt-1 block h-0.5 w-6 [background:var(--hero-text-inverse)]" />
            </label>

            <label
              htmlFor="bcc-mobile-menu"
              className={menuBackdropClass}
              aria-label="Cerrar menú"
            />

            <div className={menuPanelClass}>
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold">{business?.name ?? "Menú"}</div>

                <label
                  htmlFor="bcc-mobile-menu"
                  className="cursor-pointer rounded-lg border px-3 py-1 text-xs transition [border-color:var(--hero-chrome-surface-border-safe)] [background:var(--hero-chrome-surface-bg)] hover:[background:var(--hero-chrome-surface-hover-bg)]"
                >
                  Cerrar
                </label>
              </div>

              <div className="mt-4 space-y-2">
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
            </div>
          </div>
        </header>

        <main className="min-h-0 flex-1 pt-5 pb-36 md:pb-0">
          <div className="grid grid-cols-1 items-center gap-5 md:grid-cols-2 md:gap-8">
            <div className={`${copyPositionClass} ${copyPaneOrderClass}`}>
              {showBadge ? <Pill className="mb-3">{badge}</Pill> : null}

              <h1 className={`text-balance text-3xl font-extrabold leading-[1.02] tracking-tight [color:var(--hero-text-inverse)] sm:text-5xl md:text-6xl ${headlinePositionClass}`}>
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

              <div className="mt-1.5 md:hidden">
                <div className={`relative mx-auto flex aspect-[16/7] w-full max-w-sm items-center rounded-3xl ${logoAlignClass} ${logoFramePaddingClass} ${visualFrameSurfaceClass}`}>
                  {heroLogoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={heroLogoUrl}
                      alt={business?.name ?? "Logo"}
                      className="max-h-32 w-auto opacity-95"
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

              <p className={`mt-0.5 max-w-lg rounded-xl px-3 py-2 text-[13px] leading-snug md:hidden ${frameSurfaceClass} [color:var(--hero-text-90)]`}>
                {subtitle}
              </p>

              <div className={`mt-4 mb-6 grid grid-cols-2 gap-3 md:hidden ${ctaMobilePositionClass}`}>
                <a
                  href={href1}
                  className="inline-flex w-full items-center justify-center rounded-xl px-3 py-2 text-xs font-semibold transition [background:var(--hero-cta-primary)] [color:var(--hero-cta-primary-foreground)] hover:[background:var(--hero-cta-primary-hover)]"
                >
                  {cta1}
                </a>

                <a
                  href={href2}
                  className="inline-flex w-full items-center justify-center rounded-xl px-3 py-2 text-xs font-semibold transition [background:var(--hero-cta-secondary)] [color:var(--hero-cta-secondary-foreground)] hover:[background:var(--hero-cta-secondary-hover)]"
                >
                  {cta2}
                </a>
              </div>

              <p className="mt-3 hidden max-w-lg text-sm sm:text-base md:block md:text-lg [color:var(--hero-text-82)]">
                {subtitle}
              </p>

              <div className={`mt-5 hidden flex-wrap items-center gap-3 md:flex ${ctaDesktopAlignClass}`}>
                <a
                  href={href1}
                  className="inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold transition [background:var(--hero-cta-primary)] [color:var(--hero-cta-primary-foreground)] hover:[background:var(--hero-cta-primary-hover)]"
                >
                  {cta1}
                </a>

                <a
                  href={href2}
                  className="inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold transition [background:var(--hero-cta-secondary)] [color:var(--hero-cta-secondary-foreground)] hover:[background:var(--hero-cta-secondary-hover)]"
                >
                  {cta2}
                </a>
              </div>
            </div>

            <div className={visualPaneClass}>
              <div className={`relative mx-auto flex aspect-[16/7] w-full items-center rounded-[28px] ${logoAlignClass} ${logoFramePaddingClass} ${visualFrameSurfaceClass} sm:aspect-video md:aspect-[16/10]`}>
                {heroLogoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={heroLogoUrl}
                    alt={business?.name ?? "Logo"}
                    className="max-h-44 w-auto opacity-95 md:max-h-64"
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

        <footer className="mt-auto pb-3">
          <div className={`rounded-2xl px-4 py-3 ${footerSurfaceClass} [color:var(--hero-text-88)]`}>
            <div className={`mx-auto flex max-w-5xl flex-col items-center gap-2 md:flex-row md:gap-6 ${footerDesktopAlignClass}`}>
              <div className="grid w-full max-w-md grid-cols-2 gap-x-4 gap-y-2 md:hidden">
                <div className="flex justify-center">
                  <FooterInlineItem icon="📍" text="Dirección (pendiente)" />
                </div>
                <div className="flex justify-center">
                  <FooterInlineItem icon="☎️" text="Teléfono" />
                </div>
                <div className="flex justify-center">
                  <FooterInlineItem icon="💬" text="WhatsApp" />
                </div>
                <div className="flex justify-center">
                  <FooterInlineItem icon="✉️" text="email@cliente.com" />
                </div>
              </div>

              <div className="hidden flex-wrap items-center justify-center gap-6 md:flex">
                <FooterInlineItem icon="📍" text="Dirección (pendiente)" />
                <FooterInlineItem icon="☎️" text="Teléfono" />
                <FooterInlineItem icon="💬" text="WhatsApp" />
                <FooterInlineItem icon="✉️" text="email@cliente.com" />
              </div>
            </div>

            <div className={`mt-3 flex items-center gap-3 text-[11px] md:text-xs ${footerBottomAlignClass}`}>
              <div className={`min-w-0 truncate whitespace-nowrap ${footerBrandAlignClass}`}>
                © 2026{" "}
                <span className="font-semibold [color:var(--hero-text-inverse)]">
                  {business?.name ?? "Caballeros Barbería"}
                </span>
              </div>

              <div className="shrink-0">
                <CreatedByMini />
              </div>
            </div>
          </div>
        </footer>
      </div>
    </section>
  );
}
