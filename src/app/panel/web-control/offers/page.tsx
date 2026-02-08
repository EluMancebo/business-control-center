import PageHeader from "../../../../components/panel/PageHeader";

export default function WebControlOffersPage() {
  return (
    <>
      <PageHeader
        title="Web Control · Ofertas"
        description="Configura ofertas y promociones sin alterar el diseño de la web."
      />

      <section className="rounded-xl border border-zinc-200 bg-white p-4 sm:p-6">
        <div className="text-sm font-semibold text-zinc-900">Ofertas</div>
        <div className="mt-1 text-sm text-zinc-500">
          Ofertas con fechas, CTA y estado (draft/active). Ideal para campañas y temporadas.
        </div>

        <div className="mt-4 rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600">
          Próximamente: lista + programación + preview.
        </div>
      </section>
    </>
  );
}
