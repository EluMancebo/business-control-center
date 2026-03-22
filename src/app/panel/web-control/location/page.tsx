 import PageHeader from "../../../../components/panel/PageHeader";

export default function WebControlLocationPage() {
  return (
    <>
      <PageHeader
        title="Web Control · Ubicación"
        description="Configura dirección, mapa y datos de contacto visibles en la web."
      />

      <section className="rounded-xl border border-border p-4 sm:p-6 [background:var(--surface-2,var(--card))] [color:var(--card-foreground,var(--foreground))]">
        <div className="text-sm font-semibold text-foreground">Ubicación</div>
        <div className="mt-1 text-sm [color:var(--text-subtle,var(--muted-foreground))]">
          Dirección, teléfono, email, enlace a Google Maps, coordenadas (opcional).
        </div>

        <div className="mt-4 rounded-lg border border-border p-4 text-sm [background:var(--surface-3,var(--background))] [color:var(--text-subtle,var(--muted-foreground))]">
          Próximamente: formulario + preview.
        </div>
      </section>
    </>
  );
}
   
