import PageHeader from "../../../../components/panel/PageHeader";

export default function WebControlHoursPage() {
  return (
    <>
      <PageHeader
        title="Web Control · Horario"
        description="Configura horarios y excepciones (festivos) para mostrarlos en la web."
      />

      <section className="rounded-xl border border-zinc-200 bg-white p-4 sm:p-6">
        <div className="text-sm font-semibold text-zinc-900">Horario</div>
        <div className="mt-1 text-sm text-zinc-500">
          Horarios semanales + excepciones por fecha (festivos, cierres, horarios especiales).
        </div>

        <div className="mt-4 rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600">
          Próximamente: calendario + reglas.
        </div>
      </section>
    </>
  );
}
