import PageHeader from "../../../components/panel/PageHeader";

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Resumen general y accesos a las áreas principales."
        actions={
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
          >
            Ver web ↗
          </a>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-xl border border-zinc-200 bg-white p-4 sm:p-6">
          <div className="text-sm font-semibold text-zinc-900">Leads</div>
          <div className="mt-1 text-sm text-zinc-500">
            Próximamente: captación, estado y conversiones.
          </div>
          <div className="mt-4 text-2xl font-semibold text-zinc-900">—</div>
        </section>

        <section className="rounded-xl border border-zinc-200 bg-white p-4 sm:p-6">
          <div className="text-sm font-semibold text-zinc-900">Campañas</div>
          <div className="mt-1 text-sm text-zinc-500">
            Próximamente: rendimiento, presupuesto y ROI.
          </div>
          <div className="mt-4 text-2xl font-semibold text-zinc-900">—</div>
        </section>

        <section className="rounded-xl border border-zinc-200 bg-white p-4 sm:p-6">
          <div className="text-sm font-semibold text-zinc-900">Web pública</div>
          <div className="mt-1 text-sm text-zinc-500">
            Próximamente: estado, cambios pendientes y publicación.
          </div>
          <div className="mt-4 text-2xl font-semibold text-zinc-900">—</div>
        </section>
      </div>
    </>
  );
}


