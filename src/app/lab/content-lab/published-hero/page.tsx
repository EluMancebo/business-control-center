"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
} from "react";
import BrandHydrator from "@/components/brand/BrandHydrator";
import PanelBadge from "@/components/panel/ui/PanelBadge";
import PanelButton from "@/components/panel/ui/PanelButton";
import PanelCard from "@/components/panel/ui/PanelCard";
import PublicHero, { type LabHeroPiece } from "@/components/web/hero/PublicHero";
import type { BrandScope } from "@/lib/brand/storage";
import {
  COMPONENT_REGISTRY,
} from "@/lib/content/components/registry";
import type { ComponentId } from "@/lib/content/components/types";
import { validateLabPiece } from "@/lib/content-lab/validation";
import { mapPublishedSnapshotToContentPayload } from "@/lib/content-lab/published/mapPublishedSnapshotToContentPayload";
import type { PublishedPieceSnapshot } from "@/lib/content-lab/published/types";
import type { LabPiece } from "@/lib/content-lab/types";
import {
  getTallerLabVisualCssVars,
  getTallerPanelVisualCssVars,
} from "@/lib/panel/tallerVisualContract";
import type { HeroAppearanceVariant } from "@/lib/web/hero/types";
import { fetchSystemMediaClientByQuery } from "@/lib/taller/media/service";
import type {
  AssetItem,
  AssetVariantKey,
  MediaOrientation,
  MediaReviewStatus,
} from "@/lib/taller/media/types";

type CandidateId = "barber-pro" | "urban-studio";
type PieceFamily = "hero" | "banner" | "landing" | "cards" | "promos" | "more";
type CanvasMode = "preview" | "layout";
type PreviewViewport = "mobile" | "tablet" | "desktop" | "wide";
type SourceMode = "preset" | "hero-safe-media";
type VisualSourceKind = "hero-image" | "logo" | "video";
type Blueprint = "centered" | "split" | "poster" | "logo-first";
type LayoutZone =
  | "top-left"
  | "top-center"
  | "top-right"
  | "center-left"
  | "center"
  | "center-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";
type LayoutPiece = Extract<LabHeroPiece, "logo" | "headline" | "subheadline" | "cta-group">;
type OperationalPlacementPiece = Extract<
  LabHeroPiece,
  "nav-burger" | "theme-toggle" | "footer-hero" | "contact-strip" | "animated-signature"
>;
type StructuralAlign = "start" | "center" | "end";
type StructuralWidth = "narrow" | "medium" | "wide";
type StructuralEmphasis = "soft" | "balanced" | "dominant";
type StructuralSpacing = "compact" | "normal" | "relaxed";
type TextStyleScale = "S" | "M" | "L" | "XL" | "Display";
type TextStyleWeight = "regular" | "medium" | "semibold" | "bold";
type TextStyleColor =
  | "auto"
  | "default"
  | "white"
  | "dark"
  | "accent"
  | "subtle"
  | "inverse"
  | "highlight";
type TextStyleShadow = "off" | "soft" | "medium";
type TextStyleEmphasis = "soft" | "balanced" | "dominant";
type TextStyleFont = "sans" | "display";
type TextStyleLineHeight = "tight" | "normal" | "relaxed";
type TextStyleTracking = "tight" | "normal" | "wide";
type CtaStyle = "filled" | "outline" | "soft";
type LayoutDensity = "compact" | "balanced" | "airy";
type LayoutBalance = "copy-first" | "balanced" | "media-first";
type LayoutContentWidth = "narrow" | "medium" | "wide";
type LayoutMediaDominance = "low" | "medium" | "high";
type LayoutSafeArea = "tight" | "normal" | "relaxed";
type OverlayColor = "blue" | "green" | "amber" | "purple" | "smoke";
type OverlayStyleMode = "gradient" | "solid" | "none";
type BackgroundEmphasis = "low" | "medium" | "high";
type BackgroundFit = "cover" | "contain" | "fill";
type BackgroundFocus = "center" | "top" | "bottom" | "left" | "right";
type LabHeadlineTone =
  | "white"
  | "black"
  | "inverse"
  | "muted-light"
  | "warm-light"
  | "cool-light";
type CtaRegulation = "balanced" | "primary-focus";
type AssetPickerView = "closed" | "open";
type AssetComponentFilter = "all" | "hero" | "logo" | "icon";
type AssetContextFilter = "all" | "hero" | "navbar" | "footer";
type QualityDimensionKey =
  | "conversion"
  | "design"
  | "ux"
  | "seo"
  | "responsive"
  | "chromia"
  | "accessibility"
  | "performance"
  | "branding";
type QualityDimension = {
  key: QualityDimensionKey;
  label: string;
  score: number;
  warning: string;
  recommendation: string;
};

type PieceVisibility = Record<LabHeroPiece, boolean>;
type PieceStructure = {
  align: StructuralAlign;
  width: StructuralWidth;
  emphasis: StructuralEmphasis;
  spacing: StructuralSpacing;
};
type TextStyle = {
  scale: TextStyleScale;
  weight: TextStyleWeight;
  color: TextStyleColor;
  shadow: TextStyleShadow;
  emphasis: TextStyleEmphasis;
  font: TextStyleFont;
  lineHeight: TextStyleLineHeight;
  tracking: TextStyleTracking;
};
type SessionRole = "admin" | "owner" | "marketing" | "staff" | null;
type ContentProperty =
  | "headlineDraft"
  | "subheadlineDraft"
  | "primaryCtaDraft"
  | "secondaryCtaDraft"
  | "primaryCtaHrefDraft"
  | "secondaryCtaHrefDraft";
type VariantContentOverrides = Record<PreviewViewport, Record<ContentProperty, boolean>>;
type VariantSnapshot = {
  pieceVisibility: PieceVisibility;
  headlineDraft: string;
  subheadlineDraft: string;
  badgeDraft: string;
  primaryCtaDraft: string;
  secondaryCtaDraft: string;
  primaryCtaHrefDraft: string;
  secondaryCtaHrefDraft: string;
  textStyles: Record<Extract<LabHeroPiece, "headline" | "subheadline" | "cta-group">, TextStyle>;
  ctaStyle: CtaStyle;
  overlayDensity: HeroAppearanceVariant;
  overlayStyleMode: OverlayStyleMode;
  overlayTint: OverlayColor;
  labHeadlineTone: LabHeadlineTone;
  backgroundEmphasis: BackgroundEmphasis;
  ctaRegulation: CtaRegulation;
  blueprint: Blueprint;
  pieceZones: Record<LayoutPiece, LayoutZone>;
  operationalPieceZones: Record<OperationalPlacementPiece, LayoutZone>;
  pieceStructure: Record<LayoutPiece, PieceStructure>;
  layoutDensity: LayoutDensity;
  layoutBalance: LayoutBalance;
  layoutContentWidth: LayoutContentWidth;
  layoutMediaDominance: LayoutMediaDominance;
  layoutSafeArea: LayoutSafeArea;
  mobileLogoScale: "compact" | "balanced" | "expressive";
  navTriggerSize: "sm" | "md" | "lg";
  navTriggerTone: "inverse" | "primary" | "muted";
  navTriggerSurface: "minimal" | "solid" | "glass";
  navTriggerAura: "none" | "soft" | "strong";
  navTriggerHover: "soft" | "lift" | "glow";
  navOpenBehavior: "overlay" | "drawer" | "fullscreen";
  navOverlayDensity: "low" | "medium" | "high";
  navOverlayStyle: "tinted" | "neutral" | "none";
  navOverlayTone: "neutral" | "primary" | "secondary" | "accent" | "dark";
  navReadabilityBoost: "none" | "soft" | "strong";
  navLinksVisible: boolean;
  navPlacement: "auto" | "left" | "center" | "right";
  desktopNavSize: "sm" | "md" | "lg";
  desktopNavTone: "inverse" | "primary" | "muted";
  desktopNavSurface: "minimal" | "solid" | "glass";
  desktopNavHover: "soft" | "lift" | "glow";
  desktopNavPresence: "low" | "medium" | "high";
  navPanelOrigin: "left" | "center" | "right";
  navPanelWidth: "narrow" | "normal" | "wide";
  navPanelStyle: "minimal" | "solid" | "glass";
  navMenuAlignment: "left" | "center" | "right";
  navMenuItemSize: "sm" | "md" | "lg";
  navMenuVerticalSpacing: "tight" | "normal" | "relaxed";
  logoOpacity: number;
  logoShadow: "none" | "soft" | "medium";
  logoFrameStyle: "minimal" | "solid" | "glass";
  themeToggleDefault: "light" | "dark" | "auto";
  themeToggleStyle: "minimal" | "solid" | "glass";
  themeTogglePosition: "left" | "right";
  themeEffectIntensity: "low" | "medium" | "high";
  themeEffectScope: "button" | "header" | "hero";
  headerIntegration: "integrated" | "separated";
  headerVisualStyle: "minimal" | "solid" | "glass";
  headerTopSpacing: "tight" | "normal" | "relaxed";
  headerRelation: "balanced" | "logo-focus" | "nav-focus";
  headerLogoSize: "sm" | "md" | "lg";
  headerLogoAlign: "left" | "center" | "right";
  headerBandHeight: "10" | "15" | "20";
  headerSurfaceTone: "neutral" | "primary" | "secondary" | "accent" | "dark";
  footerAddress: string;
  footerPhone: string;
  footerWhatsapp: string;
  footerEmail: string;
  footerIntegration: "integrated" | "separated";
  footerVisualStyle: "minimal" | "solid" | "glass";
  footerHeight: "compact" | "normal" | "spacious";
  contactDensity: "compact" | "balanced" | "spacious";
  contactContrast: "soft" | "medium" | "strong";
  contactHover: "none" | "soft" | "strong";
  contactEffect: "none" | "lift" | "glow";
  contactShadow: "none" | "soft" | "medium";
  contactLinksVisible: boolean;
  footerIconsVisible: boolean;
  footerPlacement: "auto" | "left" | "center" | "right";
  footerSignatureSeparation: "tight" | "normal" | "relaxed";
  footerLogoSize: "sm" | "md" | "lg";
  footerLogoAlign: "left" | "center" | "right";
  footerBandHeight: "10" | "15" | "20";
  footerSurfaceTone: "neutral" | "primary" | "secondary" | "accent" | "dark";
  signatureSize: "sm" | "md" | "lg";
  signatureTone: "default" | "muted" | "accent";
  signatureOpacity: number;
  signatureAnimation: "draw" | "pulse" | "float" | "none";
};
type VariantSnapshotSet = Record<PreviewViewport, VariantSnapshot>;
type HeadlineTransformMode = "shorten" | "commercial" | "seo-local";
type SuggestionReturnTarget = "design" | "quality";
type AppliedSuggestionBackup = {
  id: string;
  label: string;
  snapshot: VariantSnapshot;
  selectedHeroAssetId: string;
  selectedLogoAssetId: string;
};

const HERO_CANDIDATES: Record<CandidateId, PublishedPieceSnapshot> = {
  "barber-pro": {
    id: "snapshot-lab-hero-001",
    businessId: "business-lab-001",
    pieceType: "hero",
    zone: "home.hero",
    status: "published",
    meta: {
      version: 1,
      publishedAt: "2026-04-12T10:00:00.000Z",
      publishedByUserId: "user-lab-001",
      sourcePresetVaultItemId: "preset-vault-lab-001",
      sourcePublisherInstanceId: "publisher-instance-lab-001",
    },
    payload: {
      badgeText: "LAB - Barber Pro",
      headline: "Controla la escena visual sin romper el flujo publicado",
      subheadline:
        "Snapshot publicado, mapper y renderer real en una sola superficie de validacion.",
      primaryCta: { label: "Reservar cita", href: "#reservar" },
      secondaryCta: { label: "Ver servicios", href: "#servicios" },
      media: {
        url: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1800&q=80",
        alt: "Barberia en primer plano",
        format: "jpg",
      },
      accent: "#2563eb",
      overlay: "soft",
    },
  },
  "urban-studio": {
    id: "snapshot-lab-hero-002",
    businessId: "business-lab-001",
    pieceType: "hero",
    zone: "home.hero",
    status: "published",
    meta: {
      version: 1,
      publishedAt: "2026-04-12T10:00:00.000Z",
      publishedByUserId: "user-lab-001",
      sourcePresetVaultItemId: "preset-vault-lab-002",
      sourcePublisherInstanceId: "publisher-instance-lab-002",
    },
    payload: {
      badgeText: "LAB - Urban Studio",
      headline: "Preview real del hero publicado para iterar sin tocar produccion",
      subheadline:
        "El laboratorio orquesta configuracion visual en vivo mientras mantiene el renderer real.",
      primaryCta: { label: "Agendar ahora", href: "#agendar" },
      secondaryCta: { label: "Conocer plan", href: "#plan" },
      media: {
        url: "https://images.unsplash.com/photo-1503951458645-643d53bfd90f?auto=format&fit=crop&w=1800&q=80",
        alt: "Estudio con iluminacion",
        format: "jpg",
      },
      accent: "#14b8a6",
      overlay: "solid",
    },
  },
};
const INITIAL_CANDIDATE_HERO = mapPublishedSnapshotToContentPayload(HERO_CANDIDATES["barber-pro"]);

const PIECE_FAMILY_TABS: readonly { id: PieceFamily; label: string; status: "active" | "planned" }[] = [
  { id: "hero", label: "Hero", status: "active" },
  { id: "banner", label: "Banner", status: "planned" },
  { id: "landing", label: "Landing", status: "planned" },
  { id: "cards", label: "Cards", status: "planned" },
  { id: "promos", label: "Promos", status: "planned" },
  { id: "more", label: "More", status: "planned" },
];

const COMPONENT_TO_LAB_PIECE: Partial<Record<ComponentId, LabHeroPiece>> = {
  "nav-burger": "nav-burger",
  "theme-toggle": "theme-toggle",
  badge: "badge",
  headline: "headline",
  subheadline: "subheadline",
  "cta-group": "cta-group",
  "cta-button": "cta-group",
  "background-media": "background-media",
  logo: "logo",
  overlay: "overlay-atmosphere",
  "contact-strip": "contact-strip",
  "animated-signature": "animated-signature",
};

const LAB_PIECE_LABEL: Record<LabHeroPiece, string> = {
  logo: "Logo",
  headline: "Titular",
  subheadline: "Subtitulo",
  "cta-group": "Botones CTA",
  badge: "Badge",
  "header-hero": "Header hero",
  "desktop-nav": "Navegacion escritorio",
  "nav-burger": "Hamburguesa / menu movil",
  "theme-toggle": "Claro/Oscuro",
  "footer-hero": "Footer hero",
  "contact-strip": "Contacto hero",
  "animated-signature": "Firma animada",
  "background-media": "Fondo / media",
  "overlay-atmosphere": "Overlay / atmosfera",
};

const LAYOUT_ENABLED_PIECES = new Set<LabHeroPiece>(["logo", "headline", "subheadline", "cta-group"]);
const OPERATIONAL_PLACEMENT_PIECES: readonly OperationalPlacementPiece[] = [
  "nav-burger",
  "theme-toggle",
  "footer-hero",
  "contact-strip",
  "animated-signature",
];
const OPERATIONAL_PLACEMENT_PIECE_SET = new Set<LabHeroPiece>(OPERATIONAL_PLACEMENT_PIECES);

const PIECE_LIBRARY: readonly { id: LabHeroPiece; label: string; layoutEnabled: boolean }[] = (() => {
  const pieces: { id: LabHeroPiece; label: string; layoutEnabled: boolean }[] = [];
  const seen = new Set<LabHeroPiece>();

  COMPONENT_REGISTRY.forEach((component) => {
    if (!component.enabled) return;

    const mappedPiece = COMPONENT_TO_LAB_PIECE[component.id];
    if (!mappedPiece || seen.has(mappedPiece)) return;

    seen.add(mappedPiece);
    pieces.push({
      id: mappedPiece,
      label: LAB_PIECE_LABEL[mappedPiece],
      layoutEnabled: LAYOUT_ENABLED_PIECES.has(mappedPiece),
    });
  });

  if (!seen.has("badge")) {
    pieces.push({
      id: "badge",
      label: LAB_PIECE_LABEL.badge,
      layoutEnabled: false,
    });
  }

  if (!seen.has("footer-hero")) {
    pieces.push({
      id: "footer-hero",
      label: LAB_PIECE_LABEL["footer-hero"],
      layoutEnabled: false,
    });
  }

  if (!seen.has("header-hero")) {
    pieces.push({
      id: "header-hero",
      label: LAB_PIECE_LABEL["header-hero"],
      layoutEnabled: false,
    });
  }

  if (!seen.has("desktop-nav")) {
    pieces.push({
      id: "desktop-nav",
      label: LAB_PIECE_LABEL["desktop-nav"],
      layoutEnabled: false,
    });
  }

  return pieces;
})();

const OVERLAY_TINT_PREVIEW_CLASS: Record<OverlayColor, string> = {
  blue: "bg-gradient-to-r from-blue-700 to-slate-900",
  green: "bg-gradient-to-r from-emerald-700 to-teal-900",
  amber: "bg-gradient-to-r from-amber-700 to-stone-900",
  purple: "bg-gradient-to-r from-violet-700 to-indigo-900",
  smoke: "bg-gradient-to-r from-slate-700 to-slate-950",
};

const LAYOUT_PIECES: readonly LayoutPiece[] = ["logo", "headline", "subheadline", "cta-group"];
const LAYOUT_ZONES: readonly LayoutZone[] = [
  "top-left",
  "top-center",
  "top-right",
  "center-left",
  "center",
  "center-right",
  "bottom-left",
  "bottom-center",
  "bottom-right",
];

const VIEWPORTS: Record<PreviewViewport, { width: number; height: number; label: string }> = {
  mobile: { width: 375, height: 812, label: "Mobile" },
  tablet: { width: 768, height: 1024, label: "Tablet" },
  desktop: { width: 1280, height: 800, label: "Desktop" },
  wide: { width: 1440, height: 900, label: "Wide" },
};
const VIEWPORT_INHERITANCE_ORDER: readonly PreviewViewport[] = [
  "mobile",
  "tablet",
  "desktop",
  "wide",
];
const VARIANT_FILTERS: readonly (AssetVariantKey | "all")[] = [
  "all",
  "optimized",
  "original",
  "thumbnail",
  "vectorized-svg",
];
const ORIENTATION_FILTERS: readonly (MediaOrientation | "all")[] = [
  "all",
  "landscape",
  "portrait",
  "square",
];
const REVIEW_FILTERS: readonly (MediaReviewStatus | "all")[] = [
  "all",
  "approved",
  "reviewed",
  "draft",
];

const HERO_SOURCE_ALLOWED_CONTEXT = "home.hero.background";
const HERO_SOURCE_ALLOWED_CONTEXT_LEGACY = "hero.background";
const PREVIEW_STAGE_PADDING: Record<PreviewViewport, { x: number; y: number }> = {
  mobile: { x: 24, y: 34 },
  tablet: { x: 36, y: 48 },
  desktop: { x: 30, y: 42 },
  wide: { x: 30, y: 42 },
};
const PREVIEW_MIN_SCALE: Record<PreviewViewport, number> = {
  mobile: 0.32,
  tablet: 0.27,
  desktop: 0.45,
  wide: 0.45,
};
const WORKSPACE_VIEWPORT_BOTTOM_GUTTER = 12;
const CONTENT_PROPERTIES: readonly ContentProperty[] = [
  "headlineDraft",
  "subheadlineDraft",
  "primaryCtaDraft",
  "secondaryCtaDraft",
  "primaryCtaHrefDraft",
  "secondaryCtaHrefDraft",
];
const OPERATIONAL_INSPECTOR_PIECES = new Set<LabHeroPiece>([
  "header-hero",
  "nav-burger",
  "theme-toggle",
  "footer-hero",
  "contact-strip",
  "animated-signature",
]);

const DEFAULT_PIECE_VISIBILITY: PieceVisibility = {
  logo: true,
  headline: true,
  subheadline: true,
  "cta-group": true,
  badge: true,
  "header-hero": true,
  "desktop-nav": true,
  "nav-burger": true,
  "theme-toggle": true,
  "footer-hero": true,
  "contact-strip": true,
  "animated-signature": true,
  "background-media": true,
  "overlay-atmosphere": true,
};

const DEFAULT_PIECE_ZONES: Record<LayoutPiece, LayoutZone> = {
  logo: "top-left",
  headline: "center-left",
  subheadline: "center-left",
  "cta-group": "bottom-left",
};
const DEFAULT_OPERATIONAL_PIECE_ZONES: Record<OperationalPlacementPiece, LayoutZone> = {
  "nav-burger": "top-right",
  "theme-toggle": "top-left",
  "footer-hero": "bottom-center",
  "contact-strip": "bottom-left",
  "animated-signature": "bottom-right",
};

const DEFAULT_PIECE_STRUCTURE: Record<LayoutPiece, PieceStructure> = {
  logo: { align: "start", width: "medium", emphasis: "balanced", spacing: "normal" },
  headline: { align: "start", width: "wide", emphasis: "dominant", spacing: "normal" },
  subheadline: { align: "start", width: "medium", emphasis: "balanced", spacing: "normal" },
  "cta-group": { align: "start", width: "medium", emphasis: "balanced", spacing: "normal" },
};

const DEFAULT_TEXT_STYLES: Record<Extract<LabHeroPiece, "headline" | "subheadline" | "cta-group">, TextStyle> = {
  headline: {
    scale: "Display",
    weight: "bold",
    color: "auto",
    shadow: "soft",
    emphasis: "dominant",
    font: "display",
    lineHeight: "tight",
    tracking: "tight",
  },
  subheadline: {
    scale: "M",
    weight: "medium",
    color: "subtle",
    shadow: "off",
    emphasis: "balanced",
    font: "sans",
    lineHeight: "normal",
    tracking: "normal",
  },
  "cta-group": {
    scale: "M",
    weight: "semibold",
    color: "default",
    shadow: "off",
    emphasis: "balanced",
    font: "sans",
    lineHeight: "normal",
    tracking: "normal",
  },
};

const BLUEPRINT_PRESETS: Record<
  Blueprint,
  {
    navPosition: "left" | "center" | "right";
    visualPosition: "left" | "center" | "right";
    footerPosition: "left" | "center" | "right";
    logoPosition: "left" | "center" | "right";
  }
> = {
  centered: {
    navPosition: "center",
    visualPosition: "center",
    footerPosition: "center",
    logoPosition: "center",
  },
  split: {
    navPosition: "left",
    visualPosition: "right",
    footerPosition: "left",
    logoPosition: "left",
  },
  poster: {
    navPosition: "center",
    visualPosition: "center",
    footerPosition: "center",
    logoPosition: "center",
  },
  "logo-first": {
    navPosition: "center",
    visualPosition: "center",
    footerPosition: "center",
    logoPosition: "center",
  },
};

const BLUEPRINT_ZONE_PRESETS: Record<Blueprint, Record<LayoutPiece, LayoutZone>> = {
  centered: {
    logo: "top-center",
    headline: "center",
    subheadline: "center",
    "cta-group": "bottom-center",
  },
  split: {
    logo: "top-left",
    headline: "center-left",
    subheadline: "center-left",
    "cta-group": "bottom-left",
  },
  poster: {
    logo: "top-center",
    headline: "center-left",
    subheadline: "center-left",
    "cta-group": "bottom-left",
  },
  "logo-first": {
    logo: "center",
    headline: "center-left",
    subheadline: "bottom-left",
    "cta-group": "bottom-right",
  },
};

function buildOperationalZonesFromBlueprint(
  blueprint: Blueprint
): Record<OperationalPlacementPiece, LayoutZone> {
  const preset = BLUEPRINT_PRESETS[blueprint];
  const navColumn = preset.navPosition;
  const themeColumn = navColumn === "left" ? "right" : "left";
  const footerColumn = preset.footerPosition;

  return {
    "nav-burger": `top-${navColumn}` as LayoutZone,
    "theme-toggle": `top-${themeColumn}` as LayoutZone,
    "footer-hero": `bottom-${footerColumn}` as LayoutZone,
    "contact-strip": `bottom-${footerColumn}` as LayoutZone,
    "animated-signature": "bottom-right",
  };
}

function SmartphoneIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <rect x="7" y="2.5" width="10" height="19" rx="2.2" />
      <path d="M10 5.5h4" />
      <circle cx="12" cy="18.5" r="0.8" />
    </svg>
  );
}

function TabletIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <rect x="4" y="3.5" width="16" height="17" rx="2.3" />
      <circle cx="12" cy="17.5" r="0.8" />
    </svg>
  );
}

function DesktopIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <rect x="3" y="4" width="18" height="12" rx="1.8" />
      <path d="M9 20h6M12 16v4" />
    </svg>
  );
}

const VIEWPORT_ICON: Record<PreviewViewport, (props: { className?: string }) => ReactElement> = {
  mobile: SmartphoneIcon,
  tablet: TabletIcon,
  desktop: DesktopIcon,
  wide: DesktopIcon,
};

function clamp(value: number) {
  return Math.min(100, Math.max(0, Math.round(value)));
}

function resolveLabBrandScopeFromRole(role: SessionRole): Extract<BrandScope, "panel" | "studio"> {
  return role === "admin" ? "studio" : "panel";
}

function zoneToColumn(zone: LayoutZone): "left" | "center" | "right" {
  if (zone.endsWith("left")) return "left";
  if (zone.endsWith("right")) return "right";
  return "center";
}

function zoneToRow(zone: LayoutZone): "top" | "center" | "bottom" {
  if (zone.startsWith("top")) return "top";
  if (zone.startsWith("bottom")) return "bottom";
  return "center";
}

function zoneToCopyBlock(zone: LayoutZone): "left" | "center-left" | "center" | "right" {
  const column = zoneToColumn(zone);
  if (column === "left") return "left";
  if (column === "right") return "right";
  return "center";
}

function columnToCtaPosition(column: "left" | "center" | "right"): "start" | "center" | "end" {
  if (column === "left") return "start";
  if (column === "right") return "end";
  return "center";
}

function structuralAlignToColumn(align: StructuralAlign): "left" | "center" | "right" {
  if (align === "center") return "center";
  if (align === "end") return "right";
  return "left";
}

function structuralAlignToTextClass(align: StructuralAlign): string {
  if (align === "center") return "text-center";
  if (align === "end") return "text-right";
  return "text-left";
}

function structuralAlignToContainerClass(align: StructuralAlign): string {
  if (align === "center") return "mx-auto";
  if (align === "end") return "ml-auto";
  return "";
}

function columnToStructuralAlign(column: "left" | "center" | "right"): StructuralAlign {
  if (column === "center") return "center";
  if (column === "right") return "end";
  return "start";
}

function resolveViewportNavigationMode(viewport: PreviewViewport): "mobile" | "desktop" {
  if (viewport === "desktop" || viewport === "wide") return "desktop";
  return "mobile";
}

function resolveViewportNavPanelOrigin(
  viewport: PreviewViewport,
  navPlacement: "auto" | "left" | "center" | "right",
  navPosition: "left" | "center" | "right"
): "left" | "center" | "right" {
  if (resolveViewportNavigationMode(viewport) === "desktop") {
    return navPosition;
  }
  if (navPlacement === "left" || navPlacement === "center" || navPlacement === "right") {
    return navPlacement;
  }
  return navPosition;
}

function structuralEmphasisToClass(emphasis: StructuralEmphasis): string {
  if (emphasis === "soft") return "opacity-90";
  if (emphasis === "dominant") return "scale-[1.02]";
  return "";
}

function structuralWidthToPieceClass(
  piece: LayoutPiece,
  width: StructuralWidth
): string {
  if (piece === "logo") {
    if (width === "narrow") return "max-w-[14rem]";
    if (width === "wide") return "max-w-[30rem]";
    return "max-w-[22rem]";
  }

  if (piece === "subheadline") {
    if (width === "narrow") return "max-w-md";
    if (width === "wide") return "max-w-3xl";
    return "max-w-2xl";
  }

  if (piece === "cta-group") {
    if (width === "narrow") return "max-w-sm";
    if (width === "wide") return "max-w-2xl";
    return "max-w-xl";
  }

  return "";
}

function zoneRowToOffsetClass(row: "top" | "center" | "bottom"): string {
  if (row === "top") return "-translate-y-2";
  if (row === "bottom") return "translate-y-2";
  return "translate-y-0";
}

function alignPieceStructureToZones(
  current: Record<LayoutPiece, PieceStructure>,
  zones: Record<LayoutPiece, LayoutZone>
): Record<LayoutPiece, PieceStructure> {
  return {
    logo: {
      ...current.logo,
      align: columnToStructuralAlign(zoneToColumn(zones.logo)),
    },
    headline: {
      ...current.headline,
      align: columnToStructuralAlign(zoneToColumn(zones.headline)),
    },
    subheadline: {
      ...current.subheadline,
      align: columnToStructuralAlign(zoneToColumn(zones.subheadline)),
    },
    "cta-group": {
      ...current["cta-group"],
      align: columnToStructuralAlign(zoneToColumn(zones["cta-group"])),
    },
  };
}

function structuralWidthToCopyWidth(width: StructuralWidth): "narrow" | "normal" | "wide" {
  if (width === "narrow") return "narrow";
  if (width === "wide") return "wide";
  return "normal";
}

function structuralSpacingToGap(value: StructuralSpacing): "tight" | "normal" | "relaxed" {
  if (value === "compact") return "tight";
  if (value === "relaxed") return "relaxed";
  return "normal";
}

function textStyleToClass(piece: "headline" | "subheadline" | "cta-group", style: TextStyle): string {
  const scaleClass =
    piece === "headline"
      ? style.scale === "S"
        ? "!text-2xl sm:!text-3xl md:!text-4xl"
        : style.scale === "M"
          ? "!text-3xl sm:!text-4xl md:!text-5xl"
          : style.scale === "L"
            ? "!text-4xl sm:!text-5xl md:!text-6xl"
            : style.scale === "XL"
              ? "!text-[2.9rem] sm:!text-[3.5rem] md:!text-[4.2rem]"
              : "!text-[3.25rem] sm:!text-[3.9rem] md:!text-[4.8rem]"
      : style.scale === "S"
        ? "!text-xs"
        : style.scale === "M"
          ? "!text-sm md:!text-base"
          : style.scale === "L"
            ? "!text-base md:!text-lg"
            : style.scale === "XL"
              ? "!text-lg md:!text-xl"
              : "!text-xl md:!text-2xl";

  const weightClass =
    style.weight === "regular"
      ? "!font-normal"
      : style.weight === "medium"
        ? "!font-medium"
        : style.weight === "semibold"
          ? "!font-semibold"
          : "!font-bold";
  const fontClass = style.font === "display" ? "font-display" : "font-sans";

  const colorClass =
    style.color === "auto"
      ? ""
      : style.color === "accent"
        ? piece === "headline"
          ? "![color:var(--accent-strong,var(--primary))]"
          : "[color:var(--accent-strong,var(--primary))]"
        : style.color === "subtle"
          ? "[color:var(--hero-text-82)]"
          : style.color === "inverse"
            ? piece === "headline"
              ? "![color:var(--hero-text-inverse)]"
              : "[color:var(--hero-text-inverse)]"
            : style.color === "highlight"
              ? "[color:var(--warning,var(--accent-strong,var(--primary)))]"
              : style.color === "white"
                ? piece === "headline"
                  ? "![color:var(--hero-text-inverse)]"
                  : "[color:var(--hero-text-inverse)]"
                : style.color === "dark"
                  ? piece === "headline"
                    ? "![color:var(--foreground)]"
                    : "[color:var(--foreground)]"
                  : style.color === "default" && piece === "headline"
                    ? "![color:var(--hero-text-inverse)]"
                    : "";

  const shadowClass =
    style.shadow === "soft"
      ? "[text-shadow:0_8px_20px_color-mix(in_oklab,var(--foreground)_24%,transparent)]"
      : style.shadow === "medium"
        ? "[text-shadow:0_10px_24px_color-mix(in_oklab,var(--foreground)_38%,transparent)]"
        : "";

  const emphasisClass =
    style.emphasis === "soft"
      ? "opacity-90"
      : style.emphasis === "dominant"
        ? "opacity-100 tracking-tight"
        : "opacity-95";
  const lineHeightClass =
    style.lineHeight === "tight"
      ? "leading-[1.02]"
      : style.lineHeight === "relaxed"
        ? "leading-[1.45]"
        : "leading-[1.2]";
  const trackingClass =
    style.tracking === "tight"
      ? "tracking-tight"
      : style.tracking === "wide"
        ? "tracking-wide"
        : "tracking-normal";

  return [
    scaleClass,
    weightClass,
    fontClass,
    colorClass,
    shadowClass,
    emphasisClass,
    lineHeightClass,
    trackingClass,
  ]
    .filter(Boolean)
    .join(" ");
}

function ctaStyleClasses(style: CtaStyle): { primary: string; secondary: string } {
  if (style === "outline") {
    return {
      primary:
        "border border-[color:var(--hero-text-inverse)] !bg-transparent [color:var(--hero-text-inverse)] hover:[background:color-mix(in_oklab,var(--hero-text-inverse)_14%,transparent)]",
      secondary:
        "border border-[color:var(--hero-text-90)] !bg-transparent [color:var(--hero-text-90)] hover:[background:color-mix(in_oklab,var(--hero-text-inverse)_10%,transparent)]",
    };
  }

  if (style === "soft") {
    return {
      primary:
        "border border-transparent ![background:color-mix(in_oklab,var(--hero-cta-primary)_60%,var(--surface-3,var(--card))_40%)] [color:var(--hero-cta-primary-foreground)]",
      secondary:
        "border border-transparent ![background:color-mix(in_oklab,var(--hero-cta-secondary)_78%,var(--surface-3,var(--card))_22%)] [color:var(--hero-cta-secondary-foreground)]",
    };
  }

  return { primary: "", secondary: "" };
}

function getAssetPreviewTone(item: AssetItem): "processing" | "success" | "warning" {
  if (item.reviewStatus === "approved") return "success";
  if (item.reviewStatus === "reviewed") return "processing";
  return "warning";
}

function sortByRecent(left: AssetItem, right: AssetItem): number {
  const leftTime = Date.parse(left.updatedAt || left.createdAt || "") || 0;
  const rightTime = Date.parse(right.updatedAt || right.createdAt || "") || 0;
  return rightTime - leftTime;
}

function getVariantScore(item: AssetItem): number {
  if (item.variantKey === "optimized") return 40;
  if (item.variantKey === "original") return 30;
  if (item.variantKey === "thumbnail") return 20;
  return 10;
}

function includesHeroAllowedContext(allowedIn: string[]): boolean {
  return allowedIn.some(
    (item) => item === HERO_SOURCE_ALLOWED_CONTEXT || item === HERO_SOURCE_ALLOWED_CONTEXT_LEGACY
  );
}

function toHeroSafeMediaSources(items: AssetItem[]): AssetItem[] {
  const groupedBySource = new Map<string, AssetItem>();

  items.forEach((item) => {
    const isEligible =
      item.status === "active" &&
      item.pipelineStatus === "ready" &&
      item.kind !== "video" &&
      Boolean(item.url?.trim()) &&
      includesHeroAllowedContext(item.allowedIn);

    if (!isEligible) return;

    const rootId = item.sourceAssetId || item._id;
    const previous = groupedBySource.get(rootId);
    if (!previous || getVariantScore(item) > getVariantScore(previous)) {
      groupedBySource.set(rootId, item);
    }
  });

  return Array.from(groupedBySource.values()).sort(sortByRecent);
}

function scoreAssetForVisualSource(item: AssetItem, sourceKind: VisualSourceKind): number {
  if (sourceKind === "video") return 0;

  const variant = item.variantKey;
  const orientation = item.orientation;
  const normalizedUrl = String(item.url || "").toLowerCase();

  if (sourceKind === "hero-image") {
    const variantScore = variant === "optimized" ? 50 : variant === "original" ? 30 : 10;
    const orientationScore = orientation === "landscape" ? 30 : orientation === "square" ? 10 : 0;
    const heroSafeBoost = includesHeroAllowedContext(item.allowedIn) ? 20 : 0;
    return variantScore + orientationScore + heroSafeBoost;
  }

  const logoVariantScore =
    variant === "vectorized-svg" ? 50 : variant === "optimized" ? 35 : variant === "original" ? 20 : 10;
  const transparentBoost =
    variant === "vectorized-svg" || normalizedUrl.endsWith(".svg") || normalizedUrl.endsWith(".png")
      ? 24
      : 0;
  const roleBoost = item.assetRole === "logo" || item.assetRole === "icon" ? 18 : 0;
  return logoVariantScore + transparentBoost + roleBoost;
}

function pieceLabel(piece: LabHeroPiece) {
  return PIECE_LIBRARY.find((item) => item.id === piece)?.label ?? piece;
}

function zoneLabel(zone: LayoutZone) {
  return zone.replace("-", " ");
}

function isTextEditablePiece(piece: LabHeroPiece | null): piece is "headline" | "subheadline" | "cta-group" {
  return piece === "headline" || piece === "subheadline" || piece === "cta-group";
}

function cloneSnapshot<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function readContentProperty(snapshot: VariantSnapshot, property: ContentProperty): string {
  return snapshot[property];
}

