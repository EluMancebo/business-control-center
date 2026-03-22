import PageHeader from "../../../../components/panel/PageHeader";

export default function WebControlTestimonialsPage() {
  return (
    <>
      <PageHeader
        title="Web Control · Testimonios"
        description="Gestiona testimonios y reseñas mostradas en la web."
      />

      <section className="rounded-xl border border-border p-4 sm:p-6 [background:var(--surface-2,var(--card))] [color:var(--card-foreground,var(--foreground))]">
        <div className="text-sm font-semibold text-foreground">Testimonios</div>
        <div className="mt-1 text-sm [color:var(--text-subtle,var(--muted-foreground))]">
          Nombre, cargo, texto, puntuación, visible, orden. Sin romper estilos.
        </div>

        <div className="mt-4 rounded-lg border border-border p-4 text-sm [background:var(--surface-3,var(--background))] [color:var(--text-subtle,var(--muted-foreground))]">
          Próximamente: editor + lista + moderación.
        </div>
      </section>
    </>
  );
}
