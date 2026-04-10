//src/app/panel/taller/page.tsx
import PageHeader from "@/components/panel/PageHeader";
import Link from "next/link";

export default function TallerPage() {
  const ctaBaseClass =
    "transition-all duration-200 hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";
  const secondaryCtaClass = `${ctaBaseClass} border border-border shadow-[var(--elevation-base,var(--panel-shadow-1))] [background:var(--surface-3,var(--muted))] hover:[background:var(--panel-card,var(--card))]`;
  const primaryCtaClass = `${ctaBaseClass} shadow-[var(--elevation-interactive,var(--panel-shadow-2))] bg-primary text-primary-foreground hover:brightness-90`;

  return (
    <section className="rounded-2xl border border-border p-4 shadow-[var(--elevation-base,var(--panel-shadow-1))] sm:p-6 [background:var(--background)]">
      <PageHeader
        title="Taller (Capa 1)"
        description="Diseño base, presets y reglas para que los clientes nunca rompan la web."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/panel/taller/brand"
              className={`shrink-0 rounded-lg px-4 py-2 text-sm font-semibold ${secondaryCtaClass}`}
            >
              Brand System
            </Link>

            <Link
              href="/panel/taller/media"
              className={`shrink-0 rounded-lg px-4 py-2 text-sm font-semibold ${secondaryCtaClass}`}
            >
              Media
            </Link>

            <Link
              href="/panel/taller/content"
              className={`shrink-0 rounded-lg px-4 py-2 text-sm font-semibold ${secondaryCtaClass}`}
            >
              Content Lab (legacy)
            </Link>

            <Link
              href="/panel/taller/presets/hero"
              className={`shrink-0 rounded-lg px-4 py-2 text-sm font-semibold ${primaryCtaClass}`}
            >
              Presets Hero
            </Link>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-border p-5 text-card-foreground shadow-[var(--elevation-base,var(--panel-shadow-1))] [background:var(--surface-2,var(--card))]">
          <div className="text-sm font-semibold">Brand System</div>
          <p className="mt-1 text-sm text-muted-foreground">
            Reglas de marca del sistema y gobierno visual de Studio.
          </p>
          <div className="mt-4">
            <Link
              href="/panel/taller/brand"
              className={`inline-flex rounded-lg px-3 py-2 text-sm font-medium ${secondaryCtaClass}`}
            >
              Abrir Brand System →
            </Link>
          </div>
        </section>

        <section className="rounded-xl border border-border p-5 text-card-foreground shadow-[var(--elevation-base,var(--panel-shadow-1))] [background:var(--surface-2,var(--card))]">
          <div className="text-sm font-semibold">Media</div>
          <p className="mt-1 text-sm text-muted-foreground">
            Biblioteca de assets tipados y variantes para composición segura.
          </p>
          <div className="mt-4">
            <Link
              href="/panel/taller/media"
              className={`inline-flex rounded-lg px-3 py-2 text-sm font-medium ${secondaryCtaClass}`}
            >
              Abrir Media →
            </Link>
          </div>
        </section>

        <section className="rounded-xl border border-border p-5 text-card-foreground shadow-[var(--elevation-base,var(--panel-shadow-1))] [background:var(--surface-2,var(--card))]">
          <div className="text-sm font-semibold">Content Lab (legacy)</div>
          <p className="mt-1 text-sm text-muted-foreground">
            Espacio legacy de composición de contenido, mantenido por compatibilidad.
          </p>
          <div className="mt-4">
            <Link
              href="/panel/taller/content"
              className={`inline-flex rounded-lg px-3 py-2 text-sm font-medium ${secondaryCtaClass}`}
            >
              Abrir Content Lab →
            </Link>
          </div>
        </section>

        <section className="rounded-xl border border-border p-5 text-card-foreground shadow-[var(--elevation-base,var(--panel-shadow-1))] [background:var(--surface-2,var(--card))]">
          <div className="text-sm font-semibold">Presets Hero</div>
          <p className="mt-1 text-sm text-muted-foreground">
            Catálogo de variantes Hero autorizadas para consumo en capas operativas.
          </p>
          <div className="mt-4">
            <Link
              href="/panel/taller/presets/hero"
              className={`inline-flex rounded-lg px-3 py-2 text-sm font-medium ${secondaryCtaClass}`}
            >
              Abrir Presets Hero →
            </Link>
          </div>
        </section>
      </div>

      <section className="mt-6 rounded-xl border border-border p-6 shadow-[var(--elevation-task,var(--panel-shadow-2))] [background:var(--surface-3,var(--card))]">
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
