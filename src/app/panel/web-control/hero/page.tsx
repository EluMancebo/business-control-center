// src/app/panel/web-control/hero/page.tsx
"use client";

import { useEffect, useState } from "react";
import type { HeroData } from "@/lib/web/hero/types";
import { DEFAULT_HERO } from "@/lib/web/hero/types";

async function fetchHero(status: "draft" | "published") {
  const res = await fetch(`/api/web/hero?status=${status}`, { cache: "no-store" });
  if (!res.ok) throw new Error("No se pudo cargar el hero");
  return (await res.json()) as { status: string; data: HeroData };
}

async function saveDraft(next: HeroData) {
  const res = await fetch("/api/web/hero", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(next),
  });
  if (!res.ok) throw new Error("No se pudo guardar el draft");
}

async function publishDraft() {
  const res = await fetch("/api/web/hero/publish", { method: "POST" });
  if (!res.ok) throw new Error("No se pudo publicar");
}

export default function HeroControlPage() {
  const [form, setForm] = useState<HeroData>(DEFAULT_HERO);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string>("");

  // Cargar draft al entrar
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const { data } = await fetchHero("draft");
        if (!alive) return;
        setForm(data ?? DEFAULT_HERO);
      } catch {
        if (!alive) return;
        setForm(DEFAULT_HERO);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  async function update<K extends keyof HeroData>(key: K, value: HeroData[K]) {
    const next: HeroData = { ...form, [key]: value };
    setForm(next);

    // guardado inmediato (MVP)
    try {
      setSaving(true);
      setMsg("");
      await saveDraft(next);
      setMsg("Guardado ✓");
    } catch {
      setMsg("Error guardando draft");
    } finally {
      setSaving(false);
    }
  }

  async function reset() {
    const next = DEFAULT_HERO;
    setForm(next);
    try {
      setSaving(true);
      setMsg("");
      await saveDraft(next);
      setMsg("Reset guardado ✓");
    } catch {
      setMsg("Error en reset");
    } finally {
      setSaving(false);
    }
  }

  async function publish() {
    try {
      setSaving(true);
      setMsg("");
      await publishDraft();
      setMsg("Publicado ✅ (HOME ya lee el publicado)");
    } catch {
      setMsg("Error publicando");
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
          Editas el <b>Draft</b> en MongoDB. Luego <b>Publish</b> para producción.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Form */}
        <section className="rounded-xl border border-border bg-card p-4 text-card-foreground sm:p-6">
          <h2 className="text-sm font-semibold">Configuración (Draft)</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Guardado inmediato. {saving ? "Guardando…" : msg ? msg : ""}
          </p>
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
            />
       <p className="text-xs text-muted-foreground">
        De momento es una URL. En el siguiente paso lo subiremos como archivo.
       </p>
      </div>
          <div className="mt-4 space-y-4">
            <div className="space-y-1">
              <label htmlFor="hero-badge" className="text-sm font-medium">
                Badge
              </label>
              <input
                id="hero-badge"
                value={form.badge}
                onChange={(e) => update("badge", e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
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
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label htmlFor="hero-cta1-label" className="text-sm font-medium">
                  CTA 1 · Texto
                </label>
                <input
                  id="hero-cta1-label"
                  value={form.primaryCtaLabel}
                  onChange={(e) => update("primaryCtaLabel", e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="hero-cta1-href" className="text-sm font-medium">
                  CTA 1 · Enlace
                </label>
                <input
                  id="hero-cta1-href"
                  value={form.primaryCtaHref}
                  onChange={(e) => update("primaryCtaHref", e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label htmlFor="hero-cta2-label" className="text-sm font-medium">
                  CTA 2 · Texto
                </label>
                <input
                  id="hero-cta2-label"
                  value={form.secondaryCtaLabel}
                  onChange={(e) => update("secondaryCtaLabel", e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="hero-cta2-href" className="text-sm font-medium">
                  CTA 2 · Enlace
                </label>
                <input
                  id="hero-cta2-href"
                  value={form.secondaryCtaHref}
                  onChange={(e) => update("secondaryCtaHref", e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={reset}
                className="rounded-lg border border-border bg-muted px-4 py-2 text-sm font-medium hover:opacity-90"
              >
                Reset (default)
              </button>

              <button
                type="button"
                onClick={publish}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
              >
                Publish
              </button>

              <a
                href="/"
                target="_blank"
                rel="noreferrer"
                className="rounded-lg border border-border bg-background px-4 py-2 text-sm hover:bg-muted"
              >
                Ver HOME ↗
              </a>
            </div>
          </div>
        </section>

        {/* Preview */}
        <section className="rounded-xl border border-border bg-card p-4 text-card-foreground sm:p-6">
          <h2 className="text-sm font-semibold">Vista previa (panel)</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Esto simula el Hero (la HOME real usa PUBLISHED).
          </p>

          <div className="mt-4 rounded-xl border border-border bg-background p-6">
            <div className="inline-flex rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
             
            {form.logoUrl ? (
          <div className="mb-3 flex items-center gap-3">
         {/* eslint-disable-next-line @next/next/no-img-element */}
         <img src={form.logoUrl} alt="Logo" className="h-10 w-10 rounded-lg border border-border bg-card object-contain p-1" />
         <span className="text-sm text-muted-foreground">Logo</span>
         </div>
         ) : null}
 
             
              {form.badge}
            </div>

            <h3 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
              {form.title}
            </h3>

            <p className="mt-2 text-sm text-muted-foreground">{form.description}</p>

            <div className="mt-4 flex flex-wrap gap-3">
              <span className="inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
                {form.primaryCtaLabel}
              </span>
              <span className="inline-flex rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground">
                {form.secondaryCtaLabel}
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}



