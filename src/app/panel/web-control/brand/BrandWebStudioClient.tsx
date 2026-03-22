// src/app/panel/web-control/brand/BrandWebStudioClient.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import BrandEditor from "@/components/panel/brand/BrandEditor";
import {
  LAYER2_THEME_SELECTION_SCHEMA_VERSION,
  applyLayer2SelectionToBrandThemeStateV1,
  listAuthorizedThemePresets,
  loadLayer2ThemeSelection,
  loadOrCreateBusinessThemePolicy,
  publishLayer2Selection,
  resolveAuthorizedPresetForBusiness,
  saveBusinessThemePolicy,
  saveLayer2ThemeSelection,
  type Layer2ThemeSelection,
} from "@/lib/brand-theme/authorized";
import { createDefaultBrandThemeStateV1 } from "@/lib/brand-theme/state/v1";
import {
  loadBrandThemeStateV1,
  saveBrandThemeStateV1,
} from "@/lib/brand-theme/state/storage.v1";
import {
  getBrandChannel,
  getBrandStorageKey,
  getDefaultBrandForScope,
} from "@/lib/brand/storage";
import { getBrand, setBrand } from "@/lib/brand/service";

type ViewportMode = "desktop" | "mobile";
const AUTH_SCOPE = "web" as const;

function readActiveBusinessSlug(): string {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem("bcc:activeBusinessSlug")?.trim() || "";
}

function defer(fn: () => void) {
  const q =
    typeof queueMicrotask === "function"
      ? queueMicrotask
      : (cb: () => void) => Promise.resolve().then(cb);
  q(fn);
}

