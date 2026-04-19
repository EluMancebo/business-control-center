"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
} from "react";
import PublicHero from "@/components/web/hero/PublicHero";
import BrandHydrator from "@/components/brand/BrandHydrator";
import type { BrandScope } from "@/lib/brand/storage";
import {
  createDefaultFreeLayout,
  type FreeLayoutDraft,
  type FreeLayoutSlot,
  type FreeLayoutViewportId,
} from "@/lib/content-lab/free-layout/types";
import { mapPublishedSnapshotToContentPayload } from "@/lib/content-lab/published/mapPublishedSnapshotToContentPayload";
import type { PublishedPieceSnapshot } from "@/lib/content-lab/published/types";
import type { HeroAppearanceVariant } from "@/lib/web/hero/types";
import type { AssetItem } from "@/lib/taller/media/types";
import { fetchSystemMediaClientByQuery } from "@/lib/taller/media/service";
import {
  getTallerLabVisualCssVars,
  getTallerPanelVisualCssVars,
} from "@/lib/panel/tallerVisualContract";

type CandidateId = "barber-pro" | "urban-studio";
type PreviewViewport = FreeLayoutViewportId;
type MenuStyle = "opaque" | "integrated";
type CopyWidth = "compact" | "balanced" | "expanded";
type PositionX = "left" | "center" | "right";
type CopyBlockPosition = "left" | "center-left" | "center" | "right";
type CtaPosition = "start" | "center" | "end";
type OverlayColor = "blue" | "green" | "amber" | "purple" | "smoke";
type OverlayStyleMode = "gradient" | "solid" | "none";
type LabHeadlineTone =
  | "white"
  | "black"
  | "inverse"
  | "muted-light"
  | "warm-light"
  | "cool-light";
type PositionXOverride = PositionX | "auto";
type CopyBlockPositionOverride = CopyBlockPosition | "auto";
type BackgroundEmphasis = "low" | "medium" | "high";
type CtaMode = "balanced" | "primary-focus";
type Verdict = "weak" | "promising" | "preset-candidate";
type LabComponentType = "hero" | "banner" | "landing";
type HeroLayoutType = "centered" | "split" | "logo-focus" | "media-heavy";
type ActionPriority = "alta" | "media" | "baja";
type CanvasMode = "preview" | "layout";
type SourceMode = "preset" | "hero-safe-media";
type HierarchyScale = "compact" | "balanced" | "expressive";
type SeparationLevel = "tight" | "normal" | "relaxed";
type NavTriggerSize = "sm" | "md" | "lg";
type NavTriggerAura = "none" | "soft" | "strong";
type NavTriggerSurface = "minimal" | "solid" | "glass";
type NavTriggerTone = "inverse" | "primary" | "muted";
type NavTriggerHover = "soft" | "lift" | "glow";
type DesktopNavSize = "sm" | "md" | "lg";
type DesktopNavTone = "inverse" | "primary" | "muted";
type DesktopNavSurface = "minimal" | "solid" | "glass";
type DesktopNavHover = "soft" | "lift" | "glow";
type DesktopNavPresence = "low" | "medium" | "high";
type NavigationEditTarget = "auto" | "desktop" | "burger";
type NavOpenBehavior = "overlay" | "drawer" | "fullscreen";
type NavPanelWidth = "narrow" | "normal" | "wide";
type NavPanelOrigin = "right" | "left" | "center";
type NavPanelStyle = "solid" | "glass" | "minimal";
type NavOverlayDensity = "low" | "medium" | "high";
type NavOverlayStyle = "tinted" | "neutral" | "none";
type NavReadabilityBoost = "none" | "soft" | "strong";
type NavMenuBlockPosition = "top" | "center" | "bottom";
type NavMenuAlignment = "left" | "center" | "right";
type NavMenuItemSize = "sm" | "md" | "lg";
type NavMenuSafeOffset = "tight" | "normal" | "relaxed";
type NavMenuVerticalSpacing = "tight" | "normal" | "relaxed";
type NavMenuTextTone = "inverse" | "muted" | "primary";
type HeaderIntegration = "integrated" | "separated";
type HeaderVisualStyle = "minimal" | "solid" | "glass";
type HeaderTopSpacing = "tight" | "normal" | "relaxed";
type HeaderRelation = "balanced" | "logo-focus" | "nav-focus";
type FooterIntegration = "integrated" | "separated";
type FooterVisualStyle = "minimal" | "solid" | "glass";
type FooterDensity = "compact" | "balanced" | "spacious";
type FooterSignatureSeparation = "tight" | "normal" | "relaxed";
type BriefObjective = "bookings" | "services" | "campaign";
type BriefTone = "premium" | "close" | "urgent";
type BriefAudience = "new-clients" | "returning-clients" | "mixed";
type BriefCtaIntent = "direct-booking" | "service-discovery" | "conversation";
type BriefPriority = "conversion" | "clarity" | "brand";

type Metric = {
  score: number;
  level: "alto" | "medio" | "bajo";
  reasons: string[];
};

type HeroBrief = {
  objective: BriefObjective;
  tone: BriefTone;
  audience: BriefAudience;
  ctaIntent: BriefCtaIntent;
  priority: BriefPriority;
};

type CtaSuggestion = {
  primary: string;
  secondary: string;
};

type RecommendedAction = {
  priority: ActionPriority;
  action: string;
  reason: string;
};

type QualityScoreItem = {
  key: "conversion" | "communication" | "visual-design" | "ux-ui" | "responsive" | "seo-a11y-perf";
  label: string;
  score: number;
  note: string;
};

type HeroSafeMediaSource = {
  id: string;
  label: string;
  url: string;
  thematic: string;
  sector: string;
  component: string;
  derived: string;
  format: string;
  ratio: string;
  scope: string;
  allowedComponents: string;
  reviewState: string;
};

const BRIEF_OBJECTIVE_LABEL: Record<BriefObjective, string> = {
  bookings: "Captar reservas",
  services: "Descubrir servicios",
  campaign: "Campana temporal",
};

const BRIEF_TONE_LABEL: Record<BriefTone, string> = {
  premium: "Premium",
  close: "Cercano",
  urgent: "Urgente",
};

const BRIEF_AUDIENCE_LABEL: Record<BriefAudience, string> = {
  "new-clients": "Nuevos clientes",
  "returning-clients": "Clientes recurrentes",
  mixed: "Mixta",
};

const BRIEF_CTA_INTENT_LABEL: Record<BriefCtaIntent, string> = {
  "direct-booking": "Reserva directa",
  "service-discovery": "Explorar servicios",
  conversation: "Conversacion guiada",
};

const BRIEF_PRIORITY_LABEL: Record<BriefPriority, string> = {
  conversion: "Conversion",
  clarity: "Claridad",
  brand: "Marca",
};

const COMPONENT_TYPE_LABEL: Record<LabComponentType, string> = {
  hero: "Hero",
  banner: "Banner",
  landing: "Landing",
};

const COMPONENT_TYPES: readonly { id: LabComponentType; status: "active" | "planned" }[] = [
  { id: "hero", status: "active" },
  { id: "banner", status: "planned" },
  { id: "landing", status: "planned" },
];
const FUTURE_COMPONENT_TYPES_COUNT = 3;

const viewportIconClassName = "h-4 w-4";

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

function WideDesktopIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <rect x="2.5" y="5" width="19" height="11" rx="1.8" />
      <path d="M8.5 20h7M12 16v4M18.8 7.8l2.2 2.2-2.2 2.2" />
    </svg>
  );
}

const VIEWPORT_BUTTON_LABEL: Record<
  PreviewViewport,
  { label: string; Icon: (props: { className?: string }) => ReactElement }
> = {
  mobile: { Icon: SmartphoneIcon, label: "mobile" },
  tablet: { Icon: TabletIcon, label: "tablet" },
  desktop: { Icon: DesktopIcon, label: "desktop" },
  wide: { Icon: WideDesktopIcon, label: "wide" },
};

const HERO_LAYOUT_TYPES: readonly HeroLayoutType[] = [
  "centered",
  "split",
  "logo-focus",
  "media-heavy",
];

const HERO_LAYOUT_CLASS: Record<
  HeroLayoutType,
  {
    navPosition: PositionX;
    headlinePosition: PositionX;
    copyBlockPosition: CopyBlockPosition;
    ctaPosition: CtaPosition;
    footerPosition: PositionX;
    visualPosition: PositionX;
    logoPosition: PositionX;
  }
> = {
  centered: {
    navPosition: "center",
    headlinePosition: "center",
    copyBlockPosition: "center",
    ctaPosition: "center",
    footerPosition: "center",
    visualPosition: "center",
    logoPosition: "center",
  },
  split: {
    navPosition: "left",
    headlinePosition: "left",
    copyBlockPosition: "left",
    ctaPosition: "start",
    footerPosition: "left",
    visualPosition: "right",
    logoPosition: "left",
  },
  "logo-focus": {
    navPosition: "center",
    headlinePosition: "center",
    copyBlockPosition: "center-left",
    ctaPosition: "center",
    footerPosition: "center",
    visualPosition: "center",
    logoPosition: "center",
  },
  "media-heavy": {
    navPosition: "right",
    headlinePosition: "right",
    copyBlockPosition: "right",
    ctaPosition: "end",
    footerPosition: "right",
    visualPosition: "left",
    logoPosition: "right",
  },
};

const HERO_LAYOUT_LABEL: Record<HeroLayoutType, string> = {
  centered: "Centered",
  split: "Split",
  "logo-focus": "Logo focus",
  "media-heavy": "Media heavy",
};

const OVERLAY_TINT_PREVIEW_CLASS: Record<OverlayColor, string> = {
  blue: "bg-gradient-to-r from-blue-700 to-slate-900",
  green: "bg-gradient-to-r from-emerald-700 to-teal-900",
  amber: "bg-gradient-to-r from-amber-700 to-stone-900",
  purple: "bg-gradient-to-r from-violet-700 to-indigo-900",
  smoke: "bg-gradient-to-r from-slate-700 to-slate-950",
};

const LAB_HEADLINE_TONE_LABEL: Record<LabHeadlineTone, string> = {
  white: "white",
  black: "black",
  inverse: "inverse",
  "muted-light": "muted light",
  "warm-light": "warm light",
  "cool-light": "cool light",
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
        "Snapshot publicado -> mapper -> HeroData -> renderer real en una sola superficie de validacion.",
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
        "El laboratorio orquesta configuracion visual en vivo mientras mantiene el renderer real del proyecto.",
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

const VIEWPORTS: Record<
  PreviewViewport,
  { width: number; height: number; navigationMode: "mobile" | "desktop" }
> = {
  mobile: { width: 375, height: 812, navigationMode: "mobile" },
  tablet: { width: 768, height: 1024, navigationMode: "mobile" },
  desktop: { width: 1280, height: 800, navigationMode: "desktop" },
  wide: { width: 1440, height: 900, navigationMode: "desktop" },
};
const SHOW_LAYOUT_GUIDES = false;
const PREVIEW_STAGE_HORIZONTAL_PADDING = 24;
const PREVIEW_STAGE_VERTICAL_PADDING = 40;
const WORKSPACE_VIEWPORT_BOTTOM_GUTTER = 12;
const HERO_SOURCE_ALLOWED_CONTEXT = "home.hero.background";
const HERO_SOURCE_ALLOWED_CONTEXT_LEGACY = "hero.background";

function greatestCommonDivisor(a: number, b: number): number {
  let x = Math.max(1, Math.abs(Math.round(a)));
  let y = Math.max(1, Math.abs(Math.round(b)));
  while (y !== 0) {
    const temp = y;
    y = x % y;
    x = temp;
  }
  return x;
}

function toRatioLabel(width: number, height: number): string {
  if (!width || !height) return "n/a";
  const divisor = greatestCommonDivisor(width, height);
  const ratioW = Math.max(1, Math.round(width / divisor));
  const ratioH = Math.max(1, Math.round(height / divisor));
  return `${ratioW}:${ratioH}`;
}

function readTag(tags: string[], prefix: string): string {
  const match = tags.find((tag) => tag.startsWith(prefix));
  if (!match) return "";
  return match.slice(prefix.length).trim();
}

function includesHeroAllowedContext(allowedIn: string[]): boolean {
  return allowedIn.some(
    (item) => item === HERO_SOURCE_ALLOWED_CONTEXT || item === HERO_SOURCE_ALLOWED_CONTEXT_LEGACY
  );
}

function variantScore(item: AssetItem): number {
  if (item.variantKey === "optimized") return 40;
  if (item.variantKey === "original") return 30;
  if (item.variantKey === "thumbnail") return 20;
  return 10;
}

function toHeroSafeMediaSources(items: AssetItem[]): HeroSafeMediaSource[] {
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
    if (!previous || variantScore(item) > variantScore(previous)) {
      groupedBySource.set(rootId, item);
    }
  });

  return Array.from(groupedBySource.values())
    .sort((a, b) => {
      if (variantScore(a) !== variantScore(b)) return variantScore(b) - variantScore(a);
      return b.updatedAt?.localeCompare(a.updatedAt || "") || 0;
    })
    .map((item) => {
      const thematic = readTag(item.tags, "intent:") || readTag(item.tags, "style:") || "general";
      const sector = readTag(item.tags, "sector:") || "general";
      const component = readTag(item.tags, "visual:") || "photo";
      const mimeParts = item.mime.split("/");
      const format = mimeParts[mimeParts.length - 1] || "unknown";

      return {
        id: item._id,
        label: item.label || "Asset sin nombre",
        url: item.url,
        thematic,
        sector,
        component,
        derived: item.variantKey,
        format,
        ratio: toRatioLabel(item.width, item.height),
        scope: item.scope,
        allowedComponents:
          item.allowedIn.length > 0 ? item.allowedIn.join(", ") : HERO_SOURCE_ALLOWED_CONTEXT,
        reviewState: `${item.status} / ${item.pipelineStatus}`,
      };
    });
}

const SCENE_OVERLAY_GRADIENT_TINT_CLASS: Record<OverlayColor, string> = {
  blue:
    "[background:linear-gradient(136deg,color-mix(in_oklab,var(--processing,var(--accent,var(--primary)))_78%,var(--hero-overlay-strong,var(--foreground))),color-mix(in_oklab,var(--accent-soft,var(--surface-3,var(--muted)))_54%,var(--hero-overlay,var(--foreground)))_48%,color-mix(in_oklab,var(--hero-overlay-strong,var(--foreground))_80%,var(--foreground)))]",
  green:
    "[background:linear-gradient(136deg,color-mix(in_oklab,var(--success,var(--accent,var(--primary)))_78%,var(--hero-overlay-strong,var(--foreground))),color-mix(in_oklab,var(--accent-soft,var(--surface-3,var(--muted)))_54%,var(--hero-overlay,var(--foreground)))_48%,color-mix(in_oklab,var(--hero-overlay-strong,var(--foreground))_80%,var(--foreground)))]",
  amber:
    "[background:linear-gradient(136deg,color-mix(in_oklab,var(--warning,var(--accent,var(--primary)))_78%,var(--hero-overlay-strong,var(--foreground))),color-mix(in_oklab,var(--accent-soft,var(--surface-3,var(--muted)))_54%,var(--hero-overlay,var(--foreground)))_48%,color-mix(in_oklab,var(--hero-overlay-strong,var(--foreground))_80%,var(--foreground)))]",
  purple:
    "[background:linear-gradient(136deg,color-mix(in_oklab,var(--accent-strong,var(--accent,var(--primary)))_78%,var(--hero-overlay-strong,var(--foreground))),color-mix(in_oklab,var(--accent-soft,var(--surface-3,var(--muted)))_54%,var(--hero-overlay,var(--foreground)))_48%,color-mix(in_oklab,var(--hero-overlay-strong,var(--foreground))_80%,var(--foreground)))]",
  smoke:
    "[background:linear-gradient(136deg,color-mix(in_oklab,var(--foreground,var(--primary))_80%,var(--hero-overlay-strong,var(--foreground))),color-mix(in_oklab,var(--surface-3,var(--muted))_58%,var(--hero-overlay,var(--foreground)))_48%,color-mix(in_oklab,var(--hero-overlay-strong,var(--foreground))_82%,var(--foreground)))]",
};

