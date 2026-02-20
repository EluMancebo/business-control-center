 import PageHeader from "@/components/panel/PageHeader";

export default function TallerPresetsHeroPage() {
  return (
    <>
      <PageHeader
        title="Taller · Presets · Hero"
        description="Define presets A/B/C y lo que el cliente podrá ajustar sin romper el diseño."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Selector Preset */}
        <section className="rounded-xl border border-border bg-card p-5 text-card-foreground">
          <div className="text-sm font-semibold">Preset activo en edición</div>
          <p className="mt-1 text-sm text-muted-foreground">
            En la demo el taller prepara presets controlados. El cliente no elige desde la web pública.
          </p>

          <div className="mt-4 grid gap-2">
            <div className="rounded-lg border border-border bg-background px-3 py-2 text-sm">
              default (base)
            </div>
            <div className="rounded-lg border border-border bg-background px-3 py-2 text-sm">
              presetA (barbería)
            </div>
            <div className="rounded-lg border border-border bg-background px-3 py-2 text-sm">
              presetB (evento)
            </div>
          </div>

          <div className="mt-4 text-xs text-muted-foreground">
            (UI hoy. Conexión a datos/persistencia en el siguiente paso firme.)
          </div>
        </section>

        {/* Campos del Hero */}
        <section className="rounded-xl border border-border bg-card p-5 text-card-foreground lg:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold">Slots del Hero</div>
              <p className="mt-1 text-sm text-muted-foreground">
                Layout fijo. El taller define contenido, fondo, logo SVG y CTAs.
              </p>
            </div>

            <button
              type="button"
              className="shrink-0 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
              title="Publicar (copia draft → published)"
            >
              Publicar preset
            </button>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field label="Badge" placeholder="Caballeros Barbería" />
            <Field label="Título" placeholder="Cortes clásicos. Barba impecable." />
            <Field label="CTA primaria (label)" placeholder="Reservar cita" />
            <Field label="CTA primaria (href)" placeholder="#reservar" />
            <Field label="CTA secundaria (label)" placeholder="Servicios" />
            <Field label="CTA secundaria (href)" placeholder="#servicios" />
          </div>

          <div className="mt-4 grid gap-4">
            <Field
              label="Descripción"
              placeholder="Reserva tu cita en 30 segundos..."
              textarea
            />
            <Field
              label="Background image URL (temporal hasta Media Center)"
              placeholder="https://images.unsplash.com/..."
            />
            <Field
              label="Logo SVG inline (para animación en hero)"
              placeholder="<svg>...</svg>"
              textarea
            />
          </div>
        </section>
      </div>

      {/* Política cliente */}
      <section className="mt-6 rounded-xl border border-border bg-background p-6">
        <div className="text-sm font-semibold">Política de cliente (Capa 2)</div>
        <p className="mt-2 text-sm text-muted-foreground">
          El taller decide qué puede tocar el cliente. Así el sistema es “imposible de romper”.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Check label="Permitir cambiar badge" />
          <Check label="Permitir cambiar título" />
          <Check label="Permitir cambiar descripción" />
          <Check label="Permitir cambiar CTAs" />
          <Check label="Permitir cambiar tonalidad/overlay" />
          <Check label="Permitir activar popup" disabled />
        </div>

        <div className="mt-3 text-xs text-muted-foreground">
          (UI hoy. Persistencia + validaciones en el siguiente paso firme.)
        </div>
      </section>
    </>
  );
}

function Field({
  label,
  placeholder,
  textarea,
}: {
  label: string;
  placeholder?: string;
  textarea?: boolean;
}) {
  return (
    <div>
      <div className="text-xs font-semibold text-muted-foreground">{label}</div>
      {textarea ? (
        <textarea
          className="mt-2 min-h-27.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          placeholder={placeholder}
          defaultValue=""
        />
      ) : (
        <input
          className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          placeholder={placeholder}
          defaultValue=""
        />
      )}
    </div>
  );
}

function Check({ label, disabled }: { label: string; disabled?: boolean }) {
  return (
    <label
      className={[
        "flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm",
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
      ].join(" ")}
      title={disabled ? "Próximamente" : ""}
    >
      <input type="checkbox" disabled={disabled} />
      <span>{label}</span>
    </label>
  );
}
   