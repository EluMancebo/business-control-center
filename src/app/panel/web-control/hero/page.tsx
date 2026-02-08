import PageHeader from "../../../../components/panel/PageHeader";

export default function WebControlHeroPage() {
  return (
    <>
      <PageHeader
        title="Web Control · Hero"
        description="Configura el Hero de la web. Próximamente: programación por fechas y campañas."
      />

      <section className="rounded-xl border border-zinc-200 bg-white p-4 sm:p-6">
        <div className="text-sm font-semibold text-zinc-900">Hero programable</div>
        <div className="mt-1 text-sm text-zinc-500">
          Aquí se gestionarán variantes del hero (Navidad, rebajas, campañas), con fecha inicio/fin y prioridad.
        </div>

        <div className="mt-4 rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600">
          Próximamente: lista de heros por fecha + previsualización + activar/desactivar.
        </div>
      </section>
    </>
  );
}