function writeContentProperty(snapshot: VariantSnapshot, property: ContentProperty, value: string) {
  snapshot[property] = value;
}

function createDefaultContentOverrides(): VariantContentOverrides {
  return {
    mobile: {
      headlineDraft: true,
      subheadlineDraft: true,
      primaryCtaDraft: true,
      secondaryCtaDraft: true,
      primaryCtaHrefDraft: true,
      secondaryCtaHrefDraft: true,
    },
    tablet: {
      headlineDraft: false,
      subheadlineDraft: false,
      primaryCtaDraft: false,
      secondaryCtaDraft: false,
      primaryCtaHrefDraft: false,
      secondaryCtaHrefDraft: false,
    },
    desktop: {
      headlineDraft: false,
      subheadlineDraft: false,
      primaryCtaDraft: false,
      secondaryCtaDraft: false,
      primaryCtaHrefDraft: false,
      secondaryCtaHrefDraft: false,
    },
    wide: {
      headlineDraft: false,
      subheadlineDraft: false,
      primaryCtaDraft: false,
      secondaryCtaDraft: false,
      primaryCtaHrefDraft: false,
      secondaryCtaHrefDraft: false,
    },
  };
}

function resolveContentInheritanceSource(
  viewport: PreviewViewport,
  property: ContentProperty,
  overrides: VariantContentOverrides
): PreviewViewport {
  const viewportIndex = VIEWPORT_INHERITANCE_ORDER.indexOf(viewport);
  if (viewportIndex <= 0) return "mobile";

  for (let index = viewportIndex; index >= 0; index -= 1) {
    const candidate = VIEWPORT_INHERITANCE_ORDER[index];
    if (candidate === "mobile") return "mobile";
    if (overrides[candidate][property]) return candidate;
  }

  return "mobile";
}

function snapshotsAreEqual(left: VariantSnapshot, right: VariantSnapshot): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

function resolveViewportInheritanceSource(
  viewport: PreviewViewport,
  overrides: Record<PreviewViewport, boolean>
): PreviewViewport {
  const viewportIndex = VIEWPORT_INHERITANCE_ORDER.indexOf(viewport);
  if (viewportIndex <= 0) return "mobile";

  for (let index = viewportIndex; index >= 0; index -= 1) {
    const candidate = VIEWPORT_INHERITANCE_ORDER[index];
    if (candidate === "mobile") return "mobile";
    if (overrides[candidate]) return candidate;
  }

  return "mobile";
}

function resolveViewportSnapshotWithInheritance(
  snapshots: VariantSnapshotSet,
  overrides: Record<PreviewViewport, boolean>,
  viewport: PreviewViewport
): VariantSnapshot {
  const sourceViewport = resolveViewportInheritanceSource(viewport, overrides);
  return snapshots[sourceViewport] ?? snapshots.mobile;
}

function propagateViewportSnapshotToDescendants(
  snapshots: VariantSnapshotSet,
  overrides: Record<PreviewViewport, boolean>,
  sourceViewport: PreviewViewport,
  snapshot: VariantSnapshot
) {
  const sourceIndex = VIEWPORT_INHERITANCE_ORDER.indexOf(sourceViewport);
  if (sourceIndex < 0) return;

  for (let index = sourceIndex + 1; index < VIEWPORT_INHERITANCE_ORDER.length; index += 1) {
    const targetViewport = VIEWPORT_INHERITANCE_ORDER[index];
    if (overrides[targetViewport]) continue;

    const inheritedSource = resolveViewportInheritanceSource(targetViewport, overrides);
    if (inheritedSource !== sourceViewport) continue;
    snapshots[targetViewport] = cloneSnapshot(snapshot);
  }
}

function mapSnapshotToLabPiece(snapshot: PublishedPieceSnapshot): LabPiece {
  return {
    id: snapshot.id,
    type: "hero",
    blockType: "hero",
    title: snapshot.payload.headline ?? "Sin titular",
    status: "approved",
    summary: snapshot.payload.subheadline,
    editableSlots: [
      {
        key: "headline",
        label: "Titular",
        type: "text",
        required: true,
        value: snapshot.payload.headline ?? "",
      },
      {
        key: "subheadline",
        label: "Subtitular",
        type: "textarea",
        required: true,
        value: snapshot.payload.subheadline ?? "",
      },
      {
        key: "cta",
        label: "CTA",
        type: "cta",
        required: true,
        value: snapshot.payload.primaryCta?.label ?? "",
      },
    ],
  };
}

