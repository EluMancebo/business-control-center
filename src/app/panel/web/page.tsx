 // src/app/panel/web/page.tsx
"use client";

import { useEffect, useState } from "react";
import type { HeroData } from "@/lib/web/hero/types";
import { DEFAULT_HERO } from "@/lib/web/hero/types";
import { useHero } from "@/lib/web/hero/hooks";
import { setHero as setHeroService } from "@/lib/web/hero/service";

function safeStr(v: string, fallback: string) {
  const t = v?.trim();
  return t && t.length > 0 ? t : fallback;
}

export default function WebControlPage() {
  const current = useHero(); // fuente de verdad (service)
  const [hero, setHero] = useState<HeroData>(DEFAULT_HERO);

  // sincroniza el form con el estado real
  useEffect(() => {
    setHero(current);
  }, [current]);

  function update(next: HeroData) {
    setHero(next);
    setHeroService(next);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-foreground">Web pública</h1>
        <p className="text-sm text-muted-foreground">
          Edita el Hero de la landing. (v0: localStorage + preview inmediato)
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Formulario */}
        <section className="rounded-xl border border-border bg-card p-4 text-card-foreground sm:p-6">
          <h2 className="text-sm font-semibold text-card-foreground">Configuración de portada</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Estos campos controlan el Hero de la web pública en tiempo real.
          </p>

          <form className="mt-4 space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Badge</label>
              <input
                value={hero.badge}
                onChange={(e) => update({ ...hero, badge: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                placeholder={DEFAULT_HERO.badge}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Título (Hero)</label>
              <input
                value={hero.title}
                onChange={(e) => update({ ...hero, title: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                placeholder={DEFAULT_HERO.title}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Descripción</label>
              <textarea
                value={hero.description}
                onChange={(e) => update({ ...hero, description: e.target.value })}
                className="min-h-24 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                placeholder={DEFAULT_HERO.description}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-sm font-medium">CTA principal (texto)</label>
                <input
                  value={hero.primaryCtaLabel}
                  onChange={(e) => update({ ...hero, primaryCtaLabel: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  placeholder={DEFAULT_HERO.primaryCtaLabel}
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">CTA principal (enlace)</label>
                <input
                  value={hero.primaryCtaHref}
                  onChange={(e) => update({ ...hero, primaryCtaHref: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  placeholder={DEFAULT_HERO.primaryCtaHref}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-sm font-medium">CTA secundario (texto)</label>
                <input
                  value={hero.secondaryCtaLabel}
                  onChange={(e) => update({ ...hero, secondaryCtaLabel: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  placeholder={DEFAULT_HERO.secondaryCtaLabel}
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">CTA secundario (enlace)</label>
                <input
                  value={hero.secondaryCtaHref}
                  onChange={(e) => update({ ...hero, secondaryCtaHref: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  placeholder={DEFAULT_HERO.secondaryCtaHref}
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => update(DEFAULT_HERO)}
                className="inline-flex items-center justify-center rounded-lg border border-border bg-muted px-4 py-2 text-sm font-medium text-foreground hover:opacity-90"
              >
                Reset (default)
              </button>

              <p className="text-xs text-muted-foreground">
                Aplicado:{" "}
                <span className="font-medium text-foreground">
                  {safeStr(hero.title, DEFAULT_HERO.title)}
                </span>
              </p>
            </div>
          </form>
        </section>

        {/* Preview */}
        <section className="rounded-xl border border-border bg-card p-4 text-card-foreground sm:p-6">
          <h2 className="text-sm font-semibold text-card-foreground">Vista previa</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Así se verá el Hero en la landing.
          </p>

          <div className="mt-4 rounded-xl border border-border bg-muted p-6">
            <div className="text-xs font-medium text-muted-foreground">HERO SECTION</div>
            <p className="mt-2 inline-flex rounded-full bg-background px-3 py-1 text-xs font-semibold text-muted-foreground">
              {safeStr(hero.badge, DEFAULT_HERO.badge)}
            </p>
            <h3 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
              {safeStr(hero.title, DEFAULT_HERO.title)}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {safeStr(hero.description, DEFAULT_HERO.description)}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
                {safeStr(hero.primaryCtaLabel, DEFAULT_HERO.primaryCtaLabel)}
              </span>
              <span className="inline-flex rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground">
                {safeStr(hero.secondaryCtaLabel, DEFAULT_HERO.secondaryCtaLabel)}
              </span>
            </div>
          </div>

          <p className="mt-3 text-xs text-muted-foreground">
            Siguiente paso (v1): Draft vs Published en MongoDB + revalidación del SSR.
          </p>
        </section>
      </div>
    </div>
  );
}
 
