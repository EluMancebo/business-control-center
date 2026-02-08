import PageHeader from "../../../../components/panel/PageHeader";

export default function WebControlServicesPage() {
  return (
    <>
      <PageHeader
        title="Web Control · Servicios"
        description="Gestiona el catálogo de servicios que se muestra en la web."
      />

      <section className="rounded-xl border border-zinc-200 bg-white p-4 sm:p-6">
        <div className="text-sm font-semibold text-zinc-900">Servicios</div>
        <div className="mt-1 text-sm text-zinc-500">
          CRUD de servicios: nombre, descripción, precio “desde”, duración (si citas), visible, orden.
        </div>

        <div className="mt-4 rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600">
          Próximamente: tabla + filtros + ordenación + editor seguro.
        </div>
      </section>
    </>
  );
}
