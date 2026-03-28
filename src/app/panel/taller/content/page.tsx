"use client";

import { useState } from "react";
import PromoBannerPreview from "@/components/content/PromoBannerPreview";
import PageHeader from "@/components/panel/PageHeader";
import type { ContentBlock } from "@/lib/content/types";
import { MOCK_MEDIA_ASSETS } from "@/lib/media/mock";
import {
  checkIfAssetIsLikelyVectorizable,
  createMockVectorizationResult,
} from "@/lib/media/vectorization";
import { OVERLAY_PRESETS } from "@/lib/overlay/presets";

export default function TallerContentPage() {
  const [title, setTitle] = useState("Promo de temporada");
  const [description, setDescription] = useState(
    "Activa una oferta limitada para convertir mas visitas en reservas esta semana."
  );
  const [overlayPresetId, setOverlayPresetId] = useState(OVERLAY_PRESETS[0]?.id ?? "none");
  const [mediaId, setMediaId] = useState(MOCK_MEDIA_ASSETS[0].id);

  function createPromoBlock(): ContentBlock {
    return {
      id: "temp-id",
      type: "promo",
      title,
      description,
      mediaId,
      overlayPresetId,
      status: "draft",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  const block = createPromoBlock();
  const media = MOCK_MEDIA_ASSETS.find((item) => item.id === block.mediaId);
  const vectorizationCheck = checkIfAssetIsLikelyVectorizable(media?.type ?? "image");
  const vectorizationMockResult = media ? createMockVectorizationResult(media.id) : undefined;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Content Studio"
        description="Primer bloque funcional tipo promo (editor local + preview)."
        actions={
          <button
            type="button"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            Crear contenido
          </button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-4 rounded-xl border border-border bg-card p-5 text-card-foreground">
          <h2 className="text-sm font-semibold">Editor · PromoBanner</h2>

          <label className="grid gap-1">
            <span className="text-xs font-medium text-muted-foreground">Title</span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
              placeholder="Titulo del promo"
            />
          </label>

          <label className="grid gap-1">
            <span className="text-xs font-medium text-muted-foreground">Description</span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="min-h-24 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
              placeholder="Descripcion del bloque"
            />
          </label>

          <label className="grid gap-1">
            <span className="text-xs font-medium text-muted-foreground">Overlay preset</span>
            <select
              value={overlayPresetId}
              onChange={(event) => setOverlayPresetId(event.target.value)}
              className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
            >
              {OVERLAY_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.label}
                </option>
              ))}
            </select>
          </label>

          <div className="grid gap-1">
            <span className="text-xs font-medium text-muted-foreground">Media library</span>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {MOCK_MEDIA_ASSETS.map((item) => {
                const isSelected = item.id === mediaId;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setMediaId(item.id)}
                    aria-pressed={isSelected}
                    className={`overflow-hidden rounded-lg border text-left transition ${
                      isSelected
                        ? "border-primary ring-2 ring-primary/30"
                        : "border-border hover:border-primary/40"
                    }`}
                  >
                    <div className="relative aspect-[16/9] w-full bg-muted">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.url} alt="" className="h-full w-full object-cover" />
                    </div>
                    <div className="space-y-0.5 px-2 py-1.5">
                      <p className="text-xs font-medium text-foreground">{item.id}</p>
                      <p className="text-[11px] text-muted-foreground">{item.collection}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-lg border border-border bg-background px-3 py-2 text-xs text-muted-foreground">
            <p>ID: {media?.id ?? "-"}</p>
            <p>Collection: {media?.collection ?? "-"}</p>
            <p>Brightness: {media?.metadata?.brightness ?? "-"}</p>
            <p>Contrast: {media?.metadata?.contrast ?? "-"}</p>
            <p>Suggested overlay: {media?.metadata?.suggestedOverlay ?? "-"}</p>
          </div>

          <div className="rounded-lg border border-border bg-background px-3 py-2 text-xs text-muted-foreground">
            <p>Likely vectorizable: {vectorizationCheck.isLikelyVectorizable ? "yes" : "no"}</p>
            <p>Reason: {vectorizationCheck.reason}</p>
            <p>
              Mock output SVG URL:{" "}
              {vectorizationCheck.isLikelyVectorizable
                ? vectorizationMockResult?.outputSvgUrl ?? "-"
                : "-"}
            </p>
          </div>

          <p className="text-xs text-muted-foreground">
            Mock local sin DB, sin persistencia y sin media real.
          </p>
        </section>

        <section className="space-y-3 rounded-xl border border-border bg-card p-5 text-card-foreground">
          <h2 className="text-sm font-semibold">Preview en tiempo real</h2>
          <PromoBannerPreview
            title={block.title}
            description={block.description}
            overlayPresetId={block.overlayPresetId}
            mediaUrl={media?.url}
          />
        </section>
      </div>
    </div>
  );
}
