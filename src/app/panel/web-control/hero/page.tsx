"use client";

import { useEffect, useMemo, useState } from "react";
import type { HeroData } from "@/lib/web/hero/types";
import { DEFAULT_HERO } from "@/lib/web/hero/types";

type BusinessPublic = {
  name: string;
  slug: string;
  activeHeroVariantKey: string;
};

const PRESET_OPTIONS = [
  { key: "default", label: "default (base)" },
  { key: "presetA", label: "presetA (barbería)" },
  { key: "presetB", label: "presetB (evento)" },
  { key: "presetC", label: "presetC (campaña)" },
] as const;

type PresetKey = (typeof PRESET_OPTIONS)[number]["key"];
type ViewportMode = "desktop" | "mobile";

/**
 * ✅ Catálogo MVP de assets permitidos.
 * (Más adelante vendrá de Capa 1 / Media Center)
 */
const ALLOWED_LOGOS = [
  { label: "Logo mark (BCC)", url: "/brand/logo-mark.svg" },
  { label: "Caballeros (PNG)", url: "/brand/caballeros-logo.png" },
] as const;

const ALLOWED_HERO_BACKGROUNDS = [
  { label: "Barber tools", url: "/hero/barber-tools.jpg" },
  { label: "Barber close", url: "/hero/barber-close.jpg" },
  { label: "Dark abstract", url: "/hero/dark-abstract.jpg" },
] as const;

function normalizeVariantKey(value: string) {
  const v = String(value || "").trim();
  return v.length ? v : "default";
}

async function fetchBusinessPublic(slug: string): Promise<BusinessPublic | null> {
  const res = await fetch(
    `/api/web/public/business?slug=${encodeURIComponent(slug)}`,
    { cache: "no-store" }
  );
  if (!res.ok) return null;
  const json = (await res.json()) as { ok: boolean; business?: BusinessPublic };
  return json?.business ?? null;
}

async function fetchHero(args: {
  status: "draft" | "published";
  slug: string;
  variantKey: string;
}) {
  const res = await fetch(
    `/api/web/hero?status=${args.status}&slug=${encodeURIComponent(
      args.slug
    )}&variantKey=${encodeURIComponent(args.variantKey)}`,
    { cache: "no-store" }
  );
  if (!res.ok) throw new Error("No se pudo cargar el hero");
  return (await res.json()) as { ok: boolean; status: string; data: HeroData };
}

