import PageHeader from "../../../../components/panel/PageHeader";

export default function WebControlOffersPage() {
  return (
    <>
      <PageHeader
        title="Web Control · Ofertas"
        description="Configura ofertas y promociones sin alterar el diseño de la web."
      />

      <section className="rounded-xl border border-border p-4 sm:p-6 [background:var(--surface-2,var(--card))] [color:var(--card-foreground,var(--foreground))]">
        <div className="text-sm font-semibold text-foreground">Ofertas</div>
        <div className="mt-1 text-sm [color:var(--text-subtle,var(--muted-foreground))]">
          Ofertas con fechas, CTA y estado (draft/active). Ideal para campañas y temporadas.
        </div>

        <div className="mt-4 rounded-lg border border-border p-4 text-sm [background:var(--surface-3,var(--background))] [color:var(--text-subtle,var(--muted-foreground))]">
          Próximamente: lista + programación + preview.
        </div>
      </section>
    </>
  );
}
