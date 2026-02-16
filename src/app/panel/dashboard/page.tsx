 // src/app/panel/dashboard/page.tsx
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
            className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
          >
            Ver web ↗
          </a>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-xl border border-border bg-card p-4 text-card-foreground sm:p-6">
          <div className="text-sm font-semibold">Leads</div>
          <div className="mt-1 text-sm text-muted-foreground">
            Próximamente: captación, estado y conversiones.
          </div>
          <div className="mt-4 text-2xl font-semibold">—</div>
        </section>

        <section className="rounded-xl border border-border bg-card p-4 text-card-foreground sm:p-6">
          <div className="text-sm font-semibold">Campañas</div>
          <div className="mt-1 text-sm text-muted-foreground">
            Próximamente: rendimiento, presupuesto y ROI.
          </div>
          <div className="mt-4 text-2xl font-semibold">—</div>
        </section>

        <section className="rounded-xl border border-border bg-card p-4 text-card-foreground sm:p-6">
          <div className="text-sm font-semibold">Web pública</div>
          <div className="mt-1 text-sm text-muted-foreground">
            Próximamente: estado, cambios pendientes y publicación.
          </div>
          <div className="mt-4 text-2xl font-semibold">—</div>
        </section>
      </div>
    </>
  );
}
 