async function saveDraft(args: { slug: string; variantKey: string; next: HeroData }) {
  const res = await fetch(
    `/api/web/hero?slug=${encodeURIComponent(args.slug)}&variantKey=${encodeURIComponent(args.variantKey)}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(args.next),
    }
  );
  if (!res.ok) throw new Error("No se pudo guardar el draft");
}

async function publishDraft(args: { slug: string; variantKey: string }) {
  const res = await fetch(
    `/api/web/hero/publish?slug=${encodeURIComponent(args.slug)}&variantKey=${encodeURIComponent(args.variantKey)}`,
    { method: "POST" }
  );
  if (!res.ok) throw new Error("No se pudo publicar");
}

/**
 * Capa 2: cambia el preset activo del negocio (escritura protegida).
 * IMPORTANTE: enviamos también slug para actualizar el business correcto.
 */
async function setActivePreset(args: { variantKey: PresetKey; slug: string }) {
  const res = await fetch("/api/panel/business/hero-active", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ variantKey: args.variantKey, slug: args.slug }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || "No se pudo cambiar el preset activo");
  }

  return (await res.json()) as { ok: boolean; business?: BusinessPublic };
}

export default function HeroControlPage() {
  const demoSlug =
    (typeof process !== "undefined" &&
      (process.env.NEXT_PUBLIC_DEMO_BUSINESS_SLUG as string | undefined)) ||
    "";

  const [slug, setSlug] = useState<string>(demoSlug || "");
  const [business, setBusiness] = useState<BusinessPublic | null>(null);

  const activeVariantKey = useMemo<string>(() => {
    return normalizeVariantKey(business?.activeHeroVariantKey || "default");
  }, [business?.activeHeroVariantKey]);

  const [form, setForm] = useState<HeroData>(DEFAULT_HERO);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string>("");

  const [viewport, setViewport] = useState<ViewportMode>("desktop");
  const [editorOpen, setEditorOpen] = useState<boolean>(false);
  const [previewNonce, setPreviewNonce] = useState<number>(0);

  // ✅ Guardar slug activo para Sidebar/Topbar
  useEffect(() => {
    if (business?.slug) localStorage.setItem("bcc:activeBusinessSlug", business.slug);
  }, [business?.slug]);

  // ✅ Auto-abrir editor SOLO 1ª vez
  useEffect(() => {
    try {
      const seen = localStorage.getItem("bcc:seenHeroEditor");
      if (!seen) {
        setEditorOpen(true);
        localStorage.setItem("bcc:seenHeroEditor", "1");
      }
    } catch {
      // si falla localStorage, no pasa nada
    }
  }, []);

  // 1) Cargar negocio cuando haya slug
  useEffect(() => {
    let alive = true;

    (async () => {
      if (!slug.trim()) {
        if (!alive) return;
        setBusiness(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setMsg("");

      try {
        const b = await fetchBusinessPublic(slug);
        if (!alive) return;

        setBusiness(b);
        if (!b) {
          setForm(DEFAULT_HERO);
          setMsg("Negocio no encontrado (revisa slug).");
        }
      } catch {
        if (!alive) return;
        setBusiness(null);
        setMsg("Error cargando negocio.");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [slug]);

  // 2) Cargar draft del preset activo
  useEffect(() => {
    let alive = true;

    (async () => {
      if (!business?.slug) return;

      setLoading(true);
      setMsg("");

      try {
        const { data } = await fetchHero({
          status: "draft",
          slug: business.slug,
          variantKey: activeVariantKey,
        });

        if (!alive) return;
        setForm(data ?? DEFAULT_HERO);
      } catch {
        if (!alive) return;
        setForm(DEFAULT_HERO);
        setMsg("No se pudo cargar el draft (usando default).");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [business?.slug, activeVariantKey]);

  async function update<K extends keyof HeroData>(key: K, value: HeroData[K]) {
    if (!business?.slug) return;

    const next: HeroData = { ...form, [key]: value };
    setForm(next);

    try {
      setSaving(true);
      setMsg("");
      await saveDraft({ slug: business.slug, variantKey: activeVariantKey, next });
      setMsg("Guardado ✓");
    } catch {
      setMsg("Error guardando draft");
    } finally {
      setSaving(false);
    }
  }

  async function reset() {
    if (!business?.slug) return;

    const next = DEFAULT_HERO;
    setForm(next);

    try {
      setSaving(true);
      setMsg("");
      await saveDraft({ slug: business.slug, variantKey: activeVariantKey, next });
      setMsg("Reset guardado ✓");
      setPreviewNonce((n) => n + 1);
    } catch {
      setMsg("Error en reset");
    } finally {
      setSaving(false);
    }
  }

  async function publish() {
    if (!business?.slug) return;

    try {
      setSaving(true);
      setMsg("");
      await publishDraft({ slug: business.slug, variantKey: activeVariantKey });
      setMsg("Publicado ✅ (Web pública lee PUBLISHED)");
      setPreviewNonce((n) => n + 1);
    } catch {
      setMsg("Error publicando");
    } finally {
      setSaving(false);
    }
  }

  async function changeActivePreset(nextKey: PresetKey) {
    if (!business?.slug) return;

    const businessSlug = business.slug;

    try {
      setSaving(true);
      setMsg("");

      await setActivePreset({ variantKey: nextKey, slug: businessSlug });

      const b = await fetchBusinessPublic(businessSlug);
      setBusiness(b);

      setMsg(`Preset activo cambiado a "${nextKey}" ✓`);
      setPreviewNonce((n) => n + 1);
    } catch (e) {
      console.error(e);
      setMsg("Error cambiando preset activo");
    } finally {
      setSaving(false);
    }
  }

  const canPreview = Boolean(business?.slug);
  const publishedUrl = business?.slug ? `/${encodeURIComponent(business.slug)}?t=${previewNonce}` : "/";
  const iframeWrapperClass = viewport === "mobile" ? "mx-auto w-[390px] max-w-full" : "w-full";

  if (loading) {
    return <div className="text-sm text-muted-foreground">Cargando…</div>;
  }

  return (
    <div className="space-y-4">
      {/* Handle flotante (solo si editor está cerrado) */}
      

      {/* Contexto */}
      <section className="rounded-xl border border-border bg-card p-4 text-card-foreground sm:p-6">
        <div className="grid gap-4 md:grid-cols-12 md:items-end">
          <div className="md:col-span-6">
            <label htmlFor="business-slug" className="text-sm font-medium">
              Business slug (demo)
            </label>
            <input
              id="business-slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="caballeros-barberia"
              className="mt-2 w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm outline-none placeholder:text-muted-foreground/70 focus:ring-2 focus:ring-ring"
            />
            <p className="mt-2 text-xs text-muted-foreground">
              Negocio:{" "}
              <span className="font-semibold text-foreground">{business?.name || "—"}</span>{" "}
              · mostrando:{" "}
              <span className="font-semibold text-foreground">PUBLISHED/{activeVariantKey}</span>
            </p>
          </div>

          <div className="md:col-span-3">
            <label htmlFor="active-preset" className="text-sm font-medium">
              Preset activo (web)
            </label>
            <select
              id="active-preset"
              value={activeVariantKey}
              onChange={(e) => changeActivePreset(normalizeVariantKey(e.target.value) as PresetKey)}
              className="mt-2 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              disabled={!business?.slug || saving}
            >
              {PRESET_OPTIONS.map((p) => (
                <option key={p.key} value={p.key}>
                  {p.label}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs text-muted-foreground">
              La web renderiza <b>PUBLISHED</b> del preset activo.
            </p>
          </div>

          <div className="md:col-span-3 flex flex-col gap-2 md:items-end">
            <button
              type="button"
              onClick={() => setEditorOpen(true)}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-border bg-background px-4 text-sm font-medium hover:bg-muted"
              disabled={!business?.slug}
              title="Editar Hero"
            >
              Editar Hero
            </button>

            <div className="flex w-full items-center justify-between gap-2 md:w-auto">
              <button
                type="button"
                onClick={() => setViewport("desktop")}
                className={`inline-flex h-9 flex-1 items-center justify-center rounded-lg border px-3 text-xs font-semibold md:flex-none ${
                  viewport === "desktop"
                    ? "border-border bg-muted"
                    : "border-border bg-background hover:bg-muted"
                }`}
                disabled={!canPreview}
              >
                Desktop
              </button>
              <button
                type="button"
                onClick={() => setViewport("mobile")}
                className={`inline-flex h-9 flex-1 items-center justify-center rounded-lg border px-3 text-xs font-semibold md:flex-none ${
                  viewport === "mobile"
                    ? "border-border bg-muted"
                    : "border-border bg-background hover:bg-muted"
                }`}
                disabled={!canPreview}
              >
                Mobile
              </button>
            </div>

            <div className="text-xs text-muted-foreground">
              {saving ? "Guardando…" : msg ? msg : ""}
            </div>
          </div>
        </div>
      </section>

      {/* Preview */}
      <section className="rounded-xl border border-border bg-card p-3 text-card-foreground sm:p-4">
        <div className="flex items-center justify-between gap-3 px-1 pb-3">
          <div>
            <h2 className="text-sm font-semibold">Preview real (web pública)</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Lo que ve el cliente: <b>PUBLISHED</b> del preset activo.
            </p>
          </div>

          <a
            href={business?.slug ? `/${encodeURIComponent(business.slug)}` : "/"}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-9 items-center justify-center rounded-lg border border-border bg-background px-3 text-xs font-semibold hover:bg-muted"
          >
            Abrir ↗
          </a>
        </div>

        <div className={iframeWrapperClass}>
          <div className="rounded-xl border border-border bg-background overflow-hidden">
            {canPreview ? (
              <iframe title="Preview web pública" src={publishedUrl} className="h-[80vh] w-full" />
            ) : (
              <div className="p-6 text-sm text-muted-foreground">
                Introduce un slug válido para ver el preview.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ✅ EDITOR SLIDE-IN (izquierda) */}
      <div
        className={[
          "fixed inset-0 z-50",
          editorOpen ? "pointer-events-auto" : "pointer-events-none",
        ].join(" ")}
      >
        {/* Backdrop sin blur */}
        <div
          className={[
            "absolute inset-0 bg-black/50 transition-opacity duration-200",
            editorOpen ? "opacity-100" : "opacity-0",
          ].join(" ")}
          onClick={() => setEditorOpen(false)}
        />

        {/* Panel */}
        <div
          className={[
            "absolute left-0 top-0 h-full w-130 max-w-[92vw] border-r border-border bg-background/95 backdrop-blur",
            "transition-transform duration-200 ease-out",
            editorOpen ? "translate-x-0" : "-translate-x-full",
          ].join(" ")}
        >
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-foreground">
                  Editor Hero (Draft/{activeVariantKey})
                </div>
                <div className="text-xs text-muted-foreground">
                  Compacto: selects + avanzado desplegable.
                </div>
              </div>

              <button
                type="button"
                onClick={() => setEditorOpen(false)}
                className="inline-flex h-9 items-center justify-center rounded-lg border border-border bg-background px-3 text-xs font-semibold hover:bg-muted"
              >
                Cerrar
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {/* Logo (select compacto) */}
              <div className="rounded-xl border border-border bg-card p-4">
                <label htmlFor="hero-logo-select" className="text-sm font-semibold text-foreground">
                  Logo (disponibles)
                </label>
                <select
                  id="hero-logo-select"
                  value={form.logoUrl ?? ""}
                  onChange={(e) => update("logoUrl", e.target.value)}
                  className="mt-2 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  disabled={!business?.slug || saving}
                >
                  <option value="">(sin logo)</option>
                  {ALLOWED_LOGOS.map((l) => (
                    <option key={l.url} value={l.url}>
                      {l.label}
                    </option>
                  ))}
                </select>

                <details className="mt-3 rounded-lg border border-border bg-background p-3">
                  <summary className="cursor-pointer text-xs font-semibold text-muted-foreground">
                    Avanzado (URL manual)
                  </summary>
                  <div className="mt-3">
                    <label htmlFor="hero-logo-manual" className="text-xs font-medium text-muted-foreground">
                      Logo URL
                    </label>
                    <input
                      id="hero-logo-manual"
                      value={form.logoUrl ?? ""}
                      onChange={(e) => update("logoUrl", e.target.value)}
                      className="mt-1 w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm outline-none placeholder:text-muted-foreground/70 focus:ring-2 focus:ring-ring"
                      placeholder="/brand/caballeros-logo.png"
                      disabled={!business?.slug}
                    />
                  </div>
                </details>
              </div>

              {/* Fondo (select compacto) */}
              <div className="rounded-xl border border-border bg-card p-4">
                <label htmlFor="hero-bg-select" className="text-sm font-semibold text-foreground">
                  Fondo Hero (disponibles)
                </label>
                <select
                  id="hero-bg-select"
                  value={form.backgroundImageUrl ?? ""}
                  onChange={(e) => update("backgroundImageUrl", e.target.value)}
                  className="mt-2 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  disabled={!business?.slug || saving}
                >
                  <option value="">(sin fondo / degradado)</option>
                  {ALLOWED_HERO_BACKGROUNDS.map((b) => (
                    <option key={b.url} value={b.url}>
                      {b.label}
                    </option>
                  ))}
                </select>

                <details className="mt-3 rounded-lg border border-border bg-background p-3">
                  <summary className="cursor-pointer text-xs font-semibold text-muted-foreground">
                    Avanzado (URL manual)
                  </summary>
                  <div className="mt-3">
                    <label htmlFor="hero-bg-manual" className="text-xs font-medium text-muted-foreground">
                      backgroundImageUrl
                    </label>
                    <input
                      id="hero-bg-manual"
                      value={form.backgroundImageUrl ?? ""}
                      onChange={(e) => update("backgroundImageUrl", e.target.value)}
                      className="mt-1 w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm outline-none placeholder:text-muted-foreground/70 focus:ring-2 focus:ring-ring"
                      placeholder="/hero/mi-fondo.jpg"
                      disabled={!business?.slug}
                    />
                  </div>
                </details>
              </div>

              {/* Textos */}
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="text-sm font-semibold text-foreground">Textos</div>

                <div className="mt-3 space-y-3">
                  <div>
                    <label htmlFor="hero-badge" className="text-xs font-medium text-muted-foreground">
                      Badge
                    </label>
                    <input
                      id="hero-badge"
                      value={form.badge}
                      onChange={(e) => update("badge", e.target.value)}
                      className="mt-1 w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                      disabled={!business?.slug}
                    />
                  </div>

                  <div>
                    <label htmlFor="hero-title" className="text-xs font-medium text-muted-foreground">
                      Título
                    </label>
                    <input
                      id="hero-title"
                      value={form.title}
                      onChange={(e) => update("title", e.target.value)}
                      className="mt-1 w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                      disabled={!business?.slug}
                    />
                  </div>

                  <div>
                    <label htmlFor="hero-description" className="text-xs font-medium text-muted-foreground">
                      Descripción
                    </label>
                    <textarea
                      id="hero-description"
                      value={form.description}
                      onChange={(e) => update("description", e.target.value)}
                      className="mt-1 min-h-24 w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                      disabled={!business?.slug}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-border px-4 py-3">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={reset}
                  className="inline-flex h-10 flex-1 items-center justify-center rounded-lg border border-border bg-background px-4 text-sm font-semibold hover:bg-muted"
                  disabled={!business?.slug || saving}
                >
                  Reset
                </button>

                <button
                  type="button"
                  onClick={publish}
                  className="inline-flex h-10 flex-1 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90"
                  disabled={!business?.slug || saving}
                >
                  Publish
                </button>
              </div>

              <p className="mt-2 text-xs text-muted-foreground">
                {saving ? "Guardando…" : msg ? msg : "Listo."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}