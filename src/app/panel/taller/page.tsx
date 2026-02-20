import PageHeader from "@/components/panel/PageHeader";
import Link from "next/link";

export default function TallerPage() {
  return (
    <>
      <PageHeader
        title="Taller (Capa 1)"
        description="Diseño base, presets y reglas para que los clientes nunca rompan la web."
        actions={
          <Link
            href="/panel/taller/presets/hero"
            className="shrink-0 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            Ir a Presets Hero
          </Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-xl border border-border bg-card p-5 text-card-foreground">
          <div className="text-sm font-semibold">Presets (A/B/C)</div>
          <p className="mt-1 text-sm text-muted-foreground">
            Plantillas controladas por el taller. El cliente solo elige y ajusta slots permitidos.
          </p>
          <div className="mt-4">
            <Link
              href="/panel/taller/presets/hero"
              className="inline-flex rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium hover:bg-muted"
            >
              Presets · Hero →
            </Link>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-5 text-card-foreground">
          <div className="text-sm font-semibold">Políticas Cliente</div>
          <p className="mt-1 text-sm text-muted-foreground">
            Qué presets puede elegir Capa 2 y qué campos puede editar (sin estilos libres).
          </p>
          <div className="mt-4 text-sm text-muted-foreground">
            Próximamente (UI lista para conectar).
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-5 text-card-foreground">
          <div className="text-sm font-semibold">Media Center</div>
          <p className="mt-1 text-sm text-muted-foreground">
            Assets tipados (HERO/POPUP/...). En configs se guardan referencias, no URLs libres.
          </p>
          <div className="mt-4 text-sm text-muted-foreground">
            Próximamente (estructura SaaS).
          </div>
        </section>
      </div>

      <section className="mt-6 rounded-xl border border-border bg-background p-6">
        <div className="text-sm font-semibold">Flujo oficial (End-to-End)</div>
        <div className="mt-2 text-sm text-muted-foreground">
          <div>1) Taller define preset (A/B/C) y límites</div>
          <div>2) Cliente edita solo slots permitidos en draft</div>
          <div>3) Preview renderiza draft sin publicar</div>
          <div>4) Publish copia draft → published</div>
          <div>5) Web pública siempre lee published</div>
        </div>
      </section>
    </>
  );
}

