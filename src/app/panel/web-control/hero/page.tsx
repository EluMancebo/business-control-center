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
    `/api/web/hero?slug=${encodeURIComponent(args.slug)}&variantKey=${encodeURIComponent(
      args.variantKey
    )}`,
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
    `/api/web/hero/publish?slug=${encodeURIComponent(
      args.slug
    )}&variantKey=${encodeURIComponent(args.variantKey)}`,
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
    } catch {
      setMsg("Error publicando");
    } finally {
      setSaving(false);
    }
  }

  async function changeActivePreset(nextKey: PresetKey) {
    if (!business?.slug) return;

    // blindaje: guardamos slug en variable local (evita problemas TS/null)
    const businessSlug = business.slug;

    try {
      setSaving(true);
      setMsg("");

      await setActivePreset({ variantKey: nextKey, slug: businessSlug });

      // recargar desde público para reflejar persistencia real
      const b = await fetchBusinessPublic(businessSlug);
      setBusiness(b);

      setMsg(`Preset activo cambiado a "${nextKey}" ✓`);
    } catch (e) {
      console.error(e);
      setMsg("Error cambiando preset activo");
      // opcional: console para depurar
      // console.error(e);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="text-sm text-muted-foreground">Cargando…</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-foreground">Web Control · Hero</h1>
        <p className="text-sm text-muted-foreground">
          Editas el <b>Draft</b> por preset. Luego <b>Publish</b> para producción.
        </p>
      </div>

      {/* Contexto negocio */}
      <section className="rounded-xl border border-border bg-card p-4 text-card-foreground sm:p-6">
        <div className="grid gap-4 sm:grid-cols-3 sm:items-end">
          <div className="sm:col-span-2">
            <label htmlFor="business-slug" className="text-sm font-medium">
              Business slug (demo)
            </label>
            <input
              id="business-slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="caballeros-barberia"
              className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            <p className="mt-2 text-xs text-muted-foreground">
              Recomendado: define <code>NEXT_PUBLIC_DEMO_BUSINESS_SLUG</code> para no teclearlo.
            </p>
          </div>

          <div className="sm:col-span-1">
            <div className="text-sm font-medium">Preset activo</div>

          <label htmlFor="active-preset" className="text-sm font-medium">Preset activo</label>  
            <select
              id="active-preset"
              value={activeVariantKey}
              onChange={(e) =>
                changeActivePreset(normalizeVariantKey(e.target.value) as PresetKey)
              }
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
              Este preset es el que verá la web pública.
            </p>
          </div>
        </div>

        <div className="mt-4 text-xs text-muted-foreground">
          {business?.name ? (
            <>
              Negocio: <span className="font-semibold text-foreground">{business.name}</span> ·{" "}
              slug: <span className="font-semibold text-foreground">{business.slug}</span>
            </>
          ) : (
            <span>Introduce un slug válido para cargar el negocio.</span>
          )}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Form */}
        <section className="rounded-xl border border-border bg-card p-4 text-card-foreground sm:p-6">
          <h2 className="text-sm font-semibold">Configuración (Draft)</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Guardado inmediato. {saving ? "Guardando…" : msg ? msg : ""}
          </p>

          <div className="mt-4 space-y-4">
            <div className="space-y-1">
              <label htmlFor="hero-logo" className="text-sm font-medium">
                Logo URL (MVP)
              </label>
              <input
                id="hero-logo"
                value={form.logoUrl ?? ""}
                onChange={(e) => update("logoUrl", e.target.value)}
                placeholder="/brand/logo-mark.svg o https://..."
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                disabled={!business?.slug}
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="hero-badge" className="text-sm font-medium">
                Badge
              </label>
              <input
                id="hero-badge"
                value={form.badge}
                onChange={(e) => update("badge", e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                disabled={!business?.slug}
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="hero-title" className="text-sm font-medium">
                Título
              </label>
              <input
                id="hero-title"
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                disabled={!business?.slug}
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="hero-description" className="text-sm font-medium">
                Descripción
              </label>
              <textarea
                id="hero-description"
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                className="min-h-24 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                disabled={!business?.slug}
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={reset}
                className="rounded-lg border border-border bg-muted px-4 py-2 text-sm font-medium hover:opacity-90"
                disabled={!business?.slug || saving}
              >
                Reset (default)
              </button>

              <button
                type="button"
                onClick={publish}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
                disabled={!business?.slug || saving}
              >
                Publish
              </button>

              <a
                href={business?.slug ? `/${encodeURIComponent(business.slug)}` : "/"}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg border border-border bg-background px-4 py-2 text-sm hover:bg-muted"
              >
                Ver web ↗
              </a>
            </div>
          </div>
        </section>

        {/* Preview */}
        <section className="rounded-xl border border-border bg-card p-4 text-card-foreground sm:p-6">
          <h2 className="text-sm font-semibold">Vista previa (panel)</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Esto simula el Hero. La web pública usa <b>PUBLISHED</b> del preset activo.
          </p>

          <div className="mt-4 rounded-xl border border-border bg-background p-6">
            <div className="inline-flex rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
              {form.badge}
            </div>

            <h3 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
              {form.title}
            </h3>

            <p className="mt-2 text-sm text-muted-foreground">{form.description}</p>

            <p className="mt-4 text-xs text-muted-foreground">
              Preset activo:{" "}
              <span className="font-semibold text-foreground">{activeVariantKey}</span>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}  