import PageHeader from "../../../../components/panel/PageHeader";

export default function WebControlHoursPage() {
  return (
    <>
      <PageHeader
        title="Web Control · Horario"
        description="Configura horarios y excepciones (festivos) para mostrarlos en la web."
      />

      <section className="rounded-xl border border-border p-4 sm:p-6 [background:var(--surface-2,var(--card))] [color:var(--card-foreground,var(--foreground))]">
        <div className="text-sm font-semibold text-foreground">Horario</div>
        <div className="mt-1 text-sm [color:var(--text-subtle,var(--muted-foreground))]">
          Horarios semanales + excepciones por fecha (festivos, cierres, horarios especiales).
        </div>

        <div className="mt-4 rounded-lg border border-border p-4 text-sm [background:var(--surface-3,var(--background))] [color:var(--text-subtle,var(--muted-foreground))]">
          Próximamente: calendario + reglas.
        </div>
      </section>
    </>
  );
}
