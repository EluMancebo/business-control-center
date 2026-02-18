 "use client";

import { useHero } from "@/lib/web/hero/hooks";

export default function HeroSection() {
  const hero = useHero();

  return (
    <section className="mx-auto max-w-6xl px-4 py-14">
      <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="inline-flex rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
            {hero.badge}
          </p>

          <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
            {hero.title}
          </h1>

          <p className="mt-4 text-muted-foreground">{hero.description}</p>

          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={hero.primaryCtaHref}
              className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              {hero.primaryCtaLabel}
            </a>

            <a
              href={hero.secondaryCtaHref}
              className="rounded-xl border border-border px-5 py-3 text-sm font-semibold text-foreground hover:bg-muted"
            >
              {hero.secondaryCtaLabel}
            </a>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3 text-center text-xs text-muted-foreground">
            <div className="rounded-xl bg-muted p-3">
              <p className="text-lg font-bold text-foreground">+Leads</p>
              <p>Captura & seguimiento</p>
            </div>
            <div className="rounded-xl bg-muted p-3">
              <p className="text-lg font-bold text-foreground">+Ventas</p>
              <p>Funnels & landings</p>
            </div>
            <div className="rounded-xl bg-muted p-3">
              <p className="text-lg font-bold text-foreground">+Orden</p>
              <p>Citas & tareas</p>
            </div>
          </div>
        </div>

        {/* Fake dashboard preview (no lo tocamos hoy, mantenemos tu diseño actual) */}
        <div className="rounded-2xl border border-border bg-card p-4 text-card-foreground shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Vista previa del panel</p>
            <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
              Connected
            </span>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-muted p-4">
              <p className="text-xs text-muted-foreground">Campañas activas</p>
              <p className="mt-1 text-2xl font-bold text-foreground">3</p>
            </div>
            <div className="rounded-xl bg-muted p-4">
              <p className="text-xs text-muted-foreground">Leads hoy</p>
              <p className="mt-1 text-2xl font-bold text-foreground">12</p>
            </div>
            <div className="rounded-xl bg-muted p-4">
              <p className="text-xs text-muted-foreground">Citas pendientes</p>
              <p className="mt-1 text-2xl font-bold text-foreground">5</p>
            </div>
            <div className="rounded-xl bg-muted p-4">
              <p className="text-xs text-muted-foreground">Contenido programado</p>
              <p className="mt-1 text-2xl font-bold text-foreground">7</p>
            </div>
          </div>

          <div className="mt-4 rounded-xl bg-primary p-4 text-primary-foreground">
            <p className="text-sm font-semibold">Hoy: “San Valentín”</p>
            <p className="mt-1 text-xs opacity-80">
              Hero especial + popup 10% + campaña WhatsApp + landing.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
   