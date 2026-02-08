import PageHeader from "../../../../components/panel/PageHeader";

export default function WebControlTestimonialsPage() {
  return (
    <>
      <PageHeader
        title="Web Control · Testimonios"
        description="Gestiona testimonios y reseñas mostradas en la web."
      />

      <section className="rounded-xl border border-zinc-200 bg-white p-4 sm:p-6">
        <div className="text-sm font-semibold text-zinc-900">Testimonios</div>
        <div className="mt-1 text-sm text-zinc-500">
          Nombre, cargo, texto, puntuación, visible, orden. Sin romper estilos.
        </div>

        <div className="mt-4 rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600">
          Próximamente: editor + lista + moderación.
        </div>
      </section>
    </>
  );
}
