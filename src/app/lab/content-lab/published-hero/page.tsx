"use client";

import { useMemo, useState } from "react";
import PublicHero from "@/components/web/hero/PublicHero";
import { mapPublishedSnapshotToContentPayload } from "@/lib/content-lab/published/mapPublishedSnapshotToContentPayload";
import type { PublishedPieceSnapshot } from "@/lib/content-lab/published/types";
import type { HeroAppearanceVariant } from "@/lib/web/hero/types";

type CandidateId = "barber-pro" | "urban-studio";
type MenuStyle = "opaque" | "integrated";
type CopyWidth = "narrow" | "normal" | "wide";
type BackgroundWeight = "low" | "medium" | "high";
type CtaMode = "balanced" | "primary-focus";
type EvaluationLevel = "alto" | "medio" | "bajo";

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
      primaryCta: {
        label: "Reservar cita",
        href: "#reservar",
      },
      secondaryCta: {
        label: "Ver servicios",
        href: "#servicios",
      },
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
      primaryCta: {
        label: "Agendar ahora",
        href: "#agendar",
      },
      secondaryCta: {
        label: "Conocer plan",
        href: "#plan",
      },
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

function evaluateLevel(value: number): EvaluationLevel {
  if (value >= 75) return "alto";
  if (value >= 50) return "medio";
  return "bajo";
}

