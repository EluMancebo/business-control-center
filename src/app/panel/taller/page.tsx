//src/app/panel/taller/page.tsx
import PageHeader from "@/components/panel/PageHeader";
import { getTallerPanelVisualCssVars } from "@/lib/panel/tallerVisualContract";
import Link from "next/link";
import type { CSSProperties } from "react";

export default function TallerPage() {
  const visualVars = getTallerPanelVisualCssVars() as CSSProperties;
  const ctaBaseClass =
    "transition-all duration-200 hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--taller-focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--taller-background)]";
  const secondaryCtaClass = `${ctaBaseClass} border [border-color:var(--taller-border-subtle)] [background:var(--taller-popover)] hover:[background:var(--taller-panel)]`;
  const primaryCtaClass = `${ctaBaseClass} bg-primary text-primary-foreground hover:brightness-90`;

  return (
    <section
      style={visualVars}
      className="rounded-2xl border p-4 shadow-[var(--taller-shadow-1)] sm:p-6 [border-color:var(--taller-border-subtle)] [background:var(--taller-background)]"
    >
      <PageHeader
        title="Taller (Capa 1)"
        description="Diseño base, presets y reglas para que los clientes nunca rompan la web."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/panel/taller/media"
              className={`shrink-0 rounded-lg px-4 py-2 text-sm font-semibold ${secondaryCtaClass}`}
            >
              Media Center
            </Link>

            <Link
              href="/panel/taller/presets/hero"
              className={`shrink-0 rounded-lg px-4 py-2 text-sm font-semibold ${primaryCtaClass}`}
            >
              Ir a Presets Hero
            </Link>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-xl border p-5 text-card-foreground shadow-[var(--taller-shadow-1)] [border-color:var(--taller-border-subtle)] [background:var(--taller-card)]">
          <div className="text-sm font-semibold">Presets (A/B/C)</div>
          <p className="mt-1 text-sm text-muted-foreground">
            Plantillas controladas por el taller. El cliente solo elige y ajusta slots permitidos.
          </p>
          <div className="mt-4">
            <Link
              href="/panel/taller/presets/hero"
              className={`inline-flex rounded-lg px-3 py-2 text-sm font-medium ${secondaryCtaClass}`}
            >
              Presets · Hero →
            </Link>
          </div>
        </section>

        <section className="rounded-xl border p-5 text-card-foreground shadow-[var(--taller-shadow-1)] [border-color:var(--taller-border-subtle)] [background:var(--taller-card)]">
          <div className="text-sm font-semibold">Políticas Cliente</div>
          <p className="mt-1 text-sm text-muted-foreground">
            Qué presets puede elegir Capa 2 y qué campos puede editar (sin estilos libres).
          </p>
          <div className="mt-4 text-sm text-muted-foreground">
            Próximamente (UI lista para conectar).
          </div>
        </section>

        <section className="rounded-xl border p-5 text-card-foreground shadow-[var(--taller-shadow-1)] [border-color:var(--taller-border-subtle)] [background:var(--taller-card)]">
          <div className="text-sm font-semibold">Media Center</div>
          <p className="mt-1 text-sm text-muted-foreground">
            Assets tipados (HERO/POPUP/...). En configs se guardan referencias, no URLs libres.
          </p>
          <div className="mt-4">
            <Link
              href="/panel/taller/media"
              className={`inline-flex rounded-lg px-3 py-2 text-sm font-medium ${secondaryCtaClass}`}
            >
              Abrir Media Center →
            </Link>
          </div>
        </section>
      </div>

      <section className="mt-6 rounded-xl border p-6 shadow-[var(--taller-shadow-2)] [border-color:var(--taller-border-subtle)] [background:var(--taller-panel)]">
        <div className="text-sm font-semibold">Flujo oficial (End-to-End)</div>
        <div className="mt-2 text-sm text-muted-foreground">
          <div>1) Taller define preset (A/B/C) y límites</div>
          <div>2) Cliente edita solo slots permitidos en draft</div>
          <div>3) Preview renderiza draft sin publicar</div>
          <div>4) Publish copia draft → published</div>
          <div>5) Web pública siempre lee published</div>
        </div>
      </section>
    </section>
  );
}  