export default function BrandWebStudioClient() {
  const [slug, setSlug] = useState<string>("");
  const [viewport, setViewport] = useState<ViewportMode>("desktop");
  const [nonce, setNonce] = useState<number>(0);
  const [authorizedRevision, setAuthorizedRevision] = useState(0);
  const [selectionNotice, setSelectionNotice] = useState("");

  useEffect(() => {
    defer(() => setSlug(readActiveBusinessSlug()));
  }, []);

  const canPreview = Boolean(slug.trim());
  const activeSlug = slug.trim();
  const authorizedCatalog = useMemo(
    () => listAuthorizedThemePresets(AUTH_SCOPE).filter((preset) => preset.status === "active"),
    []
  );
  const policy = useMemo(() => {
    if (!activeSlug) return null;
    if (authorizedRevision < 0) return null;
    return loadOrCreateBusinessThemePolicy(AUTH_SCOPE, activeSlug, authorizedCatalog);
  }, [activeSlug, authorizedCatalog, authorizedRevision]);
  const selection = useMemo(() => {
    if (!activeSlug || !policy) return null;
    if (authorizedRevision < 0) return null;
    return (
      loadLayer2ThemeSelection(AUTH_SCOPE, activeSlug) ?? {
        schemaVersion: LAYER2_THEME_SELECTION_SCHEMA_VERSION,
        scope: AUTH_SCOPE,
        businessSlug: activeSlug,
        draft: {
          presetId:
            policy.defaultPresetId ??
            policy.allowedPresetIds[0] ??
            authorizedCatalog[0]?.id ??
            "",
        },
      }
    );
  }, [activeSlug, policy, authorizedCatalog, authorizedRevision]);
  const allowedPresets = useMemo(() => {
    if (!policy) return authorizedCatalog;
    const allowed = new Set(policy.allowedPresetIds);
    return authorizedCatalog.filter((preset) => allowed.has(preset.id));
  }, [policy, authorizedCatalog]);
  const effectivePreset = useMemo(() => {
    if (!policy || !selection) return null;
    return resolveAuthorizedPresetForBusiness({
      scope: AUTH_SCOPE,
      policy,
      selection,
      stage: "draft",
      presets: authorizedCatalog,
    });
  }, [policy, selection, authorizedCatalog]);
  const publishedPreset = useMemo(() => {
    if (!policy || !selection?.published) return null;
    return resolveAuthorizedPresetForBusiness({
      scope: AUTH_SCOPE,
      policy,
      selection,
      stage: "published",
      presets: authorizedCatalog,
    });
  }, [policy, selection, authorizedCatalog]);
  const canPublishDraft = Boolean(selection?.draft.presetId);
  const canRestorePublished = Boolean(selection?.published);

  const previewUrl = useMemo(() => {
    if (!activeSlug) return "/";
    return `/${encodeURIComponent(activeSlug)}?t=${nonce}`;
  }, [activeSlug, nonce]);

  const iframeWrapperClass =
    viewport === "mobile" ? "mx-auto w-[390px] max-w-full" : "w-full";

  useEffect(() => {
    if (!activeSlug || !policy || !selection) return;
    saveBusinessThemePolicy(AUTH_SCOPE, activeSlug, policy, authorizedCatalog);
    saveLayer2ThemeSelection(AUTH_SCOPE, activeSlug, selection);
  }, [activeSlug, policy, selection, authorizedCatalog]);

  useEffect(() => {
    if (!activeSlug || !policy || !selection) return;

    const storageKey = getBrandStorageKey(AUTH_SCOPE, activeSlug);
    const channel = getBrandChannel(AUTH_SCOPE, activeSlug);
    const fallback = getDefaultBrandForScope(AUTH_SCOPE);
    const currentBrand = getBrand(storageKey, channel, fallback);

    const baseState =
      loadBrandThemeStateV1(AUTH_SCOPE, activeSlug) ?? {
        ...createDefaultBrandThemeStateV1(AUTH_SCOPE, activeSlug),
        legacy: {
          brandName: currentBrand.brandName,
          palette: currentBrand.palette,
          mode: currentBrand.mode,
        },
      };

    const effectiveState = applyLayer2SelectionToBrandThemeStateV1({
      baseState,
      policy,
      selection,
      stage: "draft",
      presets: authorizedCatalog,
    });

    saveBrandThemeStateV1(AUTH_SCOPE, effectiveState, activeSlug);

    const nextLegacyBrand = {
      ...currentBrand,
      palette: effectiveState.legacy.palette,
      mode: effectiveState.legacy.mode,
    };

    if (
      nextLegacyBrand.brandName !== currentBrand.brandName ||
      nextLegacyBrand.palette !== currentBrand.palette ||
      nextLegacyBrand.mode !== currentBrand.mode
    ) {
      setBrand(nextLegacyBrand, storageKey, channel, fallback, {
        applyToDocument: false,
      });
    } else if (typeof window !== "undefined") {
      window.dispatchEvent(new Event(channel));
      if (typeof BroadcastChannel !== "undefined") {
        const bc = new BroadcastChannel(channel);
        bc.postMessage({ type: "brand-theme:authorized-selection-update" });
        bc.close();
      }
    }
  }, [activeSlug, policy, selection, authorizedCatalog]);

  function updateDraftPreset(nextPresetId: string) {
    if (!selection || !activeSlug) return;

    const nextSelection: Layer2ThemeSelection = {
      ...selection,
      draft: {
        ...selection.draft,
        presetId: nextPresetId,
      },
      updatedAt: new Date().toISOString(),
      updatedBy: "web-control",
    };

    saveLayer2ThemeSelection(AUTH_SCOPE, activeSlug, nextSelection);
    setAuthorizedRevision((value) => value + 1);
    setSelectionNotice("Draft actualizado.");
    setNonce((value) => value + 1);
  }

  function publishDraftSelection() {
    if (!selection || !activeSlug) return;

    const nextSelection = publishLayer2Selection(selection, "web-control");
    saveLayer2ThemeSelection(AUTH_SCOPE, activeSlug, nextSelection);
    setAuthorizedRevision((value) => value + 1);
    setSelectionNotice("Draft publicado.");
    setNonce((value) => value + 1);
  }

  function restorePublishedToDraft() {
    if (!selection?.published || !activeSlug) return;

    const nextSelection: Layer2ThemeSelection = {
      ...selection,
      draft: {
        ...selection.published,
      },
      updatedAt: new Date().toISOString(),
      updatedBy: "web-control",
    };

    saveLayer2ThemeSelection(AUTH_SCOPE, activeSlug, nextSelection);
    setAuthorizedRevision((value) => value + 1);
    setSelectionNotice("Draft sincronizado con publicado.");
    setNonce((value) => value + 1);
  }

  return (
    <div className="h-full overflow-hidden">
      <div className="h-[calc(100vh-56px)]">
        <div className="grid h-full grid-cols-1 lg:grid-cols-[420px_1fr]">
          {/* LEFT: editor */}
          <aside className="h-full overflow-hidden border-r border-border [background:var(--surface-2,var(--background))]">
            <div className="h-full overflow-y-auto bcc-scrollbar p-4 pb-24 space-y-4">
              <section className="rounded-xl border border-border p-4 text-card-foreground [background:var(--surface-2,var(--card))] [color:var(--card-foreground,var(--foreground))]">
                <div className="space-y-3">
                  <div className="text-sm font-semibold">Apariencia web pública</div>
                  <p className="text-xs [color:var(--text-subtle,var(--muted-foreground))]">
                    Editas solo la marca de la web. El panel no cambia.
                  </p>

                  <div>
                    <label className="text-xs font-medium [color:var(--text-subtle,var(--muted-foreground))]">
                      Business slug activo
                    </label>
                    <input
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="caballeros-barberia"
                      className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring [background:var(--surface-3,var(--muted))]"
                    />
                    <p className="mt-2 text-[11px] [color:var(--text-subtle,var(--muted-foreground))]">
                      Tip: se toma de <code>bcc:activeBusinessSlug</code> si existe.
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setNonce((n) => n + 1)}
                      className="inline-flex h-9 flex-1 items-center justify-center rounded-lg border border-border px-3 text-xs font-semibold [background:var(--cta-secondary,var(--background))] [color:var(--cta-secondary-foreground,var(--foreground))] hover:[background:var(--cta-secondary-hover,var(--muted))]"
                      disabled={!canPreview}
                    >
                      Refrescar preview
                    </button>

                    <a
                      href={previewUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-9 items-center justify-center rounded-lg border border-border px-3 text-xs font-semibold [background:var(--cta-secondary,var(--background))] [color:var(--cta-secondary-foreground,var(--foreground))] hover:[background:var(--cta-secondary-hover,var(--muted))]"
                    >
                      Abrir ↗
                    </a>
                  </div>

                  <div className="rounded-lg border border-border p-3 [background:var(--surface-3,var(--background))]">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs font-semibold">Presets autorizados (Capa 2)</p>
                        <p className="mt-1 text-[11px] [color:var(--text-subtle,var(--muted-foreground))]">
                          Draft/Publish con catálogo curado por Capa 1.
                        </p>
                      </div>
                      <span className="rounded-full border border-border px-2 py-0.5 text-[10px] [color:var(--text-subtle,var(--muted-foreground))]">
                        {allowedPresets.length} presets
                      </span>
                    </div>

                    <label className="mt-3 grid gap-1">
                      <span className="text-[11px] font-medium [color:var(--text-subtle,var(--muted-foreground))]">
                        Preset draft activo
                      </span>
                      <select
                        value={selection?.draft.presetId ?? ""}
                        onChange={(e) => updateDraftPreset(e.target.value)}
                        className="h-9 rounded-lg border border-border px-3 text-xs [background:var(--background)]"
                        disabled={!activeSlug || allowedPresets.length === 0}
                      >
                        {allowedPresets.map((preset) => (
                          <option key={preset.id} value={preset.id}>
                            {preset.label}
                          </option>
                        ))}
                      </select>
                    </label>

                    <div className="mt-2 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={publishDraftSelection}
                        disabled={!canPublishDraft}
                        className="inline-flex h-8 items-center justify-center rounded-md px-2.5 text-[11px] font-semibold [background:var(--cta-primary,var(--primary))] [color:var(--cta-primary-foreground,var(--primary-foreground))] hover:[background:var(--cta-primary-hover,var(--primary))] disabled:opacity-60"
                      >
                        Publicar draft
                      </button>
                      <button
                        type="button"
                        onClick={restorePublishedToDraft}
                        disabled={!canRestorePublished}
                        className="inline-flex h-8 items-center justify-center rounded-md border border-border px-2.5 text-[11px] font-semibold [background:var(--cta-secondary,var(--background))] [color:var(--cta-secondary-foreground,var(--foreground))] hover:[background:var(--cta-secondary-hover,var(--muted))] disabled:opacity-60"
                      >
                        Cargar publicado
                      </button>
                    </div>

                    <div className="mt-2 text-[11px] [color:var(--text-subtle,var(--muted-foreground))]">
                      {selectionNotice || "Sin cambios pendientes."}
                    </div>

                    <div className="mt-3 grid gap-2 rounded-md border border-border p-2 [background:var(--surface-2,var(--card))]">
                      <div className="text-[11px]">
                        <span className="font-medium">Efectivo (draft): </span>
                        <span>{effectivePreset?.label ?? "No resuelto"}</span>
                      </div>
                      <div className="text-[11px] [color:var(--text-subtle,var(--muted-foreground))]">
                        Publicado: {publishedPreset?.label ?? "No publicado"}
                      </div>
                      <div className="text-[11px] [color:var(--text-subtle,var(--muted-foreground))]">
                        Campos permitidos: {policy?.adjustableFields.join(", ") || "ninguno"}
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <BrandEditor scope={"web" as const} businessSlug={slug} />
            </div>
          </aside>

          {/* RIGHT: preview real */}
          <section className="h-full overflow-hidden [background:var(--surface-2,var(--background))]">
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
                <div className="min-w-0">
                  <div className="text-sm font-semibold">Preview real (web pública)</div>
                  <div className="mt-1 text-xs [color:var(--text-subtle,var(--muted-foreground))]">
                    Vista real. Scroll dentro del iframe solo si la web lo necesita.
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setViewport("desktop")}
                    className={[
                      "inline-flex h-9 items-center justify-center rounded-lg border px-3 text-xs font-semibold",
                      viewport === "desktop"
                        ? "border-border [background:var(--accent-soft,var(--muted))] [color:var(--accent-soft-foreground,var(--foreground))]"
                        : "border-border [background:var(--surface-2,var(--background))] hover:[background:var(--surface-3,var(--muted))]",
                    ].join(" ")}
                    disabled={!canPreview}
                  >
                    Desktop
                  </button>

                  <button
                    type="button"
                    onClick={() => setViewport("mobile")}
                    className={[
                      "inline-flex h-9 items-center justify-center rounded-lg border px-3 text-xs font-semibold",
                      viewport === "mobile"
                        ? "border-border [background:var(--accent-soft,var(--muted))] [color:var(--accent-soft-foreground,var(--foreground))]"
                        : "border-border [background:var(--surface-2,var(--background))] hover:[background:var(--surface-3,var(--muted))]",
                    ].join(" ")}
                    disabled={!canPreview}
                  >
                    Mobile
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-hidden p-4">
                <div className={iframeWrapperClass + " h-full"}>
                  <div className="h-full overflow-hidden rounded-xl border border-border [background:var(--surface-3,var(--background))]">
                    {canPreview ? (
                      <iframe
                        title="Preview web pública"
                        src={previewUrl}
                        className="h-full w-full"
                      />
                    ) : (
                      <div className="p-6 text-sm [color:var(--text-subtle,var(--muted-foreground))]">
                        Introduce un slug válido para ver preview.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}  