export default function PublishedHeroLabPage() {
  const [candidateId, setCandidateId] = useState<CandidateId>("barber-pro");
  const [menuStyle, setMenuStyle] = useState<MenuStyle>("integrated");
  const [menuOpen, setMenuOpen] = useState<boolean>(true);
  const [showBadge, setShowBadge] = useState<boolean>(true);
  const [copyWidth, setCopyWidth] = useState<CopyWidth>("normal");
  const [overlayVariant, setOverlayVariant] = useState<HeroAppearanceVariant>("soft");
  const [backgroundWeight, setBackgroundWeight] = useState<BackgroundWeight>("medium");
  const [ctaMode, setCtaMode] = useState<CtaMode>("balanced");

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

    const backgroundImageUrl =
      backgroundWeight === "low"
        ? ""
        : backgroundWeight === "high"
          ? HERO_CANDIDATES[candidateId].payload.media?.url ?? hero.backgroundImageUrl
          : hero.backgroundImageUrl;

    return {
      ...hero,
      badge: showBadge ? hero.badge : "",
      heroAppearanceVariant: overlayVariant,
      backgroundImageUrl,
    };
  }, [backgroundWeight, candidateId, overlayVariant, showBadge, snapshotForPreview]);

  const evaluation = useMemo(() => {
    const focusScore = menuOpen ? (menuStyle === "opaque" ? 92 : 74) : 66;
    const readabilityScore =
      overlayVariant === "solid"
        ? 86
        : overlayVariant === "soft"
          ? 72
          : backgroundWeight === "high"
            ? 46
            : 63;
    const backgroundControlScore =
      backgroundWeight === "low" ? 90 : backgroundWeight === "medium" ? 72 : 48;
    const visualNoiseScore =
      menuOpen && menuStyle === "integrated" && backgroundWeight === "high"
        ? 38
        : menuOpen
          ? 64
          : 58;
    const ctaClarityScore = ctaMode === "primary-focus" ? 86 : 71;

    const observations: string[] = [];
    if (menuOpen && menuStyle === "opaque") {
      observations.push("la navegacion domina con claridad cuando el drawer esta abierto");
    }
    if (menuOpen && menuStyle === "integrated" && backgroundWeight === "high") {
      observations.push("el fondo compite con el titular en modo integrado");
    }
    if (overlayVariant === "transparent" && backgroundWeight !== "low") {
      observations.push("la legibilidad baja por overlay demasiado ligero");
    }
    if (ctaMode === "primary-focus") {
      observations.push("el CTA principal gana protagonismo sobre la accion secundaria");
    } else {
      observations.push("los CTA quedan equilibrados pero compiten entre si");
    }

    const summary =
      menuStyle === "opaque"
        ? "Modo actual: drawer dominante y foco alto en navegacion mobile."
        : "Modo actual: drawer integrado con el hero; requiere cuidado con fondo intenso.";

    return {
      focusScore,
      readabilityScore,
      backgroundControlScore,
      visualNoiseScore,
      ctaClarityScore,
      observations,
      summary,
    };
  }, [backgroundWeight, ctaMode, menuOpen, menuStyle, overlayVariant]);

  return (
    <main className="min-h-svh w-full bg-slate-950 text-slate-100">
      <div className="mx-auto w-full max-w-7xl px-3 py-4 sm:px-4 sm:py-6">
        <div className="mb-4 rounded-2xl border border-white/15 bg-slate-900/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-sky-300">
            Validation Lab v1
          </p>
          <h1 className="mt-1 text-xl font-bold sm:text-2xl">
            Published Hero Validation Surface
          </h1>
          <p className="mt-2 text-sm text-slate-300">
            Flujo en vivo: PublishedPieceSnapshot -&gt; mapper -&gt; HeroData -&gt; renderer real.
          </p>
        </div>

        <div className="grid gap-4 xl:grid-cols-[22rem_minmax(0,1fr)]">
          <aside className="space-y-4">
            <section className="rounded-2xl border border-white/15 bg-slate-900/70 p-4">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
                Controles
              </h2>

              <div className="mt-4 space-y-4 text-sm">
                <label className="block">
                  <span className="mb-1 block text-slate-300">Candidato</span>
                  <select
                    value={candidateId}
                    onChange={(event) => setCandidateId(event.target.value as CandidateId)}
                    className="w-full rounded-lg border border-white/20 bg-slate-950 px-3 py-2 text-slate-100"
                  >
                    <option value="barber-pro">Hero Candidate · Barber Pro</option>
                    <option value="urban-studio">Hero Candidate · Urban Studio</option>
                  </select>
                </label>

                <label className="block">
                  <span className="mb-1 block text-slate-300">Menu style</span>
                  <select
                    value={menuStyle}
                    onChange={(event) => setMenuStyle(event.target.value as MenuStyle)}
                    className="w-full rounded-lg border border-white/20 bg-slate-950 px-3 py-2 text-slate-100"
                  >
                    <option value="opaque">opaque</option>
                    <option value="integrated">integrated</option>
                  </select>
                </label>

                <label className="flex items-center justify-between gap-3 rounded-lg border border-white/15 bg-slate-950 px-3 py-2">
                  <span className="text-slate-200">Menu abierto en preview</span>
                  <input
                    type="checkbox"
                    checked={menuOpen}
                    onChange={(event) => setMenuOpen(event.target.checked)}
                    className="h-4 w-4 accent-sky-400"
                  />
                </label>

                <label className="flex items-center justify-between gap-3 rounded-lg border border-white/15 bg-slate-950 px-3 py-2">
                  <span className="text-slate-200">Badge visible</span>
                  <input
                    type="checkbox"
                    checked={showBadge}
                    onChange={(event) => setShowBadge(event.target.checked)}
                    className="h-4 w-4 accent-sky-400"
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-slate-300">Copy width</span>
                  <select
                    value={copyWidth}
                    onChange={(event) => setCopyWidth(event.target.value as CopyWidth)}
                    className="w-full rounded-lg border border-white/20 bg-slate-950 px-3 py-2 text-slate-100"
                  >
                    <option value="narrow">narrow</option>
                    <option value="normal">normal</option>
                    <option value="wide">wide</option>
                  </select>
                </label>

                <label className="block">
                  <span className="mb-1 block text-slate-300">Overlay mode</span>
                  <select
                    value={overlayVariant}
                    onChange={(event) =>
                      setOverlayVariant(event.target.value as HeroAppearanceVariant)
                    }
                    className="w-full rounded-lg border border-white/20 bg-slate-950 px-3 py-2 text-slate-100"
                  >
                    <option value="transparent">transparent</option>
                    <option value="soft">soft</option>
                    <option value="solid">solid</option>
                  </select>
                </label>

                <label className="block">
                  <span className="mb-1 block text-slate-300">Background protagonismo</span>
                  <select
                    value={backgroundWeight}
                    onChange={(event) =>
                      setBackgroundWeight(event.target.value as BackgroundWeight)
                    }
                    className="w-full rounded-lg border border-white/20 bg-slate-950 px-3 py-2 text-slate-100"
                  >
                    <option value="low">low</option>
                    <option value="medium">medium</option>
                    <option value="high">high</option>
                  </select>
                </label>

                <label className="block">
                  <span className="mb-1 block text-slate-300">CTA regulation</span>
                  <select
                    value={ctaMode}
                    onChange={(event) => setCtaMode(event.target.value as CtaMode)}
                    className="w-full rounded-lg border border-white/20 bg-slate-950 px-3 py-2 text-slate-100"
                  >
                    <option value="balanced">balanced</option>
                    <option value="primary-focus">primary-focus</option>
                  </select>
                </label>
              </div>
            </section>

            <section className="rounded-2xl border border-white/15 bg-slate-900/70 p-4">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
                Evaluacion
              </h2>

              <div className="mt-4 grid grid-cols-2 gap-2 text-xs sm:text-sm">
                <div className="rounded-lg border border-white/10 bg-slate-950 p-2">
                  <p className="text-slate-400">Foco</p>
                  <p className="font-semibold">
                    {evaluateLevel(evaluation.focusScore)} ({evaluation.focusScore})
                  </p>
                </div>
                <div className="rounded-lg border border-white/10 bg-slate-950 p-2">
                  <p className="text-slate-400">Legibilidad</p>
                  <p className="font-semibold">
                    {evaluateLevel(evaluation.readabilityScore)} ({evaluation.readabilityScore})
                  </p>
                </div>
                <div className="rounded-lg border border-white/10 bg-slate-950 p-2">
                  <p className="text-slate-400">Control del fondo</p>
                  <p className="font-semibold">
                    {evaluateLevel(evaluation.backgroundControlScore)} (
                    {evaluation.backgroundControlScore})
                  </p>
                </div>
                <div className="rounded-lg border border-white/10 bg-slate-950 p-2">
                  <p className="text-slate-400">Ruido visual</p>
                  <p className="font-semibold">
                    {evaluateLevel(evaluation.visualNoiseScore)} ({evaluation.visualNoiseScore})
                  </p>
                </div>
                <div className="col-span-2 rounded-lg border border-white/10 bg-slate-950 p-2">
                  <p className="text-slate-400">Claridad CTA</p>
                  <p className="font-semibold">
                    {evaluateLevel(evaluation.ctaClarityScore)} ({evaluation.ctaClarityScore})
                  </p>
                </div>
              </div>

              <p className="mt-3 rounded-lg border border-sky-300/20 bg-sky-500/10 p-3 text-xs text-sky-100 sm:text-sm">
                {evaluation.summary}
              </p>

              <ul className="mt-3 space-y-2 text-xs text-slate-200 sm:text-sm">
                {evaluation.observations.map((item) => (
                  <li key={item} className="rounded-lg border border-white/10 bg-slate-950 p-2">
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          </aside>

          <section className="overflow-hidden rounded-2xl border border-white/15 bg-slate-900/70">
            <PublicHero
              data={mappedHero}
              business={{
                slug: "lab",
                name: "BCC Lab",
                activeHeroVariantKey: `validation-${candidateId}`,
                logoUrl: "/brand/logo-mark.svg",
              }}
              mobileMenuStyle={menuStyle}
              forceMobileMenuOpen={menuOpen}
              copyWidth={copyWidth}
            />
          </section>
        </div>
      </div>
    </main>
  );
}
