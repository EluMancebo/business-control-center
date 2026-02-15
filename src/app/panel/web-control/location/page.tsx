 import PageHeader from "../../../../components/panel/PageHeader";

export default function WebControlLocationPage() {
  return (
    <>
      <PageHeader
        title="Web Control · Ubicación"
        description="Configura dirección, mapa y datos de contacto visibles en la web."
      />

      <section className="rounded-xl border border-zinc-200 bg-white p-4 sm:p-6">
        <div className="text-sm font-semibold text-zinc-900">Ubicación</div>
        <div className="mt-1 text-sm text-zinc-500">
          Dirección, teléfono, email, enlace a Google Maps, coordenadas (opcional).
        </div>

        <div className="mt-4 rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600">
          Próximamente: formulario + preview.
        </div>
      </section>
    </>
  );
}
   
