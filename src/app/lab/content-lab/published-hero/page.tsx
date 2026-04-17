"use client";

import { useEffect, useMemo, useRef, useState, type ReactElement } from "react";
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

type CandidateId = "barber-pro" | "urban-studio";
type PreviewViewport = FreeLayoutViewportId;
type MenuStyle = "opaque" | "integrated";
type CopyWidth = "compact" | "balanced" | "expanded";
type PositionX = "left" | "center" | "right";
type CopyBlockPosition = "left" | "center-left" | "center" | "right";
type CtaPosition = "start" | "center" | "end";
type OverlayColor = "blue" | "green" | "amber" | "purple" | "smoke" | "none";
type BackgroundEmphasis = "low" | "medium" | "high";
type CtaMode = "balanced" | "primary-focus";
type Verdict = "weak" | "promising" | "preset-candidate";
type LabComponentType = "hero" | "banner" | "landing";
type HeroLayoutType = "centered" | "split" | "logo-focus" | "media-heavy";
type ActionPriority = "alta" | "media" | "baja";
type CanvasMode = "preview" | "layout";
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
  none: "border border-border/80 bg-transparent",
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

const SCENE_OVERLAY_TINT_CLASS: Record<OverlayColor, string> = {
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
  none: "[background:linear-gradient(136deg,transparent,transparent)]",
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

export default function PublishedHeroLabPage() {
  const [brandScope, setBrandScope] = useState<Extract<BrandScope, "panel" | "studio">>("panel");
  const [sessionRole, setSessionRole] = useState<SessionRole>(null);
  const [componentType, setComponentType] = useState<LabComponentType>("hero");
  const [candidateId, setCandidateId] = useState<CandidateId>("barber-pro");
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
  const [menuStyle, setMenuStyle] = useState<MenuStyle>("integrated");
  const [menuOpen, setMenuOpen] = useState<boolean>(true);
  const [copyWidth, setCopyWidth] = useState<CopyWidth>("balanced");
  const [ctaMode, setCtaMode] = useState<CtaMode>("balanced");
  const [overlayMode, setOverlayMode] = useState<HeroAppearanceVariant>("soft");
  const [overlayColor, setOverlayColor] = useState<OverlayColor>("blue");
  const [backgroundEmphasis, setBackgroundEmphasis] = useState<BackgroundEmphasis>("medium");
  const [badgeVisible, setBadgeVisible] = useState<boolean>(true);
  const [headlineDraft, setHeadlineDraft] = useState<string>("");
  const [subheadlineDraft, setSubheadlineDraft] = useState<string>("");
  const [primaryCtaDraft, setPrimaryCtaDraft] = useState<string>("");
  const [secondaryCtaDraft, setSecondaryCtaDraft] = useState<string>("");
  const previewStageRef = useRef<HTMLDivElement | null>(null);
  const [previewStageSize, setPreviewStageSize] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });

  const viewportConfig = VIEWPORTS[viewport];
  const canvasWidth = viewportConfig.width;
  const canvasHeight = viewportConfig.height;
  const menuToggleEnabled =
    viewportConfig.navigationMode === "mobile" && (viewport === "mobile" || viewport === "tablet");
  const effectiveMenuOpen = menuToggleEnabled ? menuOpen : false;

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
  const freeLayoutDraft = useMemo<FreeLayoutDraft>(() => createDefaultFreeLayout(), []);
  const activeFreeLayoutViewport = useMemo(
    () => freeLayoutDraft.viewports.find((item) => item.viewport === viewport),
    [freeLayoutDraft, viewport]
  );
  const overlaySlots = activeFreeLayoutViewport?.slots ?? [];
  const sceneOverlayTintClass = SCENE_OVERLAY_TINT_CLASS[overlayColor];
  const sceneOverlayOpacityClass = SCENE_OVERLAY_OPACITY_CLASS[overlayMode][backgroundEmphasis];
  const heroLayoutClass = HERO_LAYOUT_CLASS[heroLayoutType];
  const navPosition = heroLayoutClass.navPosition;
  const headlinePosition = heroLayoutClass.headlinePosition;
  const copyBlockPosition = heroLayoutClass.copyBlockPosition;
  const ctaPosition = heroLayoutClass.ctaPosition;
  const footerPosition = heroLayoutClass.footerPosition;
  const visualPosition = heroLayoutClass.visualPosition;
  const logoPosition = heroLayoutClass.logoPosition;
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
      `Direccion base: overlay ${overlayMode}, tinte ${overlayColor}, fondo ${backgroundEmphasis}.`,
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
  }, [backgroundEmphasis, brief, overlayColor, overlayMode]);

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
      backgroundImageUrl: snapshotForPreview.payload.media?.url ?? hero.backgroundImageUrl,
    };
  }, [
    badgeVisible,
    headlineDraft,
    overlayMode,
    primaryCtaDraft,
    secondaryCtaDraft,
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

  return (
    <main className="min-h-svh w-full [background:radial-gradient(136%_120%_at_50%_-10%,color-mix(in_oklab,var(--accent-soft,var(--muted))_66%,transparent),transparent_40%),linear-gradient(180deg,color-mix(in_oklab,var(--panel-surface-1,var(--background))_72%,var(--panel-background,var(--background)))_0%,var(--panel-background,var(--background))_100%)] text-foreground">
      <BrandHydrator scope={brandScope} />
      <div className="mx-auto w-full max-w-[1600px] px-3 py-4 sm:px-4 sm:py-6">
        <div className="mb-4 rounded-2xl border border-border/70 [background:var(--panel-surface-1,var(--background))] p-4 [box-shadow:var(--elevation-interactive,var(--panel-shadow-2))]">
          <p className="text-xs font-semibold uppercase tracking-wider text-processing-foreground">
            Hero Lab v1
          </p>
          <h1 className="mt-1 text-xl font-bold sm:text-2xl">
            Guided Decision Surface
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Workspace creativo guiado: causa a la izquierda, canvas central y lectura accionable a la derecha.
          </p>
          <p className="mt-2 text-[11px] text-muted-foreground">
            Theme source: <span className="font-semibold text-foreground">{brandScope}</span> (role: {sessionRole ?? "anon"})
          </p>
        </div>

        <div className="grid gap-4 xl:grid-cols-[14.5rem_minmax(0,1fr)_16.5rem] 2xl:grid-cols-[15.5rem_minmax(0,1fr)_17.5rem] 2xl:gap-5">
          <aside className="space-y-4 xl:sticky xl:top-4 xl:h-[calc(100vh-2.25rem)] xl:overflow-y-auto xl:pr-1">
            <section className="rounded-2xl border border-border/80 [background:var(--panel-sidebar,var(--surface-2,var(--card)))] p-2.5 [box-shadow:var(--elevation-base,var(--panel-shadow-1))]">
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

            <section className="rounded-2xl border border-border/80 [background:var(--panel-sidebar,var(--surface-2,var(--card)))] p-2.5 [box-shadow:var(--elevation-base,var(--panel-shadow-1))]">
              <h2 className="text-[11px] font-semibold uppercase tracking-wider text-foreground/80">
                2) Composition
              </h2>
              <div className="mt-2 space-y-3 text-sm">
                <label className="block">
                  <span className="mb-1 block text-xs text-muted-foreground">Source</span>
                  <select
                    value={candidateId}
                    onChange={(event) => setCandidateId(event.target.value as CandidateId)}
                    className="w-full rounded-lg border border-border [background:var(--surface-3,var(--card))] px-3 py-2 text-foreground"
                  >
                    <option value="barber-pro">Lab mock - Barber Pro</option>
                    <option value="urban-studio">Lab mock - Urban Studio</option>
                  </select>
                </label>
                <div>
                  <span className="mb-1 block text-xs text-muted-foreground">Hero layout type</span>
                  <div className="grid grid-cols-2 gap-1 rounded-lg border border-border [background:var(--surface-3,var(--card))] p-1">
                    {HERO_LAYOUT_TYPES.map((layoutType) => (
                      <button
                        key={layoutType}
                        type="button"
                        onClick={() => setHeroLayoutType(layoutType)}
                        className={`rounded-md border px-2 py-2 text-center text-[11px] font-semibold uppercase tracking-wide transition ${heroLayoutType === layoutType ? "[border-color:color-mix(in_oklab,var(--processing)_44%,transparent)] bg-processing-soft text-processing-foreground [box-shadow:var(--elevation-base,var(--panel-shadow-1))]" : "border-transparent text-muted-foreground hover:[background:var(--panel-surface-2,var(--surface-2,var(--card)))] hover:[border-color:color-mix(in_oklab,var(--border)_62%,transparent)]"}`}
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
                  <span className="mb-1 block text-muted-foreground">copy width</span>
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
              </div>
            </section>
            <section className="rounded-2xl border border-border/80 [background:var(--panel-sidebar,var(--surface-2,var(--card)))] p-2.5 [box-shadow:var(--elevation-base,var(--panel-shadow-1))]">
              <h2 className="text-[11px] font-semibold uppercase tracking-wider text-foreground/80">
                3) Scene controls
              </h2>
              <div className="mt-2 space-y-2 text-xs">
                <label className="flex items-center justify-between rounded-lg border border-border [background:var(--surface-3,var(--card))] px-3 py-2">
                  <span className="text-foreground">menu open (external)</span>
                  <input
                    type="checkbox"
                    checked={effectiveMenuOpen}
                    onChange={(event) => setMenuOpen(event.target.checked)}
                    disabled={!menuToggleEnabled}
                    className="h-4 w-4 accent-processing disabled:opacity-40"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-muted-foreground">menuStyle</span>
                  <select
                    value={menuStyle}
                    onChange={(event) => setMenuStyle(event.target.value as MenuStyle)}
                    className="w-full rounded-lg border border-border [background:var(--surface-3,var(--card))] px-3 py-2 text-foreground"
                  >
                    <option value="opaque">opaque</option>
                    <option value="integrated">integrated</option>
                  </select>
                </label>
                <p className="rounded-lg border border-border [background:var(--surface-3,var(--card))] px-3 py-2 text-[11px] text-muted-foreground">
                  `opaque` concentra foco en la banda del menu. `integrated` elimina caja visible y navega flotando sobre el hero.
                </p>
                <label className="block">
                  <span className="mb-1 block text-muted-foreground">overlay mode</span>
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
                <div>
                  <span className="mb-1 block text-muted-foreground">overlay tint</span>
                  <div className="grid grid-cols-2 gap-1 rounded-lg border border-border [background:var(--surface-3,var(--card))] p-1">
                    {(["blue", "green", "amber", "purple", "smoke", "none"] as const).map((tint) => (
                      <button
                        key={tint}
                        type="button"
                        onClick={() => setOverlayColor(tint)}
                        className={`inline-flex items-center gap-2 rounded-md border px-2 py-1.5 text-[11px] font-semibold capitalize transition ${overlayColor === tint ? "[border-color:color-mix(in_oklab,var(--processing)_44%,transparent)] bg-processing-soft text-processing-foreground [box-shadow:var(--elevation-base,var(--panel-shadow-1))]" : "border-border/80 text-muted-foreground hover:[background:var(--panel-surface-2,var(--surface-2,var(--card)))]"}`}
                      >
                        <span className={`block h-2.5 w-4 rounded-sm ${OVERLAY_TINT_PREVIEW_CLASS[tint]}`} />
                        {tint}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="mb-1 block text-muted-foreground">background emphasis</span>
                  <div className="inline-flex w-full rounded-lg border border-border [background:var(--surface-3,var(--card))] p-1">
                    {(["low", "medium", "high"] as const).map((emphasis) => (
                      <button
                        key={emphasis}
                        type="button"
                        onClick={() => setBackgroundEmphasis(emphasis)}
                        className={`flex-1 rounded-md border px-2 py-1.5 text-xs font-semibold capitalize transition ${backgroundEmphasis === emphasis ? "[border-color:color-mix(in_oklab,var(--processing)_44%,transparent)] bg-processing-soft text-processing-foreground [box-shadow:var(--elevation-base,var(--panel-shadow-1))]" : "border-transparent text-muted-foreground hover:[background:var(--panel-surface-2,var(--surface-2,var(--card)))] hover:[border-color:color-mix(in_oklab,var(--border)_62%,transparent)]"}`}
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

            <section className="rounded-2xl border border-border/80 [background:var(--panel-sidebar,var(--surface-2,var(--card)))] p-2.5 [box-shadow:var(--elevation-base,var(--panel-shadow-1))]">
              <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-foreground/80">
                3) Scene Controls - Visibility
              </h2>
              <label className="flex items-center justify-between rounded-lg border border-border [background:var(--surface-3,var(--card))] px-3 py-2 text-xs">
                <span className="text-foreground">badge visible</span>
                <input
                  type="checkbox"
                  checked={badgeVisible}
                  onChange={(event) => setBadgeVisible(event.target.checked)}
                  className="h-4 w-4 accent-processing"
                />
              </label>
            </section>

          </aside>

          <section className="min-w-0 xl:h-[calc(100vh-2.25rem)]">
            <section className="flex h-full min-h-[78vh] flex-col overflow-hidden rounded-2xl border border-border/80 [background:var(--panel-surface-1,var(--background))] [box-shadow:var(--elevation-task,var(--panel-shadow-2))]">
              <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 border-b border-border/90 px-3 py-2 [background:color-mix(in_oklab,var(--panel-topbar,var(--panel-surface-1,var(--background)))_78%,var(--accent-soft,var(--muted)))]">
                <div className="flex max-w-full flex-wrap items-center justify-self-start gap-1 rounded-lg border border-border/80 [background:var(--panel-surface-3,var(--surface-3,var(--card)))] p-1 [box-shadow:var(--elevation-base,var(--panel-shadow-1))]">
                  {COMPONENT_TYPES.map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setComponentType(type.id)}
                      className={`rounded-md border px-2 py-1 text-[10px] font-semibold uppercase tracking-wide transition sm:px-2.5 sm:text-[11px] ${componentType === type.id ? "[border-color:color-mix(in_oklab,var(--processing)_48%,transparent)] [background:color-mix(in_oklab,var(--processing-soft)_86%,var(--panel-surface-3,var(--surface-3,var(--card))))] text-processing-foreground [box-shadow:var(--elevation-interactive,var(--panel-shadow-2))]" : "border-transparent text-muted-foreground hover:[background:var(--panel-surface-2,var(--surface-2,var(--card)))] hover:[border-color:color-mix(in_oklab,var(--border)_62%,transparent)]"}`}
                    >
                      {COMPONENT_TYPE_LABEL[type.id]}
                    </button>
                  ))}
                  <span className="rounded-md border border-border/80 [background:var(--panel-surface-2,var(--surface-2,var(--card)))] px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground [box-shadow:var(--elevation-base,var(--panel-shadow-1))] sm:text-[11px]">
                    More +{FUTURE_COMPONENT_TYPES_COUNT}
                  </span>
                </div>

                <div className="inline-flex justify-self-center rounded-lg border border-border/80 [background:var(--panel-surface-3,var(--surface-3,var(--card)))] p-1 [box-shadow:var(--elevation-base,var(--panel-shadow-1))]">
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
                        className={`rounded-md border px-2 py-1.5 transition ${viewport === id ? "[border-color:color-mix(in_oklab,var(--processing)_48%,transparent)] [background:color-mix(in_oklab,var(--processing-soft)_86%,var(--panel-surface-3,var(--surface-3,var(--card))))] text-processing-foreground [box-shadow:var(--elevation-interactive,var(--panel-shadow-2))]" : "border-transparent text-muted-foreground hover:[background:var(--panel-surface-2,var(--surface-2,var(--card)))] hover:[border-color:color-mix(in_oklab,var(--border)_62%,transparent)]"}`}
                      >
                        <Icon className={viewportIconClassName} />
                      </button>
                    );
                  })}
                </div>

                <div className="inline-flex justify-self-end rounded-lg border border-border/80 [background:var(--panel-surface-3,var(--surface-3,var(--card)))] p-1 [box-shadow:var(--elevation-base,var(--panel-shadow-1))]">
                  {(["preview", "layout"] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setCanvasMode(mode)}
                      className={`rounded-md border px-2 py-1 text-[11px] font-semibold uppercase tracking-wide transition ${canvasMode === mode ? "[border-color:color-mix(in_oklab,var(--processing)_48%,transparent)] [background:color-mix(in_oklab,var(--processing-soft)_86%,var(--panel-surface-3,var(--surface-3,var(--card))))] text-processing-foreground [box-shadow:var(--elevation-interactive,var(--panel-shadow-2))]" : "border-transparent text-muted-foreground hover:[background:var(--panel-surface-2,var(--surface-2,var(--card)))] hover:[border-color:color-mix(in_oklab,var(--border)_62%,transparent)]"}`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 border-b border-border/90 px-3 py-2 text-[11px] text-foreground/80 [background:color-mix(in_oklab,var(--panel-surface-2,var(--surface-2,var(--card)))_74%,var(--accent-soft,var(--muted)))]">
                <span>
                  Canvas: <strong className="text-foreground">{viewport}</strong> ({canvasWidth}x{canvasHeight})
                </span>
                <span>Scale: {(canvasScale * 100).toFixed(0)}%</span>
              </div>

              <div
                ref={previewStageRef}
                className="relative h-full flex-1 overflow-hidden border-t border-border/70 [background:var(--panel-surface-2,var(--surface-2,var(--card)))] [box-shadow:inset_0_0_0_1px_color-mix(in_oklab,var(--border)_44%,transparent)]"
              >
                <div className="absolute inset-0 flex items-center justify-center px-3 py-5">
                  <div
                    className="relative overflow-hidden rounded-[24px] ring-1 ring-border/65 [box-shadow:var(--elevation-overlay,var(--panel-shadow-3))]"
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
                        copyWidth={heroCopyWidth}
                        navigationMode={viewportConfig.navigationMode}
                        navPosition={navPosition}
                        headlinePosition={headlinePosition}
                        copyBlockPosition={copyBlockPosition}
                        ctaPosition={ctaPosition}
                        footerPosition={footerPosition}
                        visualPosition={visualPosition}
                        logoPosition={logoPosition}
                        overlayColor={overlayColor}
                        backgroundEmphasis={backgroundEmphasis}
                        labSceneOverlayClassName={`mix-blend-normal transition-opacity duration-200 ${sceneOverlayTintClass} ${sceneOverlayOpacityClass}`}
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

          <aside className="space-y-4 xl:sticky xl:top-4 xl:h-[calc(100vh-2.25rem)] xl:overflow-y-auto xl:pl-1">
            <section className="rounded-2xl border border-border/80 [background:var(--panel-sidebar,var(--surface-2,var(--card)))] p-2.5 [box-shadow:var(--elevation-base,var(--panel-shadow-1))]">
              <h2 className="text-[11px] font-semibold uppercase tracking-wider text-foreground/80">
                Candidate Status
              </h2>
              <div className="mt-2 flex items-center justify-between rounded-lg border border-border/80 [background:var(--panel-surface-3,var(--surface-3,var(--card)))] p-2 [box-shadow:var(--elevation-base,var(--panel-shadow-1))]">
                <span className="text-xs text-muted-foreground">verdict</span>
                <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ring-1 ring-border/25 [box-shadow:var(--elevation-base,var(--panel-shadow-1))] ${verdictToneClass}`}>
                  {evaluation.verdict}
                </span>
              </div>
              <div className="mt-2 rounded-lg border border-border/80 [background:var(--panel-surface-3,var(--surface-3,var(--card)))] p-2 [box-shadow:var(--elevation-base,var(--panel-shadow-1))]">
                <p className="text-[11px] text-muted-foreground">
                  Component type: <span className="font-semibold text-foreground">{COMPONENT_TYPE_LABEL[componentType]}</span>
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {componentType === "hero" ? "Flujo totalmente activo." : "Tipo visible para roadmap; renderer hero activo en esta iteracion."}
                </p>
              </div>
            </section>

            <section className="rounded-2xl border border-border/80 [background:var(--panel-sidebar,var(--surface-2,var(--card)))] p-2.5 [box-shadow:var(--elevation-base,var(--panel-shadow-1))]">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-[11px] font-semibold uppercase tracking-wider text-foreground/80">
                  4) Evaluation
                </h2>
                <span className={`rounded-full border px-3 py-1 text-xs font-semibold ring-1 ring-border/25 [box-shadow:var(--elevation-base,var(--panel-shadow-1))] ${verdictToneClass}`}>
                  {evaluation.verdict}
                </span>
              </div>

              <div className="mt-2 rounded-lg border border-border/80 [background:var(--panel-surface-3,var(--surface-3,var(--card)))] p-3 [box-shadow:var(--elevation-base,var(--panel-shadow-1))]">
                <p className="text-[11px] uppercase tracking-wide text-foreground/75">Quality score</p>
                <div className="mt-1 flex items-end justify-between gap-2">
                  <p className="text-xl font-semibold text-foreground">{qualityScore.average}</p>
                  <p className="text-[11px] text-muted-foreground">sobre 100</p>
                </div>
                <div className="mt-2 space-y-2">
                  {qualityScore.items.map((item) => (
                    <div key={item.key} className="rounded-md border border-border/80 [background:var(--panel-topbar,var(--surface-2,var(--card)))] p-2 [box-shadow:var(--elevation-base,var(--panel-shadow-1))]">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[11px] font-semibold text-foreground">{item.label}</p>
                        <p className="text-[11px] text-muted-foreground">{item.score}</p>
                      </div>
                      <progress
                        className="mt-1 h-1.5 w-full overflow-hidden rounded-full [&::-moz-progress-bar]:[background:color-mix(in_oklab,var(--processing)_68%,transparent)] [&::-webkit-progress-bar]:[background:color-mix(in_oklab,var(--surface-2,var(--card))_84%,transparent)] [&::-webkit-progress-value]:[background:color-mix(in_oklab,var(--processing)_68%,transparent)]"
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

              <div className="mt-3 rounded-lg border border-border/80 [background:var(--panel-surface-3,var(--surface-3,var(--card)))] p-3 [box-shadow:var(--elevation-base,var(--panel-shadow-1))]">
                <p className="text-xs font-semibold text-foreground/75">Why this score</p>
                <ul className="mt-2 space-y-1.5 text-[11px] text-foreground/90">
                  {whyThisScore.map((reason) => (
                    <li key={reason}>- {reason}</li>
                  ))}
                </ul>
              </div>

              <div className="mt-3 rounded-lg border border-border/80 [background:var(--panel-surface-3,var(--surface-3,var(--card)))] p-3 [box-shadow:var(--elevation-base,var(--panel-shadow-1))]">
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

            <section className="rounded-2xl border border-border/80 [background:var(--panel-sidebar,var(--surface-2,var(--card)))] p-2.5 [box-shadow:var(--elevation-base,var(--panel-shadow-1))]">
              <h2 className="text-[11px] font-semibold uppercase tracking-wider text-foreground/80">
                3) Creative Guidance
              </h2>
              <p className="mt-2 text-[11px] text-muted-foreground">
                Sugerencias locales guiadas por el brief. Puedes aplicar propuestas directamente al preview.
              </p>

              <details className="mt-3 rounded-lg border border-border/80 [background:var(--panel-surface-3,var(--surface-3,var(--card)))] p-2 [box-shadow:var(--elevation-base,var(--panel-shadow-1))]" open>
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
                        className="mt-2 rounded-md border [border-color:color-mix(in_oklab,var(--processing)_42%,transparent)] bg-processing-soft px-2 py-1 text-[11px] font-semibold text-processing-foreground [box-shadow:var(--elevation-base,var(--panel-shadow-1))] transition hover:[box-shadow:var(--elevation-interactive,var(--panel-shadow-2))]"
                      >
                        Aplicar headline
                      </button>
                    </div>
                  ))}
                </div>
              </details>

              <details className="mt-3 rounded-lg border border-border/80 [background:var(--panel-surface-3,var(--surface-3,var(--card)))] p-2 [box-shadow:var(--elevation-base,var(--panel-shadow-1))]">
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
                        className="mt-2 rounded-md border [border-color:color-mix(in_oklab,var(--processing)_42%,transparent)] bg-processing-soft px-2 py-1 text-[11px] font-semibold text-processing-foreground [box-shadow:var(--elevation-base,var(--panel-shadow-1))] transition hover:[box-shadow:var(--elevation-interactive,var(--panel-shadow-2))]"
                      >
                        Aplicar subheadline
                      </button>
                    </div>
                  ))}
                </div>
              </details>

              <details className="mt-3 rounded-lg border border-border/80 [background:var(--panel-surface-3,var(--surface-3,var(--card)))] p-2 [box-shadow:var(--elevation-base,var(--panel-shadow-1))]">
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
                        className="mt-2 rounded-md border [border-color:color-mix(in_oklab,var(--processing)_42%,transparent)] bg-processing-soft px-2 py-1 text-[11px] font-semibold text-processing-foreground [box-shadow:var(--elevation-base,var(--panel-shadow-1))] transition hover:[box-shadow:var(--elevation-interactive,var(--panel-shadow-2))]"
                      >
                        Aplicar CTA
                      </button>
                    </div>
                  ))}
                </div>
              </details>

              <div className="mt-3 rounded-lg border border-border/80 [background:var(--panel-surface-3,var(--surface-3,var(--card)))] p-2 [box-shadow:var(--elevation-base,var(--panel-shadow-1))]">
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
                  className="rounded-md border border-border/80 [background:var(--panel-sidebar,var(--surface-2,var(--card)))] px-2 py-1.5 text-[11px] font-semibold text-foreground [box-shadow:var(--elevation-base,var(--panel-shadow-1))] transition hover:[box-shadow:var(--elevation-interactive,var(--panel-shadow-2))]"
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

            <section className="rounded-2xl border border-border/80 [background:var(--panel-sidebar,var(--surface-2,var(--card)))] p-2.5 [box-shadow:var(--elevation-base,var(--panel-shadow-1))]">
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