export default function PublishedHeroLabPage({
  disableInternalBrandHydrator = false,
}: {
  disableInternalBrandHydrator?: boolean;
}) {
  const [brandScope, setBrandScope] = useState<Extract<BrandScope, "panel" | "studio">>("panel");
  const [sessionRole, setSessionRole] = useState<SessionRole>(null);

  const [pieceFamily, setPieceFamily] = useState<PieceFamily>("hero");
  const [canvasMode, setCanvasMode] = useState<CanvasMode>("preview");
  const [viewport, setViewport] = useState<PreviewViewport>("mobile");
  const [sourceMode, setSourceMode] = useState<SourceMode>("hero-safe-media");
  const candidateId: CandidateId = "barber-pro";
  const [variantName, setVariantName] = useState<string>("base");
  const [actionNotice, setActionNotice] = useState<string>("");
  const [variantCounter, setVariantCounter] = useState<number>(1);

  const [visualSourceKind, setVisualSourceKind] = useState<VisualSourceKind>("hero-image");
  const [assetPickerView, setAssetPickerView] = useState<AssetPickerView>("closed");
  const [showAssetFilters, setShowAssetFilters] = useState<boolean>(false);
  const [variantFilter, setVariantFilter] = useState<AssetVariantKey | "all">("optimized");
  const [orientationFilter, setOrientationFilter] = useState<MediaOrientation | "all">("landscape");
  const [reviewFilter, setReviewFilter] = useState<MediaReviewStatus | "all">("approved");
  const [assetComponentFilter, setAssetComponentFilter] = useState<AssetComponentFilter>("hero");
  const [assetContextFilter, setAssetContextFilter] = useState<AssetContextFilter>("hero");
  const [allAssets, setAllAssets] = useState<AssetItem[]>([]);
  const [assetState, setAssetState] = useState<"idle" | "loading" | "ready" | "error">("loading");
  const [assetError, setAssetError] = useState<string>("");
  const [selectedHeroAssetId, setSelectedHeroAssetId] = useState<string>("");
  const [selectedLogoAssetId, setSelectedLogoAssetId] = useState<string>("");
  const [navPreviewOpen, setNavPreviewOpen] = useState<boolean>(false);

  const [pieceVisibility, setPieceVisibility] = useState<PieceVisibility>(DEFAULT_PIECE_VISIBILITY);
  const [selectedPiece, setSelectedPiece] = useState<LabHeroPiece | null>(null);
  const [activeLayoutPiece, setActiveLayoutPiece] = useState<LayoutPiece>("headline");

  const [headlineDraft, setHeadlineDraft] = useState<string>(INITIAL_CANDIDATE_HERO.title);
  const [subheadlineDraft, setSubheadlineDraft] = useState<string>(INITIAL_CANDIDATE_HERO.description);
  const [badgeDraft, setBadgeDraft] = useState<string>(INITIAL_CANDIDATE_HERO.badge);
  const [primaryCtaDraft, setPrimaryCtaDraft] = useState<string>(INITIAL_CANDIDATE_HERO.primaryCtaLabel);
  const [secondaryCtaDraft, setSecondaryCtaDraft] = useState<string>(INITIAL_CANDIDATE_HERO.secondaryCtaLabel);
  const [primaryCtaHrefDraft, setPrimaryCtaHrefDraft] = useState<string>(
    INITIAL_CANDIDATE_HERO.primaryCtaHref
  );
  const [secondaryCtaHrefDraft, setSecondaryCtaHrefDraft] = useState<string>(
    INITIAL_CANDIDATE_HERO.secondaryCtaHref
  );

  const [textStyles, setTextStyles] = useState(DEFAULT_TEXT_STYLES);
  const [ctaStyle, setCtaStyle] = useState<CtaStyle>("filled");
  const [overlayDensity, setOverlayDensity] = useState<HeroAppearanceVariant>("soft");
  const [overlayStyleMode, setOverlayStyleMode] = useState<OverlayStyleMode>("gradient");
  const [overlayTint, setOverlayTint] = useState<OverlayColor>("blue");
  const [labHeadlineTone, setLabHeadlineTone] = useState<LabHeadlineTone>("white");
  const [backgroundEmphasis, setBackgroundEmphasis] = useState<BackgroundEmphasis>("medium");
  const [backgroundFit, setBackgroundFit] = useState<BackgroundFit>("cover");
  const [backgroundFocus, setBackgroundFocus] = useState<BackgroundFocus>("center");
  const [ctaRegulation, setCtaRegulation] = useState<CtaRegulation>("balanced");

  const [blueprint, setBlueprint] = useState<Blueprint>("split");
  const [pieceZones, setPieceZones] = useState<Record<LayoutPiece, LayoutZone>>(DEFAULT_PIECE_ZONES);
  const [operationalPieceZones, setOperationalPieceZones] =
    useState<Record<OperationalPlacementPiece, LayoutZone>>(buildOperationalZonesFromBlueprint("split"));
  const [pieceStructure, setPieceStructure] =
    useState<Record<LayoutPiece, PieceStructure>>(DEFAULT_PIECE_STRUCTURE);

  const [layoutDensity, setLayoutDensity] = useState<LayoutDensity>("balanced");
  const [layoutBalance, setLayoutBalance] = useState<LayoutBalance>("copy-first");
  const [layoutContentWidth, setLayoutContentWidth] = useState<LayoutContentWidth>("medium");
  const [layoutMediaDominance, setLayoutMediaDominance] =
    useState<LayoutMediaDominance>("medium");
  const [layoutSafeArea, setLayoutSafeArea] = useState<LayoutSafeArea>("normal");
  const [mobileLogoScale, setMobileLogoScale] = useState<"compact" | "balanced" | "expressive">(
    "balanced"
  );
  const [navTriggerSize, setNavTriggerSize] = useState<"sm" | "md" | "lg">("md");
  const [navTriggerTone, setNavTriggerTone] = useState<"inverse" | "primary" | "muted">("inverse");
  const [navTriggerSurface, setNavTriggerSurface] = useState<"minimal" | "solid" | "glass">("glass");
  const [navTriggerAura, setNavTriggerAura] = useState<"none" | "soft" | "strong">("soft");
  const [navTriggerHover, setNavTriggerHover] = useState<"soft" | "lift" | "glow">("soft");
  const [navOpenBehavior, setNavOpenBehavior] = useState<"overlay" | "drawer" | "fullscreen">("overlay");
  const [navOverlayDensity, setNavOverlayDensity] = useState<"low" | "medium" | "high">("medium");
  const [navOverlayStyle, setNavOverlayStyle] = useState<"tinted" | "neutral" | "none">("tinted");
  const [navOverlayTone, setNavOverlayTone] = useState<
    "neutral" | "primary" | "secondary" | "accent" | "dark"
  >("neutral");
  const [navReadabilityBoost, setNavReadabilityBoost] = useState<"none" | "soft" | "strong">("soft");
  const [navLinksVisible, setNavLinksVisible] = useState<boolean>(true);
  const [navPlacement, setNavPlacement] = useState<"auto" | "left" | "center" | "right">("auto");
  const [desktopNavSize, setDesktopNavSize] = useState<"sm" | "md" | "lg">("md");
  const [desktopNavTone, setDesktopNavTone] = useState<"inverse" | "primary" | "muted">("muted");
  const [desktopNavSurface, setDesktopNavSurface] = useState<"minimal" | "solid" | "glass">("solid");
  const [desktopNavHover, setDesktopNavHover] = useState<"soft" | "lift" | "glow">("soft");
  const [desktopNavPresence, setDesktopNavPresence] = useState<"low" | "medium" | "high">("medium");
  const [navPanelOrigin, setNavPanelOrigin] = useState<"left" | "center" | "right">("right");
  const [navPanelWidth, setNavPanelWidth] = useState<"narrow" | "normal" | "wide">("normal");
  const [navPanelStyle, setNavPanelStyle] = useState<"minimal" | "solid" | "glass">("solid");
  const [navMenuAlignment, setNavMenuAlignment] = useState<"left" | "center" | "right">("left");
  const [navMenuItemSize, setNavMenuItemSize] = useState<"sm" | "md" | "lg">("md");
  const [navMenuVerticalSpacing, setNavMenuVerticalSpacing] = useState<"tight" | "normal" | "relaxed">("normal");
  const [logoOpacity, setLogoOpacity] = useState<number>(96);
  const [logoShadow, setLogoShadow] = useState<"none" | "soft" | "medium">("soft");
  const [logoFrameStyle, setLogoFrameStyle] = useState<"minimal" | "solid" | "glass">("glass");
  const [themeToggleDefault, setThemeToggleDefault] = useState<"light" | "dark" | "auto">("auto");
  const [themeToggleStyle, setThemeToggleStyle] = useState<"minimal" | "solid" | "glass">("glass");
  const [themeTogglePosition, setThemeTogglePosition] = useState<"left" | "right">("right");
  const [themeEffectIntensity, setThemeEffectIntensity] =
    useState<"low" | "medium" | "high">("medium");
  const [themeEffectScope, setThemeEffectScope] =
    useState<"button" | "header" | "hero">("button");
  const [headerIntegration, setHeaderIntegration] =
    useState<"integrated" | "separated">("integrated");
  const [headerVisualStyle, setHeaderVisualStyle] = useState<"minimal" | "solid" | "glass">("solid");
  const [headerTopSpacing, setHeaderTopSpacing] = useState<"tight" | "normal" | "relaxed">("normal");
  const [headerRelation, setHeaderRelation] =
    useState<"balanced" | "logo-focus" | "nav-focus">("balanced");
  const [footerAddress, setFooterAddress] = useState<string>("Direccion (pendiente)");
  const [footerPhone, setFooterPhone] = useState<string>("Telefono");
  const [footerWhatsapp, setFooterWhatsapp] = useState<string>("WhatsApp");
  const [footerEmail, setFooterEmail] = useState<string>("email@cliente.com");
  const [footerIntegration, setFooterIntegration] =
    useState<"integrated" | "separated">("integrated");
  const [footerVisualStyle, setFooterVisualStyle] = useState<"minimal" | "solid" | "glass">("solid");
  const [footerHeight, setFooterHeight] = useState<"compact" | "normal" | "spacious">("normal");
  const [contactDensity, setContactDensity] = useState<"compact" | "balanced" | "spacious">("balanced");
  const [contactContrast, setContactContrast] = useState<"soft" | "medium" | "strong">("medium");
  const [contactHover, setContactHover] = useState<"none" | "soft" | "strong">("soft");
  const [contactEffect, setContactEffect] = useState<"none" | "lift" | "glow">("none");
  const [contactShadow, setContactShadow] = useState<"none" | "soft" | "medium">("none");
  const [contactLinksVisible, setContactLinksVisible] = useState<boolean>(true);
  const [footerIconsVisible, setFooterIconsVisible] = useState<boolean>(true);
  const [footerPlacement, setFooterPlacement] = useState<"auto" | "left" | "center" | "right">("auto");
  const [footerSignatureSeparation, setFooterSignatureSeparation] =
    useState<"tight" | "normal" | "relaxed">("normal");
  const [signatureSize, setSignatureSize] = useState<"sm" | "md" | "lg">("md");
  const [signatureTone, setSignatureTone] = useState<"default" | "muted" | "accent">("default");
  const [signatureOpacity, setSignatureOpacity] = useState<number>(80);
  const [signatureAnimation, setSignatureAnimation] =
    useState<"draw" | "pulse" | "float" | "none">("draw");
  const [signatureDrawRefreshKey, setSignatureDrawRefreshKey] = useState<number>(0);
  const [headerLogoSize, setHeaderLogoSize] = useState<"sm" | "md" | "lg">("md");
  const [headerLogoAlign, setHeaderLogoAlign] = useState<"left" | "center" | "right">("left");
  const [footerLogoSize, setFooterLogoSize] = useState<"sm" | "md" | "lg">("md");
  const [footerLogoAlign, setFooterLogoAlign] = useState<"left" | "center" | "right">("center");
  const [headerBandHeight, setHeaderBandHeight] = useState<"10" | "15" | "20">("15");
  const [footerBandHeight, setFooterBandHeight] = useState<"10" | "15" | "20">("15");
  const [headerSurfaceTone, setHeaderSurfaceTone] =
    useState<"neutral" | "primary" | "secondary" | "accent" | "dark">("neutral");
  const [footerSurfaceTone, setFooterSurfaceTone] =
    useState<"neutral" | "primary" | "secondary" | "accent" | "dark">("neutral");
  const [headlineProposal, setHeadlineProposal] = useState<string | null>(null);
  const [previousHeadlineDraft, setPreviousHeadlineDraft] = useState<string | null>(null);
  const [headlineProposalMode, setHeadlineProposalMode] = useState<HeadlineTransformMode | null>(null);
  const [appliedSuggestionBackup, setAppliedSuggestionBackup] = useState<AppliedSuggestionBackup | null>(null);
  const [appliedSuggestionReturnTarget, setAppliedSuggestionReturnTarget] =
    useState<SuggestionReturnTarget | null>(null);
  const [previousPanelScrollTop, setPreviousPanelScrollTop] = useState<number | null>(null);
  const [deviceEditingNotice, setDeviceEditingNotice] = useState<string>("Este ajuste afecta solo a Mobile.");

  const workspaceViewportRef = useRef<HTMLElement | null>(null);
  const previewStageRef = useRef<HTMLDivElement | null>(null);
  const inspectorContextualRef = useRef<HTMLHeadingElement | null>(null);
  const designSuggestionActionsRef = useRef<HTMLDivElement | null>(null);
  const qualityGateActionsRef = useRef<HTMLDivElement | null>(null);
  const designAdjustmentDecisionRef = useRef<HTMLDivElement | null>(null);
  const qualityAdjustmentDecisionRef = useRef<HTMLDivElement | null>(null);
  const viewportRef = useRef<PreviewViewport>("mobile");
  const breakpointSnapshotsRef = useRef<VariantSnapshotSet | null>(null);
  const variantSnapshotsRef = useRef<Record<string, VariantSnapshotSet>>({});
  const variantOverridesRef = useRef<Record<string, Record<PreviewViewport, boolean>>>({});
  const variantContentOverridesRef = useRef<Record<string, VariantContentOverrides>>({});
  const [workspaceViewportHeight, setWorkspaceViewportHeight] = useState<number | null>(null);
  const [previewStageSize, setPreviewStageSize] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });

  const candidateSnapshot = HERO_CANDIDATES[candidateId];
  const currentSnapshot = candidateSnapshot;
  const candidateHero = useMemo(
    () => mapPublishedSnapshotToContentPayload(candidateSnapshot),
    [candidateSnapshot]
  );
  const labPiece = useMemo(() => mapSnapshotToLabPiece(currentSnapshot), [currentSnapshot]);
  const validation = useMemo(() => validateLabPiece(labPiece), [labPiece]);

  function captureSnapshot(): VariantSnapshot {
    return {
      pieceVisibility,
      headlineDraft,
      subheadlineDraft,
      badgeDraft,
      primaryCtaDraft,
      secondaryCtaDraft,
      primaryCtaHrefDraft,
      secondaryCtaHrefDraft,
      textStyles,
      ctaStyle,
      overlayDensity,
      overlayStyleMode,
      overlayTint,
      labHeadlineTone,
      backgroundEmphasis,
      ctaRegulation,
      blueprint,
      pieceZones,
      operationalPieceZones,
      pieceStructure,
      layoutDensity,
      layoutBalance,
      layoutContentWidth,
      layoutMediaDominance,
      layoutSafeArea,
      mobileLogoScale,
      navTriggerSize,
      navTriggerTone,
      navTriggerSurface,
      navTriggerAura,
      navTriggerHover,
      navOpenBehavior,
      navOverlayDensity,
      navOverlayStyle,
      navOverlayTone,
      navReadabilityBoost,
      navLinksVisible,
      navPlacement,
      desktopNavSize,
      desktopNavTone,
      desktopNavSurface,
      desktopNavHover,
      desktopNavPresence,
      navPanelOrigin,
      navPanelWidth,
      navPanelStyle,
      navMenuAlignment,
      navMenuItemSize,
      navMenuVerticalSpacing,
      logoOpacity,
      logoShadow,
      logoFrameStyle,
      themeToggleDefault,
      themeToggleStyle,
      themeTogglePosition,
      themeEffectIntensity,
      themeEffectScope,
      headerIntegration,
      headerVisualStyle,
      headerTopSpacing,
      headerRelation,
      headerLogoSize,
      headerLogoAlign,
      headerBandHeight,
      headerSurfaceTone,
      footerAddress,
      footerPhone,
      footerWhatsapp,
      footerEmail,
      footerIntegration,
      footerVisualStyle,
      footerHeight,
      contactDensity,
      contactContrast,
      contactHover,
      contactEffect,
      contactShadow,
      contactLinksVisible,
      footerIconsVisible,
      footerPlacement,
      footerSignatureSeparation,
      footerLogoSize,
      footerLogoAlign,
      footerBandHeight,
      footerSurfaceTone,
      signatureSize,
      signatureTone,
      signatureOpacity,
      signatureAnimation,
    };
  }

  function applySnapshot(snapshot: VariantSnapshot) {
    const nextDesktopNavVisible =
      snapshot.pieceVisibility["desktop-nav"] ?? snapshot.navLinksVisible;
    const nextHeaderVisible = snapshot.pieceVisibility["header-hero"] ?? true;
    setPieceVisibility(
      cloneSnapshot({
        ...snapshot.pieceVisibility,
        "header-hero": nextHeaderVisible,
        "desktop-nav": nextDesktopNavVisible,
      })
    );
    setHeadlineDraft(snapshot.headlineDraft);
    setSubheadlineDraft(snapshot.subheadlineDraft);
    setBadgeDraft(snapshot.badgeDraft);
    setPrimaryCtaDraft(snapshot.primaryCtaDraft);
    setSecondaryCtaDraft(snapshot.secondaryCtaDraft);
    setPrimaryCtaHrefDraft(snapshot.primaryCtaHrefDraft);
    setSecondaryCtaHrefDraft(snapshot.secondaryCtaHrefDraft);
    setTextStyles(cloneSnapshot(snapshot.textStyles));
    setCtaStyle(snapshot.ctaStyle);
    setOverlayDensity(snapshot.overlayDensity);
    setOverlayStyleMode(snapshot.overlayStyleMode);
    setOverlayTint(snapshot.overlayTint);
    setLabHeadlineTone(snapshot.labHeadlineTone);
    setBackgroundEmphasis(snapshot.backgroundEmphasis);
    setCtaRegulation(snapshot.ctaRegulation);
    setBlueprint(snapshot.blueprint);
    setPieceZones(cloneSnapshot(snapshot.pieceZones));
    const fallbackOperationalZones: Record<OperationalPlacementPiece, LayoutZone> = {
      "nav-burger": `${zoneToRow(DEFAULT_OPERATIONAL_PIECE_ZONES["nav-burger"])}-${
        snapshot.navPlacement === "auto" ? "right" : snapshot.navPlacement
      }` as LayoutZone,
      "theme-toggle": `${zoneToRow(DEFAULT_OPERATIONAL_PIECE_ZONES["theme-toggle"])}-${
        snapshot.themeTogglePosition === "left" ? "left" : "right"
      }` as LayoutZone,
      "footer-hero": `${zoneToRow(DEFAULT_OPERATIONAL_PIECE_ZONES["footer-hero"])}-${
        snapshot.footerPlacement === "auto" ? "center" : snapshot.footerPlacement
      }` as LayoutZone,
      "contact-strip": DEFAULT_OPERATIONAL_PIECE_ZONES["contact-strip"],
      "animated-signature": DEFAULT_OPERATIONAL_PIECE_ZONES["animated-signature"],
    };
    setOperationalPieceZones(
      cloneSnapshot(snapshot.operationalPieceZones ?? fallbackOperationalZones)
    );
    setPieceStructure(cloneSnapshot(snapshot.pieceStructure));
    setLayoutDensity(snapshot.layoutDensity);
    setLayoutBalance(snapshot.layoutBalance);
    setLayoutContentWidth(snapshot.layoutContentWidth);
    setLayoutMediaDominance(snapshot.layoutMediaDominance);
    setLayoutSafeArea(snapshot.layoutSafeArea);
    setMobileLogoScale(snapshot.mobileLogoScale);
    setNavTriggerSize(snapshot.navTriggerSize);
    setNavTriggerTone(snapshot.navTriggerTone);
    setNavTriggerSurface(snapshot.navTriggerSurface);
    setNavTriggerAura(snapshot.navTriggerAura);
    setNavTriggerHover(snapshot.navTriggerHover);
    setNavOpenBehavior(snapshot.navOpenBehavior);
    setNavOverlayDensity(snapshot.navOverlayDensity);
    setNavOverlayStyle(snapshot.navOverlayStyle);
    setNavOverlayTone(snapshot.navOverlayTone ?? "neutral");
    setNavReadabilityBoost(snapshot.navReadabilityBoost);
    setNavLinksVisible(nextDesktopNavVisible);
    setNavPlacement(snapshot.navPlacement);
    setDesktopNavSize(snapshot.desktopNavSize);
    setDesktopNavTone(snapshot.desktopNavTone);
    setDesktopNavSurface(snapshot.desktopNavSurface);
    setDesktopNavHover(snapshot.desktopNavHover);
    setDesktopNavPresence(snapshot.desktopNavPresence);
    setNavPanelOrigin(snapshot.navPanelOrigin);
    setNavPanelWidth(snapshot.navPanelWidth);
    setNavPanelStyle(snapshot.navPanelStyle);
    setNavMenuAlignment(snapshot.navMenuAlignment);
    setNavMenuItemSize(snapshot.navMenuItemSize);
    setNavMenuVerticalSpacing(snapshot.navMenuVerticalSpacing);
    setLogoOpacity(snapshot.logoOpacity);
    setLogoShadow(snapshot.logoShadow);
    setLogoFrameStyle(snapshot.logoFrameStyle);
    setThemeToggleDefault(snapshot.themeToggleDefault);
    setThemeToggleStyle(snapshot.themeToggleStyle);
    setThemeTogglePosition(snapshot.themeTogglePosition);
    setThemeEffectIntensity(snapshot.themeEffectIntensity ?? "medium");
    setThemeEffectScope(snapshot.themeEffectScope ?? "button");
    setHeaderIntegration(snapshot.headerIntegration);
    setHeaderVisualStyle(snapshot.headerVisualStyle);
    setHeaderTopSpacing(snapshot.headerTopSpacing);
    setHeaderRelation(snapshot.headerRelation);
    setHeaderLogoSize(snapshot.headerLogoSize ?? "md");
    setHeaderLogoAlign(snapshot.headerLogoAlign ?? "left");
    setHeaderBandHeight(snapshot.headerBandHeight ?? "15");
    setHeaderSurfaceTone(snapshot.headerSurfaceTone ?? "neutral");
    setFooterAddress(snapshot.footerAddress);
    setFooterPhone(snapshot.footerPhone);
    setFooterWhatsapp(snapshot.footerWhatsapp);
    setFooterEmail(snapshot.footerEmail);
    setFooterIntegration(snapshot.footerIntegration);
    setFooterVisualStyle(snapshot.footerVisualStyle);
    setFooterHeight(snapshot.footerHeight);
    setContactDensity(snapshot.contactDensity);
    setContactContrast(snapshot.contactContrast);
    setContactHover(snapshot.contactHover);
    setContactEffect(snapshot.contactEffect);
    setContactShadow(snapshot.contactShadow);
    setContactLinksVisible(snapshot.contactLinksVisible);
    setFooterIconsVisible(snapshot.footerIconsVisible);
    setFooterPlacement(snapshot.footerPlacement);
    setFooterSignatureSeparation(snapshot.footerSignatureSeparation);
    setFooterLogoSize(snapshot.footerLogoSize ?? "md");
    setFooterLogoAlign(snapshot.footerLogoAlign ?? "center");
    setFooterBandHeight(snapshot.footerBandHeight ?? "15");
    setFooterSurfaceTone(snapshot.footerSurfaceTone ?? "neutral");
    setSignatureSize(snapshot.signatureSize);
    setSignatureTone(snapshot.signatureTone);
    setSignatureOpacity(snapshot.signatureOpacity);
    setSignatureAnimation(snapshot.signatureAnimation);
  }

  function ensureCurrentVariantSnapshots(): VariantSnapshotSet {
    initializeVariantStorageIfNeeded();
    const fallback = cloneSnapshot(captureSnapshot());
    const existing = variantSnapshotsRef.current[variantName];
    if (existing) return existing;

    const mobileSnapshot =
      breakpointSnapshotsRef.current?.mobile ??
      breakpointSnapshotsRef.current?.[viewport] ??
      fallback;
    const next: VariantSnapshotSet = {
      mobile: cloneSnapshot(mobileSnapshot),
      tablet: cloneSnapshot(mobileSnapshot),
      desktop: cloneSnapshot(mobileSnapshot),
      wide: cloneSnapshot(mobileSnapshot),
    };
    variantSnapshotsRef.current[variantName] = next;
    return next;
  }

  function ensureCurrentVariantOverrides(): Record<PreviewViewport, boolean> {
    const existing = variantOverridesRef.current[variantName];
    if (existing) return existing;
    const next: Record<PreviewViewport, boolean> = {
      mobile: true,
      tablet: false,
      desktop: false,
      wide: false,
    };
    variantOverridesRef.current[variantName] = next;
    return next;
  }

  function ensureCurrentVariantContentOverrides(): VariantContentOverrides {
    const existing = variantContentOverridesRef.current[variantName];
    if (existing) return existing;

    const variantSet = ensureCurrentVariantSnapshots();
    const next = createDefaultContentOverrides();
    const orderedViewports = VIEWPORT_INHERITANCE_ORDER.filter((item) => item !== "mobile");

    orderedViewports.forEach((targetViewport) => {
      CONTENT_PROPERTIES.forEach((property) => {
        const inheritedSource = resolveContentInheritanceSource(targetViewport, property, next);
        const inheritedValue = readContentProperty(
          variantSet[inheritedSource] ?? variantSet.mobile,
          property
        );
        const candidateValue = readContentProperty(variantSet[targetViewport], property);
        next[targetViewport][property] = candidateValue !== inheritedValue;
      });
    });

    variantContentOverridesRef.current[variantName] = next;
    return next;
  }

  function getResolvedValue(device: PreviewViewport, property: ContentProperty): string {
    const variantSet = ensureCurrentVariantSnapshots();
    const contentOverrides = ensureCurrentVariantContentOverrides();
    const sourceViewport = resolveContentInheritanceSource(device, property, contentOverrides);
    return readContentProperty(variantSet[sourceViewport] ?? variantSet.mobile, property);
  }

  function setResolvedContentState(device: PreviewViewport) {
    setHeadlineDraft(getResolvedValue(device, "headlineDraft"));
    setSubheadlineDraft(getResolvedValue(device, "subheadlineDraft"));
    setPrimaryCtaDraft(getResolvedValue(device, "primaryCtaDraft"));
    setSecondaryCtaDraft(getResolvedValue(device, "secondaryCtaDraft"));
    setPrimaryCtaHrefDraft(getResolvedValue(device, "primaryCtaHrefDraft"));
    setSecondaryCtaHrefDraft(getResolvedValue(device, "secondaryCtaHrefDraft"));
  }

  function propagateContentPropertyToDescendants(
    sourceViewport: PreviewViewport,
    property: ContentProperty,
    value: string
  ) {
    const sourceIndex = VIEWPORT_INHERITANCE_ORDER.indexOf(sourceViewport);
    if (sourceIndex < 0) return;

    const variantSet = ensureCurrentVariantSnapshots();
    const contentOverrides = ensureCurrentVariantContentOverrides();
    for (let index = sourceIndex + 1; index < VIEWPORT_INHERITANCE_ORDER.length; index += 1) {
      const targetViewport = VIEWPORT_INHERITANCE_ORDER[index];
      const inheritedSource = resolveContentInheritanceSource(targetViewport, property, contentOverrides);
      if (inheritedSource !== sourceViewport) continue;
      writeContentProperty(variantSet[targetViewport], property, value);
      if (breakpointSnapshotsRef.current) {
        writeContentProperty(breakpointSnapshotsRef.current[targetViewport], property, value);
      }
    }
  }

  function setContentProperty(
    property: ContentProperty,
    value: string,
    targetViewport: PreviewViewport = viewport
  ) {
    const variantSet = ensureCurrentVariantSnapshots();
    const contentOverrides = ensureCurrentVariantContentOverrides();

    writeContentProperty(variantSet[targetViewport], property, value);
    if (breakpointSnapshotsRef.current) {
      writeContentProperty(breakpointSnapshotsRef.current[targetViewport], property, value);
    }

    if (targetViewport !== "mobile") {
      contentOverrides[targetViewport][property] = true;
    }

    if (targetViewport === "mobile" || contentOverrides[targetViewport][property]) {
      propagateContentPropertyToDescendants(targetViewport, property, value);
    }

    if (property === "headlineDraft") {
      setHeadlineProposal(null);
      setHeadlineProposalMode(null);
    }

    if (targetViewport === viewport) {
      setResolvedContentState(viewport);
    }
  }

  function saveViewportSnapshot(targetViewport: PreviewViewport, snapshot: VariantSnapshot) {
    const nextSnapshot = cloneSnapshot(snapshot);
    const variantSet = ensureCurrentVariantSnapshots();
    const variantOverrides = ensureCurrentVariantOverrides();
    const contentOverrides = ensureCurrentVariantContentOverrides();
    const targetIndex = VIEWPORT_INHERITANCE_ORDER.indexOf(targetViewport);
    const preservedDescendantContent = new Map<
      PreviewViewport,
      Partial<Record<ContentProperty, string>>
    >();
    if (targetIndex >= 0) {
      for (let index = targetIndex + 1; index < VIEWPORT_INHERITANCE_ORDER.length; index += 1) {
        const descendant = VIEWPORT_INHERITANCE_ORDER[index];
        const preserved: Partial<Record<ContentProperty, string>> = {};
        CONTENT_PROPERTIES.forEach((property) => {
          if (!contentOverrides[descendant][property]) return;
          preserved[property] = readContentProperty(variantSet[descendant], property);
        });
        preservedDescendantContent.set(descendant, preserved);
      }
    }

    const inheritedSourceBefore = resolveViewportInheritanceSource(targetViewport, variantOverrides);
    const inheritedSnapshotBefore = cloneSnapshot(
      variantSet[inheritedSourceBefore] ?? variantSet.mobile ?? nextSnapshot
    );
    const hadOverride = targetViewport === "mobile" ? true : variantOverrides[targetViewport];
    const shouldKeepOverride =
      targetViewport === "mobile" ||
      hadOverride ||
      !snapshotsAreEqual(nextSnapshot, inheritedSnapshotBefore);

    variantSet[targetViewport] = cloneSnapshot(nextSnapshot);
    if (targetViewport !== "mobile") {
      variantOverrides[targetViewport] = shouldKeepOverride;
    }

    if (targetViewport === "mobile" || variantOverrides[targetViewport]) {
      propagateViewportSnapshotToDescendants(
        variantSet,
        variantOverrides,
        targetViewport,
        nextSnapshot
      );
    }

    preservedDescendantContent.forEach((preserved, descendant) => {
      CONTENT_PROPERTIES.forEach((property) => {
        const preservedValue = preserved[property];
        if (typeof preservedValue !== "string") return;
        writeContentProperty(variantSet[descendant], property, preservedValue);
        if (breakpointSnapshotsRef.current) {
          writeContentProperty(breakpointSnapshotsRef.current[descendant], property, preservedValue);
        }
      });
    });
  }

  function persistCurrentViewportSnapshot() {
    initializeVariantStorageIfNeeded();
    const current = cloneSnapshot(captureSnapshot());
    if (!breakpointSnapshotsRef.current) {
      breakpointSnapshotsRef.current = {
        mobile: cloneSnapshot(current),
        tablet: cloneSnapshot(current),
        desktop: cloneSnapshot(current),
        wide: cloneSnapshot(current),
      };
    }

    breakpointSnapshotsRef.current[viewport] = cloneSnapshot(current);
    saveViewportSnapshot(viewport, current);
  }

  function copyCurrentSnapshotToOtherDevices() {
    initializeVariantStorageIfNeeded();
    const current = cloneSnapshot(captureSnapshot());
    const variantSet = ensureCurrentVariantSnapshots();
    const variantOverrides = ensureCurrentVariantOverrides();
    const contentOverrides = ensureCurrentVariantContentOverrides();
    (Object.keys(VIEWPORTS) as PreviewViewport[]).forEach((targetViewport) => {
      if (targetViewport === viewport) return;
      variantSet[targetViewport] = cloneSnapshot(current);
      variantOverrides[targetViewport] = true;
      CONTENT_PROPERTIES.forEach((property) => {
        contentOverrides[targetViewport][property] = true;
      });
      if (breakpointSnapshotsRef.current) {
        breakpointSnapshotsRef.current[targetViewport] = cloneSnapshot(current);
      }
    });
    setActionNotice(`Ajustes de ${VIEWPORTS[viewport].label} copiados al resto de dispositivos.`);
  }

  function initializeVariantStorageIfNeeded() {
    if (breakpointSnapshotsRef.current) return;
    const baseSnapshot = cloneSnapshot(captureSnapshot());
    breakpointSnapshotsRef.current = {
      mobile: cloneSnapshot(baseSnapshot),
      tablet: cloneSnapshot(baseSnapshot),
      desktop: cloneSnapshot(baseSnapshot),
      wide: cloneSnapshot(baseSnapshot),
    };
    variantSnapshotsRef.current.base = {
      mobile: cloneSnapshot(baseSnapshot),
      tablet: cloneSnapshot(baseSnapshot),
      desktop: cloneSnapshot(baseSnapshot),
      wide: cloneSnapshot(baseSnapshot),
    };
    variantOverridesRef.current.base = {
      mobile: true,
      tablet: false,
      desktop: false,
      wide: false,
    };
    variantContentOverridesRef.current.base = createDefaultContentOverrides();
    viewportRef.current = viewport;
  }

  function handleViewportChange(nextViewport: PreviewViewport) {
    if (nextViewport === viewport) return;
    initializeVariantStorageIfNeeded();
    if (!breakpointSnapshotsRef.current) {
      setViewport(nextViewport);
      setDeviceEditingNotice(`Este ajuste afecta solo a ${VIEWPORTS[nextViewport].label}.`);
      return;
    }

    const outgoingSnapshot = cloneSnapshot(captureSnapshot());
    const previousViewport = viewportRef.current;
    breakpointSnapshotsRef.current[previousViewport] = cloneSnapshot(outgoingSnapshot);
    saveViewportSnapshot(previousViewport, outgoingSnapshot);

    const activeVariant = ensureCurrentVariantSnapshots();
    const activeOverrides = ensureCurrentVariantOverrides();
    const incomingSnapshot =
      resolveViewportSnapshotWithInheritance(activeVariant, activeOverrides, nextViewport) ??
      breakpointSnapshotsRef.current[nextViewport] ??
      breakpointSnapshotsRef.current.mobile ??
      outgoingSnapshot;
    applySnapshot(cloneSnapshot(incomingSnapshot));
    setResolvedContentState(nextViewport);
    setHeadlineProposal(null);
    setHeadlineProposalMode(null);

    viewportRef.current = nextViewport;
    setViewport(nextViewport);
    setDeviceEditingNotice(`Este ajuste afecta solo a ${VIEWPORTS[nextViewport].label}.`);
  }

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const response = await fetch("/api/session", { cache: "no-store" });
        if (!response.ok) return;
        const payload = (await response.json()) as { user?: { role?: SessionRole } | null };
        if (!active) return;
        const role = payload.user?.role ?? null;
        setSessionRole(role);
        setBrandScope(resolveLabBrandScopeFromRole(role));
      } catch {
        if (!active) return;
        setSessionRole(null);
        setBrandScope("panel");
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    (async () => {
      setAssetState("loading");
      setAssetError("");

      try {
        const [heroAssets, logoAssets] = await Promise.all([
          fetchSystemMediaClientByQuery({
            scope: "system",
            status: "active",
            pipelineStatus: "ready",
            allowedComponent: "hero",
          }),
          fetchSystemMediaClientByQuery({
            scope: "system",
            status: "active",
            pipelineStatus: "ready",
            assetRole: "logo",
          }),
        ]);

        if (!active) return;

        const merged = [...heroAssets, ...logoAssets];
        const byId = new Map<string, AssetItem>();
        merged.forEach((item) => byId.set(item._id, item));
        const next = Array.from(byId.values()).sort(sortByRecent);
        setAllAssets(next);
        setAssetState("ready");

        setSelectedHeroAssetId((previous) => {
          if (previous && next.some((item) => item._id === previous)) return previous;
          return next.find((item) => item.allowedComponents.includes("hero"))?._id || "";
        });

        setSelectedLogoAssetId((previous) => {
          if (previous && next.some((item) => item._id === previous)) return previous;
          return (
            next.find(
              (item) =>
                item.assetRole === "logo" ||
                item.assetRole === "icon" ||
                item.preferredUsage === "hero-logo"
            )?._id || ""
          );
        });
      } catch (error: unknown) {
        if (!active) return;
        setAssetState("error");
        setAssetError(error instanceof Error ? error.message : "No se pudo cargar media.");
        setAllAssets([]);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const workspace = workspaceViewportRef.current;
    if (!workspace) return;

    let frameId = 0;
    const measureWorkspaceHeight = () => {
      if (frameId) cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(() => {
        const rect = workspace.getBoundingClientRect();
        const availableHeight = Math.max(
          Math.floor(window.innerHeight - rect.top - WORKSPACE_VIEWPORT_BOTTOM_GUTTER),
          0
        );
        setWorkspaceViewportHeight((previous) =>
          previous === availableHeight ? previous : availableHeight
        );
      });
    };

    measureWorkspaceHeight();
    window.addEventListener("resize", measureWorkspaceHeight);

    return () => {
      window.removeEventListener("resize", measureWorkspaceHeight);
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, []);

  useEffect(() => {
    const stage = previewStageRef.current;
    if (!stage) return;

    const updateSize = () => {
      setPreviewStageSize({
        width: stage.clientWidth,
        height: stage.clientHeight,
      });
    };

    updateSize();

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      setPreviewStageSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      });
    });

    observer.observe(stage);

    return () => observer.disconnect();
  }, []);

  const toneToSurfaceColor = (
    tone: "neutral" | "primary" | "secondary" | "accent" | "dark"
  ): string => {
    if (tone === "primary") return "var(--primary)";
    if (tone === "secondary") return "var(--secondary)";
    if (tone === "accent") return "var(--accent,var(--primary))";
    if (tone === "dark") return "var(--foreground)";
    return "var(--surface-3,var(--card))";
  };

  const labVisualCssVars = useMemo(() => {
    const overlayBackdropStrength =
      navOverlayDensity === "high" ? 100 : navOverlayDensity === "medium" ? 74 : 42;
    const overlayPanelStrength =
      navOverlayDensity === "high" ? 100 : navOverlayDensity === "medium" ? 80 : 56;
    const overlayToneColor = toneToSurfaceColor(navOverlayTone);
    const overlayNeutralColor = "var(--foreground)";

    const overlayBackdropColor =
      navOverlayStyle === "none"
        ? "transparent"
        : navOverlayStyle === "neutral"
          ? `color-mix(in oklab,${overlayNeutralColor} ${overlayBackdropStrength}%,transparent)`
          : `color-mix(in oklab,${overlayToneColor} ${overlayBackdropStrength}%,var(--hero-overlay-strong,var(--foreground)) ${100 - overlayBackdropStrength}%)`;

    const overlayPanelColor =
      navOverlayStyle === "none"
        ? "transparent"
        : navOverlayStyle === "neutral"
          ? `color-mix(in oklab,${overlayNeutralColor} ${overlayPanelStrength}%,var(--surface-3,var(--card)) ${100 - overlayPanelStrength}%)`
          : `color-mix(in oklab,${overlayToneColor} ${overlayPanelStrength}%,var(--hero-overlay-strong,var(--foreground)) ${100 - overlayPanelStrength}%)`;

    const headerToneColor = toneToSurfaceColor(headerSurfaceTone);
    const footerToneColor = toneToSurfaceColor(footerSurfaceTone);

    return {
      ...getTallerPanelVisualCssVars(),
      ...getTallerLabVisualCssVars(),
      "--hero-menu-backdrop-bg": overlayBackdropColor,
      "--hero-menu-opaque-bg": overlayPanelColor,
      "--hero-chrome-surface-bg":
        headerSurfaceTone === "neutral"
          ? "color-mix(in oklab,var(--surface-3,var(--card)) 76%,transparent)"
          : `color-mix(in oklab,${headerToneColor} 42%,var(--hero-overlay-strong,var(--foreground)) 58%)`,
      "--hero-footer-surface-bg":
        footerSurfaceTone === "neutral"
          ? "color-mix(in oklab,var(--surface-3,var(--card)) 74%,transparent)"
          : `color-mix(in oklab,${footerToneColor} 44%,var(--hero-overlay-strong,var(--foreground)) 56%)`,
      "--hero-header-band-bg":
        headerSurfaceTone === "neutral"
          ? "color-mix(in oklab,var(--surface-2,var(--card)) 84%,transparent)"
          : `color-mix(in oklab,${headerToneColor} 72%,var(--hero-overlay-strong,var(--foreground)) 28%)`,
      "--hero-footer-band-bg":
        footerSurfaceTone === "neutral"
          ? "color-mix(in oklab,var(--surface-2,var(--card)) 84%,transparent)"
          : `color-mix(in oklab,${footerToneColor} 74%,var(--hero-overlay-strong,var(--foreground)) 26%)`,
    } as CSSProperties;
  }, [
    footerSurfaceTone,
    headerSurfaceTone,
    navOverlayDensity,
    navOverlayStyle,
    navOverlayTone,
  ]);

  const heroImageAssets = useMemo(
    () =>
      allAssets
        .filter((item) => item.kind !== "video" && item.formatKind !== "pdf")
        .filter(
          (item) =>
            item.allowedComponents.includes("hero") ||
            includesHeroAllowedContext(item.allowedIn) ||
            item.preferredUsage === "hero-background"
        )
        .sort(sortByRecent),
    [allAssets]
  );

  const logoAssets = useMemo(
    () =>
      allAssets
        .filter((item) => item.kind !== "video" && item.formatKind !== "pdf")
        .filter(
          (item) =>
            item.assetRole === "logo" ||
            item.assetRole === "icon" ||
            item.preferredUsage === "hero-logo" ||
            item.preferredUsage === "navbar-logo" ||
            item.preferredUsage === "footer-mark"
        )
        .sort(sortByRecent),
    [allAssets]
  );

  const heroSafeMediaSources = useMemo(() => toHeroSafeMediaSources(heroImageAssets), [heroImageAssets]);

  const selectedHeroAsset = useMemo(
    () => heroImageAssets.find((item) => item._id === selectedHeroAssetId) || null,
    [heroImageAssets, selectedHeroAssetId]
  );

  const selectedLogoAsset = useMemo(
    () => logoAssets.find((item) => item._id === selectedLogoAssetId) || null,
    [logoAssets, selectedLogoAssetId]
  );

  const contextualAssets = useMemo(() => {
    const base =
      visualSourceKind === "hero-image"
        ? heroImageAssets
        : visualSourceKind === "logo"
          ? logoAssets
          : [];

    return base
      .filter((item) => {
        if (variantFilter !== "all" && item.variantKey !== variantFilter) return false;
        if (orientationFilter !== "all" && item.orientation !== orientationFilter) return false;
        if (reviewFilter !== "all" && item.reviewStatus !== reviewFilter) return false;
        if (assetComponentFilter === "hero" && !item.allowedComponents.includes("hero")) return false;
        if (assetComponentFilter === "logo" && item.assetRole !== "logo") return false;
        if (assetComponentFilter === "icon" && item.assetRole !== "icon") return false;
        if (
          assetContextFilter === "hero" &&
          !(
            item.preferredUsage === "hero-background" ||
            item.preferredUsage === "hero-logo" ||
            includesHeroAllowedContext(item.allowedIn)
          )
        ) {
          return false;
        }
        if (assetContextFilter === "navbar" && item.preferredUsage !== "navbar-logo") return false;
        if (assetContextFilter === "footer" && item.preferredUsage !== "footer-mark") return false;
        return true;
      })
      .sort((left, right) => {
        const score = scoreAssetForVisualSource(right, visualSourceKind) - scoreAssetForVisualSource(left, visualSourceKind);
        if (score !== 0) return score;
        return sortByRecent(left, right);
      });
  }, [
    assetComponentFilter,
    assetContextFilter,
    heroImageAssets,
    logoAssets,
    orientationFilter,
    reviewFilter,
    variantFilter,
    visualSourceKind,
  ]);

  const selectedContextAsset =
    visualSourceKind === "hero-image"
      ? selectedHeroAsset
      : visualSourceKind === "logo"
        ? selectedLogoAsset
        : null;

  const currentHeadline = headlineDraft.trim() || candidateHero.title;
  const currentSubheadline = subheadlineDraft.trim() || candidateHero.description;
  const currentBadge = badgeDraft.trim() || candidateHero.badge;
  const currentPrimaryCta = primaryCtaDraft.trim() || candidateHero.primaryCtaLabel;
  const currentSecondaryCta = secondaryCtaDraft.trim() || candidateHero.secondaryCtaLabel;

  const heroBackgroundUrl = selectedHeroAsset?.url || candidateHero.backgroundImageUrl;

  const heroLogoUrl = selectedLogoAsset?.url || candidateHero.logoUrl;

  const structuralWarnings = useMemo(() => {
    const warnings: string[] = [];

    if (!pieceVisibility.headline) warnings.push("Falta jerarquia: headline desactivado.");
    if (pieceZones["cta-group"].startsWith("bottom")) {
      warnings.push("CTA demasiado baja para decisiones rapidas.");
    }

    const textDensity = currentHeadline.length + currentSubheadline.length;
    if (textDensity > 240) warnings.push("Texto muy denso para primer pantallazo.");

    const collisionZones = new Set<string>();
    LAYOUT_PIECES.forEach((piece) => {
      const zone = pieceZones[piece];
      if (collisionZones.has(zone)) {
        warnings.push("Posible colision visual entre piezas en la misma zona.");
      }
      collisionZones.add(zone);
    });

    return Array.from(new Set(warnings));
  }, [currentHeadline.length, currentSubheadline.length, pieceVisibility.headline, pieceZones]);

  const qualityDimensions = useMemo<QualityDimension[]>(() => {
    const ctaVisible = pieceVisibility["cta-group"];
    const contactVisible = pieceVisibility["contact-strip"];
    const logoVisible = pieceVisibility.logo;
    const headlineTooLongOnMobile = viewport === "mobile" && currentHeadline.length > 52;
    const ctaTooLow = pieceZones["cta-group"].startsWith("bottom");
    const overlayStrong = overlayDensity === "solid";
    const overlayWeak =
      overlayDensity === "transparent" || !pieceVisibility["overlay-atmosphere"];
    const splitLike = blueprint === "split";
    const centeredLike = blueprint === "centered";
    const mediaHeavyLike = blueprint === "poster";

    return [
      {
        key: "conversion",
        label: "Conversion",
        score: clamp(82 - (ctaVisible ? 0 : 24) - (ctaTooLow ? 10 : 0)),
        warning: ctaVisible ? "El flujo CTA existe." : "Falta grupo CTA para decision rapida.",
        recommendation: ctaVisible
          ? "Prueba CTA principal en prioridad alta para captar reservas."
          : "Activa Botones CTA y ubicalos en zona central/inferior inmediata.",
      },
      {
        key: "design",
        label: "Diseno",
        score: clamp(
          80 -
            (splitLike ? 0 : 4) -
            (mediaHeavyLike ? 6 : 0) -
            (structuralWarnings.length > 0 ? 8 : 0)
        ),
        warning:
          structuralWarnings.length > 0
            ? "Hay colisiones o densidad visual mejorables."
            : "Composicion limpia para iterar.",
        recommendation:
          structuralWarnings.length > 0
            ? "Reubica piezas en layout para evitar colisiones entre titular y CTA."
            : "Mantener blueprint y ajustar micro-espaciado por pieza.",
      },
      {
        key: "ux",
        label: "UI/UX",
        score: clamp(
          78 -
            (pieceVisibility["nav-burger"] ? 0 : 10) -
            (pieceVisibility["theme-toggle"] ? 0 : 6)
        ),
        warning:
          pieceVisibility["nav-burger"] && pieceVisibility["theme-toggle"]
            ? "Navegacion y control de tema visibles."
            : "Faltan ayudas de navegacion o tema en cabecera.",
        recommendation: "Mantener navegacion visible y tema accesible desde primer pliegue.",
      },
      {
        key: "seo",
        label: "SEO",
        score: clamp(74 - (currentHeadline.length < 22 ? 10 : 0) - (currentHeadline.length > 70 ? 8 : 0)),
        warning:
          currentHeadline.length < 22
            ? "El titular es corto para intencion local."
            : currentHeadline.length > 70
              ? "El titular es largo para lectura inicial."
              : "Longitud de H1 equilibrada.",
        recommendation: "Incluye servicio + beneficio + contexto local en el titular.",
      },
      {
        key: "responsive",
        label: "Responsive",
        score: clamp(
          81 -
            (headlineTooLongOnMobile ? 14 : 0) -
            (viewport === "wide" && centeredLike ? 6 : 0) -
            (pieceVisibility["theme-toggle"] && viewport === "mobile" ? 0 : 3)
        ),
        warning: headlineTooLongOnMobile ? "El H1 rompe mas de dos lineas en movil." : "Escalado responsive estable.",
        recommendation:
          headlineTooLongOnMobile
            ? "Reduce una linea del titular para mobile."
            : "Valida en wide y desktop el ancho de copy.",
      },
      {
        key: "chromia",
        label: "Cromia",
        score: clamp(79 - (overlayWeak ? 12 : 0) - (overlayStrong && backgroundEmphasis === "high" ? 6 : 0)),
        warning:
          overlayWeak
            ? "Contraste de fondo bajo con overlay transparente."
            : "Atmosfera cromatica consistente.",
        recommendation:
          overlayWeak
            ? "Sube overlay density a soft/solid para mejorar legibilidad."
            : overlayTint === "smoke"
              ? "Mantener Smoke para lectura limpia."
              : "Ajusta tintes por intencion de marca y CTA.",
      },
      {
        key: "accessibility",
        label: "Accesibilidad",
        score: clamp(80 - (pieceVisibility.headline ? 0 : 20) - (contactVisible ? 0 : 6)),
        warning:
          pieceVisibility.headline
            ? "Jerarquia principal visible."
            : "No hay titular visible para jerarquia semantica.",
        recommendation:
          contactVisible
            ? "Manten contacto con contraste medio/alto."
            : "Activa Contacto hero para cierre informativo.",
      },
      {
        key: "performance",
        label: "Performance",
        score: clamp(
          84 -
            (sourceMode === "hero-safe-media" && selectedHeroAsset?.variantKey === "optimized" ? 0 : 8) -
            (pieceVisibility["animated-signature"] && signatureAnimation !== "none" ? 4 : 0)
        ),
        warning:
          sourceMode === "hero-safe-media" && selectedHeroAsset?.variantKey === "optimized"
            ? "Asset principal optimizado."
            : "Falta usar variante optimizada como base.",
        recommendation:
          sourceMode === "hero-safe-media" && selectedHeroAsset?.variantKey === "optimized"
            ? "Mantener variante optimized para portada."
            : "Selecciona variante optimized para reducir carga inicial.",
      },
      {
        key: "branding",
        label: "Branding",
        score: clamp(82 - (logoVisible ? 0 : 20) - (overlayTint === "amber" ? 5 : 0)),
        warning:
          logoVisible
            ? "Logo visible y reconocible en composicion."
            : "Falta presencia de marca en primer pantallazo.",
        recommendation:
          logoVisible
            ? "Ajusta tamano del logo para evitar competir con el titular."
            : "Activa Logo y usa variante principal con fondo seguro.",
      },
    ];
  }, [
    backgroundEmphasis,
    blueprint,
    currentHeadline.length,
    overlayDensity,
    overlayTint,
    pieceVisibility,
    pieceZones,
    selectedHeroAsset?.variantKey,
    signatureAnimation,
    sourceMode,
    structuralWarnings.length,
    viewport,
  ]);

  const qualityScore = useMemo(() => {
    const score = clamp(
      qualityDimensions.reduce((sum, dimension) => sum + dimension.score, 0) / qualityDimensions.length
    );
    return {
      score,
      reasons: qualityDimensions.map((dimension) => `${dimension.label}: ${dimension.warning}`),
    };
  }, [qualityDimensions]);

  const assistantContext = useMemo(() => {
    const lowDimension = [...qualityDimensions].sort((left, right) => left.score - right.score)[0];
    const fallbackBusiness = candidateId === "barber-pro" ? "barberia premium" : "estudio urbano";
    const inferredBusiness =
      selectedHeroAsset?.label?.trim() ||
      selectedLogoAsset?.label?.trim() ||
      fallbackBusiness;
    return {
      negocio: inferredBusiness,
      objetivo: pieceVisibility["cta-group"] ? "conversion" : "activacion",
      blueprint,
      pieza: selectedPiece ? pieceLabel(selectedPiece) : "titular",
      ctaIntent: ctaRegulation === "primary-focus" ? "reserva inmediata" : "exploracion guiada",
      dispositivo: VIEWPORTS[viewport].label,
      imagen: selectedHeroAsset?.label ?? "sin imagen seleccionada",
      warning: lowDimension?.warning ?? "Sin alertas criticas",
    };
  }, [
    blueprint,
    candidateId,
    ctaRegulation,
    pieceVisibility,
    qualityDimensions,
    selectedHeroAsset?.label,
    selectedLogoAsset?.label,
    selectedPiece,
    viewport,
  ]);

  const designSuggestions = useMemo(
    () => [
      {
        label: "Sugerir blueprint",
        action: () => {
          const nextBlueprint: Blueprint = pieceVisibility.logo ? "split" : "centered";
          const nextOperationalZones = buildOperationalZonesFromBlueprint(nextBlueprint);
          setBlueprint(nextBlueprint);
          setPieceZones(BLUEPRINT_ZONE_PRESETS[nextBlueprint]);
          setOperationalPieceZones(nextOperationalZones);
          setNavPlacement(zoneToColumn(nextOperationalZones["nav-burger"]));
          setThemeTogglePosition(
            zoneToColumn(nextOperationalZones["theme-toggle"]) === "left" ? "left" : "right"
          );
          setFooterPlacement(zoneToColumn(nextOperationalZones["footer-hero"]));
        },
      },
      {
        label: "Sugerir overlay",
        action: () => {
          setOverlayDensity("soft");
          setOverlayStyleMode("gradient");
          setOverlayTint("smoke");
        },
      },
      {
        label: "Sugerir colocacion CTA",
        action: () =>
          setPieceZones((previous) => ({
            ...previous,
            "cta-group": viewport === "mobile" ? "center" : "bottom-center",
          })),
      },
      {
        label: "Sugerir asset de libreria",
        action: () => {
          const candidate = contextualAssets[0];
          if (!candidate) return;
          if (visualSourceKind === "logo") {
            setSelectedLogoAssetId(candidate._id);
            return;
          }
          setSelectedHeroAssetId(candidate._id);
        },
      },
    ],
    [contextualAssets, pieceVisibility.logo, viewport, visualSourceKind]
  );

  const selectedPieceStyle = isTextEditablePiece(selectedPiece)
    ? textStyles[selectedPiece]
    : null;
  const isHeadlinePiece = selectedPiece === "headline";
  const isSubheadlinePiece = selectedPiece === "subheadline";
  const isCtaGroupPiece = selectedPiece === "cta-group";
  const isHeadlineOrSubheadlinePiece = isHeadlinePiece || isSubheadlinePiece;
  const selectedLayoutPiece =
    selectedPiece && LAYOUT_PIECES.includes(selectedPiece as LayoutPiece)
      ? (selectedPiece as LayoutPiece)
      : null;
  const selectedOperationalPiece =
    selectedPiece && OPERATIONAL_PLACEMENT_PIECE_SET.has(selectedPiece)
      ? (selectedPiece as OperationalPlacementPiece)
      : null;
  const activePlacementPiece = selectedLayoutPiece ?? selectedOperationalPiece;
  const canUsePlacementShortcuts = Boolean(activePlacementPiece);

  const headlineClassName = [
    textStyleToClass("headline", textStyles.headline),
    structuralAlignToTextClass(pieceStructure.headline.align),
    structuralEmphasisToClass(pieceStructure.headline.emphasis),
    "[text-wrap:balance]",
  ]
    .filter(Boolean)
    .join(" ");
  const subheadlineClassName = [
    textStyleToClass("subheadline", textStyles.subheadline),
    structuralAlignToTextClass(pieceStructure.subheadline.align),
    structuralAlignToContainerClass(pieceStructure.subheadline.align),
    structuralWidthToPieceClass("subheadline", pieceStructure.subheadline.width),
    zoneRowToOffsetClass(zoneToRow(pieceZones.subheadline)),
    "transition-transform",
    structuralEmphasisToClass(pieceStructure.subheadline.emphasis),
    "[text-wrap:pretty]",
  ]
    .filter(Boolean)
    .join(" ");
  const ctaTextClassName = textStyleToClass("cta-group", textStyles["cta-group"]);
  const ctaGroupClassName = [
    structuralAlignToContainerClass(pieceStructure["cta-group"].align),
    structuralWidthToPieceClass("cta-group", pieceStructure["cta-group"].width),
    zoneRowToOffsetClass(zoneToRow(pieceZones["cta-group"])),
    "transition-transform",
  ]
    .filter(Boolean)
    .join(" ");
  const ctaButtonStructureClassName = [
    structuralEmphasisToClass(pieceStructure["cta-group"].emphasis),
  ]
    .filter(Boolean)
    .join(" ");
  const ctaStyleClassName = ctaStyleClasses(ctaStyle);
  const ctaRegulationClassName =
    ctaRegulation === "primary-focus"
      ? {
          primary:
            "!font-bold !shadow-[0_12px_26px_color-mix(in_oklab,var(--foreground)_28%,transparent)]",
          secondary: "opacity-80",
        }
      : { primary: "", secondary: "" };
  const effectiveOverlayStyleMode: OverlayStyleMode = pieceVisibility["overlay-atmosphere"]
    ? overlayStyleMode
    : "none";
  const effectiveHeroBackgroundUrl = pieceVisibility["background-media"] ? heroBackgroundUrl : "";
  const logoPieceClassName = [
    structuralAlignToContainerClass(pieceStructure.logo.align),
    structuralWidthToPieceClass("logo", pieceStructure.logo.width),
    pieceStructure.logo.width === "narrow"
      ? "[&_img]:!max-h-[3.25rem] [&_img]:sm:!max-h-[4rem] [&_img]:md:!max-h-[5.5rem]"
      : pieceStructure.logo.width === "wide"
        ? "[&_img]:!max-h-[5rem] [&_img]:sm:!max-h-[6.25rem] [&_img]:md:!max-h-[8rem]"
        : "[&_img]:!max-h-[4rem] [&_img]:sm:!max-h-[5rem] [&_img]:md:!max-h-[6.75rem]",
    zoneRowToOffsetClass(zoneToRow(pieceZones.logo)),
    "transition-transform",
    structuralEmphasisToClass(pieceStructure.logo.emphasis),
    logoOpacity >= 97 ? "opacity-100" : logoOpacity >= 85 ? "opacity-95" : "opacity-80",
    logoShadow === "medium"
      ? "drop-shadow-[0_12px_18px_color-mix(in_oklab,var(--foreground)_34%,transparent)]"
      : logoShadow === "soft"
        ? "drop-shadow-[0_8px_14px_color-mix(in_oklab,var(--foreground)_22%,transparent)]"
        : "",
    logoFrameStyle === "glass"
      ? "backdrop-blur-[2px]"
      : logoFrameStyle === "solid"
        ? "[background:color-mix(in_oklab,var(--surface-3,var(--card))_34%,transparent)] rounded-xl px-2 py-1"
        : "",
  ]
    .filter(Boolean)
    .join(" ");
  const signatureClassName = [
    signatureSize === "sm" ? "text-[10px]" : signatureSize === "lg" ? "text-xs" : "text-[11px]",
    signatureTone === "accent"
      ? "[color:var(--accent-soft,var(--hero-text-88))]"
      : signatureTone === "muted"
        ? "[color:var(--hero-text-80)]"
        : "[color:var(--hero-text-88)]",
    signatureOpacity >= 90 ? "opacity-100" : signatureOpacity >= 70 ? "opacity-90" : "opacity-70",
    signatureAnimation === "pulse"
      ? "motion-safe:animate-pulse"
      : signatureAnimation === "float"
        ? "motion-safe:animate-[float_4s_ease-in-out_infinite]"
        : "",
  ]
    .filter(Boolean)
    .join(" ");
  const assetKindLabel =
    visualSourceKind === "hero-image" ? "Imagen" : visualSourceKind === "logo" ? "Logo" : "Video";
  const isAssetPickerOpen = assetPickerView === "open";
  const mediaLibraryCount = visualSourceKind === "video" ? 0 : contextualAssets.length;
  const selectedAssetSummary = selectedContextAsset
    ? `${selectedContextAsset.label} - ${selectedContextAsset.variantKey} - ${selectedContextAsset.reviewStatus}`
    : visualSourceKind === "video"
      ? "Video sin soporte en esta fase"
      : "Sin asset seleccionado";
  const sourceSnapshotId = candidateSnapshot.id;
  const sourcePresetId = candidateSnapshot.meta?.sourcePresetVaultItemId ?? "sin preset";

  const viewportConfig = VIEWPORTS[viewport];
  const canvasWidth = viewportConfig.width;
  const canvasHeight = viewportConfig.height;

  const autoScale = useMemo(() => {
    const stagePadding = PREVIEW_STAGE_PADDING[viewport];
    const availableWidth = Math.max(previewStageSize.width - stagePadding.x, 0);
    const availableHeight = Math.max(
      previewStageSize.height - stagePadding.y,
      0
    );
    if (!availableWidth || !availableHeight) return 1;

    const scaleX = availableWidth / canvasWidth;
    const scaleY = availableHeight / canvasHeight;
    const next = Math.min(scaleX, scaleY, 1);
    if (!Number.isFinite(next) || next <= 0) return 1;
    return next;
  }, [canvasHeight, canvasWidth, previewStageSize.height, previewStageSize.width, viewport]);

  const canvasScale = Math.max(PREVIEW_MIN_SCALE[viewport], autoScale);
  const scaledCanvasWidth = canvasWidth * canvasScale;
  const scaledCanvasHeight = canvasHeight * canvasScale;

  const selectedHeadlineZone = pieceZones.headline;
  const selectedCtaZone = pieceZones["cta-group"];
  const selectedLogoZone = pieceZones.logo;
  const navPieceZone = operationalPieceZones["nav-burger"];
  const themeToggleZone = operationalPieceZones["theme-toggle"];
  const footerHeroZone = operationalPieceZones["footer-hero"];
  const contactStripZone = operationalPieceZones["contact-strip"];
  const signatureZone = operationalPieceZones["animated-signature"];

  const blueprintPreset = BLUEPRINT_PRESETS[blueprint];
  const headlineColumn = zoneToColumn(selectedHeadlineZone);
  const ctaColumn = zoneToColumn(selectedCtaZone);
  const logoColumn = zoneToColumn(selectedLogoZone);
  const navColumn = zoneToColumn(navPieceZone);
  const themeToggleColumn = zoneToColumn(themeToggleZone);
  const footerColumn = zoneToColumn(footerHeroZone);

  const headlinePosition = headlineColumn;
  const copyBlockPosition = zoneToCopyBlock(selectedHeadlineZone);
  const ctaPosition = columnToCtaPosition(ctaColumn);
  const logoPosition = pieceVisibility.logo ? logoColumn : blueprintPreset.logoPosition;
  const resolvedNavPosition = navPlacement === "auto" ? navColumn : navPlacement;
  const resolvedThemeTogglePosition: "left" | "right" =
    themeToggleColumn === "left" ? "left" : "right";
  const resolvedNavigationMode = resolveViewportNavigationMode(viewport);
  const resolvedNavPanelOrigin = resolveViewportNavPanelOrigin(
    viewport,
    resolvedNavPosition,
    resolvedNavPosition
  );
  const resolvedFooterPosition = footerPlacement === "auto" ? footerColumn : footerPlacement;

  const effectiveCopyWidth = structuralWidthToCopyWidth(pieceStructure.headline.width);
  const gapHeadlineSubheadline = structuralSpacingToGap(pieceStructure.subheadline.spacing);
  const gapTextCta = structuralSpacingToGap(pieceStructure["cta-group"].spacing);
  const gapLogoHeadline = structuralSpacingToGap(pieceStructure.logo.spacing);

  const mappedHero = useMemo(
    () => ({
      ...candidateHero,
      badge: currentBadge,
      title: currentHeadline,
      description: currentSubheadline,
      primaryCtaLabel: currentPrimaryCta,
      primaryCtaHref: primaryCtaHrefDraft.trim() || candidateHero.primaryCtaHref,
      secondaryCtaLabel: currentSecondaryCta,
      secondaryCtaHref: secondaryCtaHrefDraft.trim() || candidateHero.secondaryCtaHref,
      backgroundImageUrl: effectiveHeroBackgroundUrl,
      logoUrl: heroLogoUrl,
      heroAppearanceVariant: overlayDensity,
      footerAddress,
      footerPhone,
      footerWhatsapp,
      footerEmail,
      footerSignature: "Creado por ELU",
    }),
    [
      candidateHero,
      currentBadge,
      currentHeadline,
      currentPrimaryCta,
      primaryCtaHrefDraft,
      currentSecondaryCta,
      secondaryCtaHrefDraft,
      currentSubheadline,
      footerAddress,
      footerEmail,
      footerPhone,
      footerWhatsapp,
      overlayDensity,
      effectiveHeroBackgroundUrl,
      heroLogoUrl,
    ]
  );

  const layoutGlobalSummary = `${layoutDensity} densidad - ${layoutBalance} balance - ${layoutContentWidth} ancho - ${layoutMediaDominance} dominancia media - ${layoutSafeArea} area segura`;
  const contactDensityClassName =
    contactDensity === "compact"
      ? "text-[11px] gap-y-1"
      : contactDensity === "spacious"
        ? "text-[13px] gap-y-3"
        : "text-xs gap-y-2";
  const contactContrastClassName =
    contactContrast === "soft"
      ? "opacity-80"
      : contactContrast === "strong"
        ? "opacity-100 [color:var(--hero-text-inverse)]"
        : "opacity-95";
  const contactHoverClassName =
    contactHover === "none"
      ? "[&_[data-footer-part]]:transition-none [&_[data-footer-part]]:hover:opacity-100"
      : contactHover === "strong"
        ? "[&_[data-footer-part]]:transition [&_[data-footer-part]]:duration-200 [&_[data-footer-part]]:hover:opacity-100 [&_[data-footer-part]]:hover:[background:color-mix(in_oklab,var(--hero-chrome-surface-bg)_76%,transparent)] [&_[data-footer-part]]:hover:rounded-md [&_[data-footer-part]]:hover:px-1.5"
        : "[&_[data-footer-part]]:transition [&_[data-footer-part]]:duration-200 [&_[data-footer-part]]:hover:opacity-90";
  const contactEffectClassName =
    contactEffect === "none"
      ? ""
      : contactEffect === "lift"
        ? "[&_[data-footer-part]]:hover:-translate-y-0.5"
        : "[&_[data-footer-part]]:hover:[text-shadow:0_0_10px_color-mix(in_oklab,var(--hero-text-inverse)_42%,transparent)]";
  const contactShadowClassName =
    contactShadow === "none"
      ? ""
      : contactShadow === "medium"
        ? "[&_[data-footer-part]]:[text-shadow:0_2px_12px_color-mix(in_oklab,var(--foreground)_44%,transparent)]"
        : "[&_[data-footer-part]]:[text-shadow:0_1px_6px_color-mix(in_oklab,var(--foreground)_28%,transparent)]";
  const contactLinksClassName = contactLinksVisible
    ? "[&_[data-footer-part]]:underline [&_[data-footer-part]]:underline-offset-2 [&_[data-footer-part]]:decoration-dotted"
    : "[&_[data-footer-part]]:no-underline";
  const footerLogoSizeClassName =
    footerLogoSize === "sm"
      ? "[&_[data-footer-part=identity]_img]:h-4"
      : footerLogoSize === "lg"
        ? "[&_[data-footer-part=identity]_img]:h-6"
        : "[&_[data-footer-part=identity]_img]:h-5";
  const footerLogoAlignClassName =
    footerLogoAlign === "left"
      ? "[&_[data-footer-part=identity]]:justify-start [&_[data-footer-part=identity]]:text-left"
      : footerLogoAlign === "right"
        ? "[&_[data-footer-part=identity]]:justify-end [&_[data-footer-part=identity]]:text-right"
        : "[&_[data-footer-part=identity]]:justify-center [&_[data-footer-part=identity]]:text-center";
  const footerHeroClassName = [
    footerIntegration === "separated"
      ? "w-full [&>div]:w-full [&>div]:h-full [&>div]:rounded-none"
      : "",
    footerLogoSizeClassName,
    footerLogoAlignClassName,
    zoneRowToOffsetClass(zoneToRow(footerHeroZone)),
    "transition-transform",
  ]
    .filter(Boolean)
    .join(" ");
  const contactStripClassName = [
    contactDensityClassName,
    contactContrastClassName,
    contactHoverClassName,
    contactEffectClassName,
    contactShadowClassName,
    contactLinksClassName,
    structuralAlignToTextClass(columnToStructuralAlign(zoneToColumn(contactStripZone))),
    zoneRowToOffsetClass(zoneToRow(contactStripZone)),
    "transition-transform",
  ]
    .filter(Boolean)
    .join(" ");
  const navBurgerClassName = [
    zoneRowToOffsetClass(zoneToRow(navPieceZone)),
    "transition-transform",
  ]
    .filter(Boolean)
    .join(" ");
  const signaturePlacementClassName = [
    structuralAlignToTextClass(columnToStructuralAlign(zoneToColumn(signatureZone))),
    zoneRowToOffsetClass(zoneToRow(signatureZone)),
    "transition-transform",
  ]
    .filter(Boolean)
    .join(" ");
  const themeToggleIntensityClass =
    themeEffectIntensity === "high"
      ? "[box-shadow:0_0_0_1px_color-mix(in_oklab,var(--hero-text-inverse)_42%,transparent),0_8px_20px_color-mix(in_oklab,var(--foreground)_34%,transparent)]"
      : themeEffectIntensity === "low"
        ? "[box-shadow:0_0_0_1px_color-mix(in_oklab,var(--hero-text-inverse)_22%,transparent)]"
        : "[box-shadow:0_0_0_1px_color-mix(in_oklab,var(--hero-text-inverse)_30%,transparent),0_4px_12px_color-mix(in_oklab,var(--foreground)_22%,transparent)]";
  const themeToggleClassName = [
    resolvedThemeTogglePosition === "left" ? "order-[-1] mr-auto" : "order-[3]",
    zoneRowToOffsetClass(zoneToRow(themeToggleZone)),
    "relative min-w-[5.9rem] px-1.5",
    themeToggleStyle === "minimal"
      ? "border-transparent [background:transparent]"
      : themeToggleStyle === "glass"
        ? "[background:color-mix(in_oklab,var(--hero-chrome-surface-bg)_54%,transparent)] backdrop-blur-[2px]"
        : "[background:var(--hero-chrome-surface-bg)]",
    themeEffectScope === "button" ? themeToggleIntensityClass : "",
  ]
    .filter(Boolean)
    .join(" ");
  const inspectorSectionClassName =
    "rounded-xl border border-border/75 [background:color-mix(in_oklab,var(--surface-1,var(--background))_86%,var(--accent-soft,var(--card))_14%)] [box-shadow:var(--elevation-soft,var(--panel-shadow-1))] p-2.5 [&_button.rounded-full]:max-w-[6.75rem] [&_button.rounded-full]:overflow-hidden [&_button.rounded-full]:text-ellipsis [&_button.rounded-full]:whitespace-nowrap [&_button.rounded-full]:px-1.5 [&_button.rounded-full]:py-0.5 [&_button.rounded-full]:text-[9px] [&_button.rounded-full]:leading-tight [&_button.rounded-full]:tracking-[0.035em] [&_button.rounded-full]:uppercase [&_button.rounded-full]:truncate [&_button.text-muted-foreground.rounded-full]:border-border/75 [&_button.text-muted-foreground.rounded-full]:[background:color-mix(in_oklab,var(--surface-2,var(--card))_84%,var(--surface-1,var(--background))_16%)] [&_button.text-muted-foreground.rounded-full]:[box-shadow:0_1px_6px_color-mix(in_oklab,var(--foreground)_8%,transparent)] [&_button.rounded-full:not(.text-muted-foreground)]:ring-1 [&_button.rounded-full:not(.text-muted-foreground)]:ring-border/85 [&_button.rounded-full:not(.text-muted-foreground)]:[background:color-mix(in_oklab,var(--surface-1,var(--background))_86%,var(--accent-soft,var(--card))_14%)] [&_div.flex.flex-wrap.gap-1]:gap-0.5 [&_div.flex.flex-wrap.gap-1]:justify-center [&_button.rounded-full:not(:disabled)]:transition [&_button.rounded-full:not(:disabled)]:duration-200 [&_button.rounded-full:not(:disabled)]:hover:[background:color-mix(in_oklab,var(--accent-soft,var(--card))_46%,var(--surface-3,var(--card))_54%)] [&_button.rounded-full:not(:disabled)]:hover:border-border [&_button.rounded-full:disabled]:opacity-45 [&_button.rounded-full:disabled]:cursor-not-allowed";
  const inspectorSectionTitleClassName =
    "text-[12px] font-extrabold uppercase tracking-[0.15em] text-foreground/95";
  const inspectorControlGroupClassName =
    "rounded-lg border border-border/80 [background:color-mix(in_oklab,var(--surface-2,var(--card))_90%,var(--surface-1,var(--background))_10%)] [box-shadow:var(--elevation-base,var(--panel-shadow-1))] p-2.5";
  const inspectorControlGroupTitleClassName =
    "mb-1 text-[10px] font-semibold uppercase tracking-[0.11em] text-foreground/78";
  const inspectorMiniGroupTitleClassName =
    "text-[9px] font-semibold uppercase tracking-[0.08em] text-muted-foreground";
  const themePreviewFrameClassName =
    themeToggleDefault === "dark"
      ? "[box-shadow:0_10px_26px_color-mix(in_oklab,var(--foreground)_24%,transparent)] [background:color-mix(in_oklab,var(--surface-3,var(--card))_72%,var(--panel-surface-1,var(--background))_28%)] [filter:brightness(0.86)_saturate(0.9)]"
      : themeToggleDefault === "light"
        ? "[box-shadow:0_8px_22px_color-mix(in_oklab,var(--foreground)_10%,transparent)] [background:color-mix(in_oklab,var(--surface-1,var(--background))_90%,var(--surface-2,var(--card))_10%)] [filter:brightness(1.08)_saturate(1.05)]"
        : "[box-shadow:0_8px_20px_color-mix(in_oklab,var(--foreground)_14%,transparent)]";
  const themePreviewIntensityClassName =
    themeEffectIntensity === "high"
      ? themeToggleDefault === "dark"
        ? "[box-shadow:0_12px_30px_color-mix(in_oklab,var(--foreground)_28%,transparent)] [filter:brightness(0.8)_saturate(0.84)]"
        : themeToggleDefault === "light"
          ? "[box-shadow:0_12px_30px_color-mix(in_oklab,var(--foreground)_20%,transparent)] [filter:brightness(1.14)_saturate(1.09)]"
          : "[box-shadow:0_12px_30px_color-mix(in_oklab,var(--foreground)_22%,transparent)]"
      : themeEffectIntensity === "low"
        ? themeToggleDefault === "dark"
          ? "[box-shadow:0_5px_14px_color-mix(in_oklab,var(--foreground)_10%,transparent)] [filter:brightness(0.92)_saturate(0.94)]"
          : themeToggleDefault === "light"
            ? "[box-shadow:0_5px_14px_color-mix(in_oklab,var(--foreground)_8%,transparent)] [filter:brightness(1.04)_saturate(1.03)]"
            : "[box-shadow:0_5px_14px_color-mix(in_oklab,var(--foreground)_8%,transparent)]"
        : "";
  const headerLogoGroupAlignClassName =
    headerLogoAlign === "left"
      ? "[&_header>div>div:first-child]:w-[11rem] [&_header>div>div:first-child]:justify-start [&_header>div>div:first-child]:text-left"
      : headerLogoAlign === "right"
        ? "[&_header>div>div:first-child]:w-[11rem] [&_header>div>div:first-child]:justify-end [&_header>div>div:first-child]:text-right"
        : "[&_header>div>div:first-child]:w-[11rem] [&_header>div>div:first-child]:justify-center [&_header>div>div:first-child]:text-center";
  const headerLogoSizeClassName =
    headerLogoSize === "sm"
      ? "[&_header>div>div:first-child>img]:h-8 [&_header>div>div:first-child>img]:sm:h-9"
      : headerLogoSize === "lg"
        ? "[&_header>div>div:first-child>img]:h-12 [&_header>div>div:first-child>img]:sm:h-[3.25rem]"
        : "[&_header>div>div:first-child>img]:h-10 [&_header>div>div:first-child>img]:sm:h-11";
  const themeScopeClassName =
    themeEffectScope === "hero"
      ? themeToggleDefault === "dark"
        ? themeEffectIntensity === "high"
          ? "[filter:saturate(0.84)_brightness(0.78)]"
          : themeEffectIntensity === "low"
            ? "[filter:saturate(0.94)_brightness(0.9)]"
            : "[filter:saturate(0.9)_brightness(0.84)]"
        : themeToggleDefault === "light"
          ? themeEffectIntensity === "high"
            ? "[filter:saturate(1.14)_brightness(1.13)]"
            : themeEffectIntensity === "low"
              ? "[filter:saturate(1.04)_brightness(1.04)]"
              : "[filter:saturate(1.09)_brightness(1.08)]"
          : themeEffectIntensity === "high"
            ? "[filter:saturate(1.04)_brightness(1.03)]"
            : themeEffectIntensity === "low"
              ? "[filter:saturate(1.01)_brightness(1.01)]"
              : "[filter:saturate(1.02)_brightness(1.02)]"
      : themeEffectScope === "header"
        ? themeToggleDefault === "dark"
          ? themeEffectIntensity === "high"
            ? "[&_header>div]:[box-shadow:0_0_0_1px_color-mix(in_oklab,var(--hero-text-inverse)_42%,transparent),0_10px_18px_color-mix(in_oklab,var(--foreground)_32%,transparent)] [&_header>div]:[background:color-mix(in_oklab,var(--foreground)_34%,var(--surface-3,var(--card))_66%)]"
            : themeEffectIntensity === "low"
              ? "[&_header>div]:[box-shadow:0_0_0_1px_color-mix(in_oklab,var(--hero-text-inverse)_24%,transparent)] [&_header>div]:[background:color-mix(in_oklab,var(--foreground)_16%,var(--surface-3,var(--card))_84%)]"
              : "[&_header>div]:[box-shadow:0_0_0_1px_color-mix(in_oklab,var(--hero-text-inverse)_32%,transparent),0_6px_14px_color-mix(in_oklab,var(--foreground)_24%,transparent)] [&_header>div]:[background:color-mix(in_oklab,var(--foreground)_24%,var(--surface-3,var(--card))_76%)]"
          : themeToggleDefault === "light"
            ? themeEffectIntensity === "high"
              ? "[&_header>div]:[box-shadow:0_0_0_1px_color-mix(in_oklab,var(--hero-text-inverse)_24%,transparent),0_10px_18px_color-mix(in_oklab,var(--foreground)_16%,transparent)] [&_header>div]:[background:color-mix(in_oklab,var(--surface-1,var(--background))_84%,var(--surface-2,var(--card))_16%)]"
              : themeEffectIntensity === "low"
                ? "[&_header>div]:[box-shadow:0_0_0_1px_color-mix(in_oklab,var(--hero-text-inverse)_16%,transparent)] [&_header>div]:[background:color-mix(in_oklab,var(--surface-1,var(--background))_92%,var(--surface-2,var(--card))_8%)]"
                : "[&_header>div]:[box-shadow:0_0_0_1px_color-mix(in_oklab,var(--hero-text-inverse)_20%,transparent),0_6px_14px_color-mix(in_oklab,var(--foreground)_14%,transparent)] [&_header>div]:[background:color-mix(in_oklab,var(--surface-1,var(--background))_88%,var(--surface-2,var(--card))_12%)]"
            : themeEffectIntensity === "high"
              ? "[&_header>div]:[box-shadow:0_0_0_1px_color-mix(in_oklab,var(--hero-text-inverse)_36%,transparent),0_10px_18px_color-mix(in_oklab,var(--foreground)_28%,transparent)]"
              : themeEffectIntensity === "low"
                ? "[&_header>div]:[box-shadow:0_0_0_1px_color-mix(in_oklab,var(--hero-text-inverse)_18%,transparent)]"
                : "[&_header>div]:[box-shadow:0_0_0_1px_color-mix(in_oklab,var(--hero-text-inverse)_26%,transparent),0_6px_14px_color-mix(in_oklab,var(--foreground)_20%,transparent)]"
        : "";
  const previewHeroFrameClassName = [
    headerLogoGroupAlignClassName,
    headerLogoSizeClassName,
    themeScopeClassName,
  ]
    .filter(Boolean)
    .join(" ");

  function setDesktopNavVisibility(visible: boolean) {
    setNavLinksVisible(visible);
    setPieceVisibility((previous) => ({ ...previous, "desktop-nav": visible }));
  }

  function togglePieceVisibility(piece: LabHeroPiece) {
    if (piece === "desktop-nav") {
      setDesktopNavVisibility(!navLinksVisible);
      return;
    }
    setPieceVisibility((previous) => ({ ...previous, [piece]: !previous[piece] }));
  }

  function handlePieceSelect(piece: LabHeroPiece) {
    const shouldScrollToInspector = selectedPiece !== piece;
    setSelectedPiece(piece);
    if (LAYOUT_ENABLED_PIECES.has(piece)) {
      setActiveLayoutPiece(piece as LayoutPiece);
    }
    if (shouldScrollToInspector) {
      requestAnimationFrame(() => {
        inspectorContextualRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }

  function setOperationalPieceColumn(
    piece: OperationalPlacementPiece,
    column: "left" | "center" | "right"
  ) {
    setOperationalPieceZones((previous) => {
      const currentRow = zoneToRow(previous[piece]);
      return {
        ...previous,
        [piece]: `${currentRow}-${column}` as LayoutZone,
      };
    });

    if (piece === "nav-burger") {
      setNavPlacement(column);
      return;
    }

    if (piece === "theme-toggle") {
      setThemeTogglePosition(column === "left" ? "left" : "right");
      return;
    }

    if (piece === "footer-hero") {
      setFooterPlacement(column);
    }
  }

  function setOperationalPieceRow(
    piece: OperationalPlacementPiece,
    row: "top" | "center" | "bottom"
  ) {
    setOperationalPieceZones((previous) => {
      const currentColumn = zoneToColumn(previous[piece]);
      return {
        ...previous,
        [piece]: `${row}-${currentColumn}` as LayoutZone,
      };
    });
  }

  function resetOperationalPiecePlacement(piece: OperationalPlacementPiece) {
    const resetZone = buildOperationalZonesFromBlueprint(blueprint)[piece];
    setOperationalPieceZones((previous) => ({ ...previous, [piece]: resetZone }));

    const resetColumn = zoneToColumn(resetZone);
    if (piece === "nav-burger") {
      setNavPlacement(resetColumn);
      return;
    }

    if (piece === "theme-toggle") {
      setThemeTogglePosition(resetColumn === "left" ? "left" : "right");
      return;
    }

    if (piece === "footer-hero") {
      setFooterPlacement(resetColumn);
    }
  }

  function selectLayoutPiece(piece: LayoutPiece) {
    setActiveLayoutPiece(piece);
    setSelectedPiece(piece);
  }

  function assignActivePieceToZone(zone: LayoutZone) {
    const layoutPiece = selectedLayoutPiece ?? activeLayoutPiece;
    setPieceZones((previous) => ({ ...previous, [layoutPiece]: zone }));
    setPieceStructure((previous) => ({
      ...previous,
      [layoutPiece]: {
        ...previous[layoutPiece],
        align: columnToStructuralAlign(zoneToColumn(zone)),
      },
    }));
    setSelectedPiece(layoutPiece);
    setActiveLayoutPiece(layoutPiece);
  }

  function applyPlacementShortcut(row: "top" | "center" | "bottom" | "reset") {
    if (!selectedLayoutPiece && !selectedOperationalPiece) return;

    if (!selectedLayoutPiece && selectedOperationalPiece) {
      if (row === "reset") {
        resetOperationalPiecePlacement(selectedOperationalPiece);
        return;
      }

      setOperationalPieceRow(selectedOperationalPiece, row);
      return;
    }

    if (!selectedLayoutPiece) return;

    if (row === "reset") {
      const resetZone = DEFAULT_PIECE_ZONES[selectedLayoutPiece];
      setPieceZones((previous) => ({
        ...previous,
        [selectedLayoutPiece]: resetZone,
      }));
      setPieceStructure((previous) => ({
        ...previous,
        [selectedLayoutPiece]: {
          ...previous[selectedLayoutPiece],
          align: columnToStructuralAlign(zoneToColumn(resetZone)),
        },
      }));
      return;
    }

    const currentColumn = zoneToColumn(pieceZones[selectedLayoutPiece]);
    const nextZone = `${row}-${currentColumn}` as LayoutZone;
    setPieceZones((previous) => ({ ...previous, [selectedLayoutPiece]: nextZone }));
    setPieceStructure((previous) => ({
      ...previous,
      [selectedLayoutPiece]: {
        ...previous[selectedLayoutPiece],
        align: columnToStructuralAlign(currentColumn),
      },
    }));
  }

  function applyColumnShortcut(column: "left" | "center" | "right") {
    if (!selectedLayoutPiece && !selectedOperationalPiece) return;

    if (!selectedLayoutPiece && selectedOperationalPiece) {
      setOperationalPieceColumn(selectedOperationalPiece, column);
      return;
    }

    if (!selectedLayoutPiece) return;

    const currentRow = zoneToRow(pieceZones[selectedLayoutPiece]);
    const nextZone = `${currentRow}-${column}` as LayoutZone;
    setPieceZones((previous) => ({ ...previous, [selectedLayoutPiece]: nextZone }));
    setPieceStructure((previous) => ({
      ...previous,
      [selectedLayoutPiece]: {
        ...previous[selectedLayoutPiece],
        align: columnToStructuralAlign(column),
      },
    }));
  }

  function updateSelectedTextStyle<Key extends keyof TextStyle>(key: Key, value: TextStyle[Key]) {
    if (!isTextEditablePiece(selectedPiece)) return;
    setTextStyles((previous) => ({
      ...previous,
      [selectedPiece]: {
        ...previous[selectedPiece],
        [key]: value,
      },
    }));
  }

  function updateSelectedPieceStructure<Key extends keyof PieceStructure>(
    key: Key,
    value: PieceStructure[Key]
  ) {
    if (!selectedPiece || !LAYOUT_PIECES.includes(selectedPiece as LayoutPiece)) return;

    const piece = selectedPiece as LayoutPiece;
    setPieceStructure((previous) => ({
      ...previous,
      [piece]: {
        ...previous[piece],
        [key]: value,
      },
    }));

    if (key === "align") {
      const column = structuralAlignToColumn(value as StructuralAlign);
      setPieceZones((previous) => {
        const currentRow = zoneToRow(previous[piece]);
        return {
          ...previous,
          [piece]: `${currentRow}-${column}` as LayoutZone,
        };
      });
    }
  }

  function handleVisualSourceKindChange(nextKind: VisualSourceKind) {
    setVisualSourceKind(nextKind);

    if (nextKind === "hero-image") {
      setVariantFilter("optimized");
      setOrientationFilter("landscape");
      setReviewFilter("approved");
      setAssetComponentFilter("hero");
      setAssetContextFilter("hero");
      setSourceMode("hero-safe-media");
      return;
    }

    if (nextKind === "logo") {
      setVariantFilter("vectorized-svg");
      setOrientationFilter("all");
      setReviewFilter("approved");
      setAssetComponentFilter("logo");
      setAssetContextFilter("all");
      return;
    }

    setAssetComponentFilter("all");
    setAssetContextFilter("all");
    setAssetPickerView("closed");
  }

  function handleBlueprintChange(nextBlueprint: Blueprint) {
    const nextZones = cloneSnapshot(BLUEPRINT_ZONE_PRESETS[nextBlueprint]);
    const nextOperationalZones = buildOperationalZonesFromBlueprint(nextBlueprint);
    setBlueprint(nextBlueprint);
    setPieceZones(nextZones);
    setOperationalPieceZones(nextOperationalZones);
    setPieceStructure((previous) => alignPieceStructureToZones(previous, nextZones));
    setNavPlacement(zoneToColumn(nextOperationalZones["nav-burger"]));
    setThemeTogglePosition(
      zoneToColumn(nextOperationalZones["theme-toggle"]) === "left" ? "left" : "right"
    );
    setFooterPlacement(zoneToColumn(nextOperationalZones["footer-hero"]));
    setActiveLayoutPiece("headline");

    if (nextBlueprint === "centered") {
      setLayoutBalance("balanced");
      setLayoutContentWidth("medium");
      setLayoutMediaDominance("low");
      return;
    }

    if (nextBlueprint === "split") {
      setLayoutBalance("copy-first");
      setLayoutContentWidth("medium");
      setLayoutMediaDominance("medium");
      return;
    }

    if (nextBlueprint === "poster") {
      setLayoutBalance("copy-first");
      setLayoutContentWidth("wide");
      setLayoutMediaDominance("high");
      return;
    }

    setLayoutBalance("media-first");
    setLayoutContentWidth("narrow");
    setLayoutMediaDominance("medium");
  }

  function resolveSuggestionDecisionElement(
    target: SuggestionReturnTarget
  ): HTMLDivElement | null {
    return target === "design"
      ? designAdjustmentDecisionRef.current
      : qualityAdjustmentDecisionRef.current;
  }

  function resolveSuggestionPanel(target: SuggestionReturnTarget): HTMLElement | null {
    const anchorElement =
      target === "design" ? designSuggestionActionsRef.current : qualityGateActionsRef.current;
    if (anchorElement) {
      return anchorElement.closest("aside");
    }
    const decisionElement = resolveSuggestionDecisionElement(target);
    return decisionElement ? decisionElement.closest("aside") : null;
  }

  function restoreSuggestionPanelPosition(
    target: SuggestionReturnTarget,
    scrollTop: number | null
  ) {
    const panelElement = resolveSuggestionPanel(target);
    if (panelElement && scrollTop !== null) {
      panelElement.scrollTop = scrollTop;
      return;
    }
    resolveSuggestionDecisionElement(target)?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }

  function applyDesignAdjustmentWithBackup(
    id: string,
    label: string,
    target: SuggestionReturnTarget,
    action: () => void
  ) {
    const snapshot = cloneSnapshot(captureSnapshot());
    const panelElement = resolveSuggestionPanel(target);
    setAppliedSuggestionReturnTarget(target);
    setPreviousPanelScrollTop(panelElement ? panelElement.scrollTop : null);
    setAppliedSuggestionBackup({
      id,
      label,
      snapshot,
      selectedHeroAssetId,
      selectedLogoAssetId,
    });
    action();
  }

  function discardAppliedSuggestion() {
    if (!appliedSuggestionBackup) return;
    const backupTarget = appliedSuggestionReturnTarget;
    const backupScrollTop = previousPanelScrollTop;
    applySnapshot(cloneSnapshot(appliedSuggestionBackup.snapshot));
    setSelectedHeroAssetId(appliedSuggestionBackup.selectedHeroAssetId);
    setSelectedLogoAssetId(appliedSuggestionBackup.selectedLogoAssetId);
    setAppliedSuggestionBackup(null);
    setAppliedSuggestionReturnTarget(null);
    setPreviousPanelScrollTop(null);
    setActionNotice(`Se restauro el ajuste anterior (${appliedSuggestionBackup.label}).`);

    if (backupTarget === null) return;
    requestAnimationFrame(() => {
      restoreSuggestionPanelPosition(backupTarget, backupScrollTop);
    });
  }

  function confirmAppliedSuggestion() {
    if (!appliedSuggestionBackup) return;
    const backupTarget = appliedSuggestionReturnTarget;
    const backupScrollTop = previousPanelScrollTop;
    const label = appliedSuggestionBackup.label;
    setAppliedSuggestionBackup(null);
    setAppliedSuggestionReturnTarget(null);
    setPreviousPanelScrollTop(null);
    setActionNotice(`Ajuste confirmado (${label}).`);

    if (backupTarget === null) return;
    requestAnimationFrame(() => {
      restoreSuggestionPanelPosition(backupTarget, backupScrollTop);
    });
  }

  useEffect(() => {
    if (!appliedSuggestionBackup || !appliedSuggestionReturnTarget) return;
    const target = appliedSuggestionReturnTarget;
    const timeoutId = window.setTimeout(() => {
      requestAnimationFrame(() => {
        const decisionElement =
          target === "design" ? designAdjustmentDecisionRef.current : qualityAdjustmentDecisionRef.current;
        decisionElement?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      });
    }, 24);
    return () => window.clearTimeout(timeoutId);
  }, [appliedSuggestionBackup, appliedSuggestionReturnTarget]);

  function handleAssetPick(item: AssetItem) {
    if (visualSourceKind === "hero-image") {
      setSelectedHeroAssetId(item._id);
      setSourceMode("hero-safe-media");
      setAssetPickerView("closed");
      return;
    }

    if (visualSourceKind === "logo") {
      setSelectedLogoAssetId(item._id);
      setAssetPickerView("closed");
    }
  }

  function handleSaveDraft() {
    persistCurrentViewportSnapshot();
    const variantSet = ensureCurrentVariantSnapshots();
    variantSnapshotsRef.current[variantName] = cloneSnapshot(variantSet);
    const stamp = new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
    setActionNotice(
      `Borrador de sesion local (${variantName}) guardado a las ${stamp} (no persistido en servidor).`
    );
  }

  function handleResetLayoutGlobal() {
    const nextZones = cloneSnapshot(BLUEPRINT_ZONE_PRESETS[blueprint]);
    const nextOperationalZones = buildOperationalZonesFromBlueprint(blueprint);
    setPieceZones(nextZones);
    setOperationalPieceZones(nextOperationalZones);
    setPieceStructure(alignPieceStructureToZones(cloneSnapshot(DEFAULT_PIECE_STRUCTURE), nextZones));
    setNavPlacement(zoneToColumn(nextOperationalZones["nav-burger"]));
    setThemeTogglePosition(
      zoneToColumn(nextOperationalZones["theme-toggle"]) === "left" ? "left" : "right"
    );
    setFooterPlacement(zoneToColumn(nextOperationalZones["footer-hero"]));
    setActionNotice(`Layout restablecido al blueprint ${blueprint}.`);
  }

  function handleSwapMobileNavTheme() {
    const currentNavSide =
      resolvedNavPosition === "center"
        ? "right"
        : resolvedNavPosition;
    const nextNavSide = themeTogglePosition === "left" ? "left" : "right";
    const nextThemeSide = currentNavSide === "left" ? "right" : "left";
    setOperationalPieceColumn("nav-burger", nextNavSide);
    setOperationalPieceColumn("theme-toggle", nextThemeSide);
    setActionNotice("En mobile: nav y theme toggle intercambiados.");
  }

  function applyNavThemePreset(
    preset: "burger-left-theme-right" | "theme-left-burger-right" | "both-right"
  ) {
    if (preset === "burger-left-theme-right") {
      setOperationalPieceColumn("nav-burger", "left");
      setOperationalPieceColumn("theme-toggle", "right");
      setActionNotice("Preset mobile aplicado: burger izquierda, theme derecha.");
      return;
    }

    if (preset === "theme-left-burger-right") {
      setOperationalPieceColumn("nav-burger", "right");
      setOperationalPieceColumn("theme-toggle", "left");
      setActionNotice("Preset mobile aplicado: theme izquierda, burger derecha.");
      return;
    }

    setOperationalPieceColumn("nav-burger", "right");
    setOperationalPieceColumn("theme-toggle", "right");
    setActionNotice("Preset mobile aplicado: burger y theme a la derecha.");
  }

  function buildHeadlineProposal(mode: HeadlineTransformMode): string {
    const source = currentHeadline.trim();
    if (!source) return "";

    if (mode === "shorten") {
      const words = source.split(/\s+/u).filter(Boolean);
      if (words.length <= 8) return source;
      return `${words.slice(0, 8).join(" ").replace(/[.!?]+$/u, "")}.`;
    }

    if (mode === "commercial") {
      const compact = source.replace(/[.!?]+$/u, "").trim();
      if (ctaRegulation === "primary-focus") {
        if (/reserva|cita|agenda|turno/iu.test(compact)) return compact;
        return `Reserva ${compact.charAt(0).toLowerCase()}${compact.slice(1)}`;
      }
      if (/descubre|conoce|explora/iu.test(compact)) return compact;
      return `Descubre ${compact.charAt(0).toLowerCase()}${compact.slice(1)}`;
    }

    const localSuffix = candidateId === "barber-pro" ? "en tu zona" : "en tu ciudad";
    if (new RegExp(localSuffix, "iu").test(source)) return source;
    return `${source.replace(/[.!?]+$/u, "")} ${localSuffix}`;
  }

  function proposeHeadlineTransformation(mode: HeadlineTransformMode) {
    const nextProposal = buildHeadlineProposal(mode);
    setHeadlineProposal(nextProposal.trim() ? nextProposal : null);
    setHeadlineProposalMode(mode);
  }

  function applyHeadlineProposal() {
    const nextHeadline = headlineProposal?.trim() ?? "";
    if (!nextHeadline) return;
    setPreviousHeadlineDraft(headlineDraft);
    setContentProperty("headlineDraft", nextHeadline);
    setActionNotice("Titular propuesto aplicado.");
    setHeadlineProposal(null);
    setHeadlineProposalMode(null);
  }

  function discardHeadlineProposal() {
    const pendingProposal = headlineProposal?.trim() ?? "";
    if (pendingProposal) {
      setHeadlineProposal(null);
      setHeadlineProposalMode(null);
      setActionNotice("Propuesta de titular descartada.");
      return;
    }

    if (previousHeadlineDraft !== null) {
      setContentProperty("headlineDraft", previousHeadlineDraft);
      setPreviousHeadlineDraft(null);
      setActionNotice("Titular anterior restaurado.");
    }
  }

  function handleDuplicateVariant() {
    persistCurrentViewportSnapshot();
    const currentVariantSet = cloneSnapshot(ensureCurrentVariantSnapshots());
    const currentVariantOverrides = cloneSnapshot(ensureCurrentVariantOverrides());
    const currentContentOverrides = cloneSnapshot(ensureCurrentVariantContentOverrides());
    const nextName = `variant-${variantCounter}`;
    setVariantCounter((previous) => previous + 1);
    variantSnapshotsRef.current[nextName] = cloneSnapshot(currentVariantSet);
    variantOverridesRef.current[nextName] = cloneSnapshot(currentVariantOverrides);
    variantContentOverridesRef.current[nextName] = cloneSnapshot(currentContentOverrides);
    setVariantName(nextName);
    applySnapshot(cloneSnapshot(currentVariantSet[viewport]));
    setResolvedContentState(viewport);
    setHeadlineProposal(null);
    setHeadlineProposalMode(null);
    setActionNotice(`Variante duplicada: ${nextName}. Incluye los 4 breakpoints.`);
  }

  function applyQualityRecommendation(key: QualityDimensionKey) {
    if (key === "conversion") {
      setPieceVisibility((previous) => ({ ...previous, "cta-group": true }));
      setPieceZones((previous) => ({ ...previous, "cta-group": "center" }));
      setPieceStructure((previous) => ({
        ...previous,
        "cta-group": {
          ...previous["cta-group"],
          align: "center",
        },
      }));
      return;
    }

    if (key === "design") {
      const nextBlueprint: Blueprint = pieceVisibility.logo ? "split" : "centered";
      const nextZones = cloneSnapshot(BLUEPRINT_ZONE_PRESETS[nextBlueprint]);
      const nextOperationalZones = buildOperationalZonesFromBlueprint(nextBlueprint);
      setBlueprint(nextBlueprint);
      setPieceZones(nextZones);
      setOperationalPieceZones(nextOperationalZones);
      setPieceStructure((previous) => alignPieceStructureToZones(previous, nextZones));
      setNavPlacement(zoneToColumn(nextOperationalZones["nav-burger"]));
      setThemeTogglePosition(
        zoneToColumn(nextOperationalZones["theme-toggle"]) === "left" ? "left" : "right"
      );
      setFooterPlacement(zoneToColumn(nextOperationalZones["footer-hero"]));
      return;
    }

    if (key === "ux") {
      setPieceVisibility((previous) => ({
        ...previous,
        "nav-burger": true,
        "theme-toggle": true,
      }));
      return;
    }

    if (key === "seo") {
      if (currentHeadline.length > 68) {
        setContentProperty("headlineDraft", currentHeadline.slice(0, 66).trim());
      } else {
        setContentProperty(
          "headlineDraft",
          `${currentHeadline} en ${candidateId === "barber-pro" ? "tu zona" : "tu ciudad"}`
        );
      }
      return;
    }

    if (key === "responsive") {
      if (viewport === "mobile" && currentHeadline.length > 52) {
        setContentProperty("headlineDraft", currentHeadline.slice(0, 48).trim());
      }
      setPieceZones((previous) => ({ ...previous, headline: "center-left" }));
      setPieceStructure((previous) => ({
        ...previous,
        headline: {
          ...previous.headline,
          align: "start",
        },
      }));
      return;
    }

    if (key === "chromia") {
      setOverlayDensity("soft");
      setOverlayStyleMode("gradient");
      setOverlayTint("smoke");
      return;
    }

    if (key === "accessibility") {
      setPieceVisibility((previous) => ({
        ...previous,
        headline: true,
        "contact-strip": true,
      }));
      setContactContrast("strong");
      return;
    }

    if (key === "performance") {
      const optimized = heroImageAssets.find((item) => item.variantKey === "optimized");
      if (optimized) {
        setSelectedHeroAssetId(optimized._id);
      }
      setSignatureAnimation("none");
      setSourceMode("hero-safe-media");
      return;
    }

    if (key === "branding") {
      setPieceVisibility((previous) => ({ ...previous, logo: true }));
      setMobileLogoScale("balanced");
      setLogoOpacity(94);
    }
  }

  const qualityTone =
    qualityScore.score >= 78
      ? "success"
      : qualityScore.score >= 60
        ? "warning"
        : "danger";

  return (
    <main
      className="h-[100dvh] w-full overflow-hidden [background:var(--panel-background,var(--background))] text-foreground"
      style={labVisualCssVars}
    >
      {disableInternalBrandHydrator ? null : <BrandHydrator scope={brandScope} />}

      <div className="mx-auto h-full min-h-0 w-full max-w-[1680px] px-2 sm:px-3">
        <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-border/85 [background:var(--panel-surface-1,var(--background))] [box-shadow:var(--elevation-task,var(--panel-shadow-2))]">
          <header className="sticky top-0 z-30 border-b border-border/85 [background:color-mix(in_oklab,var(--panel-topbar,var(--panel-surface-1,var(--background)))_96%,transparent)] px-2 py-1.5 backdrop-blur-sm sm:px-3">
            <div className="grid items-center gap-1.5 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
              <div className="flex min-w-0 items-center gap-1 overflow-x-auto rounded-lg border border-border/75 [background:var(--surface-2,var(--card))] p-0.5 bcc-scrollbar">
                {PIECE_FAMILY_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setPieceFamily(tab.id)}
                    className={[
                      "inline-flex h-7 shrink-0 items-center justify-center rounded-md px-2 text-[10px] font-semibold uppercase tracking-wide transition",
                      pieceFamily === tab.id
                        ? "border border-border [background:var(--surface-1,var(--background))] text-foreground ring-1 ring-border/90 shadow-[0_2px_8px_color-mix(in_oklab,var(--foreground)_12%,transparent)]"
                        : "text-muted-foreground hover:[background:var(--surface-2,var(--muted))]",
                    ].join(" ")}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="mx-auto inline-flex items-center gap-1 rounded-lg border border-border/75 [background:var(--surface-2,var(--card))] p-0.5">
                {(["mobile", "tablet", "desktop", "wide"] as const).map((id) => {
                  const Icon = VIEWPORT_ICON[id];
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => handleViewportChange(id)}
                      aria-label={VIEWPORTS[id].label}
                      className={[
                        "inline-flex h-7 w-7 items-center justify-center rounded-md transition",
                        viewport === id
                          ? "border border-border [background:var(--surface-1,var(--background))] text-foreground ring-1 ring-border/90 shadow-[0_2px_8px_color-mix(in_oklab,var(--foreground)_12%,transparent)]"
                          : "text-muted-foreground hover:[background:var(--surface-2,var(--muted))]",
                      ].join(" ")}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </button>
                  );
                })}
              </div>

              <div className="flex min-w-0 flex-wrap items-center justify-start gap-1 lg:justify-end">
                <div className="inline-flex rounded-lg border border-border/75 [background:var(--surface-2,var(--card))] p-0.5">
                  {(["preview", "layout"] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setCanvasMode(mode)}
                      className={[
                        "inline-flex h-7 items-center rounded-md px-2.5 text-[10px] font-semibold uppercase tracking-wide transition",
                        canvasMode === mode
                          ? "border border-border [background:var(--surface-1,var(--background))] text-foreground ring-1 ring-border/90 shadow-[0_2px_8px_color-mix(in_oklab,var(--foreground)_12%,transparent)]"
                          : "text-muted-foreground hover:[background:var(--surface-2,var(--muted))]",
                      ].join(" ")}
                    >
                      {mode === "preview" ? "Vista" : "Layout"}
                    </button>
                  ))}
                </div>

                <PanelButton
                  type="button"
                  variant="secondary"
                  className="h-7 px-2.5 text-[10px] uppercase"
                  onClick={copyCurrentSnapshotToOtherDevices}
                  disabled={pieceFamily !== "hero"}
                >
                  Copiar
                </PanelButton>
                <PanelButton
                  type="button"
                  variant="secondary"
                  className="h-7 px-2.5 text-[10px] uppercase"
                  onClick={handleDuplicateVariant}
                  disabled={pieceFamily !== "hero"}
                >
                  Duplicar
                </PanelButton>
                <PanelButton
                  type="button"
                  variant="primary"
                  className="h-7 px-3 text-[10px] uppercase"
                  onClick={handleSaveDraft}
                  disabled={pieceFamily !== "hero"}
                >
                  Guardar borrador de sesión
                </PanelButton>
                <div
                  className="hidden min-w-0 items-center rounded-md border border-border/70 [background:var(--surface-2,var(--card))] px-2 py-1 text-[10px] text-muted-foreground xl:flex"
                  title={actionNotice || deviceEditingNotice}
                >
                  <span className="truncate">
                    {VIEWPORTS[viewport].label} · {variantName}
                  </span>
                </div>
                <span className="hidden max-w-[18rem] truncate text-[10px] text-muted-foreground 2xl:inline">
                  {actionNotice || deviceEditingNotice}
                </span>
              </div>
            </div>
          </header>

          <div className="grid min-h-0 flex-1 gap-2 p-2 xl:grid-cols-[17.25rem_minmax(0,1fr)_19rem] xl:p-2.5">
            <aside className="min-h-0 space-y-3 overflow-y-auto rounded-xl border border-border/70 [background:var(--surface-2,var(--card))] p-1.5 bcc-scrollbar">
              {canvasMode === "preview" ? (
                <>
                  <PanelCard variant="task" className="p-3">
                    <div className="flex items-center justify-between gap-2">
                      <h2 className="text-[11px] font-semibold uppercase tracking-wide text-foreground/80">
                        Libreria Media
                      </h2>
                      <PanelBadge tone={visualSourceKind === "video" ? "warning" : "processing"}>
                        {assetKindLabel}
                      </PanelBadge>
                    </div>

                    <div className="mt-2 grid gap-2">
                      <div className="inline-flex rounded-lg border border-border/75 [background:var(--surface-2,var(--card))] p-1">
                        {([
                          { id: "hero-image", label: "Imagen" },
                          { id: "logo", label: "Logo" },
                          { id: "video", label: "Video" },
                        ] as const).map((option) => (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => handleVisualSourceKindChange(option.id)}
                            className={[
                              "flex-1 rounded-md px-2 py-1.5 text-[10px] font-semibold uppercase transition",
                              visualSourceKind === option.id
                                ? "border border-border [background:var(--surface-3,var(--card))]"
                                : "text-muted-foreground hover:[background:var(--surface-2,var(--muted))]",
                            ].join(" ")}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => setShowAssetFilters((previous) => !previous)}
                          className="rounded-md border border-border/75 [background:var(--surface-2,var(--card))] px-2 py-1 text-[10px] font-semibold uppercase text-foreground transition hover:[background:var(--surface-3,var(--card))]"
                        >
                          Filtros
                        </button>
                        <p className="text-[10px] text-muted-foreground">
                          {mediaLibraryCount} resultados - variante {variantName}
                        </p>
                      </div>

                      {showAssetFilters ? (
                        <div className="grid gap-1.5 rounded-lg border border-border/75 [background:var(--surface-2,var(--card))] p-2">
                          <label className="grid gap-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                            Variante
                            <select
                              value={variantFilter}
                              onChange={(event) =>
                                setVariantFilter(event.target.value as AssetVariantKey | "all")
                              }
                              className="h-8 rounded-md border border-border/70 [background:var(--surface-1,var(--background))] px-2 text-[11px] text-foreground outline-none focus:ring-2 focus:ring-ring"
                            >
                              {VARIANT_FILTERS.map((filter) => (
                                <option key={filter} value={filter}>
                                  {filter}
                                </option>
                              ))}
                            </select>
                          </label>
                          <label className="grid gap-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                            Orientacion
                            <select
                              value={orientationFilter}
                              onChange={(event) =>
                                setOrientationFilter(event.target.value as MediaOrientation | "all")
                              }
                              className="h-8 rounded-md border border-border/70 [background:var(--surface-1,var(--background))] px-2 text-[11px] text-foreground outline-none focus:ring-2 focus:ring-ring"
                            >
                              {ORIENTATION_FILTERS.map((filter) => (
                                <option key={filter} value={filter}>
                                  {filter}
                                </option>
                              ))}
                            </select>
                          </label>
                          <label className="grid gap-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                            Estado
                            <select
                              value={reviewFilter}
                              onChange={(event) =>
                                setReviewFilter(event.target.value as MediaReviewStatus | "all")
                              }
                              className="h-8 rounded-md border border-border/70 [background:var(--surface-1,var(--background))] px-2 text-[11px] text-foreground outline-none focus:ring-2 focus:ring-ring"
                            >
                              {REVIEW_FILTERS.map((filter) => (
                                <option key={filter} value={filter}>
                                  {filter}
                                </option>
                              ))}
                            </select>
                          </label>
                          <label className="grid gap-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                            Componente
                            <select
                              value={assetComponentFilter}
                              onChange={(event) =>
                                setAssetComponentFilter(event.target.value as AssetComponentFilter)
                              }
                              className="h-8 rounded-md border border-border/70 [background:var(--surface-1,var(--background))] px-2 text-[11px] text-foreground outline-none focus:ring-2 focus:ring-ring"
                            >
                              <option value="all">all</option>
                              <option value="hero">hero</option>
                              <option value="logo">logo</option>
                              <option value="icon">icon</option>
                            </select>
                          </label>
                          <label className="grid gap-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                            Sector / contexto
                            <select
                              value={assetContextFilter}
                              onChange={(event) =>
                                setAssetContextFilter(event.target.value as AssetContextFilter)
                              }
                              className="h-8 rounded-md border border-border/70 [background:var(--surface-1,var(--background))] px-2 text-[11px] text-foreground outline-none focus:ring-2 focus:ring-ring"
                            >
                              <option value="all">all</option>
                              <option value="hero">hero</option>
                              <option value="navbar">navbar</option>
                              <option value="footer">footer</option>
                            </select>
                          </label>
                        </div>
                      ) : null}

                      <div className="rounded-lg border border-border/75 [background:var(--surface-2,var(--card))] p-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          setAssetPickerView((previous) => (previous === "open" ? "closed" : "open"))
                        }
                        disabled={visualSourceKind === "video"}
                        className={[
                          "grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 rounded-md border border-border/75 [background:var(--surface-1,var(--background))] p-1.5 text-left transition",
                          visualSourceKind === "video"
                            ? "cursor-not-allowed opacity-60"
                            : "hover:[background:var(--surface-3,var(--card))]",
                        ].join(" ")}
                      >
                        <span className="h-9 w-12 overflow-hidden rounded border border-border/70 [background:var(--surface-1,var(--background))]">
                          {selectedContextAsset ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={selectedContextAsset.url}
                              alt={selectedContextAsset.label}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="grid h-full place-items-center text-[10px] text-muted-foreground">
                              --
                            </span>
                          )}
                        </span>
                        <span className="min-w-0">
                          <p className="truncate text-xs font-semibold text-foreground">
                            {selectedContextAsset?.label ?? "Sin asset"}
                          </p>
                          <p className="truncate text-[10px] text-muted-foreground">
                            {selectedAssetSummary}
                          </p>
                        </span>
                        <span className="text-sm text-muted-foreground">
                          <svg
                            viewBox="0 0 20 20"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.6"
                            className={`h-4 w-4 transition-transform ${isAssetPickerOpen ? "rotate-180" : ""}`}
                            aria-hidden="true"
                          >
                            <path d="M5 7.5L10 12.5L15 7.5" />
                          </svg>
                        </span>
                      </button>

                      {isAssetPickerOpen ? (
                        <div className="mt-1.5 max-h-56 overflow-y-auto rounded-md border border-border/75 [background:var(--surface-1,var(--background))] p-1.5 bcc-scrollbar">
                          {visualSourceKind === "video" ? (
                            <p className="px-2 py-3 text-center text-xs text-muted-foreground">
                              Video sin soporte en esta fase.
                            </p>
                          ) : assetState === "loading" ? (
                            <p className="px-2 py-3 text-center text-xs text-muted-foreground">
                              Cargando assets...
                            </p>
                          ) : assetState === "error" ? (
                            <p className="px-2 py-3 text-center text-xs text-foreground">{assetError}</p>
                          ) : contextualAssets.length === 0 ? (
                            <p className="px-2 py-3 text-center text-xs text-muted-foreground">
                              Sin resultados con filtros actuales.
                            </p>
                          ) : (
                            <div className="space-y-1">
                              {contextualAssets.map((item) => {
                                const isSelected = selectedContextAsset?._id === item._id;
                                return (
                                  <button
                                    key={item._id}
                                    type="button"
                                    onClick={() => handleAssetPick(item)}
                                    className={[
                                      "grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 rounded-md border p-1.5 text-left transition",
                                      isSelected
                                        ? "border-border [background:var(--surface-3,var(--card))] ring-1 ring-border/60"
                                        : "border-border/70 [background:var(--surface-2,var(--card))] hover:[background:var(--surface-3,var(--card))]",
                                    ].join(" ")}
                                  >
                                    <span className="h-7 w-10 overflow-hidden rounded border border-border/70 [background:var(--surface-1,var(--background))]">
                                      {/* eslint-disable-next-line @next/next/no-img-element */}
                                      <img
                                        src={item.url}
                                        alt={item.label}
                                        className="h-full w-full object-cover"
                                      />
                                    </span>
                                    <span className="min-w-0">
                                      <p className="truncate text-[11px] font-semibold text-foreground">
                                        {item.label}
                                      </p>
                                      <p className="truncate text-[10px] text-muted-foreground">
                                        {item.variantKey} - {item.orientation}
                                      </p>
                                    </span>
                                    <PanelBadge tone={getAssetPreviewTone(item)}>{item.reviewStatus}</PanelBadge>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      ) : null}
                      </div>

                      <div className="rounded-lg border border-border/75 [background:var(--surface-2,var(--card))] p-2">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                          Origen actual
                        </p>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                          Activo ({assetKindLabel}):{" "}
                          <span className="font-semibold text-foreground">{selectedAssetSummary}</span>
                        </p>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                          Snapshot: <span className="font-semibold text-foreground">{sourceSnapshotId}</span>
                        </p>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                          Preset: <span className="font-semibold text-foreground">{sourcePresetId}</span>
                        </p>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                          Hero-safe disponibles: {heroSafeMediaSources.length}
                        </p>
                      </div>
                    </div>
                  </PanelCard>

                  <PanelCard variant="task" className="p-3">
                    <h2 className="text-[11px] font-semibold uppercase tracking-wide text-foreground/80">
                      Biblioteca de piezas
                    </h2>

                    <div className="mt-2 space-y-1.5">
                      {PIECE_LIBRARY.map((piece) => {
                        const active = pieceVisibility[piece.id];
                        return (
                          <div
                            key={piece.id}
                            className={[
                              "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-lg border px-2 py-1.5",
                              selectedPiece === piece.id
                                ? "border-border [background:var(--surface-3,var(--card))] ring-1 ring-border/60"
                                : "border-border/70 [background:var(--surface-2,var(--card))]",
                            ].join(" ")}
                          >
                            <button
                              type="button"
                              onClick={() => handlePieceSelect(piece.id)}
                              className="truncate text-xs font-semibold text-foreground"
                            >
                              {piece.label}
                            </button>
                            <button
                              type="button"
                              onClick={() => togglePieceVisibility(piece.id)}
                              className={[
                                "rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase",
                                active
                                  ? "border-success [background:var(--success-soft)] [color:var(--success-foreground)]"
                                  : "border-border text-muted-foreground",
                              ].join(" ")}
                            >
                              {active ? "ON" : "OFF"}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </PanelCard>

                  <PanelCard variant="task" className="p-3">
                    <h2 className="text-[11px] font-semibold uppercase tracking-wide text-foreground/80">
                      Emphasis / Atmosphere
                    </h2>

                    <div className="mt-2 space-y-2 text-xs">
                      <label className="block">
                        <span className="mb-1 block text-muted-foreground">overlay density</span>
                        <select
                          value={overlayDensity}
                          onChange={(event) => setOverlayDensity(event.target.value as HeroAppearanceVariant)}
                          className="w-full rounded-md border border-border/75 [background:var(--surface-1,var(--background))] px-2 py-1.5 text-xs outline-none focus:ring-2 focus:ring-ring"
                        >
                          <option value="transparent">transparent</option>
                          <option value="soft">soft</option>
                          <option value="solid">solid</option>
                        </select>
                      </label>

                      <label className="block">
                        <span className="mb-1 block text-muted-foreground">overlay style</span>
                        <select
                          value={overlayStyleMode}
                          onChange={(event) => setOverlayStyleMode(event.target.value as OverlayStyleMode)}
                          className="w-full rounded-md border border-border/75 [background:var(--surface-1,var(--background))] px-2 py-1.5 text-xs outline-none focus:ring-2 focus:ring-ring"
                        >
                          <option value="gradient">gradient</option>
                          <option value="solid">solid</option>
                          <option value="none">none</option>
                        </select>
                      </label>

                      <div className="rounded-md border border-border/75 [background:var(--surface-2,var(--card))] p-2">
                        <span className="mb-1 block text-muted-foreground">overlay tint</span>
                        <div className="grid grid-cols-2 gap-1.5">
                          {(["blue", "green", "amber", "purple", "smoke"] as const).map((tone) => (
                            <button
                              key={tone}
                              type="button"
                              disabled={effectiveOverlayStyleMode === "none"}
                              onClick={() => setOverlayTint(tone)}
                              className={[
                                "flex items-center justify-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-semibold capitalize transition",
                                overlayTint === tone
                                  ? "border-border [background:var(--card)] [box-shadow:var(--elevation-interactive)] text-foreground font-semibold"
                                  : "border-border/50 text-muted-foreground hover:[background:var(--surface-2)] hover:border-border/80",
                                effectiveOverlayStyleMode === "none" ? "cursor-not-allowed opacity-45" : "",
                              ].join(" ")}
                            >
                              <span
                                className={`h-2.5 w-4 rounded-full ${OVERLAY_TINT_PREVIEW_CLASS[tone]}`}
                                aria-hidden="true"
                              />
                              {tone}
                            </button>
                          ))}
                        </div>
                      </div>

                      <label className="block">
                        <span className="mb-1 block text-muted-foreground">headline tone (modo auto)</span>
                        <select
                          value={labHeadlineTone}
                          onChange={(event) => setLabHeadlineTone(event.target.value as LabHeadlineTone)}
                          className="w-full rounded-md border border-border/75 [background:var(--surface-1,var(--background))] px-2 py-1.5 text-xs outline-none focus:ring-2 focus:ring-ring"
                        >
                          <option value="white">white</option>
                          <option value="black">black</option>
                          <option value="inverse">inverse</option>
                          <option value="muted-light">muted-light</option>
                          <option value="warm-light">warm-light</option>
                          <option value="cool-light">cool-light</option>
                        </select>
                      </label>

                      <div>
                        <span className="mb-1 block text-muted-foreground">background emphasis</span>
                        <div className="grid grid-cols-3 gap-1.5">
                          {(["low", "medium", "high"] as const).map((emphasis) => (
                            <button
                              key={emphasis}
                              type="button"
                              onClick={() => setBackgroundEmphasis(emphasis)}
                              className={[
                                "flex items-center justify-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-semibold capitalize transition",
                                backgroundEmphasis === emphasis
                                  ? "border-border [background:var(--card)] [box-shadow:var(--elevation-interactive)] text-foreground font-semibold"
                                  : "border-border/50 text-muted-foreground hover:[background:var(--surface-2)] hover:border-border/80",
                              ].join(" ")}
                            >
                              {emphasis}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="mb-1 block text-muted-foreground">background fit</span>
                        <div className="grid grid-cols-3 gap-1.5">
                          {(["cover", "contain", "fill"] as const).map((fit) => (
                            <button
                              key={fit}
                              type="button"
                              onClick={() => setBackgroundFit(fit)}
                              className={[
                                "flex items-center justify-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-semibold capitalize transition",
                                backgroundFit === fit
                                  ? "border-border [background:var(--card)] [box-shadow:var(--elevation-interactive)] text-foreground font-semibold"
                                  : "border-border/50 text-muted-foreground hover:[background:var(--surface-2)] hover:border-border/80",
                              ].join(" ")}
                            >
                              {fit}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="mb-1 block text-muted-foreground">background focus</span>
                        <div className="grid grid-cols-5 gap-1.5">
                          {(["center", "top", "bottom", "left", "right"] as const).map((focus) => (
                            <button
                              key={focus}
                              type="button"
                              onClick={() => setBackgroundFocus(focus)}
                              className={[
                                "flex items-center justify-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-semibold capitalize transition",
                                backgroundFocus === focus
                                  ? "border-border [background:var(--card)] [box-shadow:var(--elevation-interactive)] text-foreground font-semibold"
                                  : "border-border/50 text-muted-foreground hover:[background:var(--surface-2)] hover:border-border/80",
                              ].join(" ")}
                            >
                              {focus}
                            </button>
                          ))}
                        </div>
                      </div>

                      <label className="block">
                        <span className="mb-1 block text-muted-foreground">cta regulation</span>
                        <select
                          value={ctaRegulation}
                          onChange={(event) => setCtaRegulation(event.target.value as CtaRegulation)}
                          className="w-full rounded-md border border-border/75 [background:var(--surface-1,var(--background))] px-2 py-1.5 text-xs outline-none focus:ring-2 focus:ring-ring"
                        >
                          <option value="balanced">balanced</option>
                          <option value="primary-focus">primary-focus</option>
                        </select>
                      </label>
                    </div>
                  </PanelCard>

                  <PanelCard variant="task" className="p-3">
                    <div className="flex items-center justify-between gap-2 border-b border-border/70 pb-2">
                      <h2 className="text-[11px] font-semibold uppercase tracking-wide text-foreground/80">
                        Asistente de contenido
                      </h2>
                      <PanelBadge tone="processing">{assistantContext.negocio}</PanelBadge>
                    </div>

                    <div className="mt-2 space-y-2">
                      <div className="rounded-lg border border-border/75 [background:var(--surface-2,var(--card))] p-2">
                        <p className="text-[10px] text-muted-foreground">
                          Contexto activo: {assistantContext.blueprint} - {assistantContext.dispositivo} - pieza{" "}
                          <span className="font-semibold text-foreground">{assistantContext.pieza}</span>
                        </p>
                        <p className="mt-1 text-[10px] text-muted-foreground">
                          Enfoque CTA: <span className="font-semibold text-foreground">{assistantContext.ctaIntent}</span>
                        </p>
                      </div>

                      <div className="rounded-lg border border-border/75 [background:var(--surface-2,var(--card))] p-2">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                          Generar titular (transformar H1 actual)
                        </p>
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          <button
                            type="button"
                            onClick={() => proposeHeadlineTransformation("shorten")}
                            className="rounded-md border border-border/70 [background:var(--surface-1,var(--background))] px-2 py-1 text-[10px] font-semibold uppercase transition hover:[background:var(--surface-3,var(--card))]"
                          >
                            Acortar
                          </button>
                          <button
                            type="button"
                            onClick={() => proposeHeadlineTransformation("commercial")}
                            className="rounded-md border border-border/70 [background:var(--surface-1,var(--background))] px-2 py-1 text-[10px] font-semibold uppercase transition hover:[background:var(--surface-3,var(--card))]"
                          >
                            Mas comercial
                          </button>
                          <button
                            type="button"
                            onClick={() => proposeHeadlineTransformation("seo-local")}
                            className="rounded-md border border-border/70 [background:var(--surface-1,var(--background))] px-2 py-1 text-[10px] font-semibold uppercase transition hover:[background:var(--surface-3,var(--card))]"
                          >
                            SEO local
                          </button>
                        </div>
                        <div className="mt-2 grid gap-1.5">
                          <div className="rounded-md border border-border/75 [background:var(--surface-1,var(--background))] p-2">
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Actual</p>
                            <p className="mt-1 text-[11px] text-foreground">{currentHeadline}</p>
                          </div>
                          <div className="rounded-md border border-border/75 [background:var(--surface-1,var(--background))] p-2">
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                              Propuesta {headlineProposalMode ? `(${headlineProposalMode})` : ""}
                            </p>
                            <p className="mt-1 text-[11px] text-foreground">
                              {headlineProposal || "Selecciona una transformacion para ver propuesta."}
                            </p>
                          </div>
                        </div>

                        <div className="mt-2 flex items-center gap-1.5">
                          <PanelButton
                            type="button"
                            variant="primary"
                            className="h-7 px-2.5 text-[10px] uppercase"
                            onClick={applyHeadlineProposal}
                            disabled={!headlineProposal?.trim()}
                          >
                            Aplicar
                          </PanelButton>
                          <PanelButton
                            type="button"
                            variant="secondary"
                            className="h-7 px-2.5 text-[10px] uppercase"
                            onClick={discardHeadlineProposal}
                            disabled={!headlineProposal?.trim() && previousHeadlineDraft === null}
                          >
                            Descartar
                          </PanelButton>
                        </div>
                        {previousHeadlineDraft !== null ? (
                          <p className="mt-1 text-[10px] text-muted-foreground">
                            Anterior: {previousHeadlineDraft || "(vacio)"}.
                          </p>
                        ) : null}
                      </div>

                      <div
                        ref={designSuggestionActionsRef}
                        className="rounded-lg border border-border/75 [background:var(--surface-2,var(--card))] p-2"
                      >
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                          Sugerencias de diseno
                        </p>
                        <div className="mt-1.5 grid gap-1">
                          {designSuggestions.map((suggestion) => (
                            <button
                              key={suggestion.label}
                              type="button"
                              onClick={() =>
                                applyDesignAdjustmentWithBackup(
                                  `design-suggestion-${suggestion.label}`,
                                  suggestion.label,
                                  "design",
                                  suggestion.action
                                )
                              }
                              className="w-full rounded-md border border-border/70 [background:var(--surface-1,var(--background))] px-2 py-1.5 text-left text-[11px] font-semibold text-foreground transition hover:[background:var(--surface-3,var(--card))]"
                            >
                              {suggestion.label}
                            </button>
                          ))}
                        </div>
                        {appliedSuggestionBackup && appliedSuggestionReturnTarget === "design" ? (
                          <div ref={designAdjustmentDecisionRef} className="mt-2 flex items-center gap-1.5">
                            <PanelButton
                              type="button"
                              variant="primary"
                              className="h-7 px-2.5 text-[10px] uppercase"
                              onClick={confirmAppliedSuggestion}
                            >
                              Confirmar ajuste
                            </PanelButton>
                            <PanelButton
                              type="button"
                              variant="secondary"
                              className="h-7 px-2.5 text-[10px] uppercase"
                              onClick={discardAppliedSuggestion}
                            >
                              Descartar ajuste
                            </PanelButton>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </PanelCard>
                </>
              ) : (
                <>
                  <PanelCard variant="task" className="p-3">
                    <h2 className="text-[11px] font-semibold uppercase tracking-wide text-foreground/80">
                      Selector de blueprint
                    </h2>

                    <div className="mt-2 grid grid-cols-2 gap-1 rounded-lg border border-border/75 [background:var(--surface-2,var(--card))] p-1">
                      {([
                        { id: "centered", label: "Centrado" },
                        { id: "split", label: "Split" },
                        { id: "poster", label: "Poster" },
                        { id: "logo-first", label: "Logo first" },
                      ] as const).map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleBlueprintChange(item.id)}
                          className={[
                            "rounded-md px-2 py-1.5 text-[11px] font-semibold uppercase transition",
                            blueprint === item.id
                              ? "border border-border [background:var(--surface-3,var(--card))]"
                              : "text-muted-foreground hover:[background:var(--surface-2,var(--muted))]",
                          ].join(" ")}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </PanelCard>

                  <PanelCard variant="task" className="p-3">
                    <h2 className="text-[11px] font-semibold uppercase tracking-wide text-foreground/80">
                      Biblioteca de piezas
                    </h2>

                    <div className="mt-2 space-y-1.5">
                      {PIECE_LIBRARY.map((piece) => {
                        const placed = LAYOUT_PIECES.includes(piece.id as LayoutPiece)
                          ? pieceZones[piece.id as LayoutPiece]
                          : OPERATIONAL_PLACEMENT_PIECE_SET.has(piece.id)
                            ? operationalPieceZones[piece.id as OperationalPlacementPiece]
                            : null;
                        const isActiveLayoutPiece = selectedLayoutPiece === piece.id;
                        const hasOperationalInspectorControl = OPERATIONAL_INSPECTOR_PIECES.has(piece.id);
                        return (
                          <div
                            key={piece.id}
                            className={[
                              "rounded-md border p-1.5 transition",
                              selectedPiece === piece.id
                                ? "border-border [background:var(--surface-3,var(--card))] shadow-[0_2px_10px_color-mix(in_oklab,var(--foreground)_10%,transparent)] ring-1 ring-border/80"
                                : "border-border/70 [background:var(--surface-2,var(--card))] hover:border-border/90 hover:[background:var(--surface-3,var(--card))]",
                            ].join(" ")}
                          >
                            <div className="flex items-center justify-between gap-2">
                              {piece.layoutEnabled ? (
                                <button
                                  type="button"
                                  onClick={() => selectLayoutPiece(piece.id as LayoutPiece)}
                                  className={[
                                    "rounded-md px-2 py-1 text-xs font-semibold uppercase",
                                    isActiveLayoutPiece
                                      ? "border border-border [background:var(--surface-1,var(--background))] text-foreground shadow-[0_1px_6px_color-mix(in_oklab,var(--foreground)_12%,transparent)]"
                                      : "text-muted-foreground hover:text-foreground",
                                  ].join(" ")}
                                >
                                  {piece.label}
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handlePieceSelect(piece.id)}
                                  className={[
                                    "rounded-md border px-2 py-1 text-xs font-semibold uppercase transition",
                                    selectedPiece === piece.id
                                      ? "border-border [background:var(--surface-1,var(--background))] text-foreground shadow-[0_1px_6px_color-mix(in_oklab,var(--foreground)_12%,transparent)]"
                                      : "border-transparent text-muted-foreground hover:border-border/70 hover:text-foreground",
                                  ].join(" ")}
                                >
                                  {piece.label}
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => togglePieceVisibility(piece.id)}
                                className={[
                                  "rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase",
                                  pieceVisibility[piece.id]
                                    ? "border-success [background:var(--success-soft)] [color:var(--success-foreground)]"
                                    : "border-border text-muted-foreground",
                                ].join(" ")}
                              >
                                {pieceVisibility[piece.id] ? "visible" : "hidden"}
                              </button>
                            </div>

                            <p className="mt-1 text-[10px] text-muted-foreground">
                              {piece.layoutEnabled
                                ? placed
                                  ? `colocada en ${zoneLabel(placed)}`
                                  : "no colocada en grid 3x3"
                                : hasOperationalInspectorControl
                                  ? placed
                                    ? `colocacion operativa en ${zoneLabel(placed)}`
                                    : "Control de posicion operativo en inspector"
                                  : "Control de visibilidad en inspector"}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </PanelCard>

                  <PanelCard variant="task" className="p-3">
                    <h2 className="text-[11px] font-semibold uppercase tracking-wide text-foreground/80">
                      Atajos de colocacion
                    </h2>

                    <p className="mt-1 text-[11px] text-muted-foreground">
                      Pieza activa:{" "}
                      <span className="font-semibold text-foreground">
                        {activePlacementPiece ? pieceLabel(activePlacementPiece) : "Ninguna"}
                      </span>
                    </p>

                    {!canUsePlacementShortcuts ? (
                      <p className="mt-1 text-[11px] text-warning">
                        Selecciona una pieza con colocacion operativa.
                      </p>
                    ) : null}

                    <div className="mt-2 grid grid-cols-3 gap-1">
                      {([
                        { id: "top", label: "Arriba" },
                        { id: "center", label: "Centro" },
                        { id: "bottom", label: "Abajo" },
                      ] as const).map((shortcut) => (
                        <button
                          key={shortcut.id}
                          type="button"
                          onClick={() => applyPlacementShortcut(shortcut.id)}
                          disabled={!canUsePlacementShortcuts}
                          className="rounded-md border border-border/75 [background:var(--surface-2,var(--card))] px-2 py-1.5 text-[11px] font-semibold uppercase disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {shortcut.label}
                        </button>
                      ))}
                    </div>

                    <div className="mt-1 grid grid-cols-3 gap-1">
                      {([
                        { id: "left", label: "Izq." },
                        { id: "center", label: "Centro H" },
                        { id: "right", label: "Der." },
                      ] as const).map((shortcut) => (
                        <button
                          key={shortcut.id}
                          type="button"
                          onClick={() => applyColumnShortcut(shortcut.id)}
                          disabled={!canUsePlacementShortcuts}
                          className="rounded-md border border-border/75 [background:var(--surface-2,var(--card))] px-2 py-1.5 text-[11px] font-semibold uppercase disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {shortcut.label}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => applyPlacementShortcut("reset")}
                      disabled={!canUsePlacementShortcuts}
                      className="mt-2 w-full rounded-md border border-border/75 [background:var(--surface-2,var(--card))] px-2 py-1.5 text-[11px] font-semibold uppercase text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Reset pieza
                    </button>
                    <button
                      type="button"
                      onClick={handleResetLayoutGlobal}
                      className="mt-1 w-full rounded-md border border-border/75 [background:var(--surface-2,var(--card))] px-2 py-1.5 text-[11px] font-semibold uppercase text-muted-foreground transition hover:[background:var(--surface-3,var(--card))]"
                    >
                      Reset layout
                    </button>
                  </PanelCard>
                </>
              )}
            </aside>

            <section
              ref={workspaceViewportRef}
              className="min-h-0 h-full min-w-0 xl:h-[var(--lab-workspace-viewport-height)]"
              style={
                workspaceViewportHeight
                  ? ({ "--lab-workspace-viewport-height": `${workspaceViewportHeight}px` } as CSSProperties)
                  : undefined
              }
            >
              <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-border/85 [background:var(--panel-surface-1,var(--background))] [box-shadow:var(--elevation-task,var(--panel-shadow-2))]">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/85 px-2.5 py-1.5 [background:var(--surface-2,var(--card))]">
                  <div className="flex min-w-0 flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                    <span>Modo: <strong className="text-foreground uppercase">{canvasMode}</strong></span>
                    <span>Blueprint: <strong className="text-foreground">{blueprint}</strong></span>
                    <span>Rol: <strong className="text-foreground">{sessionRole ?? "anon"}</strong></span>
                  </div>
                  <div className="flex min-w-0 flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                    <span>Tablero {canvasWidth}x{canvasHeight}</span>
                    <PanelBadge tone={qualityTone}>score {qualityScore.score}</PanelBadge>
                  </div>
                </div>

                <div
                  ref={previewStageRef}
                  className="relative min-h-0 flex-1 overflow-hidden [background:color-mix(in_oklab,var(--surface-2,var(--card))_88%,var(--panel-background,var(--background))_12%)] [background-image:linear-gradient(to_bottom,color-mix(in_oklab,var(--surface-1,var(--background))_48%,transparent),transparent),radial-gradient(circle_at_1px_1px,color-mix(in_oklab,var(--border)_28%,transparent)_1px,transparent_0),radial-gradient(circle_at_23%_27%,color-mix(in_oklab,var(--foreground)_5%,transparent)_0.7px,transparent_1.2px),radial-gradient(circle_at_77%_61%,color-mix(in_oklab,var(--foreground)_4%,transparent)_0.75px,transparent_1.3px)] [background-size:100%_100%,18px_18px,24px_24px,28px_28px]"
                >
                  <div className="absolute inset-0 flex items-center justify-center px-3 py-4 sm:px-4 sm:py-5 lg:px-5 lg:py-6">
                    <div
                      className={`relative overflow-hidden rounded-xl border border-border/80 [background:var(--panel-surface-1,var(--background))] transition-[box-shadow,background] duration-300 [box-shadow:0_6px_18px_color-mix(in_oklab,var(--foreground)_12%,transparent)] ${themePreviewFrameClassName} ${themePreviewIntensityClassName}`}
                      style={{
                        width: `${scaledCanvasWidth}px`,
                        height: `${scaledCanvasHeight}px`,
                      }}
                    >
                      <div
                        className={`relative origin-top-left ${previewHeroFrameClassName}`}
                        style={{
                          width: `${canvasWidth}px`,
                          height: `${canvasHeight}px`,
                          transform: `scale(${canvasScale})`,
                        }}
                      >
                        <PublicHero
                          key={`hero-preview-${signatureAnimation}-${signatureDrawRefreshKey}`}
                          data={mappedHero}
                          business={{
                            slug: "lab",
                            name: "BCC Lab",
                            activeHeroVariantKey: `validation-${variantName}`,
                            logoUrl: heroLogoUrl || "/brand/logo-mark.svg",
                          }}
                          copyWidth={
                            pieceStructure.headline.width === "narrow"
                              ? "narrow"
                              : pieceStructure.headline.width === "wide"
                                ? "wide"
                                : effectiveCopyWidth
                          }
                          mobileLogoScale={mobileLogoScale}
                          navigationMode={resolvedNavigationMode}
                          navPosition={resolvedNavPosition}
                          navPanelOrigin={navPanelOrigin || resolvedNavPanelOrigin}
                          navTriggerSize={navTriggerSize}
                          navTriggerTone={navTriggerTone}
                          navTriggerSurface={navTriggerSurface}
                          navTriggerAura={navTriggerAura}
                          navTriggerHover={navTriggerHover}
                          desktopNavSize={desktopNavSize}
                          desktopNavTone={desktopNavTone}
                          desktopNavSurface={desktopNavSurface}
                          desktopNavHover={desktopNavHover}
                          desktopNavPresence={desktopNavPresence}
                          navOpenBehavior={navOpenBehavior}
                          navPanelWidth={navPanelWidth}
                          navPanelStyle={navPanelStyle}
                          navOverlayDensity={navOverlayDensity}
                          navOverlayStyle={navOverlayStyle}
                          navReadabilityBoost={navReadabilityBoost}
                          navMenuAlignment={navMenuAlignment}
                          navMenuItemSize={navMenuItemSize}
                          navMenuVerticalSpacing={navMenuVerticalSpacing}
                          showNavLinks={navLinksVisible}
                          forceMobileMenuOpen={navPreviewOpen}
                          onLabMenuOpenChange={setNavPreviewOpen}
                          headlinePosition={headlinePosition}
                          copyBlockPosition={copyBlockPosition}
                          ctaPosition={ctaPosition}
                          footerPosition={resolvedFooterPosition}
                          visualPosition={
                            layoutMediaDominance === "high"
                              ? "center"
                              : blueprintPreset.visualPosition
                          }
                          logoPosition={logoPosition}
                          overlayColor={overlayTint}
                          overlayStyleMode={effectiveOverlayStyleMode}
                          backgroundEmphasis={backgroundEmphasis}
                          backgroundFit={backgroundFit}
                          backgroundFocus={backgroundFocus}
                          labHeadlineTone={labHeadlineTone}
                          themeToggleDefault={themeToggleDefault}
                          onLabThemeToggleDefaultChange={(mode) => setThemeToggleDefault(mode)}
                          themeToggleStyle={themeToggleStyle}
                          themeTogglePosition={resolvedThemeTogglePosition}
                          headerIntegration={headerIntegration}
                          headerVisualStyle={headerVisualStyle}
                          headerTopSpacing={headerTopSpacing}
                          headerRelation={headerRelation}
                          headerBandHeight={headerBandHeight}
                          footerIntegration={footerIntegration}
                          footerVisualStyle={footerVisualStyle}
                          footerBandHeight={footerBandHeight}
                          ctaRegulation={ctaRegulation}
                          gapLogoHeadline={gapLogoHeadline}
                          gapHeadlineSubheadline={gapHeadlineSubheadline}
                          gapTextCta={gapTextCta}
                          gapCtaFooter={
                            layoutDensity === "compact"
                              ? "tight"
                              : layoutDensity === "airy"
                                ? "relaxed"
                                : "normal"
                          }
                          gapFooterDataSignature={
                            layoutSafeArea === "tight"
                              ? "tight"
                              : layoutSafeArea === "relaxed"
                                ? "relaxed"
                                : "normal"
                          }
                          footerDensity={
                            footerHeight === "compact"
                              ? "compact"
                              : footerHeight === "spacious"
                                ? "spacious"
                                : "balanced"
                          }
                          footerSignatureSeparation={footerSignatureSeparation}
                          isLabMode={true}
                          selectedLabPiece={selectedPiece}
                          onLabPieceSelect={handlePieceSelect}
                          showLabLogo={pieceVisibility.logo}
                          showLabHeadline={pieceVisibility.headline}
                          showLabSubheadline={pieceVisibility.subheadline}
                          showLabCtaGroup={pieceVisibility["cta-group"]}
                          showLabBadge={pieceVisibility.badge}
                          showLabHeaderHero={pieceVisibility["header-hero"]}
                          showLabNavBurger={pieceVisibility["nav-burger"]}
                          showLabThemeToggle={pieceVisibility["theme-toggle"]}
                          showLabFooterHero={pieceVisibility["footer-hero"]}
                          showLabContactStrip={pieceVisibility["contact-strip"]}
                          showLabAnimatedSignature={pieceVisibility["animated-signature"]}
                          showLabBackgroundMedia={pieceVisibility["background-media"]}
                          showLabOverlayAtmosphere={pieceVisibility["overlay-atmosphere"]}
                          showFooterIcons={footerIconsVisible}
                          labLogoClassName={logoPieceClassName}
                          labNavBurgerClassName={navBurgerClassName}
                          labThemeToggleClassName={themeToggleClassName}
                          labFooterHeroClassName={footerHeroClassName}
                          labContactStripClassName={contactStripClassName}
                          labAnimatedSignatureClassName={`${signatureClassName} ${signaturePlacementClassName}`}
                          labHeadlineClassName={headlineClassName}
                          labSubheadlineClassName={subheadlineClassName}
                          labCtaGroupClassName={ctaGroupClassName}
                          labPrimaryCtaClassName={`${ctaTextClassName} ${ctaButtonStructureClassName} ${ctaStyleClassName.primary} ${ctaRegulationClassName.primary}`}
                          labSecondaryCtaClassName={`${ctaTextClassName} ${ctaButtonStructureClassName} ${ctaStyleClassName.secondary} ${ctaRegulationClassName.secondary}`}
                        />

                        {canvasMode === "layout" ? (
                          <div className="absolute inset-0 z-40 grid grid-cols-3 grid-rows-3 gap-1 p-4">
                            {LAYOUT_ZONES.map((zone) => {
                              const assignedPieces = LAYOUT_PIECES.filter((piece) => pieceZones[piece] === zone);
                              const targetLayoutPiece = selectedLayoutPiece ?? activeLayoutPiece;
                              const isActiveZone = pieceZones[targetLayoutPiece] === zone;

                              return (
                                <button
                                  key={zone}
                                  type="button"
                                  onClick={() => assignActivePieceToZone(zone)}
                                  className={[
                                    "group rounded-md border border-sky-100/30 [background:color-mix(in_oklab,var(--foreground)_12%,transparent)] p-1 text-left transition",
                                    isActiveZone
                                      ? "ring-2 ring-sky-200/65"
                                      : "hover:[background:color-mix(in_oklab,var(--foreground)_18%,transparent)]",
                                  ].join(" ")}
                                >
                                  <p className="text-[10px] font-semibold uppercase tracking-wide text-sky-100/90">
                                    {zoneLabel(zone)}
                                  </p>
                                  <div className="mt-1 flex flex-wrap gap-1">
                                    {assignedPieces.length === 0 ? (
                                      <span className="rounded-full border border-sky-100/35 px-1.5 py-0.5 text-[9px] text-sky-100/80">
                                        vacia
                                      </span>
                                    ) : (
                                      assignedPieces.map((piece) => (
                                        <span
                                          key={`${zone}-${piece}`}
                                          className="rounded-full border border-sky-100/35 px-1.5 py-0.5 text-[9px] text-sky-100"
                                        >
                                          {pieceLabel(piece)}
                                        </span>
                                      ))
                                    )}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </section>

            <aside className="min-h-0 space-y-3 overflow-y-auto rounded-xl border border-border/70 [background:var(--surface-2,var(--card))] p-1.5 bcc-scrollbar">
              {canvasMode === "preview" ? (
                <>
                  <PanelCard variant="task" className="p-3">
                    <h2
                      ref={inspectorContextualRef}
                      className="text-[11px] font-semibold uppercase tracking-wide text-foreground/80"
                    >
                      Inspector contextual
                    </h2>

                    {selectedPiece ? (
                      <div className="mt-2 space-y-3">
                        <PanelBadge
                          tone="processing"
                          size="md"
                          className="px-3 py-1 font-semibold [border-color:color-mix(in_oklab,var(--processing,var(--accent,var(--primary)))_42%,var(--border))] [background:color-mix(in_oklab,var(--processing-soft,var(--surface-2,var(--muted)))_88%,var(--surface-3,var(--card))_12%)]"
                        >
                          {pieceLabel(selectedPiece)}
                        </PanelBadge>
                        <section className={inspectorSectionClassName}>
                          <p className={inspectorSectionTitleClassName}>CONTENIDO</p>
                          <div className="mt-3 space-y-3">

                        <section className={inspectorControlGroupClassName}>
                            <p className={inspectorControlGroupTitleClassName}>
                              {isHeadlinePiece || isSubheadlinePiece || isCtaGroupPiece
                                ? "A. Contenido"
                                : "A. Ajustes de pieza"}
                            </p>

                          {selectedPiece === "headline" ? (
                            <textarea
                              value={headlineDraft}
                              onChange={(event) => setContentProperty("headlineDraft", event.target.value)}
                              rows={3}
                              className="mt-2 w-full rounded-md border border-border/75 [background:var(--surface-1,var(--background))] px-2 py-1.5 text-xs outline-none focus:ring-2 focus:ring-ring"
                            />
                          ) : null}

                          {selectedPiece === "subheadline" ? (
                            <textarea
                              value={subheadlineDraft}
                              onChange={(event) =>
                                setContentProperty("subheadlineDraft", event.target.value)
                              }
                              rows={4}
                              className="mt-2 w-full rounded-md border border-border/75 [background:var(--surface-1,var(--background))] px-2 py-1.5 text-xs outline-none focus:ring-2 focus:ring-ring"
                            />
                          ) : null}

                          {selectedPiece === "cta-group" ? (
                            <div className="mt-2 grid gap-1.5">
                              <input
                                value={primaryCtaDraft}
                                onChange={(event) =>
                                  setContentProperty("primaryCtaDraft", event.target.value)
                                }
                                placeholder="CTA primaria"
                                className="h-8 rounded-md border border-border/75 [background:var(--surface-1,var(--background))] px-2 text-xs outline-none focus:ring-2 focus:ring-ring"
                              />
                              <input
                                value={secondaryCtaDraft}
                                onChange={(event) =>
                                  setContentProperty("secondaryCtaDraft", event.target.value)
                                }
                                placeholder="CTA secundaria"
                                className="h-8 rounded-md border border-border/75 [background:var(--surface-1,var(--background))] px-2 text-xs outline-none focus:ring-2 focus:ring-ring"
                              />
                              <input
                                value={primaryCtaHrefDraft}
                                onChange={(event) =>
                                  setContentProperty("primaryCtaHrefDraft", event.target.value)
                                }
                                placeholder="Destino CTA primaria (#reservar)"
                                className="h-8 rounded-md border border-border/75 [background:var(--surface-1,var(--background))] px-2 text-xs outline-none focus:ring-2 focus:ring-ring"
                              />
                              <input
                                value={secondaryCtaHrefDraft}
                                onChange={(event) =>
                                  setContentProperty("secondaryCtaHrefDraft", event.target.value)
                                }
                                placeholder="Destino CTA secundaria (#contacto)"
                                className="h-8 rounded-md border border-border/75 [background:var(--surface-1,var(--background))] px-2 text-xs outline-none focus:ring-2 focus:ring-ring"
                              />
                            </div>
                          ) : null}

                          {selectedPiece === "badge" ? (
                            <input
                              value={badgeDraft}
                              onChange={(event) => setBadgeDraft(event.target.value)}
                              placeholder="Texto badge"
                              className="mt-2 h-8 w-full rounded-md border border-border/75 [background:var(--surface-1,var(--background))] px-2 text-xs outline-none focus:ring-2 focus:ring-ring"
                            />
                          ) : null}

                          {selectedPiece === "logo" ? (
                            <div className="mt-2 space-y-2">
                              <div className={inspectorControlGroupClassName}>
                                <p className={inspectorControlGroupTitleClassName}>A. Logo header</p>
                                <p className="text-[11px] text-muted-foreground">
                                  Variante activa: logo principal.
                                </p>
                                <div className="mt-1.5 grid grid-cols-3 gap-1">
                                  {([
                                    { id: "sm", label: "SM", title: "Tamano pequeno" },
                                    { id: "md", label: "MD", title: "Tamano medio" },
                                    { id: "lg", label: "LG", title: "Tamano grande" },
                                  ] as const).map((size) => (
                                    <button
                                      key={size.id}
                                      type="button"
                                      onClick={() => setHeaderLogoSize(size.id)}
                                      title={size.title}
                                      className={[
                                        "rounded-full border px-2 py-1 text-[10px] font-semibold uppercase",
                                        headerLogoSize === size.id
                                          ? "border-border [background:var(--card)] [box-shadow:var(--elevation-interactive)] text-foreground font-semibold"
                                          : "border-border/50 text-muted-foreground hover:[background:var(--surface-2)] hover:border-border/80",
                                      ].join(" ")}
                                    >
                                      {size.label}
                                    </button>
                                  ))}
                                </div>
                                <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                                  Posicion
                                </p>
                                <div className="mt-1 grid grid-cols-3 gap-1">
                                  {([
                                    { value: "left", label: "Izq.", title: "Izquierda" },
                                    { value: "center", label: "Centro", title: "Centro" },
                                    { value: "right", label: "Der.", title: "Derecha" },
                                  ] as const).map((item) => (
                                    <button
                                      key={item.value}
                                      type="button"
                                      onClick={() => setHeaderLogoAlign(item.value)}
                                      title={item.title}
                                      className={[
                                        "rounded-full border px-2 py-1 text-[10px] font-semibold uppercase",
                                        headerLogoAlign === item.value
                                          ? "border-border [background:var(--card)] [box-shadow:var(--elevation-interactive)] text-foreground font-semibold"
                                          : "border-border/50 text-muted-foreground hover:[background:var(--surface-2)] hover:border-border/80",
                                      ].join(" ")}
                                    >
                                      {item.label}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              <div className={inspectorControlGroupClassName}>
                                <p className={inspectorControlGroupTitleClassName}>B. Logo hero</p>
                                <p className="text-[11px] text-muted-foreground">
                                  Variante activa: logo principal.
                                </p>
                                <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                                  Tamano
                                </p>
                                <div className="mt-1 grid grid-cols-3 gap-1">
                                  {([
                                    { id: "narrow", label: "SM" },
                                    { id: "medium", label: "MD" },
                                    { id: "wide", label: "LG" },
                                  ] as const).map((widthOption) => (
                                    <button
                                      key={widthOption.id}
                                      type="button"
                                      onClick={() =>
                                        setPieceStructure((previous) => ({
                                          ...previous,
                                          logo: { ...previous.logo, width: widthOption.id },
                                        }))
                                      }
                                      className={[
                                        "rounded-full border px-2 py-1 text-[10px] font-semibold uppercase",
                                        pieceStructure.logo.width === widthOption.id
                                          ? "border-border [background:var(--card)] [box-shadow:var(--elevation-interactive)] text-foreground font-semibold"
                                          : "border-border/50 text-muted-foreground hover:[background:var(--surface-2)] hover:border-border/80",
                                      ].join(" ")}
                                    >
                                      {widthOption.label}
                                    </button>
                                  ))}
                                </div>
                                <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                                  Posicion
                                </p>
                                <div className="mt-1 grid grid-cols-3 gap-1">
                                  {(["left", "center", "right"] as const).map((column) => (
                                    <button
                                      key={column}
                                      type="button"
                                      onClick={() => {
                                        const currentRow = zoneToRow(pieceZones.logo);
                                        setPieceZones((previous) => ({
                                          ...previous,
                                          logo: `${currentRow}-${column}` as LayoutZone,
                                        }));
                                      }}
                                      className={[
                                        "rounded-full border px-2 py-1 text-[10px] font-semibold uppercase",
                                        zoneToColumn(pieceZones.logo) === column
                                          ? "border-border [background:var(--card)] [box-shadow:var(--elevation-interactive)] text-foreground font-semibold"
                                          : "border-border/50 text-muted-foreground hover:[background:var(--surface-2)] hover:border-border/80",
                                      ].join(" ")}
                                    >
                                      {column === "left"
                                        ? "Izq."
                                        : column === "right"
                                          ? "Der."
                                          : "Centro"}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              <div className={inspectorControlGroupClassName}>
                                <p className={inspectorControlGroupTitleClassName}>C. Logo footer</p>
                                <p className="text-[11px] text-muted-foreground">
                                  Variante activa: logo principal.
                                </p>
                                <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                                  Tamano
                                </p>
                                <div className="mt-1 grid grid-cols-3 gap-1">
                                  {([
                                    { value: "sm", label: "SM", title: "Tamano pequeno" },
                                    { value: "md", label: "MD", title: "Tamano medio" },
                                    { value: "lg", label: "LG", title: "Tamano grande" },
                                  ] as const).map((item) => (
                                    <button
                                      key={item.value}
                                      type="button"
                                      onClick={() => setFooterLogoSize(item.value)}
                                      title={item.title}
                                      className={[
                                        "rounded-full border px-2 py-1 text-[10px] font-semibold uppercase",
                                        footerLogoSize === item.value
                                          ? "border-border [background:var(--card)] [box-shadow:var(--elevation-interactive)] text-foreground font-semibold"
                                          : "border-border/50 text-muted-foreground hover:[background:var(--surface-2)] hover:border-border/80",
                                      ].join(" ")}
                                    >
                                      {item.label}
                                    </button>
                                  ))}
                                </div>
                                <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                                  Posicion
                                </p>
                                <div className="mt-1 grid grid-cols-3 gap-1">
                                  {([
                                    { value: "left", label: "Izq.", title: "Izquierda" },
                                    { value: "center", label: "Centro", title: "Centro" },
                                    { value: "right", label: "Der.", title: "Derecha" },
                                  ] as const).map((item) => (
                                    <button
                                      key={item.value}
                                      type="button"
                                      onClick={() => setFooterLogoAlign(item.value)}
                                      title={item.title}
                                      className={[
                                        "rounded-full border px-2 py-1 text-[10px] font-semibold uppercase",
                                        footerLogoAlign === item.value
                                          ? "border-border [background:var(--card)] [box-shadow:var(--elevation-interactive)] text-foreground font-semibold"
                                          : "border-border/50 text-muted-foreground hover:[background:var(--surface-2)] hover:border-border/80",
                                      ].join(" ")}
                                    >
                                      {item.label}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              <div className={inspectorControlGroupClassName}>
                                <p className={inspectorControlGroupTitleClassName}>D. Acabado</p>
                                <input
                                  type="range"
                                  min={55}
                                  max={100}
                                  step={1}
                                  value={logoOpacity}
                                  onChange={(event) => setLogoOpacity(Number(event.target.value))}
                                  className="w-full"
                                />
                                <div className="mt-1.5 grid grid-cols-3 gap-1">
                                  {([
                                    { value: "none", label: "No" },
                                    { value: "soft", label: "Suave" },
                                    { value: "medium", label: "Medio" },
                                  ] as const).map((shadow) => (
                                    <button
                                      key={shadow.value}
                                      type="button"
                                      onClick={() => setLogoShadow(shadow.value)}
                                      className={[
                                        "rounded-full border px-2 py-1 text-[10px] font-semibold uppercase",
                                        logoShadow === shadow.value
                                          ? "border-border [background:var(--card)] [box-shadow:var(--elevation-interactive)] text-foreground font-semibold"
                                          : "border-border/50 text-muted-foreground hover:[background:var(--surface-2)] hover:border-border/80",
                                      ].join(" ")}
                                    >
                                      {shadow.label}
                                    </button>
                                  ))}
                                </div>
                                <div className="mt-1.5 grid grid-cols-3 gap-1">
                                  {([
                                    { value: "minimal", label: "Minimo" },
                                    { value: "solid", label: "Solido" },
                                    { value: "glass", label: "Cristal" },
                                  ] as const).map((surface) => (
                                    <button
                                      key={surface.value}
                                      type="button"
                                      onClick={() => setLogoFrameStyle(surface.value)}
                                      className={[
                                        "rounded-full border px-2 py-1 text-[10px] font-semibold uppercase",
                                        logoFrameStyle === surface.value
                                          ? "border-border [background:var(--card)] [box-shadow:var(--elevation-interactive)] text-foreground font-semibold"
                                          : "border-border/50 text-muted-foreground hover:[background:var(--surface-2)] hover:border-border/80",
                                      ].join(" ")}
                                    >
                                      {surface.label}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ) : null}

                          {selectedPiece === "desktop-nav" ? (
                            <div className="mt-2 space-y-2">
                              <div className={inspectorControlGroupClassName}>
                                <p className={inspectorControlGroupTitleClassName}>A. Visibilidad y posicion</p>
                                <button
                                  type="button"
                                  onClick={() => setDesktopNavVisibility(!navLinksVisible)}
                                  className={[
                                    "mt-1.5 w-full rounded-md border px-2 py-1.5 text-xs font-semibold",
                                    navLinksVisible
                                      ? "border-success [background:var(--success-soft)] [color:var(--success-foreground)]"
                                      : "border-border/75 [background:var(--surface-1,var(--background))] text-muted-foreground",
                                  ].join(" ")}
                                >
                                  Navegacion visible: {navLinksVisible ? "ON" : "OFF"}
                                </button>
                                <div className="mt-1.5 flex flex-wrap gap-1">
                                  {(["left", "center", "right"] as const).map((position) => (
                                    <button
                                      key={position}
                                      type="button"
                                      onClick={() => setNavPlacement(position)}
                                      title={
                                        position === "left"
                                          ? "Izquierda"
                                          : position === "right"
                                            ? "Derecha"
                                            : "Centro"
                                      }
                                      className={[
                                        "rounded-full border px-2 py-1 text-[10px] font-semibold uppercase",
                                        navPlacement === position ||
                                        (navPlacement === "auto" && resolvedNavPosition === position)
                                          ? "border-border [background:var(--card)] [box-shadow:var(--elevation-interactive)] text-foreground font-semibold"
                                          : "border-border/50 text-muted-foreground hover:[background:var(--surface-2)] hover:border-border/80",
                                      ].join(" ")}
                                    >
                                      {position === "left"
                                        ? "Izq."
                                        : position === "right"
                                          ? "Der."
                                          : "Centro"}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              <div className={inspectorControlGroupClassName}>
                                <p className={inspectorControlGroupTitleClassName}>B. Apariencia</p>
                                <div className="mt-1.5 flex flex-wrap gap-1">
                                  {(["sm", "md", "lg"] as const).map((size) => (
                                    <button
                                      key={size}
                                      type="button"
                                      onClick={() => setDesktopNavSize(size)}
                                      className={[
                                        "rounded-full border px-2 py-1 text-[10px] font-semibold uppercase",
                                        desktopNavSize === size
                                          ? "border-border [background:var(--card)] [box-shadow:var(--elevation-interactive)] text-foreground font-semibold"
                                          : "border-border/50 text-muted-foreground hover:[background:var(--surface-2)] hover:border-border/80",
                                      ].join(" ")}
                                    >
                                      {size}
                                    </button>
                                  ))}
                                </div>
                                <div className="mt-1.5 flex flex-wrap gap-1">
                                  {([
                                    { value: "inverse", label: "Inverso" },
                                    { value: "primary", label: "Principal" },
                                    { value: "muted", label: "Suave" },
                                  ] as const).map((tone) => (
                                    <button
                                      key={tone.value}
                                      type="button"
                                      onClick={() => setDesktopNavTone(tone.value)}
                                      className={[
                                        "rounded-full border px-2 py-1 text-[10px] font-semibold uppercase",
                                        desktopNavTone === tone.value
                                          ? "border-border [background:var(--card)] [box-shadow:var(--elevation-interactive)] text-foreground font-semibold"
                                          : "border-border/50 text-muted-foreground hover:[background:var(--surface-2)] hover:border-border/80",
                                      ].join(" ")}
                                    >
                                      {tone.label}
                                    </button>
                                  ))}
                                </div>
                                <div className="mt-1.5 flex flex-wrap gap-1">
                                  {([
                                    { value: "minimal", label: "Minimo" },
                                    { value: "solid", label: "Solido" },
                                    { value: "glass", label: "Cristal" },
                                  ] as const).map((surface) => (
                                    <button
                                      key={surface.value}
                                      type="button"
                                      onClick={() => setDesktopNavSurface(surface.value)}
                                      className={[
                                        "rounded-full border px-2 py-1 text-[10px] font-semibold uppercase",
                                        desktopNavSurface === surface.value
                                          ? "border-border [background:var(--card)] [box-shadow:var(--elevation-interactive)] text-foreground font-semibold"
                                          : "border-border/50 text-muted-foreground hover:[background:var(--surface-2)] hover:border-border/80",
                                      ].join(" ")}
                                    >
                                      {surface.label}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              <div className={inspectorControlGroupClassName}>
                                <p className={inspectorControlGroupTitleClassName}>C. Hover y presencia</p>
                                <div className="mt-1.5 flex flex-wrap gap-1">
                                  {([
                                    { value: "low", label: "Baja" },
                                    { value: "medium", label: "Media" },
                                    { value: "high", label: "Alta" },
                                  ] as const).map((presence) => (
                                    <button
                                      key={presence.value}
                                      type="button"
                                      onClick={() => setDesktopNavPresence(presence.value)}
                                      className={[
                                        "rounded-full border px-2 py-1 text-[10px] font-semibold uppercase",
                                        desktopNavPresence === presence.value
                                          ? "border-border [background:var(--card)] [box-shadow:var(--elevation-interactive)] text-foreground font-semibold"
                                          : "border-border/50 text-muted-foreground hover:[background:var(--surface-2)] hover:border-border/80",
                                      ].join(" ")}
                                    >
                                      {presence.label}
                                    </button>
                                  ))}
                                </div>
                                <div className="mt-1.5 flex flex-wrap gap-1">
                                  {(["soft", "lift", "glow"] as const).map((hover) => (
                                    <button
                                      key={hover}
                                      type="button"
                                      onClick={() => setDesktopNavHover(hover)}
                                      className={[
                                        "rounded-full border px-2 py-1 text-[10px] font-semibold uppercase",
                                        desktopNavHover === hover
                                          ? "border-border [background:var(--card)] [box-shadow:var(--elevation-interactive)] text-foreground font-semibold"
                                          : "border-border/50 text-muted-foreground hover:[background:var(--surface-2)] hover:border-border/80",
                                      ].join(" ")}
                                    >
                                      {hover}
                                    </button>
                                  ))}
                                </div>
                              </div>

                            </div>
                          ) : null}

                          {selectedPiece === "header-hero" ? (
                            <div className="mt-2 space-y-2">
                              <div className={inspectorControlGroupClassName}>
                                <p className={inspectorControlGroupTitleClassName}>A. Visibilidad y modo</p>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setPieceVisibility((previous) => ({
                                      ...previous,
                                      "header-hero": !previous["header-hero"],
                                    }))
                                  }
                                  className={[
                                    "mt-1.5 w-full rounded-md border px-2 py-1.5 text-xs font-semibold uppercase",
                                    pieceVisibility["header-hero"]
                                      ? "border-success [background:var(--success-soft)] [color:var(--success-foreground)]"
                                      : "border-border/75 [background:var(--surface-1,var(--background))] text-muted-foreground",
                                  ].join(" ")}
                                >
                                  Header visible: {pieceVisibility["header-hero"] ? "ON" : "OFF"}
                                </button>
                                <div className="mt-1.5 flex flex-wrap gap-1">
                                  {([
                                    { value: "integrated", label: "Integrado" },
                                    { value: "separated", label: "Separado" },
                                  ] as const).map((mode) => (
                                    <button
                                      key={mode.value}
                                      type="button"
                                      onClick={() => setHeaderIntegration(mode.value)}
                                      className={[
                                        "rounded-full border px-2 py-1 text-[10px] font-semibold uppercase",
                                        headerIntegration === mode.value
                                          ? "border-border [background:var(--card)] [box-shadow:var(--elevation-interactive)] text-foreground font-semibold"
                                          : "border-border/50 text-muted-foreground hover:[background:var(--surface-2)] hover:border-border/80",
                                      ].join(" ")}
                                    >
                                      {mode.label}
                                    </button>
                                  ))}
                                </div>
                              </div>
                              <div className={inspectorControlGroupClassName}>
                                <p className={inspectorControlGroupTitleClassName}>B. Fondo y altura</p>
                                <p className={inspectorMiniGroupTitleClassName}>B1. Fondo</p>
                                <div className="mt-1 flex flex-wrap gap-1">
                                  {([
                                    { value: "minimal", label: "Neutro", title: "Superficie neutra del sistema" },
                                    { value: "solid", label: "Acento", title: "Color de acento del preset activo" },
                                    { value: "glass", label: "Oscuro", title: "Token foreground / modo oscuro" },
                                  ] as const).map((style) => (
                                    <button
                                      key={style.value}
                                      type="button"
                                      onClick={() => setHeaderVisualStyle(style.value)}
                                      title={style.title}
                                      className={[
                                        "rounded-full border px-2 py-1 text-[10px] font-semibold uppercase",
                                        headerVisualStyle === style.value
                                          ? "border-border [background:var(--card)] [box-shadow:var(--elevation-interactive)] text-foreground font-semibold"
                                          : "border-border/50 text-muted-foreground hover:[background:var(--surface-2)] hover:border-border/80",
                                      ].join(" ")}
                                    >
                                      {style.label}
                                    </button>
                                  ))}
                                </div>
                                <div className="mt-1 grid grid-cols-3 gap-1">
                                  {([
                                    {
                                      value: "neutral",
                                      label: "Neutro",
                                      title: "Superficie neutra del sistema",
                                    },
                                    {
                                      value: "primary",
                                      label: "Primary",
                                      title: "Color principal del preset activo",
                                    },
                                    {
                                      value: "secondary",
                                      label: "Secondary",
                                      title: "Color secundario del preset activo",
                                    },
                                    {
                                      value: "accent",
                                      label: "Accent",
                                      title: "Color de acento del preset activo",
                                    },
                                    {
                                      value: "dark",
                                      label: "Oscuro",
                                      title: "Token foreground / modo oscuro",
                                    },
                                  ] as const).map((tone) => (
                                    <button
                                      key={tone.value}
                                      type="button"
                                      onClick={() => setHeaderSurfaceTone(tone.value)}
                                      title={tone.title}
                                      className={[
                                        "rounded-full border px-2 py-1 text-[10px] font-semibold uppercase",
                                        headerSurfaceTone === tone.value
                                          ? "border-border [background:var(--card)] [box-shadow:var(--elevation-interactive)] text-foreground font-semibold"
                                          : "border-border/50 text-muted-foreground hover:[background:var(--surface-2)] hover:border-border/80",
                                      ].join(" ")}
                                    >
                                      {tone.label}
                                    </button>
                                  ))}
                                </div>
                                <p className="mt-1 text-[10px] text-muted-foreground">
                                  Usa tokens del Brand Lab activo.
                                </p>
                                <p className="mt-1.5 text-[9px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                                  B2. Altura
                                </p>
                                <div className="mt-1 grid grid-cols-3 gap-1">
                                  {([
                                    { value: "10", label: "10vh" },
                                    { value: "15", label: "15vh" },
                                    { value: "20", label: "20vh" },
                                  ] as const).map((bandHeight) => (
                                    <button
                                      key={bandHeight.value}
                                      type="button"
                                      onClick={() => setHeaderBandHeight(bandHeight.value)}
                                      title={`Altura ${bandHeight.label}`}
                                      className={[
                                        "rounded-full border px-2 py-1 text-[10px] font-semibold uppercase",
                                        headerBandHeight === bandHeight.value
                                          ? "border-border [background:var(--card)] [box-shadow:var(--elevation-interactive)] text-foreground font-semibold"
                                          : "border-border/50 text-muted-foreground hover:[background:var(--surface-2)] hover:border-border/80",
                                      ].join(" ")}
                                    >
                                      {bandHeight.label}
                                    </button>
                                  ))}
                                </div>
                                <p className="mt-1.5 text-[9px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                                  B3. Densidad
                                </p>
                                <div className="mt-1 flex flex-wrap gap-1">
                                  {(["compact", "normal", "spacious"] as const).map((height) => (
                                    <button
                                      key={height}
                                      type="button"
                                      onClick={() =>
                                        setHeaderTopSpacing(
                                          height === "compact"
                                            ? "tight"
                                            : height === "spacious"
                                              ? "relaxed"
                                              : "normal"
                                        )
                                      }
                                      className={[
                                        "rounded-full border px-2 py-1 text-[10px] font-semibold uppercase",
                                        (height === "compact" && headerTopSpacing === "tight") ||
                                        (height === "normal" && headerTopSpacing === "normal") ||
                                        (height === "spacious" && headerTopSpacing === "relaxed")
                                          ? "border-border [background:var(--card)] [box-shadow:var(--elevation-interactive)] text-foreground font-semibold"
                                          : "border-border/50 text-muted-foreground hover:[background:var(--surface-2)] hover:border-border/80",
                                      ].join(" ")}
                                    >
                                      {height === "compact"
                                        ? "Compacto"
                                        : height === "spacious"
                                          ? "Amplio"
                                          : "Normal"}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ) : null}

                          {selectedPiece === "nav-burger" ? (
                            <div className="mt-2 space-y-2">
                              <div className={inspectorControlGroupClassName}>
                                <p className={inspectorControlGroupTitleClassName}>A. Boton hamburguesa</p>
                                <div className="mt-1 space-y-1.5">
                                  <div>
                                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                                      A1. Visibilidad
                                    </p>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setPieceVisibility((previous) => ({
                                          ...previous,
                                          "nav-burger": !previous["nav-burger"],
                                        }))
                                      }
                                      className={[
                                        "mt-1 w-full rounded-md border px-2 py-1.5 text-xs font-semibold uppercase",
                                        pieceVisibility["nav-burger"]
                                          ? "border-success [background:var(--success-soft)] [color:var(--success-foreground)]"
                                          : "border-border/75 [background:var(--surface-1,var(--background))] text-muted-foreground",
                                      ].join(" ")}
                                    >
                                      Menu hamburguesa visible: {pieceVisibility["nav-burger"] ? "ON" : "OFF"}
                                    </button>
                                  </div>

                                  <div>
                                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                                      A2. Posicion
                                    </p>
                                    <div className="mt-1 grid grid-cols-2 gap-1">
                                      {(["left", "right"] as const).map((position) => (
                                        <button
                                          key={position}
                                          type="button"
                                          onClick={() => setOperationalPieceColumn("nav-burger", position)}
                                          title={position === "left" ? "Izquierda" : "Derecha"}
                                          className={[
                                            "rounded-full border px-2 py-1 text-[10px] font-semibold uppercase",
                                            navColumn === position
                                              ? "border-border [background:var(--card)] [box-shadow:var(--elevation-interactive)] text-foreground font-semibold"
                                              : "border-border/50 text-muted-foreground hover:[background:var(--surface-2)] hover:border-border/80",
                                          ].join(" ")}
                                        >
                                          {position === "left" ? "Izq." : "Der."}
                                        </button>
                                      ))}
                                    </div>
                                  </div>

                                  <div>
                                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                                      A3. Tamano
                                    </p>
                                    <div className="mt-1 grid grid-cols-3 gap-1">
                                      {([
                                        { id: "sm", label: "SM", title: "Tamano pequeno" },
                                        { id: "md", label: "MD", title: "Tamano medio" },
                                        { id: "lg", label: "LG", title: "Tamano grande" },
                                      ] as const).map((size) => (
                                        <button
                                          key={size.id}
                                          type="button"
                                          onClick={() => setNavTriggerSize(size.id)}
                                          title={size.title}
                                          className={[
                                            "rounded-full border px-2 py-1 text-[10px] font-semibold uppercase",
                                            navTriggerSize === size.id
                                              ? "border-border [background:var(--card)] [box-shadow:var(--elevation-interactive)] text-foreground font-semibold"
                                              : "border-border/50 text-muted-foreground hover:[background:var(--surface-2)] hover:border-border/80",
                                          ].join(" ")}
                                        >
                                          {size.label}
                                        </button>
                                      ))}
                                    </div>
                                  </div>

                                  <div>
                                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                                      A4. Tono
                                    </p>
                                    <div className="mt-1 grid grid-cols-3 gap-1">
                                      {([
                                        { value: "inverse", label: "Inv.", title: "Inverso" },
                                        { value: "primary", label: "Princ.", title: "Principal" },
                                        { value: "muted", label: "Suave", title: "Suave" },
                                      ] as const).map((tone) => (
                                        <button
                                          key={tone.value}
                                          type="button"
                                          onClick={() => setNavTriggerTone(tone.value)}
                                          title={tone.title}
                                          className={[
                                            "rounded-full border px-2 py-1 text-[10px] font-semibold uppercase",
                                            navTriggerTone === tone.value
                                              ? "border-border [background:var(--card)] [box-shadow:var(--elevation-interactive)] text-foreground font-semibold"
                                              : "border-border/50 text-muted-foreground hover:[background:var(--surface-2)] hover:border-border/80",
                                          ].join(" ")}
                                        >
                                          {tone.label}
                                        </button>
                                      ))}
                                    </div>
                                  </div>

                                  <div>
                                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                                      A5. Superficie
                                    </p>
                                    <div className="mt-1 grid grid-cols-3 gap-1">
                                      {([
                                        { value: "minimal", label: "Min.", title: "Minimo" },
                                        { value: "solid", label: "Sol.", title: "Solido" },
                                        { value: "glass", label: "Crist.", title: "Cristal" },
                                      ] as const).map((surface) => (
                                        <button
                                          key={surface.value}
                                          type="button"
                                          onClick={() => setNavTriggerSurface(surface.value)}
                                          title={surface.title}
                                          className={[
                                            "rounded-full border px-2 py-1 text-[10px] font-semibold uppercase",
                                            navTriggerSurface === surface.value
                                              ? "border-border [background:var(--card)] [box-shadow:var(--elevation-interactive)] text-foreground font-semibold"
                                              : "border-border/50 text-muted-foreground hover:[background:var(--surface-2)] hover:border-border/80",
                                          ].join(" ")}
                                        >
                                          {surface.label}
                                        </button>
                                      ))}
                                    </div>
                                  </div>

                                  <div>
                                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                                      A6. Hover
                                    </p>
                                    <div className="mt-1 grid grid-cols-3 gap-1">
                                      {([
                                        { value: "soft", label: "Suave", title: "Hover suave" },
                                        { value: "lift", label: "Lift", title: "Hover elevacion" },
                                        { value: "glow", label: "Glow", title: "Hover brillo" },
                                      ] as const).map((hover) => (
                                        <button
                                          key={hover.value}
                                          type="button"
                                          onClick={() => setNavTriggerHover(hover.value)}
                                          title={hover.title}
                                          className={[
                                            "rounded-full border px-2 py-1 text-[10px] font-semibold uppercase",
                                            navTriggerHover === hover.value
                                              ? "border-border [background:var(--card)] [box-shadow:var(--elevation-interactive)] text-foreground font-semibold"
                                              : "border-border/50 text-muted-foreground hover:[background:var(--surface-2)] hover:border-border/80",
                                          ].join(" ")}
                                        >
                                          {hover.label}
                                        </button>
                                      ))}
                                    </div>
                                  </div>

                                  <div>
                                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                                      A7. Aura
                                    </p>
                                    <div className="mt-1 grid grid-cols-3 gap-1">
                                      {([
                                        { value: "none", label: "No", title: "Ninguno" },
                                        { value: "soft", label: "Suave", title: "Suave" },
                                        { value: "strong", label: "Fuerte", title: "Fuerte" },
                                      ] as const).map((aura) => (
                                        <button
                                          key={aura.value}
                                          type="button"
                                          onClick={() => setNavTriggerAura(aura.value)}
                                          title={aura.title}
                                          className={[
                                            "rounded-full border px-2 py-1 text-[10px] font-semibold uppercase",
                                            navTriggerAura === aura.value
                                              ? "border-border [background:var(--card)] [box-shadow:var(--elevation-interactive)] text-foreground font-semibold"
                                              : "border-border/50 text-muted-foreground hover:[background:var(--surface-2)] hover:border-border/80",
                                          ].join(" ")}
                                        >
                                          {aura.label}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className={inspectorControlGroupClassName}>
                                <p className={inspectorControlGroupTitleClassName}>B. Tipo de apertura</p>
                                <div className="mt-1.5 grid grid-cols-3 gap-1">
                                  {([
                                    { value: "overlay", label: "Overlay", title: "Overlay" },
                                    { value: "drawer", label: "Drawer", title: "Drawer lateral" },
                                    { value: "fullscreen", label: "Completa", title: "Pantalla completa" },
                                  ] as const).map((behavior) => (
                                    <button
                                      key={behavior.value}
                                      type="button"
                                      onClick={() => setNavOpenBehavior(behavior.value)}
                                      title={behavior.title}
                                      className={[
                                        "rounded-full border px-2 py-1 text-[10px] font-semibold uppercase",
                                        navOpenBehavior === behavior.value
                                          ? "border-border [background:var(--card)] [box-shadow:var(--elevation-interactive)] text-foreground font-semibold"
                                          : "border-border/50 text-muted-foreground hover:[background:var(--surface-2)] hover:border-border/80",
                                      ].join(" ")}
                                    >
                                      {behavior.label}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              <div className={inspectorControlGroupClassName}>
                                <p className={inspectorControlGroupTitleClassName}>C. Panel del menu</p>
                                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                                  C1. Ancho
                                </p>
                                <div className="mt-1 grid grid-cols-3 gap-1">
                                  {([
                                    { value: "narrow", label: "Estrecho", title: "Panel estrecho" },
                                    { value: "normal", label: "Normal", title: "Panel normal" },
                                    { value: "wide", label: "Completo", title: "Ancho completo" },
                                  ] as const).map((panelWidth) => (
                                    <button
                                      key={panelWidth.value}
                                      type="button"
                                      onClick={() => setNavPanelWidth(panelWidth.value)}
                                      title={panelWidth.title}
                                      className={[
                                        "rounded-full border px-2 py-1 text-[10px] font-semibold uppercase",
                                        navPanelWidth === panelWidth.value
                                          ? "border-border [background:var(--card)] [box-shadow:var(--elevation-interactive)] text-foreground font-semibold"
                                          : "border-border/50 text-muted-foreground hover:[background:var(--surface-2)] hover:border-border/80",
                                      ].join(" ")}
                                    >
                                      {panelWidth.label}
                                    </button>
                                  ))}
                                </div>
                                <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                                  C2. Origen / posicion
                                </p>
                                <div className="mt-1 grid grid-cols-3 gap-1">
                                  {([
                                    { value: "left", label: "Izq.", title: "Origen izquierda" },
                                    { value: "center", label: "Centro", title: "Origen centro" },
                                    { value: "right", label: "Der.", title: "Origen derecha" },
                                  ] as const).map((origin) => (
                                    <button
                                      key={origin.value}
                                      type="button"
                                      onClick={() => setNavPanelOrigin(origin.value)}
                                      title={origin.title}
                                      className={[
                                        "rounded-full border px-2 py-1 text-[10px] font-semibold uppercase",
                                        navPanelOrigin === origin.value
                                          ? "border-border [background:var(--card)] [box-shadow:var(--elevation-interactive)] text-foreground font-semibold"
                                          : "border-border/50 text-muted-foreground hover:[background:var(--surface-2)] hover:border-border/80",
                                      ].join(" ")}
                                    >
                                      {origin.label}
                                    </button>
                                  ))}
                                </div>
                                <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                                  C3. Superficie
                                </p>
                                <div className="mt-1 grid grid-cols-3 gap-1">
                                  {([
                                    { value: "minimal", label: "Minimo", title: "Superficie minima" },
                                    { value: "solid", label: "Solido", title: "Superficie solida" },
                                    { value: "glass", label: "Cristal", title: "Superficie cristal" },
                                  ] as const).map((surface) => (
                                    <button
                                      key={surface.value}
                                      type="button"
                                      onClick={() => setNavPanelStyle(surface.value)}
                                      title={surface.title}
                                      className={[
                                        "rounded-full border px-2 py-1 text-[10px] font-semibold uppercase",
                                        navPanelStyle === surface.value
                                          ? "border-border [background:var(--card)] [box-shadow:var(--elevation-interactive)] text-foreground font-semibold"
                                          : "border-border/50 text-muted-foreground hover:[background:var(--surface-2)] hover:border-border/80",
                                      ].join(" ")}
                                    >
                                      {surface.label}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              <div className={inspectorControlGroupClassName}>
                                <p className={inspectorControlGroupTitleClassName}>D. Soporte del menu</p>
                                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                                  D1. Opacidad
                                </p>
                                <div className="mt-1 grid grid-cols-3 gap-1">
                                  {([
                                    { value: "low", label: "Baja" },
                                    { value: "medium", label: "Media" },
                                    { value: "high", label: "Alta" },
                                  ] as const).map((density) => (
                                    <button
                                      key={density.value}
                                      type="button"
                                      onClick={() => setNavOverlayDensity(density.value)}
                                      title={`Opacidad ${density.label}`}
                                      className={[
                                        "rounded-full border px-2 py-1 text-[10px] font-semibold uppercase",
                                        navOverlayDensity === density.value
                                          ? "border-border [background:var(--card)] [box-shadow:var(--elevation-interactive)] text-foreground font-semibold"
                                          : "border-border/50 text-muted-foreground hover:[background:var(--surface-2)] hover:border-border/80",
                                      ].join(" ")}
                                    >
                                      {density.label}
                                    </button>
                                  ))}
                                </div>
                                <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                                  D2. Tono
                                </p>
                                <div className="mt-1 grid grid-cols-3 gap-1">
                                  {([
                                    { value: "neutral", label: "Neutro" },
                                    { value: "primary", label: "Primary" },
                                    { value: "secondary", label: "Secondary" },
                                    { value: "accent", label: "Accent" },
                                    { value: "dark", label: "Oscuro" },
                                  ] as const).map((toneValue) => (
                                    <button
                                      key={toneValue.value}
                                      type="button"
                                      onClick={() => {
                                        setNavOverlayStyle("tinted");
                                        setNavOverlayTone(toneValue.value);
                                      }}
                                      title={`Tono ${toneValue.label}`}
                                      className={[
                                        "rounded-full border px-2 py-1 text-[10px] font-semibold uppercase",
                                        navOverlayTone === toneValue.value
                                          ? "border-border [background:var(--card)] [box-shadow:var(--elevation-interactive)] text-foreground font-semibold"
                                          : "border-border/50 text-muted-foreground hover:[background:var(--surface-2)] hover:border-border/80",
                                      ].join(" ")}
                                    >
                                      {toneValue.label}
                                    </button>
                                  ))}
                                </div>
                                <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                                  D3. Transparencia
                                </p>
                                <div className="mt-1 grid grid-cols-3 gap-1">
                                  {([
                                    { value: "tinted", label: "Tintado" },
                                    { value: "neutral", label: "Oscuro" },
                                    { value: "none", label: "Sin capa" },
                                  ] as const).map((overlayStyleValue) => (
                                    <button
                                      key={overlayStyleValue.value}
                                      type="button"
                                      onClick={() => setNavOverlayStyle(overlayStyleValue.value)}
                                      title={`Estilo ${overlayStyleValue.label}`}
                                      className={[
                                        "rounded-full border px-2 py-1 text-[10px] font-semibold uppercase",
                                        navOverlayStyle === overlayStyleValue.value
                                          ? "border-border [background:var(--card)] [box-shadow:var(--elevation-interactive)] text-foreground font-semibold"
                                          : "border-border/50 text-muted-foreground hover:[background:var(--surface-2)] hover:border-border/80",
                                      ].join(" ")}
                                    >
                                      {overlayStyleValue.label}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              <div className={inspectorControlGroupClassName}>
                                <p className={inspectorControlGroupTitleClassName}>E. Links del menu</p>
                                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                                  E1. Alineacion
                                </p>
                                <div className="mt-1 grid grid-cols-3 gap-1">
                                  {([
                                    { value: "left", label: "Izq.", title: "Alinear izquierda" },
                                    { value: "center", label: "Centro", title: "Alinear centro" },
                                    { value: "right", label: "Der.", title: "Alinear derecha" },
                                  ] as const).map((alignment) => (
                                    <button
                                      key={alignment.value}
                                      type="button"
                                      onClick={() => setNavMenuAlignment(alignment.value)}
                                      title={alignment.title}
                                      className={[
                                        "rounded-full border px-2 py-1 text-[10px] font-semibold uppercase",
                                        navMenuAlignment === alignment.value
                                          ? "border-border [background:var(--card)] [box-shadow:var(--elevation-interactive)] text-foreground font-semibold"
                                          : "border-border/50 text-muted-foreground hover:[background:var(--surface-2)] hover:border-border/80",
                                      ].join(" ")}
                                    >
                                      {alignment.label}
                                    </button>
                                  ))}
                                </div>
                                <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                                  E2. Separacion / tamano
                                </p>
                                <div className="mt-1 grid grid-cols-3 gap-1">
                                  {([
                                    { value: "tight", label: "Junta", title: "Separacion ajustada" },
                                    { value: "normal", label: "Normal", title: "Separacion normal" },
                                    { value: "relaxed", label: "Amplia", title: "Separacion amplia" },
                                  ] as const).map((spacing) => (
                                    <button
                                      key={spacing.value}
                                      type="button"
                                      onClick={() => setNavMenuVerticalSpacing(spacing.value)}
                                      title={spacing.title}
                                      className={[
                                        "rounded-full border px-2 py-1 text-[10px] font-semibold uppercase",
                                        navMenuVerticalSpacing === spacing.value
                                          ? "border-border [background:var(--card)] [box-shadow:var(--elevation-interactive)] text-foreground font-semibold"
                                          : "border-border/50 text-muted-foreground hover:[background:var(--surface-2)] hover:border-border/80",
                                      ].join(" ")}
                                    >
                                      {spacing.label}
                                    </button>
                                  ))}
                                </div>
                                <div className="mt-1 grid grid-cols-3 gap-1">
                                  {([
                                    { value: "sm", label: "SM", title: "Link pequeno" },
                                    { value: "md", label: "MD", title: "Link medio" },
                                    { value: "lg", label: "LG", title: "Link grande" },
                                  ] as const).map((size) => (
                                    <button
                                      key={size.value}
                                      type="button"
                                      onClick={() => setNavMenuItemSize(size.value)}
                                      title={size.title}
                                      className={[
                                        "rounded-full border px-2 py-1 text-[10px] font-semibold uppercase",
                                        navMenuItemSize === size.value
                                          ? "border-border [background:var(--card)] [box-shadow:var(--elevation-interactive)] text-foreground font-semibold"
                                          : "border-border/50 text-muted-foreground hover:[background:var(--surface-2)] hover:border-border/80",
                                      ].join(" ")}
                                    >
                                      {size.label}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              <div className={inspectorControlGroupClassName}>
                                <p className={inspectorControlGroupTitleClassName}>F. Accion</p>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setNavPreviewOpen((previous) => (previous ? false : true))
                                  }
                                  className="mt-1.5 w-full rounded-md border border-border/75 [background:var(--surface-1,var(--background))] px-2 py-1.5 text-xs font-semibold"
                                >
                                  {navPreviewOpen ? "Cerrar menu" : "Ver menu"}
                                </button>
                              </div>
                            </div>
                          ) : null}

                          {selectedPiece === "theme-toggle" ? (
                            <div className="mt-2 space-y-1.5">
                              <button
                                type="button"
                                onClick={() =>
                                  setPieceVisibility((previous) => ({
                                    ...previous,
                                    "theme-toggle": !previous["theme-toggle"],
                                  }))
                                }
                                className={[
                                  "w-full rounded-md border px-2 py-1.5 text-xs font-semibold uppercase",
                                  pieceVisibility["theme-toggle"]
                                    ? "border-success [background:var(--success-soft)] [color:var(--success-foreground)]"
                                    : "border-border/75 [background:var(--surface-1,var(--background))] text-muted-foreground",
                                ].join(" ")}
                              >
                                Visible: {pieceVisibility["theme-toggle"] ? "ON" : "OFF"}
                              </button>
                              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                                Posicion mobile
                              </p>
                              <div className="grid grid-cols-2 gap-1">
                                {(["left", "right"] as const).map((value) => (
                                  <button
                                    key={value}
                                    type="button"
                                    onClick={() => setOperationalPieceColumn("theme-toggle", value)}
                                    title={value === "left" ? "Izquierda" : "Derecha"}
                                    className={[
                                      "rounded-full border px-2 py-1 text-[10px] font-semibold uppercase",
                                      themeTogglePosition === value
                                        ? "border-border [background:var(--card)] [box-shadow:var(--elevation-interactive)] text-foreground font-semibold"
                                        : "border-border/50 text-muted-foreground hover:[background:var(--surface-2)] hover:border-border/80",
                                    ].join(" ")}
                                  >
                                    {value === "left" ? "Izq." : "Der."}
                                  </button>
                                ))}
                              </div>
                              <div className="grid grid-cols-1 gap-1">
                                <button
                                  type="button"
                                  onClick={() => applyNavThemePreset("burger-left-theme-right")}
                                  className="w-full rounded-md border border-border/75 [background:var(--surface-1,var(--background))] px-2 py-1.5 text-[11px] font-semibold"
                                >
                                  Preset: burger izq + theme der
                                </button>
                                <button
                                  type="button"
                                  onClick={() => applyNavThemePreset("theme-left-burger-right")}
                                  className="w-full rounded-md border border-border/75 [background:var(--surface-1,var(--background))] px-2 py-1.5 text-[11px] font-semibold"
                                >
                                  Preset: theme izq + burger der
                                </button>
                                <button
                                  type="button"
                                  onClick={() => applyNavThemePreset("both-right")}
                                  className="w-full rounded-md border border-border/75 [background:var(--surface-1,var(--background))] px-2 py-1.5 text-[11px] font-semibold"
                                >
                                  Preset: ambos derecha
                                </button>
                              </div>
                              <button
                                type="button"
                                onClick={handleSwapMobileNavTheme}
                                className="w-full rounded-md border border-border/75 [background:var(--surface-1,var(--background))] px-2 py-1.5 text-xs font-semibold"
                              >
                                Intercambiar con nav burger (mobile)
                              </button>
                              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                                Superficie
                              </p>
                              <div className="grid grid-cols-3 gap-1">
                                {([
                                  { value: "minimal", label: "Minimo" },
                                  { value: "solid", label: "Solido" },
                                  { value: "glass", label: "Cristal" },
                                ] as const).map((value) => (
                                  <button
                                    key={value.value}
                                    type="button"
                                    onClick={() => setThemeToggleStyle(value.value)}
                                    className={[
                                      "rounded-full border px-2 py-1 text-[10px] font-semibold uppercase",
                                      themeToggleStyle === value.value
                                        ? "border-border [background:var(--card)] [box-shadow:var(--elevation-interactive)] text-foreground font-semibold"
                                        : "border-border/50 text-muted-foreground hover:[background:var(--surface-2)] hover:border-border/80",
                                    ].join(" ")}
                                  >
                                    {value.label}
                                  </button>
                                ))}
                              </div>
                              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                                Modo de tema
                              </p>
                              <div className="grid grid-cols-3 gap-1">
                                {([
                                  { value: "light", label: "[L] Light", title: "Modo claro" },
                                  { value: "dark", label: "[D] Dark", title: "Modo oscuro" },
                                  { value: "auto", label: "A Auto", title: "Modo automatico" },
                                ] as const).map((value) => (
                                  <button
                                    key={value.value}
                                    type="button"
                                    onClick={() => setThemeToggleDefault(value.value)}
                                    title={value.title}
                                    className={[
                                      "rounded-md border px-1.5 py-1 text-[10px] font-semibold leading-tight tracking-tight whitespace-nowrap",
                                      themeToggleDefault === value.value
                                        ? "border-border [background:var(--card)] ring-1 ring-border [box-shadow:var(--elevation-interactive)] text-foreground"
                                        : "border-border/50 text-muted-foreground hover:[background:var(--surface-2)] hover:border-border/80",
                                    ].join(" ")}
                                  >
                                    {value.label}
                                  </button>
                                ))}
                              </div>
                              <p className="text-[10px] text-muted-foreground">
                                Vista activa:{" "}
                                <span className="font-semibold text-foreground">
                                  {themeToggleDefault === "light"
                                    ? "Light"
                                    : themeToggleDefault === "dark"
                                      ? "Dark"
                                      : "Auto"}
                                </span>
                              </p>
                              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                                Intensidad
                              </p>
                              <div className="grid grid-cols-3 gap-1">
                                {([
                                  { value: "low", label: "Baja" },
                                  { value: "medium", label: "Media" },
                                  { value: "high", label: "Alta" },
                                ] as const).map((value) => (
                                  <button
                                    key={value.value}
                                    type="button"
                                    onClick={() => setThemeEffectIntensity(value.value)}
                                    title={`Intensidad ${value.label}`}
                                    className={[
                                      "rounded-full border px-2 py-1 text-[10px] font-semibold uppercase",
                                      themeEffectIntensity === value.value
                                        ? "border-border [background:var(--card)] [box-shadow:var(--elevation-interactive)] text-foreground font-semibold"
                                        : "border-border/50 text-muted-foreground hover:[background:var(--surface-2)] hover:border-border/80",
                                    ].join(" ")}
                                  >
                                    {value.label}
                                  </button>
                                ))}
                              </div>
                              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                                Alcance
                              </p>
                              <div className="grid grid-cols-3 gap-1">
                                {([
                                  { value: "button", label: "Boton", title: "Solo boton" },
                                  { value: "header", label: "Header", title: "Afecta cabecera" },
                                  { value: "hero", label: "Hero", title: "Afecta hero completo" },
                                ] as const).map((value) => (
                                  <button
                                    key={value.value}
                                    type="button"
                                    onClick={() => setThemeEffectScope(value.value)}
                                    title={value.title}
                                    className={[
                                      "rounded-full border px-2 py-1 text-[10px] font-semibold uppercase",
                                      themeEffectScope === value.value
                                        ? "border-border [background:var(--card)] [box-shadow:var(--elevation-interactive)] text-foreground font-semibold"
                                        : "border-border/50 text-muted-foreground hover:[background:var(--surface-2)] hover:border-border/80",
                                    ].join(" ")}
                                  >
                                    {value.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ) : null}

                          {selectedPiece === "footer-hero" ? (
                            <div className="mt-2 space-y-2">
                              <div className={inspectorControlGroupClassName}>
                                <p className={inspectorControlGroupTitleClassName}>A. Visibilidad y modo</p>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setPieceVisibility((previous) => ({
                                      ...previous,
                                      "footer-hero": !previous["footer-hero"],
                                    }))
                                  }
                                  className={[
                                    "mt-1.5 w-full rounded-md border px-2 py-1.5 text-xs font-semibold uppercase",
                                    pieceVisibility["footer-hero"]
                                      ? "border-success [background:var(--success-soft)] [color:var(--success-foreground)]"
                                      : "border-border/75 [background:var(--surface-1,var(--background))] text-muted-foreground",
                                  ].join(" ")}
                                >
                                  Footer visible: {pieceVisibility["footer-hero"] ? "ON" : "OFF"}
                                </button>
                                <div className="mt-1.5 flex flex-wrap gap-1">
                                  {([
                                    { value: "integrated", label: "Integrado" },
                                    { value: "separated", label: "Separado" },
                                  ] as const).map((mode) => (
                                    <button
                                      key={mode.value}
                                      type="button"
                                      onClick={() => setFooterIntegration(mode.value)}
                                      className={[
                                        "rounded-full border px-2 py-1 text-[10px] font-semibold uppercase",
                                        footerIntegration === mode.value
                                          ? "border-border [background:var(--card)] [box-shadow:var(--elevation-interactive)] text-foreground font-semibold"
                                          : "border-border/50 text-muted-foreground hover:[background:var(--surface-2)] hover:border-border/80",
                                      ].join(" ")}
                                    >
                                      {mode.label}
                                    </button>
                                  ))}
                                </div>
                              </div>
                              <div className={inspectorControlGroupClassName}>
                                <p className={inspectorControlGroupTitleClassName}>B. Fondo y altura</p>
                                <p className={inspectorMiniGroupTitleClassName}>B1. Fondo</p>
                                <div className="mt-1 flex flex-wrap gap-1">
                                  {([
                                    { value: "minimal", label: "Neutro", title: "Superficie neutra del sistema" },
                                    { value: "solid", label: "Acento", title: "Color de acento del preset activo" },
                                    { value: "glass", label: "Oscuro", title: "Token foreground / modo oscuro" },
                                  ] as const).map((style) => (
                                    <button
                                      key={style.value}
                                      type="button"
                                      onClick={() => setFooterVisualStyle(style.value)}
                                      title={style.title}
                                      className={[
                                        "rounded-full border px-2 py-1 text-[10px] font-semibold uppercase",
                                        footerVisualStyle === style.value
                                          ? "border-border [background:var(--card)] [box-shadow:var(--elevation-interactive)] text-foreground font-semibold"
                                          : "border-border/50 text-muted-foreground hover:[background:var(--surface-2)] hover:border-border/80",
                                      ].join(" ")}
                                    >
                                      {style.label}
                                    </button>
                                  ))}
                                </div>
                                <div className="mt-1 grid grid-cols-3 gap-1">
                                  {([
                                    {
                                      value: "neutral",
                                      label: "Neutro",
                                      title: "Superficie neutra del sistema",
                                    },
                                    {
                                      value: "primary",
                                      label: "Primary",
                                      title: "Color principal del preset activo",
                                    },
                                    {
                                      value: "secondary",
                                      label: "Secondary",
                                      title: "Color secundario del preset activo",
                                    },
                                    {
                                      value: "accent",
                                      label: "Accent",
                                      title: "Color de acento del preset activo",
                                    },
                                    {
                                      value: "dark",
                                      label: "Oscuro",
                                      title: "Token foreground / modo oscuro",
                                    },
                                  ] as const).map((tone) => (
                                    <button
                                      key={tone.value}
                                      type="button"
                                      onClick={() => setFooterSurfaceTone(tone.value)}
                                      title={tone.title}
                                      className={[
                                        "rounded-full border px-2 py-1 text-[10px] font-semibold uppercase",
                                        footerSurfaceTone === tone.value
                                          ? "border-border [background:var(--card)] [box-shadow:var(--elevation-interactive)] text-foreground font-semibold"
                                          : "border-border/50 text-muted-foreground hover:[background:var(--surface-2)] hover:border-border/80",
                                      ].join(" ")}
                                    >
                                      {tone.label}
                                    </button>
                                  ))}
                                </div>
                                <p className="mt-1 text-[10px] text-muted-foreground">
                                  Usa tokens del Brand Lab activo.
                                </p>
                                <p className="mt-1.5 text-[9px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                                  B2. Altura
                                </p>
                                <div className="mt-1 grid grid-cols-3 gap-1">
                                  {([
                                    { value: "10", label: "10vh" },
                                    { value: "15", label: "15vh" },
                                    { value: "20", label: "20vh" },
                                  ] as const).map((bandHeight) => (
                                    <button
                                      key={bandHeight.value}
                                      type="button"
                                      onClick={() => setFooterBandHeight(bandHeight.value)}
                                      title={`Altura ${bandHeight.label}`}
                                      className={[
                                        "rounded-full border px-2 py-1 text-[10px] font-semibold uppercase",
                                        footerBandHeight === bandHeight.value
                                          ? "border-border [background:var(--card)] [box-shadow:var(--elevation-interactive)] text-foreground font-semibold"
                                          : "border-border/50 text-muted-foreground hover:[background:var(--surface-2)] hover:border-border/80",
                                      ].join(" ")}
                                    >
                                      {bandHeight.label}
                                    </button>
                                  ))}
                                </div>
                                <p className="mt-1.5 text-[9px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                                  B3. Densidad
                                </p>
                                <div className="mt-1 flex flex-wrap gap-1">
                                  {(["compact", "normal", "spacious"] as const).map((value) => (
                                    <button
                                      key={value}
                                      type="button"
                                      onClick={() => setFooterHeight(value)}
                                      className={[
                                        "rounded-full border px-2 py-1 text-[10px] font-semibold uppercase",
                                        footerHeight === value
                                          ? "border-border [background:var(--card)] [box-shadow:var(--elevation-interactive)] text-foreground font-semibold"
                                          : "border-border/50 text-muted-foreground hover:[background:var(--surface-2)] hover:border-border/80",
                                      ].join(" ")}
                                    >
                                      {value === "compact"
                                        ? "Compacto"
                                        : value === "spacious"
                                          ? "Amplio"
                                          : "Normal"}
                                    </button>
                                  ))}
                                </div>
                              </div>
                              <div className={inspectorControlGroupClassName}>
                                <p className={inspectorControlGroupTitleClassName}>C. Alineacion y firma</p>
                                <div className="mt-1.5 flex flex-wrap gap-1">
                                  {(["auto", "left", "center", "right"] as const).map((value) => (
                                    <button
                                      key={value}
                                      type="button"
                                      onClick={() => {
                                        if (value === "auto") {
                                          setFooterPlacement("auto");
                                          setOperationalPieceColumn(
                                            "footer-hero",
                                            BLUEPRINT_PRESETS[blueprint].footerPosition
                                          );
                                          return;
                                        }
                                        setOperationalPieceColumn("footer-hero", value);
                                      }}
                                      className={[
                                        "rounded-full border px-2 py-1 text-[10px] font-semibold uppercase",
                                        footerPlacement === value
                                          ? "border-border [background:var(--card)] [box-shadow:var(--elevation-interactive)] text-foreground font-semibold"
                                          : "border-border/50 text-muted-foreground hover:[background:var(--surface-2)] hover:border-border/80",
                                      ].join(" ")}
                                    >
                                      {value === "auto"
                                        ? "Auto"
                                        : value === "left"
                                          ? "Izq."
                                          : value === "right"
                                            ? "Der."
                                            : "Centro"}
                                    </button>
                                  ))}
                                </div>
                                <div className="mt-1.5 flex flex-wrap gap-1">
                                  {(["tight", "normal", "relaxed"] as const).map((value) => (
                                    <button
                                      key={value}
                                      type="button"
                                      onClick={() => setFooterSignatureSeparation(value)}
                                      className={[
                                        "rounded-full border px-2 py-1 text-[10px] font-semibold uppercase",
                                        footerSignatureSeparation === value
                                          ? "border-border [background:var(--card)] [box-shadow:var(--elevation-interactive)] text-foreground font-semibold"
                                          : "border-border/50 text-muted-foreground hover:[background:var(--surface-2)] hover:border-border/80",
                                      ].join(" ")}
                                    >
                                      firma{" "}
                                      {value === "tight"
                                        ? "compacta"
                                        : value === "relaxed"
                                          ? "amplia"
                                          : "normal"}
                                    </button>
                                  ))}
                                </div>
                              </div>
                              <div className={inspectorControlGroupClassName}>
                                <p className={inspectorControlGroupTitleClassName}>D. Toggles</p>
                                <div className="mt-1.5 flex flex-wrap gap-1">
                                  <button
                                    type="button"
                                    onClick={() => setFooterIconsVisible((previous) => !previous)}
                                    className={[
                                      "rounded-full border px-2 py-1 text-[10px] font-semibold uppercase",
                                      footerIconsVisible
                                        ? "border-success [background:var(--success-soft)] [color:var(--success-foreground)]"
                                        : "border-border/50 text-muted-foreground hover:[background:var(--surface-2)] hover:border-border/80",
                                    ].join(" ")}
                                  >
                                    iconos {footerIconsVisible ? "on" : "off"}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setPieceVisibility((previous) => ({
                                        ...previous,
                                        "contact-strip": !previous["contact-strip"],
                                      }))
                                    }
                                    className={[
                                      "rounded-full border px-2 py-1 text-[10px] font-semibold uppercase",
                                      pieceVisibility["contact-strip"]
                                        ? "border-success [background:var(--success-soft)] [color:var(--success-foreground)]"
                                        : "border-border/50 text-muted-foreground hover:[background:var(--surface-2)] hover:border-border/80",
                                    ].join(" ")}
                                  >
                                    contacto {pieceVisibility["contact-strip"] ? "on" : "off"}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setPieceVisibility((previous) => ({
                                        ...previous,
                                        "animated-signature": !previous["animated-signature"],
                                      }))
                                    }
                                    className={[
                                      "rounded-full border px-2 py-1 text-[10px] font-semibold uppercase",
                                      pieceVisibility["animated-signature"]
                                        ? "border-success [background:var(--success-soft)] [color:var(--success-foreground)]"
                                        : "border-border/50 text-muted-foreground hover:[background:var(--surface-2)] hover:border-border/80",
                                    ].join(" ")}
                                  >
                                    firma {pieceVisibility["animated-signature"] ? "on" : "off"}
                                  </button>
                                </div>
                                <p className="mt-1.5 text-[11px] text-muted-foreground">
                                  La visibilidad del footer se guarda por dispositivo y por variante.
                                </p>
                              </div>
                            </div>
                          ) : null}

                          {selectedPiece === "contact-strip" ? (
                            <div className="mt-2 space-y-2">
                              <div className={inspectorControlGroupClassName}>
                                <p className={inspectorControlGroupTitleClassName}>A. Contenido</p>
                                <input
                                  value={footerAddress}
                                  onChange={(event) => setFooterAddress(event.target.value)}
                                  placeholder="Direccion"
                                  className="h-8 w-full rounded-md border border-border/75 [background:var(--surface-1,var(--background))] px-2 text-xs outline-none focus:ring-2 focus:ring-ring"
                                />
                                <input
                                  value={footerPhone}
                                  onChange={(event) => setFooterPhone(event.target.value)}
                                  placeholder="Telefono"
                                  className="mt-1.5 h-8 w-full rounded-md border border-border/75 [background:var(--surface-1,var(--background))] px-2 text-xs outline-none focus:ring-2 focus:ring-ring"
                                />
                                <input
                                  value={footerWhatsapp}
                                  onChange={(event) => setFooterWhatsapp(event.target.value)}
                                  placeholder="WhatsApp"
                                  className="mt-1.5 h-8 w-full rounded-md border border-border/75 [background:var(--surface-1,var(--background))] px-2 text-xs outline-none focus:ring-2 focus:ring-ring"
                                />
                                <input
                                  value={footerEmail}
                                  onChange={(event) => setFooterEmail(event.target.value)}
                                  placeholder="email@cliente.com"
                                  className="mt-1.5 h-8 w-full rounded-md border border-border/75 [background:var(--surface-1,var(--background))] px-2 text-xs outline-none focus:ring-2 focus:ring-ring"
                                />
                              </div>
                              <div className={inspectorControlGroupClassName}>
                                <p className={inspectorControlGroupTitleClassName}>B. Densidad y contraste</p>
                                <div className="mt-1.5 flex flex-wrap gap-1">
                                  {([
                                    { value: "compact", label: "Compacto" },
                                    { value: "balanced", label: "Normal" },
                                    { value: "spacious", label: "Amplio" },
                                  ] as const).map((value) => (
                                    <button
                                      key={value.value}
                                      type="button"
                                      onClick={() => setContactDensity(value.value)}
                                      className={[
                                        "rounded-full border px-2 py-1 text-[10px] font-semibold uppercase",
                                        contactDensity === value.value
                                          ? "border-border [background:var(--card)] [box-shadow:var(--elevation-interactive)] text-foreground font-semibold"
                                          : "border-border/50 text-muted-foreground hover:[background:var(--surface-2)] hover:border-border/80",
                                      ].join(" ")}
                                    >
                                      {value.label}
                                    </button>
                                  ))}
                                </div>
                                <div className="mt-1.5 flex flex-wrap gap-1">
                                  {([
                                    { value: "soft", label: "Suave" },
                                    { value: "medium", label: "Media" },
                                    { value: "strong", label: "Fuerte" },
                                  ] as const).map((value) => (
                                    <button
                                      key={value.value}
                                      type="button"
                                      onClick={() => setContactContrast(value.value)}
                                      className={[
                                        "rounded-full border px-2 py-1 text-[10px] font-semibold uppercase",
                                        contactContrast === value.value
                                          ? "border-border [background:var(--card)] [box-shadow:var(--elevation-interactive)] text-foreground font-semibold"
                                          : "border-border/50 text-muted-foreground hover:[background:var(--surface-2)] hover:border-border/80",
                                      ].join(" ")}
                                    >
                                      {value.label}
                                    </button>
                                  ))}
                                </div>
                              </div>
                              <div className={inspectorControlGroupClassName}>
                                <p className={inspectorControlGroupTitleClassName}>C. Interaccion</p>
                                <div className="mt-1.5 flex flex-wrap gap-1">
                                  {([
                                    { value: "none", label: "No" },
                                    { value: "soft", label: "Suave" },
                                    { value: "strong", label: "Fuerte" },
                                  ] as const).map((value) => (
                                    <button
                                      key={value.value}
                                      type="button"
                                      onClick={() => setContactHover(value.value)}
                                      className={[
                                        "rounded-full border px-2 py-1 text-[10px] font-semibold uppercase",
                                        contactHover === value.value
                                          ? "border-border [background:var(--card)] [box-shadow:var(--elevation-interactive)] text-foreground font-semibold"
                                          : "border-border/50 text-muted-foreground hover:[background:var(--surface-2)] hover:border-border/80",
                                      ].join(" ")}
                                    >
                                      hover {value.label}
                                    </button>
                                  ))}
                                </div>
                                <div className="mt-1.5 flex flex-wrap gap-1">
                                  {([
                                    { value: "none", label: "No" },
                                    { value: "lift", label: "Lift" },
                                    { value: "glow", label: "Glow" },
                                  ] as const).map((value) => (
                                    <button
                                      key={value.value}
                                      type="button"
                                      onClick={() => setContactEffect(value.value)}
                                      className={[
                                        "rounded-full border px-2 py-1 text-[10px] font-semibold uppercase",
                                        contactEffect === value.value
                                          ? "border-border [background:var(--card)] [box-shadow:var(--elevation-interactive)] text-foreground font-semibold"
                                          : "border-border/50 text-muted-foreground hover:[background:var(--surface-2)] hover:border-border/80",
                                      ].join(" ")}
                                    >
                                      efecto {value.label}
                                    </button>
                                  ))}
                                </div>
                                <div className="mt-1.5 flex flex-wrap gap-1">
                                  {([
                                    { value: "none", label: "No" },
                                    { value: "soft", label: "Suave" },
                                    { value: "medium", label: "Medio" },
                                  ] as const).map((value) => (
                                    <button
                                      key={value.value}
                                      type="button"
                                      onClick={() => setContactShadow(value.value)}
                                      className={[
                                        "rounded-full border px-2 py-1 text-[10px] font-semibold uppercase",
                                        contactShadow === value.value
                                          ? "border-border [background:var(--card)] [box-shadow:var(--elevation-interactive)] text-foreground font-semibold"
                                          : "border-border/50 text-muted-foreground hover:[background:var(--surface-2)] hover:border-border/80",
                                      ].join(" ")}
                                    >
                                      sombra {value.label}
                                    </button>
                                  ))}
                                </div>
                                <div className="mt-1.5 flex flex-wrap gap-1">
                                  <button
                                    type="button"
                                    onClick={() => setFooterIconsVisible((previous) => !previous)}
                                    className={[
                                      "rounded-full border px-2 py-1 text-[10px] font-semibold uppercase",
                                      footerIconsVisible
                                        ? "border-success [background:var(--success-soft)] [color:var(--success-foreground)]"
                                        : "border-border/50 text-muted-foreground hover:[background:var(--surface-2)] hover:border-border/80",
                                    ].join(" ")}
                                  >
                                    iconos {footerIconsVisible ? "on" : "off"}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setContactLinksVisible((previous) => !previous)}
                                    className={[
                                      "rounded-full border px-2 py-1 text-[10px] font-semibold uppercase",
                                      contactLinksVisible
                                        ? "border-success [background:var(--success-soft)] [color:var(--success-foreground)]"
                                        : "border-border/50 text-muted-foreground hover:[background:var(--surface-2)] hover:border-border/80",
                                    ].join(" ")}
                                  >
                                    links {contactLinksVisible ? "on" : "off"}
                                  </button>
                                </div>
                              </div>
                            </div>
                          ) : null}

                          {selectedPiece === "animated-signature" ? (
                            <div className="mt-2 space-y-2">
                              <div className={inspectorControlGroupClassName}>
                                <p className={inspectorControlGroupTitleClassName}>A. Tamano y tono</p>
                                <div className="mt-1.5 flex flex-wrap gap-1">
                                  {(["sm", "md", "lg"] as const).map((value) => (
                                    <button
                                      key={value}
                                      type="button"
                                      onClick={() => setSignatureSize(value)}
                                      className={[
                                        "rounded-full border px-2 py-1 text-[10px] font-semibold uppercase",
                                        signatureSize === value
                                          ? "border-border [background:var(--card)] [box-shadow:var(--elevation-interactive)] text-foreground font-semibold"
                                          : "border-border/50 text-muted-foreground hover:[background:var(--surface-2)] hover:border-border/80",
                                      ].join(" ")}
                                    >
                                      {value}
                                    </button>
                                  ))}
                                </div>
                                <div className="mt-1.5 flex flex-wrap gap-1">
                                  {([
                                    { id: "default", label: "Neutro" },
                                    { id: "muted", label: "Suave" },
                                    { id: "accent", label: "Acento" },
                                  ] as const).map((tone) => (
                                    <button
                                      key={tone.id}
                                      type="button"
                                      onClick={() => setSignatureTone(tone.id)}
                                      className={[
                                        "rounded-full border px-2 py-1 text-[10px] font-semibold uppercase",
                                        signatureTone === tone.id
                                          ? "border-border [background:var(--card)] [box-shadow:var(--elevation-interactive)] text-foreground font-semibold"
                                          : "border-border/50 text-muted-foreground hover:[background:var(--surface-2)] hover:border-border/80",
                                      ].join(" ")}
                                    >
                                      {tone.label}
                                    </button>
                                  ))}
                                </div>
                                <input
                                  type="range"
                                  min={20}
                                  max={100}
                                  step={1}
                                  value={signatureOpacity}
                                  onChange={(event) => setSignatureOpacity(Number(event.target.value))}
                                  className="mt-1.5 w-full"
                                />
                                <div className="mt-1.5 rounded-md border border-border/70 [background:var(--surface-1,var(--background))] px-2 py-1">
                                  <span
                                    className={[
                                      "inline-flex text-[10px] font-semibold tracking-tight text-foreground",
                                      signatureAnimation === "draw"
                                        ? "motion-safe:animate-[pulse_1.1s_ease-out_1]"
                                        : signatureAnimation === "pulse"
                                        ? "motion-safe:animate-pulse"
                                        : signatureAnimation === "float"
                                          ? "motion-safe:animate-[float_3.6s_ease-in-out_infinite]"
                                          : "",
                                    ].join(" ")}
                                  >
                                    Estado:{" "}
                                    {signatureAnimation === "draw"
                                      ? "Escritura"
                                      : signatureAnimation === "none"
                                        ? "No anim"
                                        : signatureAnimation}
                                  </span>
                                </div>
                              </div>
                              <div className={inspectorControlGroupClassName}>
                                <p className={inspectorControlGroupTitleClassName}>B. Animacion</p>
                                <div className="mt-1.5 flex flex-wrap gap-1">
                                  {([
                                    { value: "draw", label: "Escritura" },
                                    { value: "pulse", label: "Pulse" },
                                    { value: "float", label: "Float" },
                                    { value: "none", label: "No" },
                                  ] as const).map((value) => (
                                    <button
                                      key={value.value}
                                      type="button"
                                      onClick={() => {
                                        setSignatureAnimation(value.value);
                                        if (value.value === "draw") {
                                          setSignatureDrawRefreshKey((previous) => previous + 1);
                                        }
                                      }}
                                      title={value.label}
                                      className={[
                                        "rounded-full border px-2 py-1 text-[10px] font-semibold uppercase",
                                        signatureAnimation === value.value
                                          ? "border-border [background:var(--card)] [box-shadow:var(--elevation-interactive)] text-foreground font-semibold"
                                          : "border-border/50 text-muted-foreground hover:[background:var(--surface-2)] hover:border-border/80",
                                      ].join(" ")}
                                    >
                                      {value.label}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ) : null}

                          {selectedPiece === "background-media" ? (
                            <div className="mt-2 space-y-2">
                              <div className={inspectorControlGroupClassName}>
                                <p className={inspectorControlGroupTitleClassName}>A. Imagen activa</p>
                                <p className="text-xs text-muted-foreground">
                                  Fondo activo:{" "}
                                  <span className="font-semibold text-foreground">
                                    {selectedHeroAsset?.label ?? "sin fondo seleccionado"}
                                  </span>
                                </p>
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleVisualSourceKindChange("hero-image");
                                    setAssetPickerView("open");
                                  }}
                                  className="mt-1.5 w-full rounded-md border border-border/75 [background:var(--surface-1,var(--background))] px-2 py-1.5 text-xs font-semibold"
                                >
                                  Abrir libreria de fondos
                                </button>
                              </div>

                              <div className={inspectorControlGroupClassName}>
                                <p className={inspectorControlGroupTitleClassName}>B. Enfasis del fondo</p>
                                <div className="mt-1.5 grid grid-cols-3 gap-1">
                                  {([
                                    { value: "low", label: "Baja" },
                                    { value: "medium", label: "Media" },
                                    { value: "high", label: "Alta" },
                                  ] as const).map((value) => (
                                    <button
                                      key={value.value}
                                      type="button"
                                      onClick={() => setBackgroundEmphasis(value.value)}
                                      className={[
                                        "rounded-md border px-2 py-1 text-[10px] font-semibold uppercase",
                                        backgroundEmphasis === value.value
                                          ? "border-border [background:var(--card)] [box-shadow:var(--elevation-interactive)] text-foreground font-semibold"
                                          : "border-border/50 text-muted-foreground hover:[background:var(--surface-2)] hover:border-border/80",
                                      ].join(" ")}
                                    >
                                      {value.label}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              <div className={inspectorControlGroupClassName}>
                                <p className={inspectorControlGroupTitleClassName}>C. Ajuste de imagen</p>
                                <div className="mt-1.5 grid grid-cols-3 gap-1">
                                  {([
                                    { value: "cover", label: "Cubr.", title: "Cubrir" },
                                    { value: "contain", label: "Cont.", title: "Contener" },
                                    { value: "fill", label: "Rell.", title: "Rellenar" },
                                  ] as const).map((fit) => (
                                    <button
                                      key={fit.value}
                                      type="button"
                                      onClick={() => setBackgroundFit(fit.value)}
                                      title={fit.title}
                                      className={[
                                        "rounded-md border px-2 py-1 text-[10px] font-semibold uppercase",
                                        backgroundFit === fit.value
                                          ? "border-border [background:var(--card)] [box-shadow:var(--elevation-interactive)] text-foreground font-semibold"
                                          : "border-border/50 text-muted-foreground hover:[background:var(--surface-2)] hover:border-border/80",
                                      ].join(" ")}
                                    >
                                      {fit.label}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              <div className={inspectorControlGroupClassName}>
                                <p className={inspectorControlGroupTitleClassName}>D. Foco de imagen</p>
                                <div className="mt-1.5 grid grid-cols-5 gap-1 justify-items-center">
                                  {([
                                    { value: "center", label: "Ctr.", title: "Centro" },
                                    { value: "top", label: "Arr.", title: "Arriba" },
                                    { value: "bottom", label: "Ab.", title: "Abajo" },
                                    { value: "left", label: "Izq.", title: "Izquierda" },
                                    { value: "right", label: "Der.", title: "Derecha" },
                                  ] as const).map((focus) => (
                                    <button
                                      key={focus.value}
                                      type="button"
                                      onClick={() => setBackgroundFocus(focus.value)}
                                      title={focus.title}
                                      className={[
                                        "min-w-[1.9rem] rounded-md border px-1.5 py-1 text-[10px] font-semibold uppercase",
                                        backgroundFocus === focus.value
                                          ? "border-border [background:var(--card)] [box-shadow:var(--elevation-interactive)] text-foreground font-semibold"
                                          : "border-border/50 text-muted-foreground hover:[background:var(--surface-2)] hover:border-border/80",
                                      ].join(" ")}
                                    >
                                      {focus.label}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ) : null}

                          {selectedPiece === "overlay-atmosphere" ? (
                            <div className="mt-2 space-y-1.5">
                              <select
                                value={overlayDensity}
                                onChange={(event) => setOverlayDensity(event.target.value as HeroAppearanceVariant)}
                                className="h-8 w-full rounded-md border border-border/75 [background:var(--surface-1,var(--background))] px-2 text-xs outline-none focus:ring-2 focus:ring-ring"
                              >
                                <option value="transparent">transparent</option>
                                <option value="soft">soft</option>
                                <option value="solid">solid</option>
                              </select>
                              <select
                                value={overlayStyleMode}
                                onChange={(event) => setOverlayStyleMode(event.target.value as OverlayStyleMode)}
                                className="h-8 w-full rounded-md border border-border/75 [background:var(--surface-1,var(--background))] px-2 text-xs outline-none focus:ring-2 focus:ring-ring"
                              >
                                <option value="gradient">gradient</option>
                                <option value="solid">solid</option>
                                <option value="none">none</option>
                              </select>
                              <div className="flex flex-wrap gap-1">
                                {([
                                  {
                                    tone: "blue",
                                    label: "Azul",
                                    swatch:
                                      "[background:color-mix(in_oklab,var(--processing,var(--primary))_62%,var(--surface-1,var(--background))_38%)]",
                                  },
                                  {
                                    tone: "green",
                                    label: "Verde",
                                    swatch:
                                      "[background:color-mix(in_oklab,var(--success,var(--primary))_62%,var(--surface-1,var(--background))_38%)]",
                                  },
                                  {
                                    tone: "amber",
                                    label: "Ambar",
                                    swatch:
                                      "[background:color-mix(in_oklab,var(--warning,var(--primary))_62%,var(--surface-1,var(--background))_38%)]",
                                  },
                                  {
                                    tone: "purple",
                                    label: "Accent",
                                    swatch:
                                      "[background:color-mix(in_oklab,var(--accent,var(--primary))_62%,var(--surface-1,var(--background))_38%)]",
                                  },
                                  {
                                    tone: "smoke",
                                    label: "Neutro",
                                    swatch:
                                      "[background:color-mix(in_oklab,var(--foreground)_58%,var(--surface-1,var(--background))_42%)]",
                                  },
                                ] as const).map((item) => (
                                  <button
                                    key={item.tone}
                                    type="button"
                                    onClick={() => setOverlayTint(item.tone)}
                                    title={item.label}
                                    className={[
                                      "inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-semibold uppercase",
                                      overlayTint === item.tone
                                        ? "border-border [background:var(--card)] [box-shadow:var(--elevation-interactive)] text-foreground font-semibold"
                                        : "border-border/50 text-muted-foreground hover:[background:var(--surface-2)] hover:border-border/80",
                                    ].join(" ")}
                                  >
                                    <span className={`h-2 w-2 rounded-full ${item.swatch}`} />
                                    {item.label}
                                  </button>
                                ))}
                              </div>
                              <select
                                value={labHeadlineTone}
                                onChange={(event) => setLabHeadlineTone(event.target.value as LabHeadlineTone)}
                                className="h-8 w-full rounded-md border border-border/75 [background:var(--surface-1,var(--background))] px-2 text-xs outline-none focus:ring-2 focus:ring-ring"
                              >
                                <option value="white">white</option>
                                <option value="black">black</option>
                                <option value="inverse">inverse</option>
                                <option value="muted-light">muted-light</option>
                                <option value="warm-light">warm-light</option>
                                <option value="cool-light">cool-light</option>
                              </select>
                              <div className="grid grid-cols-3 gap-1">
                                {(["low", "medium", "high"] as const).map((value) => (
                                  <button
                                    key={value}
                                    type="button"
                                    onClick={() => setBackgroundEmphasis(value)}
                                    className={[
                                      "rounded-md border px-2 py-1 text-[10px] font-semibold uppercase",
                                      backgroundEmphasis === value
                                        ? "border-border [background:var(--card)] [box-shadow:var(--elevation-interactive)] text-foreground font-semibold"
                                        : "border-border/50 text-muted-foreground hover:[background:var(--surface-2)] hover:border-border/80",
                                    ].join(" ")}
                                  >
                                    {value}
                                  </button>
                                ))}
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {(["balanced", "primary-focus"] as const).map((value) => (
                                  <button
                                    key={value}
                                    type="button"
                                    onClick={() => setCtaRegulation(value)}
                                    className={[
                                      "rounded-full border px-2 py-1 text-[10px] font-semibold uppercase",
                                      ctaRegulation === value
                                        ? "border-border [background:var(--card)] [box-shadow:var(--elevation-interactive)] text-foreground font-semibold"
                                        : "border-border/50 text-muted-foreground hover:[background:var(--surface-2)] hover:border-border/80",
                                    ].join(" ")}
                                  >
                                    {value}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ) : null}
                        </section>

                        {selectedPieceStyle && isHeadlineOrSubheadlinePiece ? (
                          <section className={inspectorControlGroupClassName}>
                            <p className={inspectorControlGroupTitleClassName}>B. Tipografia</p>
                            <div className="mt-1.5 space-y-1.5">
                              <div>
                                <p className={inspectorMiniGroupTitleClassName}>A) Tamano</p>
                                <div className="mt-1 grid grid-cols-5 gap-1">
                                  {(["S", "M", "L", "XL", "Display"] as const).map((scale) => (
                                    <button
                                      key={scale}
                                      type="button"
                                      onClick={() => updateSelectedTextStyle("scale", scale)}
                                      className={[
                                        "rounded-full border px-2 py-1 text-[10px] font-semibold",
                                        selectedPieceStyle.scale === scale
                                          ? "border-border [background:var(--card)] [box-shadow:var(--elevation-interactive)] text-foreground font-semibold"
                                          : "border-border/50 text-muted-foreground hover:[background:var(--surface-2)] hover:border-border/80",
                                      ].join(" ")}
                                    >
                                      {scale}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              <div>
                                <p className={inspectorMiniGroupTitleClassName}>B) Peso</p>
                                <div className="mt-1 grid grid-cols-4 gap-1">
                                  {(["regular", "medium", "semibold", "bold"] as const).map((weight) => (
                                    <button
                                      key={weight}
                                      type="button"
                                      onClick={() => updateSelectedTextStyle("weight", weight)}
                                      className={[
                                        "rounded-full border px-2 py-1 text-[10px] font-semibold",
                                        selectedPieceStyle.weight === weight
                                          ? "border-border [background:var(--card)] [box-shadow:var(--elevation-interactive)] text-foreground font-semibold"
                                          : "border-border/50 text-muted-foreground hover:[background:var(--surface-2)] hover:border-border/80",
                                      ].join(" ")}
                                    >
                                      {weight}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              <div>
                                <p className={inspectorMiniGroupTitleClassName}>C) Familia</p>
                                <div className="mt-1 grid grid-cols-2 gap-1">
                                  {(["sans", "display"] as const).map((font) => (
                                    <button
                                      key={font}
                                      type="button"
                                      onClick={() => updateSelectedTextStyle("font", font)}
                                      title={font === "sans" ? "Familia Sans" : "Familia Display"}
                                      className={[
                                        "rounded-full border px-2 py-1 text-[10px] font-semibold uppercase",
                                        selectedPieceStyle.font === font
                                          ? "border-border [background:var(--card)] [box-shadow:var(--elevation-interactive)] text-foreground font-semibold"
                                          : "border-border/50 text-muted-foreground hover:[background:var(--surface-2)] hover:border-border/80",
                                      ].join(" ")}
                                    >
                                      {font}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              <div>
                                <p className={inspectorMiniGroupTitleClassName}>D) Altura de linea</p>
                                <div className="mt-1 grid grid-cols-3 gap-1">
                                  {(["tight", "normal", "relaxed"] as const).map((lineHeight) => (
                                    <button
                                      key={lineHeight}
                                      type="button"
                                      onClick={() => updateSelectedTextStyle("lineHeight", lineHeight)}
                                      title={
                                        lineHeight === "tight"
                                          ? "Linea compacta"
                                          : lineHeight === "relaxed"
                                            ? "Linea relajada"
                                            : "Linea normal"
                                      }
                                      className={[
                                        "rounded-full border px-2 py-1 text-[10px] font-semibold uppercase",
                                        selectedPieceStyle.lineHeight === lineHeight
                                          ? "border-border [background:var(--card)] [box-shadow:var(--elevation-interactive)] text-foreground font-semibold"
                                          : "border-border/50 text-muted-foreground hover:[background:var(--surface-2)] hover:border-border/80",
                                      ].join(" ")}
                                    >
                                      {lineHeight === "tight"
                                        ? "LH-T"
                                        : lineHeight === "relaxed"
                                          ? "LH-R"
                                          : "LH-N"}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              <div>
                                <p className={inspectorMiniGroupTitleClassName}>E) Espaciado</p>
                                <div className="mt-1 grid grid-cols-3 gap-1">
                                  {(["tight", "normal", "wide"] as const).map((tracking) => (
                                    <button
                                      key={tracking}
                                      type="button"
                                      onClick={() => updateSelectedTextStyle("tracking", tracking)}
                                      className={[
                                        "rounded-full border px-2 py-1 text-[10px] font-semibold uppercase",
                                        selectedPieceStyle.tracking === tracking
                                          ? "border-border [background:var(--card)] [box-shadow:var(--elevation-interactive)] text-foreground font-semibold"
                                          : "border-border/50 text-muted-foreground hover:[background:var(--surface-2)] hover:border-border/80",
                                      ].join(" ")}
                                    >
                                      {tracking === "tight" ? "TR-T" : tracking === "wide" ? "TR-W" : "TR-N"}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {selectedPiece && LAYOUT_PIECES.includes(selectedPiece as LayoutPiece) ? (
                                <div>
                                  <p className={inspectorMiniGroupTitleClassName}>F) Alineacion</p>
                                  <div className="mt-1 grid grid-cols-3 gap-1">
                                    {(["start", "center", "end"] as const).map((value) => (
                                      <button
                                        key={value}
                                        type="button"
                                        onClick={() => updateSelectedPieceStructure("align", value)}
                                        className={[
                                          "rounded-full border px-2 py-1 text-[10px] font-semibold uppercase",
                                          pieceStructure[selectedPiece as LayoutPiece].align === value
                                            ? "border-border [background:var(--card)] [box-shadow:var(--elevation-interactive)] text-foreground font-semibold"
                                            : "border-border/50 text-muted-foreground hover:[background:var(--surface-2)] hover:border-border/80",
                                        ].join(" ")}
                                      >
                                        {value === "start" ? "Izq." : value === "end" ? "Der." : "Centro"}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              ) : null}
                            </div>
                          </section>
                        ) : null}

                        {selectedPieceStyle && isHeadlineOrSubheadlinePiece ? (
                          <section className={inspectorControlGroupClassName}>
                            <p className={inspectorControlGroupTitleClassName}>C. Color y enfasis</p>
                            {isHeadlinePiece ? (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {([
                                  { id: "auto", label: "auto" },
                                  { id: "default", label: "default" },
                                  { id: "white", label: "white" },
                                  { id: "dark", label: "dark" },
                                  { id: "accent", label: "accent" },
                                  { id: "inverse", label: "inverse" },
                                ] as const).map((tone) => (
                                  <button
                                    key={tone.id}
                                    type="button"
                                    onClick={() => updateSelectedTextStyle("color", tone.id)}
                                    className={[
                                      "rounded-full border px-2 py-1 text-[10px] font-semibold uppercase",
                                      selectedPieceStyle.color === tone.id
                                        ? "border-border [background:var(--card)] [box-shadow:var(--elevation-interactive)] text-foreground font-semibold"
                                        : "border-border/50 text-muted-foreground hover:[background:var(--surface-2)] hover:border-border/80",
                                    ].join(" ")}
                                  >
                                    {tone.label}
                                  </button>
                                ))}
                              </div>
                            ) : (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {([
                                  "default",
                                  "accent",
                                  "subtle",
                                  "inverse",
                                  "highlight",
                                ] as const).map((tone) => (
                                  <button
                                    key={tone}
                                    type="button"
                                    onClick={() => updateSelectedTextStyle("color", tone)}
                                    className={[
                                      "rounded-full border px-2 py-1 text-[10px] font-semibold uppercase",
                                      selectedPieceStyle.color === tone
                                        ? "border-border [background:var(--card)] [box-shadow:var(--elevation-interactive)] text-foreground font-semibold"
                                        : "border-border/50 text-muted-foreground hover:[background:var(--surface-2)] hover:border-border/80",
                                    ].join(" ")}
                                  >
                                    {tone}
                                  </button>
                                ))}
                              </div>
                            )}
                            <div className="mt-1 flex flex-wrap gap-1">
                              {(["off", "soft", "medium"] as const).map((shadow) => (
                                <button
                                  key={shadow}
                                  type="button"
                                  onClick={() => updateSelectedTextStyle("shadow", shadow)}
                                  title={shadow === "off" ? "Sin sombra" : shadow === "soft" ? "Sombra suave" : "Sombra media"}
                                  className={[
                                    "rounded-full border px-2 py-1 text-[10px] font-semibold uppercase",
                                    selectedPieceStyle.shadow === shadow
                                      ? "border-border [background:var(--card)] [box-shadow:var(--elevation-interactive)] text-foreground font-semibold"
                                      : "border-border/50 text-muted-foreground hover:[background:var(--surface-2)] hover:border-border/80",
                                  ].join(" ")}
                                >
                                  {shadow === "off" ? "OFF" : shadow === "soft" ? "SOFT" : "MED"}
                                </button>
                              ))}
                            </div>
                            <div className="mt-1 flex flex-wrap gap-1">
                              {(["soft", "balanced", "dominant"] as const).map((emphasis) => (
                                <button
                                  key={emphasis}
                                  type="button"
                                  onClick={() => updateSelectedTextStyle("emphasis", emphasis)}
                                  className={[
                                    "rounded-full border px-2 py-1 text-[10px] font-semibold uppercase",
                                    selectedPieceStyle.emphasis === emphasis
                                      ? "border-border [background:var(--card)] [box-shadow:var(--elevation-interactive)] text-foreground font-semibold"
                                      : "border-border/50 text-muted-foreground hover:[background:var(--surface-2)] hover:border-border/80",
                                  ].join(" ")}
                                >
                                  {emphasis}
                                </button>
                              ))}
                            </div>
                          </section>
                        ) : null}

                        {isHeadlinePiece ? (
                          <section className={inspectorControlGroupClassName}>
                            <p className={inspectorControlGroupTitleClassName}>D. Transformar titular</p>
                            <div className="mt-1.5 flex flex-wrap gap-1">
                              <button
                                type="button"
                                onClick={() => proposeHeadlineTransformation("shorten")}
                                className="rounded-md border border-border/70 [background:var(--surface-1,var(--background))] px-2 py-1 text-[10px] font-semibold uppercase transition hover:[background:var(--surface-3,var(--card))]"
                              >
                                Acortar
                              </button>
                              <button
                                type="button"
                                onClick={() => proposeHeadlineTransformation("commercial")}
                                className="rounded-md border border-border/70 [background:var(--surface-1,var(--background))] px-2 py-1 text-[10px] font-semibold uppercase transition hover:[background:var(--surface-3,var(--card))]"
                              >
                                Mas comercial
                              </button>
                              <button
                                type="button"
                                onClick={() => proposeHeadlineTransformation("seo-local")}
                                className="rounded-md border border-border/70 [background:var(--surface-1,var(--background))] px-2 py-1 text-[10px] font-semibold uppercase transition hover:[background:var(--surface-3,var(--card))]"
                              >
                                SEO local
                              </button>
                            </div>
                            <div className="mt-1.5 rounded-md border border-border/75 [background:var(--surface-1,var(--background))] p-2">
                              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                                Propuesta {headlineProposalMode ? `(${headlineProposalMode})` : ""}
                              </p>
                              <p className="mt-1 text-[11px] text-foreground">
                                {headlineProposal || "Selecciona una transformacion para ver propuesta."}
                              </p>
                            </div>
                            <div className="mt-1.5 flex items-center gap-1.5">
                              <PanelButton
                                type="button"
                                variant="primary"
                                className="h-7 px-2.5 text-[10px] uppercase"
                                onClick={applyHeadlineProposal}
                                disabled={!headlineProposal?.trim()}
                              >
                                Aplicar
                              </PanelButton>
                              <PanelButton
                                type="button"
                                variant="secondary"
                                className="h-7 px-2.5 text-[10px] uppercase"
                                onClick={discardHeadlineProposal}
                                disabled={!headlineProposal?.trim() && previousHeadlineDraft === null}
                              >
                                Descartar
                              </PanelButton>
                            </div>
                          </section>
                        ) : null}

                        {isCtaGroupPiece ? (
                          <section className={inspectorControlGroupClassName}>
                            <p className={inspectorControlGroupTitleClassName}>B. Posicion</p>
                            <div className="mt-1.5 flex flex-wrap gap-1">
                              {([
                                { key: "left", label: "start" },
                                { key: "center", label: "center" },
                                { key: "right", label: "end" },
                              ] as const).map((item) => (
                                <button
                                  key={item.key}
                                  type="button"
                                  onClick={() => {
                                    const currentRow = zoneToRow(pieceZones["cta-group"]);
                                    setPieceZones((previous) => ({
                                      ...previous,
                                      "cta-group": `${currentRow}-${item.key}` as LayoutZone,
                                    }));
                                  }}
                                  className={[
                                    "rounded-full border px-2 py-1 text-[10px] font-semibold uppercase",
                                    zoneToColumn(pieceZones["cta-group"]) === item.key
                                      ? "border-border [background:var(--card)] [box-shadow:var(--elevation-interactive)] text-foreground font-semibold"
                                      : "border-border/50 text-muted-foreground hover:[background:var(--surface-2)] hover:border-border/80",
                                  ].join(" ")}
                                >
                                  {item.label}
                                </button>
                              ))}
                            </div>
                          </section>
                        ) : null}

                        {isCtaGroupPiece ? (
                          <section className={inspectorControlGroupClassName}>
                            <p className={inspectorControlGroupTitleClassName}>C. Estilo</p>
                            <div className="mt-1.5 flex flex-wrap gap-1">
                              {(["filled", "outline", "soft"] as const).map((style) => (
                                <button
                                  key={style}
                                  type="button"
                                  onClick={() => setCtaStyle(style)}
                                  className={[
                                    "rounded-full border px-2 py-1 text-[10px] font-semibold uppercase",
                                    ctaStyle === style
                                      ? "border-border [background:var(--card)] [box-shadow:var(--elevation-interactive)] text-foreground font-semibold"
                                      : "border-border/50 text-muted-foreground hover:[background:var(--surface-2)] hover:border-border/80",
                                  ].join(" ")}
                                >
                                  {style}
                                </button>
                              ))}
                            </div>
                          </section>
                        ) : null}

                        {isCtaGroupPiece ? (
                          <section className={inspectorControlGroupClassName}>
                            <p className={inspectorControlGroupTitleClassName}>D. Regulacion</p>
                            <div className="mt-1.5 flex flex-wrap gap-1">
                              {(["balanced", "primary-focus"] as const).map((value) => (
                                <button
                                  key={value}
                                  type="button"
                                  onClick={() => setCtaRegulation(value)}
                                  className={[
                                    "rounded-full border px-2 py-1 text-[10px] font-semibold uppercase",
                                    ctaRegulation === value
                                      ? "border-border [background:var(--card)] [box-shadow:var(--elevation-interactive)] text-foreground font-semibold"
                                      : "border-border/50 text-muted-foreground hover:[background:var(--surface-2)] hover:border-border/80",
                                  ].join(" ")}
                                >
                                  {value}
                                </button>
                              ))}
                            </div>
                          </section>
                        ) : null}
                          </div>
                        </section>
                      </div>
                    ) : (
                      <div className="mt-2 space-y-2 rounded-lg border border-dashed border-border/70 [background:var(--surface-2,var(--card))] p-3">
                        <p className="text-xs text-muted-foreground">Selecciona una pieza para editar.</p>
                        <div className="space-y-1">
                          {PIECE_LIBRARY.filter((piece) => pieceVisibility[piece.id]).map((piece) => (
                            <button
                              key={piece.id}
                              type="button"
                              onClick={() => handlePieceSelect(piece.id)}
                              className="w-full rounded-md border border-border/70 [background:var(--surface-1,var(--background))] px-2 py-1.5 text-left text-[11px] font-semibold text-foreground transition hover:[background:var(--surface-3,var(--card))]"
                            >
                              {piece.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </PanelCard>

                  <PanelCard variant="task" className="p-3">
                    <div className="flex items-center justify-between gap-2 border-b border-border/70 pb-2">
                      <h2 className="text-[11px] font-semibold uppercase tracking-wide text-foreground/80">
                        Evaluador
                      </h2>
                      <PanelBadge tone={qualityTone}>{qualityScore.score} / 100</PanelBadge>
                    </div>
                    <div ref={qualityGateActionsRef} className="mt-2 space-y-2">
                      {qualityDimensions.map((dimension) => (
                        <div
                          key={dimension.key}
                          className="rounded-lg border border-border/75 [background:var(--surface-2,var(--card))] p-2"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs font-semibold text-foreground">{dimension.label}</p>
                            <PanelBadge
                              tone={dimension.score >= 78 ? "success" : dimension.score >= 60 ? "warning" : "danger"}
                            >
                              {dimension.score}
                            </PanelBadge>
                          </div>
                          <p className="mt-1 text-[11px] text-muted-foreground">{dimension.warning}</p>
                          <p className="mt-1 text-[11px] text-foreground/85">{dimension.recommendation}</p>
                          <button
                            type="button"
                            onClick={() =>
                              applyDesignAdjustmentWithBackup(
                                `quality-${dimension.key}`,
                                `Ajuste ${dimension.label}`,
                                "quality",
                                () => applyQualityRecommendation(dimension.key)
                              )
                            }
                            className="mt-1.5 rounded-md border border-border/70 [background:var(--surface-1,var(--background))] px-2 py-1 text-[10px] font-semibold uppercase text-foreground transition hover:[background:var(--surface-3,var(--card))]"
                          >
                            Aplicar ajuste
                          </button>
                        </div>
                      ))}
                      {appliedSuggestionBackup && appliedSuggestionReturnTarget === "quality" ? (
                        <div ref={qualityAdjustmentDecisionRef} className="flex items-center gap-1.5">
                          <PanelButton
                            type="button"
                            variant="primary"
                            className="h-7 px-2.5 text-[10px] uppercase"
                            onClick={confirmAppliedSuggestion}
                          >
                            Confirmar ajuste
                          </PanelButton>
                          <PanelButton
                            type="button"
                            variant="secondary"
                            className="h-7 px-2.5 text-[10px] uppercase"
                            onClick={discardAppliedSuggestion}
                          >
                            Descartar ajuste
                          </PanelButton>
                        </div>
                      ) : null}
                    </div>
                  </PanelCard>
                </>
              ) : (
                <>
                  <PanelCard variant="task" className="p-3">
                    <h2 className="text-[11px] font-semibold uppercase tracking-wide text-foreground/80">
                      Inspector estructural
                    </h2>

                    {selectedPiece && LAYOUT_PIECES.includes(selectedPiece as LayoutPiece) ? (
                      <div className="mt-2 space-y-2">
                        <PanelBadge tone="processing">{pieceLabel(selectedPiece)}</PanelBadge>

                        <div className="rounded-lg border border-border/75 [background:var(--surface-2,var(--card))] p-2">
                          <p className="text-[11px] text-muted-foreground">
                            Zona actual: <span className="font-semibold text-foreground">{zoneLabel(pieceZones[selectedPiece as LayoutPiece])}</span>
                          </p>

                          <div className="mt-2 grid gap-1.5">
                            <div className="flex flex-wrap gap-1">
                              {(["start", "center", "end"] as const).map((value) => (
                                <button
                                  key={value}
                                  type="button"
                                  onClick={() => updateSelectedPieceStructure("align", value)}
                                  className={[
                                    "rounded-full border px-2 py-1 text-[10px] font-semibold uppercase",
                                    pieceStructure[selectedPiece as LayoutPiece].align === value
                                      ? "border-border [background:var(--card)] [box-shadow:var(--elevation-interactive)] text-foreground font-semibold"
                                      : "border-border/50 text-muted-foreground hover:[background:var(--surface-2)] hover:border-border/80",
                                  ].join(" ")}
                                >
                                  {value}
                                </button>
                              ))}
                            </div>

                            <div className="flex flex-wrap gap-1">
                              {(["narrow", "medium", "wide"] as const).map((value) => (
                                <button
                                  key={value}
                                  type="button"
                                  onClick={() => updateSelectedPieceStructure("width", value)}
                                  className={[
                                    "rounded-full border px-2 py-1 text-[10px] font-semibold uppercase",
                                    pieceStructure[selectedPiece as LayoutPiece].width === value
                                      ? "border-border [background:var(--card)] [box-shadow:var(--elevation-interactive)] text-foreground font-semibold"
                                      : "border-border/50 text-muted-foreground hover:[background:var(--surface-2)] hover:border-border/80",
                                  ].join(" ")}
                                >
                                  {value}
                                </button>
                              ))}
                            </div>

                            <div className="flex flex-wrap gap-1">
                              {(["soft", "balanced", "dominant"] as const).map((value) => (
                                <button
                                  key={value}
                                  type="button"
                                  onClick={() => updateSelectedPieceStructure("emphasis", value)}
                                  className={[
                                    "rounded-full border px-2 py-1 text-[10px] font-semibold uppercase",
                                    pieceStructure[selectedPiece as LayoutPiece].emphasis === value
                                      ? "border-border [background:var(--card)] [box-shadow:var(--elevation-interactive)] text-foreground font-semibold"
                                      : "border-border/50 text-muted-foreground hover:[background:var(--surface-2)] hover:border-border/80",
                                  ].join(" ")}
                                >
                                  {value}
                                </button>
                              ))}
                            </div>

                            <div className="flex flex-wrap gap-1">
                              {(["compact", "normal", "relaxed"] as const).map((value) => (
                                <button
                                  key={value}
                                  type="button"
                                  onClick={() => updateSelectedPieceStructure("spacing", value)}
                                  className={[
                                    "rounded-full border px-2 py-1 text-[10px] font-semibold uppercase",
                                    pieceStructure[selectedPiece as LayoutPiece].spacing === value
                                      ? "border-border [background:var(--card)] [box-shadow:var(--elevation-interactive)] text-foreground font-semibold"
                                      : "border-border/50 text-muted-foreground hover:[background:var(--surface-2)] hover:border-border/80",
                                  ].join(" ")}
                                >
                                  {value}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-2 space-y-2">
                        <div className="rounded-lg border border-border/75 [background:var(--surface-2,var(--card))] p-2">
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                            Globales de blueprint
                          </p>

                          <div className="mt-2 grid gap-1.5">
                            <div className="flex flex-wrap gap-1">
                              {(["compact", "balanced", "airy"] as const).map((value) => (
                                <button
                                  key={value}
                                  type="button"
                                  onClick={() => setLayoutDensity(value)}
                                  className={[
                                    "rounded-full border px-2 py-1 text-[10px] font-semibold uppercase",
                                    layoutDensity === value
                                      ? "border-border [background:var(--card)] [box-shadow:var(--elevation-interactive)] text-foreground font-semibold"
                                      : "border-border/50 text-muted-foreground hover:[background:var(--surface-2)] hover:border-border/80",
                                  ].join(" ")}
                                >
                                  {value}
                                </button>
                              ))}
                            </div>

                            <div className="flex flex-wrap gap-1">
                              {(["copy-first", "balanced", "media-first"] as const).map((value) => (
                                <button
                                  key={value}
                                  type="button"
                                  onClick={() => setLayoutBalance(value)}
                                  className={[
                                    "rounded-full border px-2 py-1 text-[10px] font-semibold uppercase",
                                    layoutBalance === value
                                      ? "border-border [background:var(--card)] [box-shadow:var(--elevation-interactive)] text-foreground font-semibold"
                                      : "border-border/50 text-muted-foreground hover:[background:var(--surface-2)] hover:border-border/80",
                                  ].join(" ")}
                                >
                                  {value}
                                </button>
                              ))}
                            </div>

                            <div className="flex flex-wrap gap-1">
                              {(["narrow", "medium", "wide"] as const).map((value) => (
                                <button
                                  key={value}
                                  type="button"
                                  onClick={() => setLayoutContentWidth(value)}
                                  className={[
                                    "rounded-full border px-2 py-1 text-[10px] font-semibold uppercase",
                                    layoutContentWidth === value
                                      ? "border-border [background:var(--card)] [box-shadow:var(--elevation-interactive)] text-foreground font-semibold"
                                      : "border-border/50 text-muted-foreground hover:[background:var(--surface-2)] hover:border-border/80",
                                  ].join(" ")}
                                >
                                  {value}
                                </button>
                              ))}
                            </div>

                            <div className="flex flex-wrap gap-1">
                              {(["low", "medium", "high"] as const).map((value) => (
                                <button
                                  key={value}
                                  type="button"
                                  onClick={() => setLayoutMediaDominance(value)}
                                  className={[
                                    "rounded-full border px-2 py-1 text-[10px] font-semibold uppercase",
                                    layoutMediaDominance === value
                                      ? "border-border [background:var(--card)] [box-shadow:var(--elevation-interactive)] text-foreground font-semibold"
                                      : "border-border/50 text-muted-foreground hover:[background:var(--surface-2)] hover:border-border/80",
                                  ].join(" ")}
                                >
                                  {value}
                                </button>
                              ))}
                            </div>

                            <div className="flex flex-wrap gap-1">
                              {(["tight", "normal", "relaxed"] as const).map((value) => (
                                <button
                                  key={value}
                                  type="button"
                                  onClick={() => setLayoutSafeArea(value)}
                                  className={[
                                    "rounded-full border px-2 py-1 text-[10px] font-semibold uppercase",
                                    layoutSafeArea === value
                                      ? "border-border [background:var(--card)] [box-shadow:var(--elevation-interactive)] text-foreground font-semibold"
                                      : "border-border/50 text-muted-foreground hover:[background:var(--surface-2)] hover:border-border/80",
                                  ].join(" ")}
                                >
                                  {value}
                                </button>
                              ))}
                            </div>
                          </div>

                          <p className="mt-2 text-[11px] text-muted-foreground">{layoutGlobalSummary}</p>
                        </div>
                      </div>
                    )}
                  </PanelCard>

                  <PanelCard variant="task" className="p-3">
                    <h2 className="text-[11px] font-semibold uppercase tracking-wide text-foreground/80">
                      Alertas
                    </h2>

                    <div className="mt-2 rounded-lg border border-border/75 [background:var(--surface-2,var(--card))] p-2">
                      {structuralWarnings.length === 0 ? (
                        <p className="text-xs text-success">Sin alertas estructurales.</p>
                      ) : (
                        <ul className="space-y-1 text-[11px] text-muted-foreground">
                          {structuralWarnings.map((warning) => (
                            <li key={warning}>- {warning}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </PanelCard>
                </>
              )}

              <PanelCard className="mt-4 p-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Quality Gate</h3>
                  <PanelBadge tone="processing">Score {validation.score}</PanelBadge>
                </div>

                <div className="mt-2 text-xs text-muted-foreground">
                  Avisos: {validation.warnings.length} · Bloqueos: {validation.blockers.length}
                </div>

                {validation.blockers.length > 0 ? (
                  <div className="mt-2 text-xs text-foreground">{validation.blockers.join(" · ")}</div>
                ) : null}
              </PanelCard>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}