const SCENE_OVERLAY_SOLID_TINT_CLASS: Record<OverlayColor, string> = {
  blue:
    "[background:color-mix(in_oklab,var(--processing,var(--accent,var(--primary)))_74%,var(--hero-overlay-strong,var(--foreground)))]",
  green:
    "[background:color-mix(in_oklab,var(--success,var(--accent,var(--primary)))_74%,var(--hero-overlay-strong,var(--foreground)))]",
  amber:
    "[background:color-mix(in_oklab,var(--warning,var(--accent,var(--primary)))_74%,var(--hero-overlay-strong,var(--foreground)))]",
  purple:
    "[background:color-mix(in_oklab,var(--accent-strong,var(--accent,var(--primary)))_74%,var(--hero-overlay-strong,var(--foreground)))]",
  smoke:
    "[background:color-mix(in_oklab,var(--foreground,var(--primary))_78%,var(--hero-overlay-strong,var(--foreground)))]",
};

const SCENE_OVERLAY_OPACITY_CLASS: Record<
  HeroAppearanceVariant,
  Record<BackgroundEmphasis, string>
> = {
  transparent: {
    low: "opacity-32",
    medium: "opacity-24",
    high: "opacity-18",
  },
  soft: {
    low: "opacity-46",
    medium: "opacity-38",
    high: "opacity-30",
  },
  solid: {
    low: "opacity-58",
    medium: "opacity-50",
    high: "opacity-42",
  },
};

function clamp(value: number): number {
  return Math.min(100, Math.max(0, Math.round(value)));
}

function levelFromPositive(score: number): "alto" | "medio" | "bajo" {
  if (score >= 75) return "alto";
  if (score >= 50) return "medio";
  return "bajo";
}

function levelFromNoise(score: number): "alto" | "medio" | "bajo" {
  if (score >= 70) return "alto";
  if (score >= 45) return "medio";
  return "bajo";
}

function evalMetricPositive(score: number, reasons: string[]): Metric {
  return { score: clamp(score), level: levelFromPositive(score), reasons };
}

function evalMetricNoise(score: number, reasons: string[]): Metric {
  return { score: clamp(score), level: levelFromNoise(score), reasons };
}

function formatRectPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

type SessionRole = "admin" | "owner" | "marketing" | "staff" | null;

function resolveLabBrandScopeFromRole(role: SessionRole): Extract<BrandScope, "panel" | "studio"> {
  return role === "admin" ? "studio" : "panel";
}

export default function PublishedHeroLabPage({
  disableInternalBrandHydrator = false,
}: {
  disableInternalBrandHydrator?: boolean;
}) {
  const [brandScope, setBrandScope] = useState<Extract<BrandScope, "panel" | "studio">>("panel");
  const [sessionRole, setSessionRole] = useState<SessionRole>(null);
  const [componentType, setComponentType] = useState<LabComponentType>("hero");
  const [candidateId, setCandidateId] = useState<CandidateId>("barber-pro");
  const [sourceMode, setSourceMode] = useState<SourceMode>("preset");
  const [heroSafeMediaSources, setHeroSafeMediaSources] = useState<HeroSafeMediaSource[]>([]);
  const [heroSafeMediaSourceId, setHeroSafeMediaSourceId] = useState<string>("");
  const [heroSafeMediaState, setHeroSafeMediaState] = useState<
    "idle" | "loading" | "ready" | "error"
  >("loading");
  const [heroSafeMediaError, setHeroSafeMediaError] = useState<string>("");
  const [brief, setBrief] = useState<HeroBrief>({
    objective: "bookings",
    tone: "premium",
    audience: "new-clients",
    ctaIntent: "direct-booking",
    priority: "conversion",
  });
  const [viewport, setViewport] = useState<PreviewViewport>("mobile");
  const [canvasMode, setCanvasMode] = useState<CanvasMode>("preview");
  const [heroLayoutType, setHeroLayoutType] = useState<HeroLayoutType>("split");
  const [menuStyle] = useState<MenuStyle>("integrated");
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [navigationEditTarget, setNavigationEditTarget] = useState<NavigationEditTarget>("auto");
  const [navTriggerSize, setNavTriggerSize] = useState<NavTriggerSize>("md");
  const [navTriggerAura, setNavTriggerAura] = useState<NavTriggerAura>("none");
  const [navTriggerSurface, setNavTriggerSurface] = useState<NavTriggerSurface>("minimal");
  const [navTriggerTone, setNavTriggerTone] = useState<NavTriggerTone>("inverse");
  const [navTriggerHover, setNavTriggerHover] = useState<NavTriggerHover>("soft");
  const [desktopNavSize, setDesktopNavSize] = useState<DesktopNavSize>("md");
  const [desktopNavTone, setDesktopNavTone] = useState<DesktopNavTone>("muted");
  const [desktopNavSurface, setDesktopNavSurface] = useState<DesktopNavSurface>("solid");
  const [desktopNavHover, setDesktopNavHover] = useState<DesktopNavHover>("soft");
  const [desktopNavPresence, setDesktopNavPresence] = useState<DesktopNavPresence>("medium");
  const [navOpenBehavior, setNavOpenBehavior] = useState<NavOpenBehavior>("overlay");
  const [navPanelWidth, setNavPanelWidth] = useState<NavPanelWidth>("normal");
  const [navPanelOrigin, setNavPanelOrigin] = useState<NavPanelOrigin>("right");
  const [navPanelIncludeLogo, setNavPanelIncludeLogo] = useState<boolean>(true);
  const [navPanelStyle, setNavPanelStyle] = useState<NavPanelStyle>("solid");
  const [navOverlayDensity, setNavOverlayDensity] = useState<NavOverlayDensity>("medium");
  const [navOverlayStyle, setNavOverlayStyle] = useState<NavOverlayStyle>("tinted");
  const [navReadabilityBoost, setNavReadabilityBoost] = useState<NavReadabilityBoost>("soft");
  const [navMenuBlockPosition, setNavMenuBlockPosition] =
    useState<NavMenuBlockPosition>("top");
  const [navMenuAlignment, setNavMenuAlignment] = useState<NavMenuAlignment>("left");
  const [navMenuItemSize, setNavMenuItemSize] = useState<NavMenuItemSize>("md");
  const [navMenuSafeTopOffset, setNavMenuSafeTopOffset] =
    useState<NavMenuSafeOffset>("normal");
  const [navMenuSafeSideOffset, setNavMenuSafeSideOffset] =
    useState<NavMenuSafeOffset>("normal");
  const [navMenuVerticalSpacing, setNavMenuVerticalSpacing] =
    useState<NavMenuVerticalSpacing>("normal");
  const [navMenuTextTone, setNavMenuTextTone] = useState<NavMenuTextTone>("inverse");
  const [headerIntegration, setHeaderIntegration] = useState<HeaderIntegration>("integrated");
  const [headerVisualStyle, setHeaderVisualStyle] = useState<HeaderVisualStyle>("solid");
  const [headerTopSpacing, setHeaderTopSpacing] = useState<HeaderTopSpacing>("normal");
  const [headerRelation, setHeaderRelation] = useState<HeaderRelation>("balanced");
  const [footerIntegration, setFooterIntegration] = useState<FooterIntegration>("integrated");
  const [footerVisualStyle, setFooterVisualStyle] = useState<FooterVisualStyle>("solid");
  const [footerDensity, setFooterDensity] = useState<FooterDensity>("balanced");
  const [footerSignatureSeparation, setFooterSignatureSeparation] =
    useState<FooterSignatureSeparation>("normal");
  const [footerPositionOverride, setFooterPositionOverride] = useState<PositionXOverride>("auto");
  const [copyWidth, setCopyWidth] = useState<CopyWidth>("balanced");
  const [mobileHeadlineScale, setMobileHeadlineScale] = useState<HierarchyScale>("balanced");
  const [mobileLogoScale, setMobileLogoScale] = useState<HierarchyScale>("balanced");
  const [gapLogoHeadline, setGapLogoHeadline] = useState<SeparationLevel>("normal");
  const [gapHeadlineSubheadline, setGapHeadlineSubheadline] = useState<SeparationLevel>("normal");
  const [gapTextCta, setGapTextCta] = useState<SeparationLevel>("normal");
  const [gapCtaFooter, setGapCtaFooter] = useState<SeparationLevel>("normal");
  const [gapFooterDataSignature, setGapFooterDataSignature] = useState<SeparationLevel>("normal");
  const [ctaMode, setCtaMode] = useState<CtaMode>("balanced");
  const [overlayMode, setOverlayMode] = useState<HeroAppearanceVariant>("soft");
  const [overlayStyleMode, setOverlayStyleMode] = useState<OverlayStyleMode>("gradient");
  const [overlayColor, setOverlayColor] = useState<OverlayColor>("blue");
  const [labHeadlineTone, setLabHeadlineTone] = useState<LabHeadlineTone>("white");
  const [backgroundEmphasis, setBackgroundEmphasis] = useState<BackgroundEmphasis>("medium");
  const [navPositionOverride, setNavPositionOverride] = useState<PositionXOverride>("auto");
  const [logoPositionOverride, setLogoPositionOverride] = useState<PositionXOverride>("auto");
  const [visualPositionOverride, setVisualPositionOverride] = useState<PositionXOverride>("auto");
  const [copyBlockPositionOverride, setCopyBlockPositionOverride] =
    useState<CopyBlockPositionOverride>("auto");
  const [badgeVisible, setBadgeVisible] = useState<boolean>(true);
  const [headlineDraft, setHeadlineDraft] = useState<string>("");
  const [subheadlineDraft, setSubheadlineDraft] = useState<string>("");
  const [primaryCtaDraft, setPrimaryCtaDraft] = useState<string>("");
  const [secondaryCtaDraft, setSecondaryCtaDraft] = useState<string>("");
  const workspaceViewportRef = useRef<HTMLElement | null>(null);
  const [workspaceViewportHeight, setWorkspaceViewportHeight] = useState<number | null>(null);
  const previewStageRef = useRef<HTMLDivElement | null>(null);
  const [previewStageSize, setPreviewStageSize] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });

  const viewportConfig = VIEWPORTS[viewport];
  const canvasWidth = viewportConfig.width;
  const canvasHeight = viewportConfig.height;
  const canEditDesktopNavigation = viewportConfig.navigationMode === "desktop";
  const canEditBurgerNavigation = viewportConfig.navigationMode === "mobile";
  const governedNavigationEditTarget =
    navigationEditTarget === "desktop" && !canEditDesktopNavigation
      ? "auto"
      : navigationEditTarget === "burger" && !canEditBurgerNavigation
        ? "auto"
        : navigationEditTarget;
  const resolvedNavigationEditTarget =
    governedNavigationEditTarget === "auto"
      ? viewportConfig.navigationMode === "mobile"
        ? "burger"
        : "desktop"
      : governedNavigationEditTarget;
  const previewNavigationMode = resolvedNavigationEditTarget === "burger" ? "mobile" : "desktop";
  const menuToggleEnabled = previewNavigationMode === "mobile";
  const effectiveMenuOpen = menuToggleEnabled ? menuOpen : false;
  const desktopNavigationControlsVisible = resolvedNavigationEditTarget === "desktop";
  const burgerNavigationControlsVisible = resolvedNavigationEditTarget === "burger";
  const burgerControlsLiveOnViewport = previewNavigationMode === "mobile";

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
      try {
        const [heroScoped, legacyHeroScoped] = await Promise.all([
          fetchSystemMediaClientByQuery({
            allowedIn: HERO_SOURCE_ALLOWED_CONTEXT,
            pipelineStatus: "ready",
            status: "active",
          }),
          fetchSystemMediaClientByQuery({
            allowedIn: HERO_SOURCE_ALLOWED_CONTEXT_LEGACY,
            pipelineStatus: "ready",
            status: "active",
          }),
        ]);

        if (!active) return;
        const semantizedSources = toHeroSafeMediaSources([...heroScoped, ...legacyHeroScoped]);
        setHeroSafeMediaSources(semantizedSources);
        setHeroSafeMediaSourceId((previous) => {
          if (previous && semantizedSources.some((item) => item.id === previous)) return previous;
          return semantizedSources[0]?.id || "";
        });
        setHeroSafeMediaState("ready");
      } catch (error) {
        if (!active) return;
        setHeroSafeMediaSources([]);
        setHeroSafeMediaState("error");
        setHeroSafeMediaError(
          error instanceof Error ? error.message : "No se pudieron cargar los sources hero-safe."
        );
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
      if (frameId) {
        cancelAnimationFrame(frameId);
      }
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
      if (frameId) {
        cancelAnimationFrame(frameId);
      }
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

  const canvasScale = useMemo(() => {
    const availableWidth = Math.max(
      previewStageSize.width - PREVIEW_STAGE_HORIZONTAL_PADDING,
      0
    );
    const availableHeight = Math.max(
      previewStageSize.height - PREVIEW_STAGE_VERTICAL_PADDING,
      0
    );
    if (!availableWidth || !availableHeight) return 1;

    const scaleX = availableWidth / canvasWidth;
    const scaleY = availableHeight / canvasHeight;
    const nextScale = Math.min(scaleX, scaleY);

    if (!Number.isFinite(nextScale) || nextScale <= 0) return 1;
    return nextScale;
  }, [canvasHeight, canvasWidth, previewStageSize.height, previewStageSize.width]);

  const scaledCanvasWidth = canvasWidth * canvasScale;
  const scaledCanvasHeight = canvasHeight * canvasScale;
  const heroCopyWidth = copyWidth === "compact" ? "narrow" : copyWidth === "expanded" ? "wide" : "normal";
  const selectedHeroSafeMediaSource = useMemo(
    () => heroSafeMediaSources.find((item) => item.id === heroSafeMediaSourceId) || null,
    [heroSafeMediaSourceId, heroSafeMediaSources]
  );
  const labVisualCssVars = useMemo(
    () =>
      ({
        ...getTallerPanelVisualCssVars(),
        ...getTallerLabVisualCssVars(),
      }) as CSSProperties,
    []
  );
  const freeLayoutDraft = useMemo<FreeLayoutDraft>(() => createDefaultFreeLayout(), []);
  const activeFreeLayoutViewport = useMemo(
    () => freeLayoutDraft.viewports.find((item) => item.viewport === viewport),
    [freeLayoutDraft, viewport]
  );
  const overlaySlots = activeFreeLayoutViewport?.slots ?? [];
  const sceneOverlayTintClass =
    overlayStyleMode === "solid"
      ? SCENE_OVERLAY_SOLID_TINT_CLASS[overlayColor]
      : SCENE_OVERLAY_GRADIENT_TINT_CLASS[overlayColor];
  const sceneOverlayOpacityClass = SCENE_OVERLAY_OPACITY_CLASS[overlayMode][backgroundEmphasis];
  const heroLayoutClass = HERO_LAYOUT_CLASS[heroLayoutType];
  const navPosition =
    navPositionOverride === "auto" ? heroLayoutClass.navPosition : navPositionOverride;
  const headlinePosition = heroLayoutClass.headlinePosition;
  const copyBlockPosition =
    copyBlockPositionOverride === "auto"
      ? heroLayoutClass.copyBlockPosition
      : copyBlockPositionOverride;
  const ctaPosition = heroLayoutClass.ctaPosition;
  const footerPosition =
    footerPositionOverride === "auto" ? heroLayoutClass.footerPosition : footerPositionOverride;
  const visualPosition =
    visualPositionOverride === "auto" ? heroLayoutClass.visualPosition : visualPositionOverride;
  const logoPosition =
    logoPositionOverride === "auto" ? heroLayoutClass.logoPosition : logoPositionOverride;
  const labSceneOverlayClassName =
    overlayStyleMode === "none"
      ? "opacity-0 [background:transparent]"
      : `mix-blend-normal transition-opacity duration-200 ${sceneOverlayTintClass} ${sceneOverlayOpacityClass}`;
  const updateBrief = <K extends keyof HeroBrief>(key: K, value: HeroBrief[K]) => {
    setBrief((previous) => ({ ...previous, [key]: value }));
  };
  const resetCreativeContent = () => {
    setHeadlineDraft("");
    setSubheadlineDraft("");
    setPrimaryCtaDraft("");
    setSecondaryCtaDraft("");
  };
  const creativeGuidance = useMemo(() => {
    const objectiveHeadlineBase =
      brief.objective === "bookings"
        ? "Convierte visitas en reservas confirmadas"
        : brief.objective === "services"
          ? "Presenta servicios con claridad en un solo vistazo"
          : "Activa tu campana con una portada que genera accion";
    const toneAccent =
      brief.tone === "premium"
        ? "con una presencia premium"
        : brief.tone === "close"
          ? "con un tono cercano y humano"
          : "con un empuje directo y urgente";
    const audienceFrame =
      brief.audience === "new-clients"
        ? "para primera visita"
        : brief.audience === "returning-clients"
          ? "para clientes que ya te conocen"
          : "para audiencias mixtas";
    const headlineOptions = [
      `${objectiveHeadlineBase} ${toneAccent}`,
      `Haz que tu hero trabaje ${audienceFrame}`,
      `De la portada a la accion en segundos`,
    ];

    const subheadlineOptions = [
      brief.objective === "bookings"
        ? "Reserva, confirma y llena agenda sin friccion: una propuesta clara con llamadas a la accion directas."
        : brief.objective === "services"
          ? "Muestra valor y diferencia cada servicio con mensajes concretos y una navegacion que no dispersa."
          : "Comunica urgencia y contexto de campana para empujar una decision inmediata desde el primer scroll.",
      brief.audience === "new-clients"
        ? "Pensado para quien aun no te conoce: menos ruido, promesa concreta y siguiente paso visible."
        : brief.audience === "returning-clients"
          ? "Construido para clientes recurrentes: reconocimiento rapido, accion corta y continuidad de marca."
          : "Balanceado para captar nuevos clientes sin perder claridad para quienes ya confian en tu negocio.",
      brief.priority === "clarity"
        ? "Direccion visual limpia, copy compacto y CTA entendible para decidir rapido."
        : brief.priority === "conversion"
          ? "Jerarquia orientada a conversion: propuesta fuerte, friccion baja y CTA dominante."
          : "Escena y narrativa alineadas para reforzar marca sin romper rendimiento comercial.",
    ];

    const ctaOptions: CtaSuggestion[] =
      brief.ctaIntent === "direct-booking"
        ? [
            { primary: "Reservar ahora", secondary: "Ver horarios" },
            { primary: "Quiero mi cita", secondary: "Ver servicios" },
            { primary: "Agenda en 1 minuto", secondary: "Hablar por WhatsApp" },
          ]
        : brief.ctaIntent === "service-discovery"
          ? [
              { primary: "Explorar servicios", secondary: "Ver precios" },
              { primary: "Descubrir tratamientos", secondary: "Solicitar recomendacion" },
              { primary: "Ver carta completa", secondary: "Reservar despues" },
            ]
          : [
              { primary: "Hablar con asesor", secondary: "Enviar WhatsApp" },
              { primary: "Resolver dudas", secondary: "Ver servicios" },
              { primary: "Recibir propuesta", secondary: "Contactar ahora" },
            ];

    const atmosphereSuggestions = [
      `Direccion base: densidad ${overlayMode}, estilo ${overlayStyleMode}, tinte ${overlayColor}, fondo ${backgroundEmphasis}.`,
      brief.tone === "premium"
        ? "Para tono premium: prioriza composicion estable, contraste medio-alto y copy corto."
        : brief.tone === "close"
          ? "Para tono cercano: usa enfasis medio, CTA balanced y lectura relajada."
          : "Para tono urgente: sube contraste y jerarquia de CTA con enfoque primary-focus.",
      brief.priority === "brand"
        ? "Prioridad marca: cuida consistencia visual y evita saltos bruscos de atmosfera."
        : brief.priority === "clarity"
          ? "Prioridad claridad: controla ruido de fondo y evita copy demasiado ancha."
          : "Prioridad conversion: refuerza CTA principal y mantiene navegacion secundaria ligera.",
    ];

    return {
      headlines: headlineOptions,
      subheadlines: subheadlineOptions,
      ctas: ctaOptions,
      atmosphere: atmosphereSuggestions,
    };
  }, [backgroundEmphasis, brief, overlayColor, overlayMode, overlayStyleMode]);

  const snapshotForPreview = useMemo<PublishedPieceSnapshot>(() => {
    const base = HERO_CANDIDATES[candidateId];

    const primaryCta =
      ctaMode === "primary-focus"
        ? { label: "Reservar ahora", href: "#reservar-ahora" }
        : base.payload.primaryCta;
    const secondaryCta =
      ctaMode === "primary-focus"
        ? { label: "Detalles", href: "#detalles" }
        : base.payload.secondaryCta;

    return {
      ...base,
      payload: {
        ...base.payload,
        primaryCta,
        secondaryCta,
      },
    };
  }, [candidateId, ctaMode]);

  const mappedHero = useMemo(() => {
    const hero = mapPublishedSnapshotToContentPayload(snapshotForPreview);
    const resolvedHeadline = headlineDraft.trim();
    const resolvedSubheadline = subheadlineDraft.trim();
    const resolvedPrimaryCta = primaryCtaDraft.trim();
    const resolvedSecondaryCta = secondaryCtaDraft.trim();

    return {
      ...hero,
      badge: badgeVisible ? hero.badge : "",
      title: resolvedHeadline || hero.title,
      description: resolvedSubheadline || hero.description,
      primaryCtaLabel: resolvedPrimaryCta || hero.primaryCtaLabel,
      secondaryCtaLabel: resolvedSecondaryCta || hero.secondaryCtaLabel,
      heroAppearanceVariant: overlayMode,
      backgroundImageUrl:
        sourceMode === "hero-safe-media"
          ? selectedHeroSafeMediaSource?.url ||
            snapshotForPreview.payload.media?.url ||
            hero.backgroundImageUrl
          : snapshotForPreview.payload.media?.url || hero.backgroundImageUrl,
    };
  }, [
    badgeVisible,
    headlineDraft,
    overlayMode,
    primaryCtaDraft,
    secondaryCtaDraft,
    selectedHeroSafeMediaSource,
    sourceMode,
    snapshotForPreview,
    subheadlineDraft,
  ]);

  const evaluation = useMemo(() => {
    let focus = 58;
    const focusReasons: string[] = [];
    if (viewportConfig.navigationMode === "mobile" && effectiveMenuOpen && menuStyle === "opaque") {
      focus += 28;
      focusReasons.push("menu opaque abierto en mobile: foco alto en navegacion");
    }
    if (viewportConfig.navigationMode === "mobile" && effectiveMenuOpen && menuStyle === "integrated") {
      focus += 14;
      focusReasons.push("menu integrated abierto: foco moderado en navegacion");
    }
    if (copyBlockPosition === "center" && copyWidth === "expanded") {
      focus -= 10;
      focusReasons.push("copy centrado y ancho: atencion mas dispersa");
    }
    if (navPosition === "center" && viewportConfig.navigationMode === "desktop") {
      focus += 4;
      focusReasons.push("nav centrada en desktop mejora lectura jerarquica");
    }
    if (ctaMode === "primary-focus") {
      focus += 6;
      focusReasons.push("cta primary-focus ayuda a dirigir la atencion");
    }
    if (brief.priority === "conversion" && ctaMode !== "primary-focus") {
      focus -= 6;
      focusReasons.push("brief de conversion sugiere mayor dominancia del cta primario");
    }
    if (brief.priority === "clarity" && copyWidth === "expanded") {
      focus -= 4;
      focusReasons.push("brief de claridad penaliza copy demasiado amplia");
    }
    if (focusReasons.length === 0) focusReasons.push("configuracion equilibrada sin sesgo fuerte");

    let legibility = 60;
    const legibilityReasons: string[] = [];
    if (overlayMode === "solid") {
      legibility += 18;
      legibilityReasons.push("overlay solid mejora contraste del texto");
    }
    if (overlayMode === "soft") {
      legibility += 8;
      legibilityReasons.push("overlay soft aporta contraste moderado");
    }
    if (overlayMode === "transparent") {
      legibility -= 16;
      legibilityReasons.push("overlay transparente reduce contraste del texto");
    }
    if (overlayColor === "smoke") {
      legibility += 8;
      legibilityReasons.push("tinte smoke estabiliza lectura");
    }
    if (overlayColor === "amber" || overlayColor === "purple") {
      legibility -= 4;
      legibilityReasons.push("tinte expresivo exige mayor cuidado de contraste");
    }
    if (backgroundEmphasis === "high") {
      legibility -= 14;
      legibilityReasons.push("fondo alto compite con titular y subtitulo");
    }
    if (copyWidth === "expanded") {
      legibility -= 8;
      legibilityReasons.push("copy expanded aumenta fatiga de lectura");
    }
    if (copyWidth === "compact") {
      legibility += 6;
      legibilityReasons.push("copy compact concentra la lectura");
    }
    if (brief.priority === "clarity" && copyWidth !== "compact") {
      legibility -= 4;
      legibilityReasons.push("brief de claridad recomienda copy mas compacta");
    }

    let backgroundControl = 55;
    const backgroundReasons: string[] = [];
    if (backgroundEmphasis === "low") {
      backgroundControl += 24;
      backgroundReasons.push("background low reduce protagonismo de imagen");
    }
    if (backgroundEmphasis === "medium") {
      backgroundControl += 10;
      backgroundReasons.push("background medium mantiene equilibrio base");
    }
    if (backgroundEmphasis === "high") {
      backgroundControl -= 20;
      backgroundReasons.push("background high deja el fondo demasiado dominante");
    }
    if (overlayMode === "solid") {
      backgroundControl += 10;
      backgroundReasons.push("overlay solid ayuda a gobernar el fondo");
    }
    if (overlayMode === "transparent") {
      backgroundControl -= 10;
      backgroundReasons.push("overlay transparente cede demasiado al fondo");
    }
    if (overlayColor === "smoke" || overlayColor === "blue") {
      backgroundControl += 6;
      backgroundReasons.push("tinte frio refuerza el control de superficie");
    }
    if (brief.priority === "brand" && overlayMode === "transparent") {
      backgroundControl -= 6;
      backgroundReasons.push("brief de marca pide una atmosfera menos plana");
    }

    let noise = 48;
    const noiseReasons: string[] = [];
    if (backgroundEmphasis === "high") {
      noise += 18;
      noiseReasons.push("background high aumenta ruido visual");
    }
    if (overlayMode === "transparent") {
      noise += 14;
      noiseReasons.push("overlay transparente eleva interferencias del fondo");
    }
    if (menuStyle === "integrated" && effectiveMenuOpen) {
      noise += 8;
      noiseReasons.push("menu integrated abierto suma capas visuales");
    }
    if (copyBlockPosition === "center" && copyWidth === "expanded") {
      noise += 8;
      noiseReasons.push("copy centrado + ancho incrementa densidad visual");
    }
    if (menuStyle === "opaque" && effectiveMenuOpen) {
      noise -= 14;
      noiseReasons.push("menu opaque abierto limpia el fondo en mobile");
    }
    if (backgroundEmphasis === "low") {
      noise -= 10;
      noiseReasons.push("background low reduce elementos compitiendo");
    }

    let ctaClarity = 58;
    const ctaReasons: string[] = [];
    if (ctaMode === "primary-focus") {
      ctaClarity += 22;
      ctaReasons.push("cta primary-focus define jerarquia clara");
    } else {
      ctaClarity += 6;
      ctaReasons.push("modo balanced mantiene dos acciones en paralelo");
    }
    if (overlayMode === "transparent" && backgroundEmphasis === "high") {
      ctaClarity -= 14;
      ctaReasons.push("fondo dominante reduce claridad de ctas");
    }
    if (copyWidth === "expanded") {
      ctaClarity -= 6;
      ctaReasons.push("copy ancho resta foco a la botonera");
    }
    if (ctaPosition === "end") {
      ctaClarity -= 4;
      ctaReasons.push("cta desplazada al extremo pierde inmediatez");
    }
    if (ctaPosition === "center") {
      ctaClarity += 4;
      ctaReasons.push("cta centrada mejora detectabilidad");
    }
    if (brief.ctaIntent === "direct-booking" && ctaMode !== "primary-focus") {
      ctaClarity -= 8;
      ctaReasons.push("brief de reserva directa necesita cta primaria mas dominante");
    }
    if (brief.ctaIntent === "service-discovery" && ctaMode === "balanced") {
      ctaClarity += 4;
      ctaReasons.push("brief de exploracion encaja con cta balanced");
    }

    const focusMetric = evalMetricPositive(focus, focusReasons);
    const legibilityMetric = evalMetricPositive(legibility, legibilityReasons);
    const backgroundMetric = evalMetricPositive(backgroundControl, backgroundReasons);
    const noiseMetric = evalMetricNoise(noise, noiseReasons);
    const ctaMetric = evalMetricPositive(ctaClarity, ctaReasons);

    let verdict: Verdict = "weak";
    if (
      focusMetric.score >= 72 &&
      legibilityMetric.score >= 72 &&
      backgroundMetric.score >= 68 &&
      ctaMetric.score >= 70 &&
      noiseMetric.score <= 45
    ) {
      verdict = "preset-candidate";
    } else if (
      focusMetric.score >= 58 &&
      legibilityMetric.score >= 56 &&
      backgroundMetric.score >= 52 &&
      ctaMetric.score >= 55 &&
      noiseMetric.score <= 65
    ) {
      verdict = "promising";
    }

    const baseVerdictReason =
      verdict === "preset-candidate"
        ? "La configuracion mantiene foco, legibilidad y control visual suficientes para candidato de preset."
        : verdict === "promising"
          ? "La direccion visual es valida, pero aun hay ruido o jerarquia mejorables."
          : "La composicion actual no es estable para decision de preset.";
    const briefContext = `Brief activo: ${BRIEF_OBJECTIVE_LABEL[brief.objective]}, tono ${BRIEF_TONE_LABEL[brief.tone].toLowerCase()}, audiencia ${BRIEF_AUDIENCE_LABEL[brief.audience].toLowerCase()} y prioridad ${BRIEF_PRIORITY_LABEL[brief.priority].toLowerCase()}.`;
    const verdictReason = `${baseVerdictReason} ${briefContext}`;

    return {
      focus: focusMetric,
      legibility: legibilityMetric,
      background: backgroundMetric,
      noise: noiseMetric,
      cta: ctaMetric,
      verdict,
      verdictReason,
    };
  }, [
    backgroundEmphasis,
    brief,
    copyBlockPosition,
    copyWidth,
    ctaPosition,
    ctaMode,
    effectiveMenuOpen,
    menuStyle,
    navPosition,
    overlayColor,
    overlayMode,
    viewportConfig.navigationMode,
  ]);

  const qualityScore = useMemo(() => {
    const conversion = clamp(evaluation.focus.score * 0.38 + evaluation.cta.score * 0.62);
    const communication = clamp(
      evaluation.legibility.score * 0.64 + evaluation.focus.score * 0.36 - (copyWidth === "expanded" ? 6 : 0)
    );
    const visualDesign = clamp(
      evaluation.background.score * 0.52 + (100 - evaluation.noise.score) * 0.48
    );
    const uxUi = clamp(
      evaluation.focus.score * 0.35 +
        evaluation.legibility.score * 0.4 +
        evaluation.cta.score * 0.25 -
        (effectiveMenuOpen && menuStyle === "integrated" ? 4 : 0)
    );
    const responsive = clamp(
      (viewportConfig.navigationMode === "mobile" ? 62 : 70) +
        (evaluation.legibility.score - 60) * 0.35 +
        (evaluation.focus.score - 60) * 0.25 -
        (copyWidth === "expanded" ? 8 : 0)
    );
    const seoA11yPerf = clamp(
      evaluation.legibility.score * 0.5 +
        (100 - evaluation.noise.score) * 0.3 +
        evaluation.background.score * 0.2 -
        (overlayMode === "transparent" && backgroundEmphasis === "high" ? 6 : 0)
    );

    const items: QualityScoreItem[] = [
      { key: "conversion", label: "Conversion", score: conversion, note: "foco + claridad CTA" },
      {
        key: "communication",
        label: "Communication",
        score: communication,
        note: "lectura de propuesta y mensaje",
      },
      {
        key: "visual-design",
        label: "Visual design",
        score: visualDesign,
        note: "control de fondo y ruido",
      },
      { key: "ux-ui", label: "UX/UI", score: uxUi, note: "jerarquia y flujo de accion" },
      {
        key: "responsive",
        label: "Responsive",
        score: responsive,
        note: "consistencia entre viewports",
      },
      {
        key: "seo-a11y-perf",
        label: "SEO/A11y/Perf",
        score: seoA11yPerf,
        note: "legibilidad y densidad visual",
      },
    ];

    const average = clamp(items.reduce((sum, item) => sum + item.score, 0) / items.length);
    return { average, items };
  }, [
    backgroundEmphasis,
    copyWidth,
    effectiveMenuOpen,
    evaluation.background.score,
    evaluation.cta.score,
    evaluation.focus.score,
    evaluation.legibility.score,
    evaluation.noise.score,
    menuStyle,
    overlayMode,
    viewportConfig.navigationMode,
  ]);

  const whyThisScore = useMemo(() => {
    const reasons: string[] = [];

    if (heroLayoutType === "split" || heroLayoutType === "media-heavy") {
      reasons.push(
        `El layout ${heroLayoutType} mejora jerarquia entre copy y visual para el headline actual.`
      );
    }
    if (overlayMode === "transparent" && backgroundEmphasis !== "low") {
      reasons.push(
        "Overlay transparente con fondo medio/alto reduce separacion entre texto y capas secundarias."
      );
    }
    if (overlayMode === "solid") {
      reasons.push("Overlay solid refuerza contraste del copy principal y sube estabilidad de lectura.");
    }
    if (copyWidth === "expanded" && viewportConfig.navigationMode === "mobile") {
      reasons.push("La densidad de copy en mobile penaliza lectura rapida y baja Communication.");
    }
    if (ctaMode === "primary-focus") {
      reasons.push("CTA primary-focus fortalece Conversion al dejar una accion dominante.");
    } else {
      reasons.push("Modo CTA balanced reparte atencion y resta empuje en escenarios de reserva directa.");
    }
    if (evaluation.noise.score >= 60) {
      reasons.push("El ruido visual sigue alto en capas internas y resta claridad en secundarios.");
    } else {
      reasons.push("El ruido visual esta contenido y permite una escena mas limpia para decidir.");
    }
    if (menuStyle === "integrated" && effectiveMenuOpen && viewportConfig.navigationMode === "mobile") {
      reasons.push("Menu integrated abierto en mobile compite con el bloque principal durante decision inicial.");
    }

    return reasons.slice(0, 5);
  }, [
    copyWidth,
    ctaMode,
    effectiveMenuOpen,
    evaluation.noise.score,
    heroLayoutType,
    menuStyle,
    overlayMode,
    backgroundEmphasis,
    viewportConfig.navigationMode,
  ]);

  const recommendedActions = useMemo<RecommendedAction[]>(() => {
    const actions: RecommendedAction[] = [];

    if (brief.ctaIntent === "direct-booking" && ctaMode !== "primary-focus") {
      actions.push({
        priority: "alta",
        action: "Subir CTA a primary-focus",
        reason: "El brief busca reserva directa y la accion principal aun comparte demasiada atencion.",
      });
    }
    if (overlayMode === "transparent" && backgroundEmphasis !== "low") {
      actions.push({
        priority: "alta",
        action: "Pasar overlay a soft",
        reason: "Mejora contraste y separa mejor headline y CTA del fondo real.",
      });
    }
    if (copyWidth === "expanded" && viewportConfig.navigationMode === "mobile") {
      actions.push({
        priority: "alta",
        action: "Reducir copy width a balanced en mobile",
        reason: "La lectura actual es densa y baja Communication + Responsive en mobile.",
      });
    }
    if (evaluation.noise.score >= 60) {
      actions.push({
        priority: "media",
        action: "Bajar una capa visual secundaria",
        reason: "Ruido visual alto; conviene simplificar para recuperar foco en CTA y mensaje.",
      });
    }
    if (heroLayoutType === "centered" && brief.priority === "conversion") {
      actions.push({
        priority: "media",
        action: "Probar split para conversion",
        reason: "Con prioridad de conversion, split suele acelerar escaneo y decision.",
      });
    }

    const fallbackActions: RecommendedAction[] = [
      {
        priority: "media",
        action: "Validar en mobile y desktop",
        reason: "La jerarquia cambia por viewport y conviene cerrar decision en ambos extremos.",
      },
      {
        priority: "baja",
        action: "Ajustar solo overlay tint",
        reason: "Permite afinar atmosfera sin abrir cambios estructurales del hero.",
      },
      {
        priority: "baja",
        action: "Guardar esta variante como baseline",
        reason: "Ayuda a comparar la siguiente iteracion contra una referencia estable.",
      },
    ];

    for (const fallback of fallbackActions) {
      if (actions.length >= 3) break;
      actions.push(fallback);
    }

    return actions.slice(0, 5);
  }, [
    backgroundEmphasis,
    brief.ctaIntent,
    brief.priority,
    copyWidth,
    ctaMode,
    evaluation.noise.score,
    heroLayoutType,
    overlayMode,
    viewportConfig.navigationMode,
  ]);

  const actionPriorityToneClass = (priority: ActionPriority) =>
    priority === "alta"
      ? "[border-color:color-mix(in_oklab,var(--danger)_52%,transparent)] [background:color-mix(in_oklab,var(--danger-soft)_74%,var(--panel-surface-3,var(--surface-3,var(--card))))] [color:var(--danger-foreground)] [box-shadow:inset_0_0_0_1px_color-mix(in_oklab,currentColor_12%,transparent),var(--elevation-base,var(--panel-shadow-1))]"
      : priority === "media"
        ? "[border-color:color-mix(in_oklab,var(--warning)_52%,transparent)] [background:color-mix(in_oklab,var(--warning-soft)_74%,var(--panel-surface-3,var(--surface-3,var(--card))))] [color:var(--warning-foreground)] [box-shadow:inset_0_0_0_1px_color-mix(in_oklab,currentColor_12%,transparent),var(--elevation-base,var(--panel-shadow-1))]"
        : "[border-color:color-mix(in_oklab,var(--success)_52%,transparent)] [background:color-mix(in_oklab,var(--success-soft)_74%,var(--panel-surface-3,var(--surface-3,var(--card))))] [color:var(--success-foreground)] [box-shadow:inset_0_0_0_1px_color-mix(in_oklab,currentColor_12%,transparent),var(--elevation-base,var(--panel-shadow-1))]";
  const verdictToneClass =
    evaluation.verdict === "preset-candidate"
      ? "[border-color:color-mix(in_oklab,var(--success)_52%,transparent)] [background:color-mix(in_oklab,var(--success-soft)_72%,var(--panel-surface-3,var(--surface-3,var(--card))))] [color:var(--success-foreground)] [box-shadow:inset_0_0_0_1px_color-mix(in_oklab,currentColor_14%,transparent)]"
      : evaluation.verdict === "promising"
        ? "[border-color:color-mix(in_oklab,var(--warning)_52%,transparent)] [background:color-mix(in_oklab,var(--warning-soft)_72%,var(--panel-surface-3,var(--surface-3,var(--card))))] [color:var(--warning-foreground)] [box-shadow:inset_0_0_0_1px_color-mix(in_oklab,currentColor_14%,transparent)]"
        : "[border-color:color-mix(in_oklab,var(--danger)_52%,transparent)] [background:color-mix(in_oklab,var(--danger-soft)_72%,var(--panel-surface-3,var(--surface-3,var(--card))))] [color:var(--danger-foreground)] [box-shadow:inset_0_0_0_1px_color-mix(in_oklab,currentColor_14%,transparent)]";
  const labControlSelectClass =
    "w-full min-w-0 rounded-md border [border-color:var(--taller-lab-control-border,var(--border))] [background:var(--taller-lab-control-surface,var(--surface-2,var(--card)))] px-2 py-1 text-foreground [box-shadow:var(--taller-lab-control-shadow,var(--elevation-base,var(--panel-shadow-1)))] focus-visible:outline-none focus-visible:ring-2 focus-visible:[ring-color:var(--taller-lab-accent-border,var(--taller-lab-accent,var(--accent,var(--processing))))]";
  const labControlToggleRowClass =
    "col-span-2 min-w-0 flex items-center justify-between gap-2 rounded-md border [border-color:var(--taller-lab-control-border,var(--border))] [background:var(--taller-lab-control-surface,var(--surface-2,var(--card)))] px-2 py-1.5 [box-shadow:var(--taller-lab-control-shadow,var(--elevation-base,var(--panel-shadow-1)))]";
  const labControlCheckboxClass =
    "h-4 w-4 shrink-0 cursor-pointer rounded-sm [accent-color:var(--taller-lab-accent,var(--accent,var(--processing)))] focus-visible:outline-none focus-visible:ring-2 focus-visible:[ring-color:var(--taller-lab-accent-border,var(--taller-lab-accent,var(--accent,var(--processing))))]";
  const navSystemSurfaceAClass =
    "min-w-0 rounded-lg border [border-color:color-mix(in_oklab,var(--taller-lab-chip-border,var(--border))_82%,transparent)] [background:var(--taller-lab-sidebar-card,var(--surface-3,var(--card)))] p-2 [box-shadow:var(--elevation-interactive,var(--panel-shadow-2))]";
  const navSystemGridClass = "mt-2 grid min-w-0 grid-cols-2 gap-2.5";
  const navSystemFieldClass = "min-w-0 grid gap-1";
  const navSystemWideFieldClass = "col-span-2 min-w-0 grid gap-1";
  const navSystemLabelClass = "min-w-0 truncate text-muted-foreground";
  const navSystemTargetGroupClass =
    "mt-2 grid min-w-0 grid-cols-2 gap-1 rounded-md border [border-color:var(--taller-lab-control-border,var(--border))] [background:var(--taller-lab-control-surface,var(--surface-2,var(--card)))] p-1 sm:grid-cols-3";
  const navSystemTargetButtonClass =
    "inline-flex h-8 w-full min-w-0 items-center justify-center rounded-md border px-2 text-[10px] font-semibold uppercase tracking-wide transition";
  const labSegmentedTextButtonClass =
    "inline-flex h-8 min-w-0 shrink-0 items-center justify-center rounded-md border px-2.5 text-[11px] font-semibold tracking-wide transition";
  const labSegmentedIconButtonClass =
    "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border px-0 transition";
  const labSegmentedStaticChipClass =
    "inline-flex h-8 min-w-0 shrink-0 items-center justify-center rounded-md border px-2.5 text-[11px] font-semibold tracking-wide";
  const labChipActiveClass =
    "[border-color:var(--taller-lab-accent-border,color-mix(in_oklab,var(--processing)_48%,transparent))] [background:var(--taller-lab-accent-soft,color-mix(in_oklab,var(--processing-soft)_86%,var(--taller-lab-chip-surface,var(--panel-surface-3,var(--surface-3,var(--card))))))] [color:var(--taller-lab-accent-foreground,var(--processing-foreground))] [box-shadow:var(--elevation-interactive,var(--panel-shadow-2))]";
  const labChipIdleClass =
    "border-transparent text-muted-foreground hover:[background:var(--panel-surface-2,var(--surface-2,var(--card)))] hover:[border-color:color-mix(in_oklab,var(--taller-lab-chip-border,var(--border))_72%,transparent)]";
  const labUtilityChipClass =
    "inline-flex h-7 min-w-0 items-center rounded-md border [border-color:var(--taller-lab-chip-border,var(--border))] [background:var(--taller-lab-chip-surface,var(--surface-3,var(--card)))] px-2 text-[11px] font-medium text-muted-foreground [box-shadow:var(--elevation-base,var(--panel-shadow-1))]";
  const labStatusBadgeBaseClass =
    "inline-flex h-6 shrink-0 items-center rounded-full border px-2.5 text-[11px] font-semibold [box-shadow:var(--elevation-base,var(--panel-shadow-1))]";
  const labAccentActionButtonClass =
    "mt-2 rounded-md border [border-color:var(--taller-lab-accent-border,color-mix(in_oklab,var(--processing)_42%,transparent))] [background:var(--taller-lab-accent-soft,var(--processing-soft))] px-2 py-1 text-[11px] font-semibold [color:var(--taller-lab-accent-foreground,var(--processing-foreground))] [box-shadow:var(--elevation-base,var(--panel-shadow-1))] transition hover:[box-shadow:var(--elevation-interactive,var(--panel-shadow-2))]";

  return (
    <main
      className="min-h-svh w-full [background:var(--panel-background,var(--background))] text-foreground"
      style={labVisualCssVars}
    >
      {disableInternalBrandHydrator ? null : <BrandHydrator scope={brandScope} />}
      <div className="mx-auto w-full max-w-[1600px] px-3 py-4 sm:px-4 sm:py-6">
        <div className="grid gap-4 xl:grid-cols-[14.5rem_minmax(0,1fr)_16.5rem] 2xl:grid-cols-[15.5rem_minmax(0,1fr)_17.5rem] 2xl:gap-5">
          <aside className="space-y-4 xl:sticky xl:top-4 xl:h-[calc(100vh-2.25rem)] xl:overflow-y-auto bcc-scrollbar xl:pr-1">
            <section className="rounded-2xl border border-border/80 [background:var(--taller-lab-sidebar-frame,var(--panel-sidebar,var(--surface-2,var(--card))))] p-2.5 [box-shadow:var(--elevation-base,var(--panel-shadow-1))]">
              <h2 className="text-[11px] font-semibold uppercase tracking-wider text-foreground/80">
                1) Brief
              </h2>
              <div className="mt-2 space-y-2 text-xs">
                <label className="block">
                  <span className="mb-1 block text-muted-foreground">objetivo</span>
                  <select
                    value={brief.objective}
                    onChange={(event) => updateBrief("objective", event.target.value as BriefObjective)}
                    className="w-full rounded-lg border border-border [background:var(--surface-3,var(--card))] px-3 py-2 text-foreground"
                  >
                    <option value="bookings">captar reservas</option>
                    <option value="services">descubrir servicios</option>
                    <option value="campaign">campana temporal</option>
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1 block text-muted-foreground">tono</span>
                  <select
                    value={brief.tone}
                    onChange={(event) => updateBrief("tone", event.target.value as BriefTone)}
                    className="w-full rounded-lg border border-border [background:var(--surface-3,var(--card))] px-3 py-2 text-foreground"
                  >
                    <option value="premium">premium</option>
                    <option value="close">cercano</option>
                    <option value="urgent">urgente</option>
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1 block text-muted-foreground">audiencia</span>
                  <select
                    value={brief.audience}
                    onChange={(event) => updateBrief("audience", event.target.value as BriefAudience)}
                    className="w-full rounded-lg border border-border [background:var(--surface-3,var(--card))] px-3 py-2 text-foreground"
                  >
                    <option value="new-clients">nuevos clientes</option>
                    <option value="returning-clients">clientes recurrentes</option>
                    <option value="mixed">mixta</option>
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1 block text-muted-foreground">intencion cta</span>
                  <select
                    value={brief.ctaIntent}
                    onChange={(event) => updateBrief("ctaIntent", event.target.value as BriefCtaIntent)}
                    className="w-full rounded-lg border border-border [background:var(--surface-3,var(--card))] px-3 py-2 text-foreground"
                  >
                    <option value="direct-booking">reserva directa</option>
                    <option value="service-discovery">explorar servicios</option>
                    <option value="conversation">conversacion guiada</option>
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1 block text-muted-foreground">prioridad</span>
                  <select
                    value={brief.priority}
                    onChange={(event) => updateBrief("priority", event.target.value as BriefPriority)}
                    className="w-full rounded-lg border border-border [background:var(--surface-3,var(--card))] px-3 py-2 text-foreground"
                  >
                    <option value="conversion">conversion</option>
                    <option value="clarity">claridad</option>
                    <option value="brand">marca</option>
                  </select>
                </label>
              </div>
              <p className="mt-2 rounded-lg border border-border [background:var(--surface-3,var(--card))] px-3 py-2 text-[11px] text-muted-foreground">
                Brief activo: {BRIEF_OBJECTIVE_LABEL[brief.objective]} | {BRIEF_TONE_LABEL[brief.tone]} |{" "}
                {BRIEF_AUDIENCE_LABEL[brief.audience]} | {BRIEF_CTA_INTENT_LABEL[brief.ctaIntent]} |{" "}
                {BRIEF_PRIORITY_LABEL[brief.priority]}.
              </p>
            </section>

            <section className="rounded-2xl border border-border/80 [background:var(--taller-lab-sidebar-frame,var(--panel-sidebar,var(--surface-2,var(--card))))] p-2.5 [box-shadow:var(--elevation-base,var(--panel-shadow-1))]">
              <h2 className="text-[11px] font-semibold uppercase tracking-wider text-foreground/80">
                2) Composition Lab
              </h2>
              <div className="mt-2 space-y-3 text-sm">
                <div className="rounded-lg border border-border [background:var(--taller-lab-sidebar-card,var(--surface-3,var(--card)))] p-2">
                  <span className="mb-1 block text-xs text-muted-foreground">Source flow</span>
                  <label className="block text-xs">
                    <span className="mb-1 block text-muted-foreground">source view</span>
                    <select
                      value={sourceMode}
                      onChange={(event) => setSourceMode(event.target.value as SourceMode)}
                      className="w-full rounded-md border border-border [background:var(--surface-3,var(--card))] px-3 py-2 text-foreground"
                    >
                      <option value="preset">preset snapshot</option>
                      <option value="hero-safe-media">media hero-safe</option>
                    </select>
                  </label>

                  {sourceMode === "preset" ? (
                    <label className="mt-2 block text-xs">
                      <span className="mb-1 block text-muted-foreground">preset snapshot</span>
                      <select
                        value={candidateId}
                        onChange={(event) => setCandidateId(event.target.value as CandidateId)}
                        className="w-full rounded-md border border-border [background:var(--surface-3,var(--card))] px-3 py-2 text-foreground"
                      >
                        <option value="barber-pro">Lab mock - Barber Pro</option>
                        <option value="urban-studio">Lab mock - Urban Studio</option>
                      </select>
                    </label>
                  ) : (
                    <div className="mt-2 space-y-2">
                      <label className="block text-xs">
                        <span className="mb-1 block text-muted-foreground">hero-safe source</span>
                        <select
                          value={heroSafeMediaSourceId}
                          onChange={(event) => setHeroSafeMediaSourceId(event.target.value)}
                          disabled={heroSafeMediaState !== "ready" || heroSafeMediaSources.length === 0}
                          className="w-full rounded-md border border-border [background:var(--surface-3,var(--card))] px-3 py-2 text-foreground disabled:opacity-55"
                        >
                          {heroSafeMediaSources.length === 0 ? (
                            <option value="">sin assets hero-safe disponibles</option>
                          ) : null}
                          {heroSafeMediaSources.map((source) => (
                            <option key={source.id} value={source.id}>
                              {source.label} · {source.derived} · {source.ratio}
                            </option>
                          ))}
                        </select>
                      </label>
                      <p className="rounded-md border border-border/80 [background:var(--surface-3,var(--card))] px-2 py-1.5 text-[11px] text-muted-foreground">
                        {heroSafeMediaState === "loading"
                          ? "Cargando media hero-safe desde la libreria..."
                          : heroSafeMediaState === "error"
                            ? `Error de source hero-safe: ${heroSafeMediaError}`
                            : `Assets hero-safe: ${heroSafeMediaSources.length}`}
                      </p>
                      {selectedHeroSafeMediaSource ? (
                        <div className="rounded-md border border-border/80 [background:var(--surface-3,var(--card))] p-2 text-[11px] text-muted-foreground">
                          <p>
                            thematic:{" "}
                            <span className="font-semibold text-foreground">
                              {selectedHeroSafeMediaSource.thematic}
                            </span>
                          </p>
                          <p>
                            sector:{" "}
                            <span className="font-semibold text-foreground">
                              {selectedHeroSafeMediaSource.sector}
                            </span>
                          </p>
                          <p>
                            component:{" "}
                            <span className="font-semibold text-foreground">
                              {selectedHeroSafeMediaSource.component}
                            </span>
                          </p>
                          <p>
                            derivado/formato/ratio:{" "}
                            <span className="font-semibold text-foreground">
                              {selectedHeroSafeMediaSource.derived} · {selectedHeroSafeMediaSource.format} ·{" "}
                              {selectedHeroSafeMediaSource.ratio}
                            </span>
                          </p>
                          <p>
                            scope + allowedComponents:{" "}
                            <span className="font-semibold text-foreground">
                              {selectedHeroSafeMediaSource.scope} ·{" "}
                              {selectedHeroSafeMediaSource.allowedComponents}
                            </span>
                          </p>
                          <p>
                            review state:{" "}
                            <span className="font-semibold text-foreground">
                              {selectedHeroSafeMediaSource.reviewState}
                            </span>
                          </p>
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>

                <div>
                  <span className="mb-1 block text-xs text-muted-foreground">Hero layout type</span>
                  <div className="grid grid-cols-2 gap-1 rounded-lg border border-border [background:var(--surface-3,var(--card))] p-1">
                    {HERO_LAYOUT_TYPES.map((layoutType) => (
                      <button
                        key={layoutType}
                        type="button"
                        onClick={() => setHeroLayoutType(layoutType)}
                        className={`${labSegmentedTextButtonClass} uppercase ${heroLayoutType === layoutType ? labChipActiveClass : labChipIdleClass}`}
                      >
                        {HERO_LAYOUT_LABEL[layoutType]}
                      </button>
                    ))}
                  </div>
                </div>

                <p className="rounded-lg border border-border [background:var(--surface-3,var(--card))] px-3 py-2 text-[11px] text-muted-foreground">
                  Active composition:{" "}
                  <span className="font-semibold text-foreground">
                    {HERO_LAYOUT_LABEL[heroLayoutType]}
                  </span>
                </p>

                <label className="block text-xs">
                  <span className="mb-1 block text-muted-foreground">narrative width</span>
                  <select
                    value={copyWidth}
                    onChange={(event) => setCopyWidth(event.target.value as CopyWidth)}
                    className="w-full rounded-lg border border-border [background:var(--surface-3,var(--card))] px-3 py-2 text-foreground"
                  >
                    <option value="compact">compact</option>
                    <option value="balanced">balanced</option>
                    <option value="expanded">expanded</option>
                  </select>
                </label>

                <div className="rounded-lg border border-border [background:var(--taller-lab-sidebar-card,var(--surface-3,var(--card)))] p-2">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Anchors / Relative Position
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setLogoPositionOverride("auto");
                        setVisualPositionOverride("auto");
                        setCopyBlockPositionOverride("auto");
                      }}
                      className="rounded-md border border-border/80 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground transition hover:[background:var(--panel-surface-2,var(--surface-2,var(--card)))]"
                    >
                      reset
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <label className="grid gap-1">
                      <span className="text-muted-foreground">logo anchor</span>
                      <select
                        value={logoPositionOverride}
                        onChange={(event) => setLogoPositionOverride(event.target.value as PositionXOverride)}
                        className="rounded-md border [border-color:var(--taller-lab-control-border,var(--border))] [background:var(--taller-lab-control-surface,var(--surface-2,var(--card)))] px-2 py-1 text-foreground [box-shadow:var(--taller-lab-control-shadow,var(--elevation-base,var(--panel-shadow-1)))]"
                      >
                        <option value="auto">auto</option>
                        <option value="left">left</option>
                        <option value="center">center</option>
                        <option value="right">right</option>
                      </select>
                    </label>
                    <label className="grid gap-1">
                      <span className="text-muted-foreground">visual anchor</span>
                      <select
                        value={visualPositionOverride}
                        onChange={(event) => setVisualPositionOverride(event.target.value as PositionXOverride)}
                        className="rounded-md border [border-color:var(--taller-lab-control-border,var(--border))] [background:var(--taller-lab-control-surface,var(--surface-2,var(--card)))] px-2 py-1 text-foreground [box-shadow:var(--taller-lab-control-shadow,var(--elevation-base,var(--panel-shadow-1)))]"
                      >
                        <option value="auto">auto</option>
                        <option value="left">left</option>
                        <option value="center">center</option>
                        <option value="right">right</option>
                      </select>
                    </label>
                    <label className="grid gap-1">
                      <span className="text-muted-foreground">copy anchor</span>
                      <select
                        value={copyBlockPositionOverride}
                        onChange={(event) =>
                          setCopyBlockPositionOverride(event.target.value as CopyBlockPositionOverride)
                        }
                        className="rounded-md border [border-color:var(--taller-lab-control-border,var(--border))] [background:var(--taller-lab-control-surface,var(--surface-2,var(--card)))] px-2 py-1 text-foreground [box-shadow:var(--taller-lab-control-shadow,var(--elevation-base,var(--panel-shadow-1)))]"
                      >
                        <option value="auto">auto</option>
                        <option value="left">left</option>
                        <option value="center-left">center-left</option>
                        <option value="center">center</option>
                        <option value="right">right</option>
                      </select>
                    </label>
                  </div>
                </div>

                <div className="rounded-lg border border-border [background:var(--taller-lab-sidebar-card,var(--surface-3,var(--card)))] p-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Spacing / Hierarchy
                  </p>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-[11px]">
                    <label className="grid gap-1">
                      <span className="text-muted-foreground">mobile headline scale</span>
                      <select
                        value={mobileHeadlineScale}
                        onChange={(event) =>
                          setMobileHeadlineScale(event.target.value as HierarchyScale)
                        }
                        className="rounded-md border [border-color:var(--taller-lab-control-border,var(--border))] [background:var(--taller-lab-control-surface,var(--surface-2,var(--card)))] px-2 py-1 text-foreground [box-shadow:var(--taller-lab-control-shadow,var(--elevation-base,var(--panel-shadow-1)))]"
                      >
                        <option value="compact">compact</option>
                        <option value="balanced">balanced</option>
                        <option value="expressive">expressive</option>
                      </select>
                    </label>
                    <label className="grid gap-1">
                      <span className="text-muted-foreground">mobile logo scale</span>
                      <select
                        value={mobileLogoScale}
                        onChange={(event) => setMobileLogoScale(event.target.value as HierarchyScale)}
                        className="rounded-md border [border-color:var(--taller-lab-control-border,var(--border))] [background:var(--taller-lab-control-surface,var(--surface-2,var(--card)))] px-2 py-1 text-foreground [box-shadow:var(--taller-lab-control-shadow,var(--elevation-base,var(--panel-shadow-1)))]"
                      >
                        <option value="compact">compact</option>
                        <option value="balanced">balanced</option>
                        <option value="expressive">expressive</option>
                      </select>
                    </label>
                    <label className="grid gap-1">
                      <span className="text-muted-foreground">logo to headline</span>
                      <select
                        value={gapLogoHeadline}
                        onChange={(event) => setGapLogoHeadline(event.target.value as SeparationLevel)}
                        className="rounded-md border [border-color:var(--taller-lab-control-border,var(--border))] [background:var(--taller-lab-control-surface,var(--surface-2,var(--card)))] px-2 py-1 text-foreground [box-shadow:var(--taller-lab-control-shadow,var(--elevation-base,var(--panel-shadow-1)))]"
                      >
                        <option value="tight">tight</option>
                        <option value="normal">normal</option>
                        <option value="relaxed">relaxed</option>
                      </select>
                    </label>
                    <label className="grid gap-1">
                      <span className="text-muted-foreground">headline to subheadline</span>
                      <select
                        value={gapHeadlineSubheadline}
                        onChange={(event) =>
                          setGapHeadlineSubheadline(event.target.value as SeparationLevel)
                        }
                        className="rounded-md border [border-color:var(--taller-lab-control-border,var(--border))] [background:var(--taller-lab-control-surface,var(--surface-2,var(--card)))] px-2 py-1 text-foreground [box-shadow:var(--taller-lab-control-shadow,var(--elevation-base,var(--panel-shadow-1)))]"
                      >
                        <option value="tight">tight</option>
                        <option value="normal">normal</option>
                        <option value="relaxed">relaxed</option>
                      </select>
                    </label>
                    <label className="grid gap-1">
                      <span className="text-muted-foreground">text to CTA</span>
                      <select
                        value={gapTextCta}
                        onChange={(event) => setGapTextCta(event.target.value as SeparationLevel)}
                        className="rounded-md border [border-color:var(--taller-lab-control-border,var(--border))] [background:var(--taller-lab-control-surface,var(--surface-2,var(--card)))] px-2 py-1 text-foreground [box-shadow:var(--taller-lab-control-shadow,var(--elevation-base,var(--panel-shadow-1)))]"
                      >
                        <option value="tight">tight</option>
                        <option value="normal">normal</option>
                        <option value="relaxed">relaxed</option>
                      </select>
                    </label>
                    <label className="grid gap-1">
                      <span className="text-muted-foreground">CTA to footer</span>
                      <select
                        value={gapCtaFooter}
                        onChange={(event) => setGapCtaFooter(event.target.value as SeparationLevel)}
                        className="rounded-md border [border-color:var(--taller-lab-control-border,var(--border))] [background:var(--taller-lab-control-surface,var(--surface-2,var(--card)))] px-2 py-1 text-foreground [box-shadow:var(--taller-lab-control-shadow,var(--elevation-base,var(--panel-shadow-1)))]"
                      >
                        <option value="tight">tight</option>
                        <option value="normal">normal</option>
                        <option value="relaxed">relaxed</option>
                      </select>
                    </label>
                    <label className="grid gap-1">
                      <span className="text-muted-foreground">footer data to signature</span>
                      <select
                        value={gapFooterDataSignature}
                        onChange={(event) =>
                          setGapFooterDataSignature(event.target.value as SeparationLevel)
                        }
                        className="rounded-md border [border-color:var(--taller-lab-control-border,var(--border))] [background:var(--taller-lab-control-surface,var(--surface-2,var(--card)))] px-2 py-1 text-foreground [box-shadow:var(--taller-lab-control-shadow,var(--elevation-base,var(--panel-shadow-1)))]"
                      >
                        <option value="tight">tight</option>
                        <option value="normal">normal</option>
                        <option value="relaxed">relaxed</option>
                      </select>
                    </label>
                  </div>
                </div>
              </div>
            </section>
            <section className="rounded-2xl border border-border/80 [background:var(--taller-lab-sidebar-frame,var(--panel-sidebar,var(--surface-2,var(--card))))] p-2.5 [box-shadow:var(--elevation-base,var(--panel-shadow-1))]">
              <h2 className="text-[11px] font-semibold uppercase tracking-wider text-foreground/80">
                3) Emphasis / Atmosphere
              </h2>
              <div className="mt-2 space-y-2 text-xs">
                <label className="block">
                  <span className="mb-1 block text-muted-foreground">overlay density</span>
                  <select
                    value={overlayMode}
                    onChange={(event) => setOverlayMode(event.target.value as HeroAppearanceVariant)}
                    className="w-full rounded-lg border border-border [background:var(--surface-3,var(--card))] px-3 py-2 text-foreground"
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
                    className="w-full rounded-lg border border-border [background:var(--surface-3,var(--card))] px-3 py-2 text-foreground"
                  >
                    <option value="gradient">gradient</option>
                    <option value="solid">solid</option>
                    <option value="none">none</option>
                  </select>
                </label>
                <div>
                  <span className="mb-1 block text-muted-foreground">overlay tint</span>
                  <div className="grid grid-cols-2 gap-1 rounded-lg border border-border [background:var(--surface-3,var(--card))] p-1">
                    {(["blue", "green", "amber", "purple", "smoke"] as const).map((tint) => (
                      <button
                        key={tint}
                        type="button"
                        onClick={() => setOverlayColor(tint)}
                        disabled={overlayStyleMode === "none"}
                        className={`${labSegmentedTextButtonClass} gap-2 capitalize disabled:opacity-45 ${overlayColor === tint ? labChipActiveClass : labChipIdleClass}`}
                      >
                        <span className={`block h-2.5 w-4 rounded-sm ${OVERLAY_TINT_PREVIEW_CLASS[tint]}`} />
                        {tint}
                      </button>
                    ))}
                  </div>
                </div>
                <label className="block">
                  <span className="mb-1 block text-muted-foreground">headline color</span>
                  <select
                    value={labHeadlineTone}
                    onChange={(event) => setLabHeadlineTone(event.target.value as LabHeadlineTone)}
                    className="w-full rounded-lg border border-border [background:var(--surface-3,var(--card))] px-3 py-2 text-foreground"
                  >
                    {(
                      [
                        "white",
                        "black",
                        "inverse",
                        "muted-light",
                        "warm-light",
                        "cool-light",
                      ] as const
                    ).map((tone) => (
                      <option key={tone} value={tone}>
                        {LAB_HEADLINE_TONE_LABEL[tone]}
                      </option>
                    ))}
                  </select>
                </label>
                <div>
                  <span className="mb-1 block text-muted-foreground">background emphasis</span>
                  <div className="inline-flex w-full rounded-lg border border-border [background:var(--surface-3,var(--card))] p-1">
                    {(["low", "medium", "high"] as const).map((emphasis) => (
                      <button
                        key={emphasis}
                        type="button"
                        onClick={() => setBackgroundEmphasis(emphasis)}
                        className={`flex-1 rounded-md border px-2 py-1.5 text-xs font-semibold capitalize transition ${backgroundEmphasis === emphasis ? labChipActiveClass : labChipIdleClass}`}
                      >
                        {emphasis}
                      </button>
                    ))}
                  </div>
                </div>
                <label className="block">
                  <span className="mb-1 block text-muted-foreground">cta regulation</span>
                  <select
                    value={ctaMode}
                    onChange={(event) => setCtaMode(event.target.value as CtaMode)}
                    className="w-full rounded-lg border border-border [background:var(--surface-3,var(--card))] px-3 py-2 text-foreground"
                  >
                    <option value="balanced">balanced</option>
                    <option value="primary-focus">primary-focus</option>
                  </select>
                </label>
              </div>
            </section>

            <section className="rounded-2xl border border-border/80 [background:var(--taller-lab-sidebar-frame,var(--panel-sidebar,var(--surface-2,var(--card))))] p-2.5 [box-shadow:var(--elevation-base,var(--panel-shadow-1))]">
              <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-foreground/80">
                4) Navigation / Menu System
              </h2>
              <div className={`mb-2 text-xs ${navSystemSurfaceAClass}`}>
                <span className="block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  editing target
                </span>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  `auto` sigue el viewport activo.
                </p>
                <div className={navSystemTargetGroupClass}>
                  {(
                    [
                      { id: "auto", label: "auto", disabled: false },
                      {
                        id: "desktop",
                        label: "desktop nav",
                        disabled: !canEditDesktopNavigation,
                      },
                      {
                        id: "burger",
                        label: "burger nav",
                        disabled: !canEditBurgerNavigation,
                      },
                    ] as const
                  ).map((target) => (
                    <button
                      key={target.id}
                      type="button"
                      disabled={target.disabled}
                      onClick={() => setNavigationEditTarget(target.id)}
                      className={`${navSystemTargetButtonClass} ${governedNavigationEditTarget === target.id ? "[border-color:var(--taller-lab-accent-border,color-mix(in_oklab,var(--processing)_44%,transparent))] [background:var(--taller-lab-accent-soft,var(--processing-soft))] [color:var(--taller-lab-accent-foreground,var(--processing-foreground))]" : "border-transparent text-muted-foreground hover:[background:var(--panel-surface-2,var(--surface-2,var(--card)))]"} ${target.disabled ? "cursor-not-allowed opacity-45 hover:[background:transparent]" : ""}`}
                    >
                      {target.label}
                    </button>
                  ))}
                </div>
              </div>

              {desktopNavigationControlsVisible ? (
                <div className="space-y-2 text-xs">
                  <div className={navSystemSurfaceAClass}>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Desktop Nav Appearance
                    </p>
                    <div className={navSystemGridClass}>
                      <label className={navSystemFieldClass}>
                        <span className={navSystemLabelClass}>desktop nav position</span>
                        <select
                          value={navPositionOverride}
                          onChange={(event) =>
                            setNavPositionOverride(event.target.value as PositionXOverride)
                          }
                          className={labControlSelectClass}
                        >
                          <option value="auto">auto</option>
                          <option value="left">left</option>
                          <option value="center">center</option>
                          <option value="right">right</option>
                        </select>
                      </label>
                      <label className={navSystemFieldClass}>
                        <span className={navSystemLabelClass}>desktop nav size</span>
                        <select
                          value={desktopNavSize}
                          onChange={(event) => setDesktopNavSize(event.target.value as DesktopNavSize)}
                          className={labControlSelectClass}
                        >
                          <option value="sm">sm</option>
                          <option value="md">md</option>
                          <option value="lg">lg</option>
                        </select>
                      </label>
                      <label className={navSystemFieldClass}>
                        <span className={navSystemLabelClass}>desktop nav fg/text color</span>
                        <select
                          value={desktopNavTone}
                          onChange={(event) => setDesktopNavTone(event.target.value as DesktopNavTone)}
                          className={labControlSelectClass}
                        >
                          <option value="inverse">inverse</option>
                          <option value="primary">primary</option>
                          <option value="muted">muted</option>
                        </select>
                      </label>
                      <label className={navSystemFieldClass}>
                        <span className={navSystemLabelClass}>desktop nav badge/background style</span>
                        <select
                          value={desktopNavSurface}
                          onChange={(event) =>
                            setDesktopNavSurface(event.target.value as DesktopNavSurface)
                          }
                          className={labControlSelectClass}
                        >
                          <option value="minimal">minimal</option>
                          <option value="solid">solid</option>
                          <option value="glass">glass</option>
                        </select>
                      </label>
                      <label className={navSystemFieldClass}>
                        <span className={navSystemLabelClass}>desktop nav hover style</span>
                        <select
                          value={desktopNavHover}
                          onChange={(event) => setDesktopNavHover(event.target.value as DesktopNavHover)}
                          className={labControlSelectClass}
                        >
                          <option value="soft">soft</option>
                          <option value="lift">lift</option>
                          <option value="glow">glow</option>
                        </select>
                      </label>
                      <label className={navSystemFieldClass}>
                        <span className={navSystemLabelClass}>desktop nav contrast/presence</span>
                        <select
                          value={desktopNavPresence}
                          onChange={(event) =>
                            setDesktopNavPresence(event.target.value as DesktopNavPresence)
                          }
                          className={labControlSelectClass}
                        >
                          <option value="low">low</option>
                          <option value="medium">medium</option>
                          <option value="high">high</option>
                        </select>
                      </label>
                    </div>
                  </div>
                </div>
              ) : null}

              {burgerNavigationControlsVisible ? (
                <div className="space-y-2 text-xs">
                  <div className={navSystemSurfaceAClass}>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      A) Burger trigger appearance
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      Solo afecta al trigger hamburguesa.
                    </p>
                    <div className={navSystemGridClass}>
                      <label className={navSystemFieldClass}>
                        <span className={navSystemLabelClass}>nav size</span>
                        <select
                          value={navTriggerSize}
                          onChange={(event) => setNavTriggerSize(event.target.value as NavTriggerSize)}
                          className={labControlSelectClass}
                        >
                          <option value="sm">sm</option>
                          <option value="md">md</option>
                          <option value="lg">lg</option>
                        </select>
                      </label>
                      <label className={navSystemFieldClass}>
                        <span className={navSystemLabelClass}>nav aura</span>
                        <select
                          value={navTriggerAura}
                          onChange={(event) => setNavTriggerAura(event.target.value as NavTriggerAura)}
                          className={labControlSelectClass}
                        >
                          <option value="none">none</option>
                          <option value="soft">soft</option>
                          <option value="strong">strong</option>
                        </select>
                      </label>
                      <label className={navSystemFieldClass}>
                        <span className={navSystemLabelClass}>nav surface style</span>
                        <select
                          value={navTriggerSurface}
                          onChange={(event) =>
                            setNavTriggerSurface(event.target.value as NavTriggerSurface)
                          }
                          className={labControlSelectClass}
                        >
                          <option value="minimal">minimal</option>
                          <option value="solid">solid</option>
                          <option value="glass">glass</option>
                        </select>
                      </label>
                      <label className={navSystemFieldClass}>
                        <span className={navSystemLabelClass}>nav fg/icon color</span>
                        <select
                          value={navTriggerTone}
                          onChange={(event) => setNavTriggerTone(event.target.value as NavTriggerTone)}
                          className={labControlSelectClass}
                        >
                          <option value="inverse">inverse</option>
                          <option value="primary">primary</option>
                          <option value="muted">muted</option>
                        </select>
                      </label>
                      <label className={navSystemWideFieldClass}>
                        <span className={navSystemLabelClass}>nav hover style</span>
                        <select
                          value={navTriggerHover}
                          onChange={(event) => setNavTriggerHover(event.target.value as NavTriggerHover)}
                          className={labControlSelectClass}
                        >
                          <option value="soft">soft</option>
                          <option value="lift">lift</option>
                          <option value="glow">glow</option>
                        </select>
                      </label>
                    </div>
                  </div>

                  <div className={navSystemSurfaceAClass}>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      B) Open panel
                    </p>
                    <div className={navSystemGridClass}>
                      <label className={navSystemFieldClass}>
                        <span className={navSystemLabelClass}>open behavior</span>
                        <select
                          value={navOpenBehavior}
                          onChange={(event) => setNavOpenBehavior(event.target.value as NavOpenBehavior)}
                          className={labControlSelectClass}
                        >
                          <option value="overlay">overlay</option>
                          <option value="drawer">drawer</option>
                          <option value="fullscreen">fullscreen</option>
                        </select>
                      </label>
                      <label className={navSystemFieldClass}>
                        <span className={navSystemLabelClass}>panel width</span>
                        <select
                          value={navPanelWidth}
                          onChange={(event) => setNavPanelWidth(event.target.value as NavPanelWidth)}
                          disabled={navOpenBehavior === "fullscreen"}
                          className={`${labControlSelectClass} disabled:opacity-55`}
                        >
                          <option value="narrow">narrow</option>
                          <option value="normal">normal</option>
                          <option value="wide">wide</option>
                        </select>
                      </label>
                      <label className={navSystemFieldClass}>
                        <span className={navSystemLabelClass}>panel alignment/origin</span>
                        <select
                          value={navPanelOrigin}
                          onChange={(event) => setNavPanelOrigin(event.target.value as NavPanelOrigin)}
                          disabled={navOpenBehavior === "fullscreen"}
                          className={`${labControlSelectClass} disabled:opacity-55`}
                        >
                          <option value="right">right</option>
                          <option value="left">left</option>
                          <option value="center">center</option>
                        </select>
                      </label>
                      <label className={navSystemFieldClass}>
                        <span className={navSystemLabelClass}>panel visual style</span>
                        <select
                          value={navPanelStyle}
                          onChange={(event) => setNavPanelStyle(event.target.value as NavPanelStyle)}
                          className={labControlSelectClass}
                        >
                          <option value="solid">solid</option>
                          <option value="glass">glass</option>
                          <option value="minimal">minimal</option>
                        </select>
                      </label>
                      <label className={labControlToggleRowClass}>
                        <span className="min-w-0 truncate text-muted-foreground">include logo</span>
                        <input
                          type="checkbox"
                          checked={navPanelIncludeLogo}
                          onChange={(event) => setNavPanelIncludeLogo(event.target.checked)}
                          className={labControlCheckboxClass}
                        />
                      </label>
                      <label className={navSystemFieldClass}>
                        <span className={navSystemLabelClass}>overlay density</span>
                        <select
                          value={navOverlayDensity}
                          onChange={(event) =>
                            setNavOverlayDensity(event.target.value as NavOverlayDensity)
                          }
                          className={labControlSelectClass}
                        >
                          <option value="low">low</option>
                          <option value="medium">medium</option>
                          <option value="high">high</option>
                        </select>
                      </label>
                      <label className={navSystemFieldClass}>
                        <span className={navSystemLabelClass}>overlay tint/style</span>
                        <select
                          value={navOverlayStyle}
                          onChange={(event) => setNavOverlayStyle(event.target.value as NavOverlayStyle)}
                          className={labControlSelectClass}
                        >
                          <option value="tinted">tinted</option>
                          <option value="neutral">neutral</option>
                          <option value="none">none</option>
                        </select>
                      </label>
                      <label className={navSystemWideFieldClass}>
                        <span className={navSystemLabelClass}>background readability behind menu</span>
                        <select
                          value={navReadabilityBoost}
                          onChange={(event) =>
                            setNavReadabilityBoost(event.target.value as NavReadabilityBoost)
                          }
                          className={labControlSelectClass}
                        >
                          <option value="none">none</option>
                          <option value="soft">soft</option>
                          <option value="strong">strong</option>
                        </select>
                      </label>
                      <label className={labControlToggleRowClass}>
                        <span className="min-w-0 truncate text-muted-foreground">badge visible</span>
                        <input
                          type="checkbox"
                          checked={badgeVisible}
                          onChange={(event) => setBadgeVisible(event.target.checked)}
                          className={labControlCheckboxClass}
                        />
                      </label>
                    </div>
                  </div>

                  <div className={navSystemSurfaceAClass}>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      C) Menu content placement
                    </p>
                    <div className={navSystemGridClass}>
                      <label className={navSystemFieldClass}>
                        <span className={navSystemLabelClass}>menu block position</span>
                        <select
                          value={navMenuBlockPosition}
                          onChange={(event) =>
                            setNavMenuBlockPosition(event.target.value as NavMenuBlockPosition)
                          }
                          className={labControlSelectClass}
                        >
                          <option value="top">top</option>
                          <option value="center">center</option>
                          <option value="bottom">bottom</option>
                        </select>
                      </label>
                      <label className={navSystemFieldClass}>
                        <span className={navSystemLabelClass}>menu alignment</span>
                        <select
                          value={navMenuAlignment}
                          onChange={(event) =>
                            setNavMenuAlignment(event.target.value as NavMenuAlignment)
                          }
                          className={labControlSelectClass}
                        >
                          <option value="left">left</option>
                          <option value="center">center</option>
                          <option value="right">right</option>
                        </select>
                      </label>
                      <label className={navSystemFieldClass}>
                        <span className={navSystemLabelClass}>menu item size</span>
                        <select
                          value={navMenuItemSize}
                          onChange={(event) =>
                            setNavMenuItemSize(event.target.value as NavMenuItemSize)
                          }
                          className={labControlSelectClass}
                        >
                          <option value="sm">sm</option>
                          <option value="md">md</option>
                          <option value="lg">lg</option>
                        </select>
                      </label>
                      <label className={navSystemFieldClass}>
                        <span className={navSystemLabelClass}>menu text style</span>
                        <select
                          value={navMenuTextTone}
                          onChange={(event) =>
                            setNavMenuTextTone(event.target.value as NavMenuTextTone)
                          }
                          className={labControlSelectClass}
                        >
                          <option value="inverse">inverse</option>
                          <option value="muted">muted</option>
                          <option value="primary">primary</option>
                        </select>
                      </label>
                      <label className={navSystemFieldClass}>
                        <span className={navSystemLabelClass}>top safe offset</span>
                        <select
                          value={navMenuSafeTopOffset}
                          onChange={(event) =>
                            setNavMenuSafeTopOffset(event.target.value as NavMenuSafeOffset)
                          }
                          className={labControlSelectClass}
                        >
                          <option value="tight">tight</option>
                          <option value="normal">normal</option>
                          <option value="relaxed">relaxed</option>
                        </select>
                      </label>
                      <label className={navSystemFieldClass}>
                        <span className={navSystemLabelClass}>side safe offset</span>
                        <select
                          value={navMenuSafeSideOffset}
                          onChange={(event) =>
                            setNavMenuSafeSideOffset(event.target.value as NavMenuSafeOffset)
                          }
                          className={labControlSelectClass}
                        >
                          <option value="tight">tight</option>
                          <option value="normal">normal</option>
                          <option value="relaxed">relaxed</option>
                        </select>
                      </label>
                      <label className={navSystemWideFieldClass}>
                        <span className={navSystemLabelClass}>menu vertical spacing</span>
                        <select
                          value={navMenuVerticalSpacing}
                          onChange={(event) =>
                            setNavMenuVerticalSpacing(event.target.value as NavMenuVerticalSpacing)
                          }
                          className={labControlSelectClass}
                        >
                          <option value="tight">tight</option>
                          <option value="normal">normal</option>
                          <option value="relaxed">relaxed</option>
                        </select>
                      </label>
                    </div>
                  </div>
                </div>
              ) : null}
            </section>

            <section className="rounded-2xl border border-border/80 [background:var(--taller-lab-sidebar-frame,var(--panel-sidebar,var(--surface-2,var(--card))))] p-2.5 [box-shadow:var(--elevation-base,var(--panel-shadow-1))]">
              <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-foreground/80">
                5) Hero Regions
              </h2>
              <p className="mb-2 text-[11px] text-muted-foreground">
                Regiones activas en esta fase: header, body y footer.
              </p>

              <div className="space-y-2 text-xs">
                <div className="min-w-0 rounded-lg border border-border [background:var(--taller-lab-sidebar-card,var(--surface-3,var(--card)))] p-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Header region
                  </p>
                  <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <label className="min-w-0 grid gap-1">
                      <span className="truncate text-muted-foreground">header integration</span>
                      <select
                        value={headerIntegration}
                        onChange={(event) =>
                          setHeaderIntegration(event.target.value as HeaderIntegration)
                        }
                        className={labControlSelectClass}
                      >
                        <option value="integrated">integrated</option>
                        <option value="separated">separated</option>
                      </select>
                    </label>
                    <label className="min-w-0 grid gap-1">
                      <span className="truncate text-muted-foreground">header visual style</span>
                      <select
                        value={headerVisualStyle}
                        onChange={(event) =>
                          setHeaderVisualStyle(event.target.value as HeaderVisualStyle)
                        }
                        className={labControlSelectClass}
                      >
                        <option value="minimal">minimal</option>
                        <option value="solid">solid</option>
                        <option value="glass">glass</option>
                      </select>
                    </label>
                    <label className="min-w-0 grid gap-1">
                      <span className="truncate text-muted-foreground">top safe area / spacing</span>
                      <select
                        value={headerTopSpacing}
                        onChange={(event) =>
                          setHeaderTopSpacing(event.target.value as HeaderTopSpacing)
                        }
                        className={labControlSelectClass}
                      >
                        <option value="tight">tight</option>
                        <option value="normal">normal</option>
                        <option value="relaxed">relaxed</option>
                      </select>
                    </label>
                    <label className="min-w-0 grid gap-1">
                      <span className="truncate text-muted-foreground">logo / nav relation</span>
                      <select
                        value={headerRelation}
                        onChange={(event) => setHeaderRelation(event.target.value as HeaderRelation)}
                        className={labControlSelectClass}
                      >
                        <option value="balanced">balanced</option>
                        <option value="logo-focus">logo-focus</option>
                        <option value="nav-focus">nav-focus</option>
                      </select>
                    </label>
                  </div>
                </div>

                <div className="min-w-0 rounded-lg border border-border [background:var(--taller-lab-sidebar-card,var(--surface-3,var(--card)))] p-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Footer region
                  </p>
                  <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <label className="min-w-0 grid gap-1">
                      <span className="truncate text-muted-foreground">footer integration</span>
                      <select
                        value={footerIntegration}
                        onChange={(event) =>
                          setFooterIntegration(event.target.value as FooterIntegration)
                        }
                        className={labControlSelectClass}
                      >
                        <option value="integrated">integrated</option>
                        <option value="separated">separated</option>
                      </select>
                    </label>
                    <label className="min-w-0 grid gap-1">
                      <span className="truncate text-muted-foreground">footer visual style</span>
                      <select
                        value={footerVisualStyle}
                        onChange={(event) =>
                          setFooterVisualStyle(event.target.value as FooterVisualStyle)
                        }
                        className={labControlSelectClass}
                      >
                        <option value="minimal">minimal</option>
                        <option value="solid">solid</option>
                        <option value="glass">glass</option>
                      </select>
                    </label>
                    <label className="min-w-0 grid gap-1">
                      <span className="truncate text-muted-foreground">footer density</span>
                      <select
                        value={footerDensity}
                        onChange={(event) => setFooterDensity(event.target.value as FooterDensity)}
                        className={labControlSelectClass}
                      >
                        <option value="compact">compact</option>
                        <option value="balanced">balanced</option>
                        <option value="spacious">spacious</option>
                      </select>
                    </label>
                    <label className="min-w-0 grid gap-1">
                      <span className="truncate text-muted-foreground">footer placement/alignment</span>
                      <select
                        value={footerPositionOverride}
                        onChange={(event) =>
                          setFooterPositionOverride(event.target.value as PositionXOverride)
                        }
                        className={labControlSelectClass}
                      >
                        <option value="auto">auto</option>
                        <option value="left">left</option>
                        <option value="center">center</option>
                        <option value="right">right</option>
                      </select>
                    </label>
                    <label className="col-span-1 min-w-0 grid gap-1 sm:col-span-2">
                      <span className="truncate text-muted-foreground">data / signature separation</span>
                      <select
                        value={footerSignatureSeparation}
                        onChange={(event) =>
                          setFooterSignatureSeparation(
                            event.target.value as FooterSignatureSeparation
                          )
                        }
                        className={labControlSelectClass}
                      >
                        <option value="tight">tight</option>
                        <option value="normal">normal</option>
                        <option value="relaxed">relaxed</option>
                      </select>
                    </label>
                  </div>
                </div>
              </div>
            </section>

          </aside>

          <section
            ref={workspaceViewportRef}
            className="min-w-0 xl:h-[var(--lab-workspace-viewport-height)]"
            style={
              workspaceViewportHeight
                ? ({ "--lab-workspace-viewport-height": `${workspaceViewportHeight}px` } as CSSProperties)
                : undefined
            }
          >
            <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-border/80 [background:var(--taller-lab-canvas-backdrop,var(--panel-surface-1,var(--background)))] [box-shadow:var(--elevation-task,var(--panel-shadow-2))]">
              <div className="grid grid-cols-1 items-center gap-2 border-b border-border/90 px-3 py-2 [background:var(--taller-lab-workspace-top-strip,var(--panel-topbar,var(--panel-surface-1,var(--background))))] lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
                <div className="flex min-w-0 max-w-full flex-wrap items-center justify-self-start gap-1 rounded-lg border [border-color:var(--taller-lab-chip-border,var(--border))] [background:var(--taller-lab-chip-surface,var(--taller-lab-sidebar-card,var(--panel-surface-3,var(--surface-3,var(--card)))))] p-1 pr-1 [box-shadow:var(--elevation-base,var(--panel-shadow-1))]">
                  {COMPONENT_TYPES.map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setComponentType(type.id)}
                      className={`${labSegmentedTextButtonClass} min-w-0 max-w-[8.2rem] truncate uppercase ${componentType === type.id ? labChipActiveClass : labChipIdleClass}`}
                    >
                      {COMPONENT_TYPE_LABEL[type.id]}
                    </button>
                  ))}
                  <span className={`${labSegmentedStaticChipClass} min-w-0 max-w-[8.8rem] truncate uppercase [border-color:var(--taller-lab-chip-border,var(--border))] [background:var(--panel-surface-2,var(--surface-2,var(--card)))] text-muted-foreground [box-shadow:var(--elevation-base,var(--panel-shadow-1))]`}>
                    More +{FUTURE_COMPONENT_TYPES_COUNT}
                  </span>
                </div>

                <div className="flex min-w-0 max-w-full flex-wrap justify-self-start rounded-lg border [border-color:var(--taller-lab-chip-border,var(--border))] [background:var(--taller-lab-chip-surface,var(--taller-lab-sidebar-card,var(--panel-surface-3,var(--surface-3,var(--card)))))] p-1 [box-shadow:var(--elevation-base,var(--panel-shadow-1))] lg:justify-self-center">
                  {(["mobile", "tablet", "desktop", "wide"] as const).map((id) => {
                    const Icon = VIEWPORT_BUTTON_LABEL[id].Icon;
                    return (
                      <button
                        key={id}
                        type="button"
                        title={VIEWPORT_BUTTON_LABEL[id].label}
                        aria-label={VIEWPORT_BUTTON_LABEL[id].label}
                        aria-pressed={viewport === id}
                        onClick={() => setViewport(id)}
                        className={`${labSegmentedIconButtonClass} ${viewport === id ? labChipActiveClass : labChipIdleClass}`}
                      >
                        <Icon className={viewportIconClassName} />
                      </button>
                    );
                  })}
                </div>

                <div className="flex min-w-0 max-w-full flex-wrap justify-self-start rounded-lg border [border-color:var(--taller-lab-chip-border,var(--border))] [background:var(--taller-lab-chip-surface,var(--taller-lab-sidebar-card,var(--panel-surface-3,var(--surface-3,var(--card)))))] p-1 [box-shadow:var(--elevation-base,var(--panel-shadow-1))] lg:justify-self-end">
                  {(["preview", "layout"] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setCanvasMode(mode)}
                      className={`${labSegmentedTextButtonClass} uppercase ${canvasMode === mode ? labChipActiveClass : labChipIdleClass}`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/90 px-3 py-2 text-[11px] text-foreground/80 [background:var(--taller-lab-sidebar-card,var(--panel-surface-2,var(--surface-2,var(--card))))]">
                <div className="min-w-0 flex flex-wrap items-center gap-2.5">
                  <span className="min-w-0 max-w-full truncate text-muted-foreground sm:max-w-[25rem]">
                    Hero Lab v1 - source:{" "}
                    <span className="font-semibold text-foreground">{brandScope}</span> / role{" "}
                    {sessionRole ?? "anon"}
                  </span>
                  <span className="truncate">
                    Canvas: <strong className="text-foreground">{viewport}</strong> ({canvasWidth}x{canvasHeight})
                  </span>
                  <span className="shrink-0">Scale: {(canvasScale * 100).toFixed(0)}%</span>
                </div>
                <div className="flex max-w-full flex-wrap items-center justify-end gap-2">
                  <span className={`${labUtilityChipClass} shrink-0 font-semibold`}>
                    Navigation module
                  </span>
                  <span className={`${labUtilityChipClass} min-w-0 max-w-full truncate`}>
                    {burgerNavigationControlsVisible
                      ? burgerControlsLiveOnViewport
                        ? `burger ${effectiveMenuOpen ? "open" : "closed"}`
                        : "burger controls (switch viewport)"
                      : "desktop nav preview"}
                  </span>
                </div>
              </div>

              <div
                ref={previewStageRef}
                className="relative min-h-0 flex-1 overflow-hidden border-t border-border/70 [background:var(--taller-lab-canvas-stage,var(--panel-surface-2,var(--surface-2,var(--card))))] [background-image:var(--taller-lab-canvas-texture,none)] [background-size:var(--taller-lab-canvas-texture-size,auto)] [background-position:center] [box-shadow:inset_0_0_0_1px_color-mix(in_oklab,var(--border)_56%,transparent),inset_0_22px_36px_color-mix(in_oklab,var(--foreground)_8%,transparent)]"
              >
                <div className="absolute inset-0 flex items-center justify-center px-3 py-5">
                  <div
                    className="relative overflow-hidden rounded-[24px] ring-1 [ring-color:color-mix(in_oklab,var(--taller-lab-chip-border,var(--border))_84%,transparent)] [box-shadow:var(--elevation-overlay,var(--panel-shadow-3)),0_0_0_1px_color-mix(in_oklab,var(--foreground)_8%,transparent)]"
                    style={{
                      width: `${scaledCanvasWidth}px`,
                      height: `${scaledCanvasHeight}px`,
                    }}
                  >
                    <div
                      className="relative origin-top-left"
                      style={{
                        width: `${canvasWidth}px`,
                        height: `${canvasHeight}px`,
                        transform: `scale(${canvasScale})`,
                      }}
                    >
                      <PublicHero
                        data={mappedHero}
                        business={{
                          slug: "lab",
                          name: "BCC Lab",
                          activeHeroVariantKey: `validation-${candidateId}`,
                          logoUrl: "/brand/logo-mark.svg",
                        }}
                        mobileMenuStyle={menuStyle}
                        forceMobileMenuOpen={effectiveMenuOpen}
                        onLabMenuOpenChange={(open) => setMenuOpen(open)}
                        navTriggerSize={navTriggerSize}
                        navTriggerAura={navTriggerAura}
                        navTriggerSurface={navTriggerSurface}
                        navTriggerTone={navTriggerTone}
                        navTriggerHover={navTriggerHover}
                        desktopNavSize={desktopNavSize}
                        desktopNavTone={desktopNavTone}
                        desktopNavSurface={desktopNavSurface}
                        desktopNavHover={desktopNavHover}
                        desktopNavPresence={desktopNavPresence}
                        navOpenBehavior={navOpenBehavior}
                        navPanelWidth={navPanelWidth}
                        navPanelOrigin={navPanelOrigin}
                        navPanelIncludeLogo={navPanelIncludeLogo}
                        navPanelStyle={navPanelStyle}
                        navOverlayDensity={navOverlayDensity}
                        navOverlayStyle={navOverlayStyle}
                        navReadabilityBoost={navReadabilityBoost}
                        navMenuBlockPosition={navMenuBlockPosition}
                        navMenuAlignment={navMenuAlignment}
                        navMenuItemSize={navMenuItemSize}
                        navMenuSafeTopOffset={navMenuSafeTopOffset}
                        navMenuSafeSideOffset={navMenuSafeSideOffset}
                        navMenuVerticalSpacing={navMenuVerticalSpacing}
                        navMenuTextTone={navMenuTextTone}
                        headerIntegration={headerIntegration}
                        headerVisualStyle={headerVisualStyle}
                        headerTopSpacing={headerTopSpacing}
                        headerRelation={headerRelation}
                        footerIntegration={footerIntegration}
                        footerVisualStyle={footerVisualStyle}
                        footerDensity={footerDensity}
                        footerSignatureSeparation={footerSignatureSeparation}
                        copyWidth={heroCopyWidth}
                        navigationMode={previewNavigationMode}
                        navPosition={navPosition}
                        headlinePosition={headlinePosition}
                        copyBlockPosition={copyBlockPosition}
                        ctaPosition={ctaPosition}
                        footerPosition={footerPosition}
                        visualPosition={visualPosition}
                        logoPosition={logoPosition}
                        overlayColor={overlayColor}
                        overlayStyleMode={overlayStyleMode}
                        backgroundEmphasis={backgroundEmphasis}
                        labHeadlineTone={labHeadlineTone}
                        mobileHeadlineScale={mobileHeadlineScale}
                        mobileLogoScale={mobileLogoScale}
                        gapLogoHeadline={gapLogoHeadline}
                        gapHeadlineSubheadline={gapHeadlineSubheadline}
                        gapTextCta={gapTextCta}
                        gapCtaFooter={gapCtaFooter}
                        gapFooterDataSignature={gapFooterDataSignature}
                        labSceneOverlayClassName={labSceneOverlayClassName}
                        isLabMode={true}
                      />
                      {SHOW_LAYOUT_GUIDES ? (
                        <div className="pointer-events-none absolute inset-0 z-40">
                          {overlaySlots.map((slot: FreeLayoutSlot) => (
                            <div
                              key={slot.id}
                              className="absolute rounded border border-sky-100/25"
                              style={{
                                left: formatRectPercent(slot.rect.x),
                                top: formatRectPercent(slot.rect.y),
                                width: formatRectPercent(slot.rect.width),
                                height: formatRectPercent(slot.rect.height),
                              }}
                            >
                              <div className="ml-1 mt-1 inline-flex max-w-[94%] items-center gap-1 rounded px-1 py-0.5 text-[10px] font-medium text-sky-100/75">
                                <span>{slot.id}</span>
                                <span className="text-muted-foreground">
                                  {`x:${Math.round(slot.rect.x * 100)} y:${Math.round(slot.rect.y * 100)} w:${Math.round(slot.rect.width * 100)} h:${Math.round(slot.rect.height * 100)}`}
                                </span>
                                {slot.locked ? (
                                  <span className="text-amber-200/75">lock</span>
                                ) : null}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </section>

          <aside className="space-y-4 xl:sticky xl:top-4 xl:h-[calc(100vh-2.25rem)] xl:overflow-y-auto bcc-scrollbar xl:pl-1">
            <section className="rounded-2xl border border-border/80 [background:var(--taller-lab-sidebar-frame,var(--panel-sidebar,var(--surface-2,var(--card))))] p-2.5 [box-shadow:var(--elevation-base,var(--panel-shadow-1))] xl:sticky xl:top-0 xl:z-10">
              <h2 className="text-[11px] font-semibold uppercase tracking-wider text-foreground/80">
                Candidate Status
              </h2>
              <div className="mt-2 flex items-center justify-between rounded-lg border border-border/80 [background:var(--taller-lab-sidebar-card,var(--panel-surface-3,var(--surface-3,var(--card))))] p-2 [box-shadow:var(--elevation-base,var(--panel-shadow-1))]">
                <span className="text-xs text-muted-foreground">verdict</span>
                <span className={`${labStatusBadgeBaseClass} ${verdictToneClass}`}>
                  {evaluation.verdict}
                </span>
              </div>
              <div className="mt-2 rounded-lg border border-border/80 [background:var(--taller-lab-sidebar-card,var(--panel-surface-3,var(--surface-3,var(--card))))] p-2 [box-shadow:var(--elevation-base,var(--panel-shadow-1))]">
                <p className="text-[11px] text-muted-foreground">
                  Component type: <span className="font-semibold text-foreground">{COMPONENT_TYPE_LABEL[componentType]}</span>
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {componentType === "hero" ? "Flujo totalmente activo." : "Tipo visible para roadmap; renderer hero activo en esta iteracion."}
                </p>
              </div>
              <div className="mt-2 rounded-lg border border-border/80 [background:var(--taller-lab-sidebar-card,var(--panel-surface-3,var(--surface-3,var(--card))))] p-2 [box-shadow:var(--elevation-base,var(--panel-shadow-1))]">
                <p className="text-[11px] text-muted-foreground">
                  Final score:{" "}
                  <span className="font-semibold text-foreground">{qualityScore.average}</span> / 100
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Action read:{" "}
                  <span className="font-semibold text-foreground">
                    {recommendedActions[0]?.action ?? "Sin accion prioritaria"}
                  </span>
                </p>
              </div>
            </section>

            <section className="rounded-2xl border border-border/80 [background:var(--taller-lab-sidebar-frame,var(--panel-sidebar,var(--surface-2,var(--card))))] p-2.5 [box-shadow:var(--elevation-base,var(--panel-shadow-1))]">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-[11px] font-semibold uppercase tracking-wider text-foreground/80">
                  4) Evaluation
                </h2>
                <span className={`${labStatusBadgeBaseClass} ${verdictToneClass}`}>
                  {evaluation.verdict}
                </span>
              </div>

              <div className="mt-2 rounded-lg border border-border/80 [background:var(--taller-lab-sidebar-card,var(--panel-surface-3,var(--surface-3,var(--card))))] p-3 [box-shadow:var(--elevation-base,var(--panel-shadow-1))]">
                <p className="text-[11px] uppercase tracking-wide text-foreground/75">Quality score</p>
                <div className="mt-1 flex items-end justify-between gap-2">
                  <p className="text-xl font-semibold [color:var(--taller-lab-accent-strong,var(--processing))]">{qualityScore.average}</p>
                  <p className="text-[11px] text-muted-foreground">sobre 100</p>
                </div>
                <div className="mt-2 space-y-2">
                  {qualityScore.items.map((item) => (
                    <div key={item.key} className="rounded-md border [border-color:color-mix(in_oklab,var(--taller-lab-accent-border,var(--border))_38%,transparent)] [background:var(--panel-topbar,var(--surface-2,var(--card)))] p-2 [box-shadow:var(--elevation-base,var(--panel-shadow-1))]">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[11px] font-semibold text-foreground">{item.label}</p>
                        <p className="text-[11px] [color:var(--taller-lab-accent-strong,var(--processing))]">{item.score}</p>
                      </div>
                      <progress
                        className="mt-1 h-1.5 w-full overflow-hidden rounded-full border [border-color:color-mix(in_oklab,var(--taller-lab-chip-border,var(--border))_68%,transparent)] [&::-moz-progress-bar]:[background:var(--taller-lab-accent-strong,color-mix(in_oklab,var(--processing)_68%,transparent))] [&::-webkit-progress-bar]:[background:color-mix(in_oklab,var(--taller-lab-chip-surface,var(--surface-2,var(--card)))_88%,transparent)] [&::-webkit-progress-value]:[background:var(--taller-lab-accent-strong,color-mix(in_oklab,var(--processing)_68%,transparent))]"
                        value={item.score}
                        max={100}
                        aria-label={`${item.label} score`}
                      >
                        {item.score}
                      </progress>
                      <p className="mt-1 text-[10px] text-muted-foreground">{item.note}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-3 rounded-lg border border-border/80 [background:var(--taller-lab-sidebar-card,var(--panel-surface-3,var(--surface-3,var(--card))))] p-3 [box-shadow:var(--elevation-base,var(--panel-shadow-1))]">
                <p className="text-xs font-semibold text-foreground/75">Why this score</p>
                <ul className="mt-2 space-y-1.5 text-[11px] text-foreground/90">
                  {whyThisScore.map((reason) => (
                    <li key={reason}>- {reason}</li>
                  ))}
                </ul>
              </div>

              <div className="mt-3 rounded-lg border border-border/80 [background:var(--taller-lab-sidebar-card,var(--panel-surface-3,var(--surface-3,var(--card))))] p-3 [box-shadow:var(--elevation-base,var(--panel-shadow-1))]">
                <p className="text-xs font-semibold text-foreground/75">Recommended changes</p>
                <div className="mt-2 space-y-2">
                  {recommendedActions.map((item) => (
                    <div key={`${item.priority}-${item.action}`} className={`rounded-md border p-2 ${actionPriorityToneClass(item.priority)}`}>
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold">{item.action}</p>
                        <span className="rounded-full border border-current/40 [background:color-mix(in_oklab,currentColor_10%,transparent)] px-2 py-0.5 text-[10px] font-semibold uppercase [box-shadow:inset_0_0_0_1px_color-mix(in_oklab,currentColor_12%,transparent)]">
                          {item.priority}
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] opacity-95">{item.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-border/80 [background:var(--taller-lab-sidebar-frame,var(--panel-sidebar,var(--surface-2,var(--card))))] p-2.5 [box-shadow:var(--elevation-base,var(--panel-shadow-1))]">
              <h2 className="text-[11px] font-semibold uppercase tracking-wider text-foreground/80">
                3) Creative Guidance
              </h2>
              <p className="mt-2 text-[11px] text-muted-foreground">
                Sugerencias locales guiadas por el brief. Puedes aplicar propuestas directamente al preview.
              </p>

              <details className="mt-3 rounded-lg border border-border/80 [background:var(--taller-lab-sidebar-card,var(--panel-surface-3,var(--surface-3,var(--card))))] p-2 [box-shadow:var(--elevation-base,var(--panel-shadow-1))]" open>
                <summary className="cursor-pointer text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Headline proposals
                </summary>
                <div className="mt-2 space-y-2">
                  {creativeGuidance.headlines.map((headline) => (
                    <div key={headline} className="rounded-md border border-border/80 [background:var(--panel-topbar,var(--surface-2,var(--card)))] p-2 [box-shadow:var(--elevation-base,var(--panel-shadow-1))]">
                      <p className="text-xs text-foreground">{headline}</p>
                      <button
                        type="button"
                        onClick={() => setHeadlineDraft(headline)}
                        className={labAccentActionButtonClass}
                      >
                        Aplicar headline
                      </button>
                    </div>
                  ))}
                </div>
              </details>

              <details className="mt-3 rounded-lg border border-border/80 [background:var(--taller-lab-sidebar-card,var(--panel-surface-3,var(--surface-3,var(--card))))] p-2 [box-shadow:var(--elevation-base,var(--panel-shadow-1))]">
                <summary className="cursor-pointer text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Subheadline proposals
                </summary>
                <div className="mt-2 space-y-2">
                  {creativeGuidance.subheadlines.map((subheadline) => (
                    <div key={subheadline} className="rounded-md border border-border/80 [background:var(--panel-topbar,var(--surface-2,var(--card)))] p-2 [box-shadow:var(--elevation-base,var(--panel-shadow-1))]">
                      <p className="text-xs text-foreground">{subheadline}</p>
                      <button
                        type="button"
                        onClick={() => setSubheadlineDraft(subheadline)}
                        className={labAccentActionButtonClass}
                      >
                        Aplicar subheadline
                      </button>
                    </div>
                  ))}
                </div>
              </details>

              <details className="mt-3 rounded-lg border border-border/80 [background:var(--taller-lab-sidebar-card,var(--panel-surface-3,var(--surface-3,var(--card))))] p-2 [box-shadow:var(--elevation-base,var(--panel-shadow-1))]">
                <summary className="cursor-pointer text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  CTA proposals
                </summary>
                <div className="mt-2 space-y-2">
                  {creativeGuidance.ctas.map((cta, index) => (
                    <div key={`${cta.primary}-${index}`} className="rounded-md border border-border/80 [background:var(--panel-topbar,var(--surface-2,var(--card)))] p-2 [box-shadow:var(--elevation-base,var(--panel-shadow-1))]">
                      <p className="text-xs text-foreground">Primaria: {cta.primary}</p>
                      <p className="mt-1 text-xs text-muted-foreground">Secundaria: {cta.secondary}</p>
                      <button
                        type="button"
                        onClick={() => {
                          setPrimaryCtaDraft(cta.primary);
                          setSecondaryCtaDraft(cta.secondary);
                        }}
                        className={labAccentActionButtonClass}
                      >
                        Aplicar CTA
                      </button>
                    </div>
                  ))}
                </div>
              </details>

              <div className="mt-3 rounded-lg border border-border/80 [background:var(--taller-lab-sidebar-card,var(--panel-surface-3,var(--surface-3,var(--card))))] p-2 [box-shadow:var(--elevation-base,var(--panel-shadow-1))]">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Atmosfera recomendada
                </p>
                <ul className="mt-2 space-y-1 text-xs text-foreground">
                  {creativeGuidance.atmosphere.map((item) => (
                    <li key={item}>- {item}</li>
                  ))}
                </ul>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={resetCreativeContent}
                  className="rounded-md border border-border/80 [background:var(--taller-lab-sidebar-frame,var(--panel-sidebar,var(--surface-2,var(--card))))] px-2 py-1.5 text-[11px] font-semibold text-foreground [box-shadow:var(--elevation-base,var(--panel-shadow-1))] transition hover:[box-shadow:var(--elevation-interactive,var(--panel-shadow-2))]"
                >
                  Reset propuestas
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setHeadlineDraft(creativeGuidance.headlines[0] ?? "");
                    setSubheadlineDraft(creativeGuidance.subheadlines[0] ?? "");
                    const firstCta = creativeGuidance.ctas[0];
                    setPrimaryCtaDraft(firstCta?.primary ?? "");
                    setSecondaryCtaDraft(firstCta?.secondary ?? "");
                  }}
                  className="rounded-md border [border-color:color-mix(in_oklab,var(--success)_42%,transparent)] [background:var(--success-soft)] px-2 py-1.5 text-[11px] font-semibold [color:var(--success-foreground)] [box-shadow:var(--elevation-base,var(--panel-shadow-1))] transition hover:[box-shadow:var(--elevation-interactive,var(--panel-shadow-2))]"
                >
                  Aplicar pack base
                </button>
              </div>
            </section>

            <section className="rounded-2xl border border-border/80 [background:var(--taller-lab-sidebar-frame,var(--panel-sidebar,var(--surface-2,var(--card))))] p-2.5 [box-shadow:var(--elevation-base,var(--panel-shadow-1))]">
              <h2 className="text-[11px] font-semibold uppercase tracking-wider text-foreground/80">
                Coming next
              </h2>
              <ul className="mt-2 space-y-1 text-[11px] text-muted-foreground">
                <li>- Palette direction</li>
                <li>- Typography system</li>
                <li>- Motion guidance</li>
                <li>- Responsive guidance by breakpoint</li>
              </ul>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}



