import PageHeader from "../../../../components/panel/PageHeader";

export default function WebControlHomePage() {
  return (
    <>
      <PageHeader
        title="Web Control · Home"
        description="Gestiona las secciones principales de tu web sin romper el diseño."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-xl border border-border p-4 sm:p-6 [background:var(--surface-2,var(--card))] [color:var(--card-foreground,var(--foreground))]">
          <div className="text-sm font-semibold text-foreground">Sección 1</div>
          <div className="mt-1 text-sm [color:var(--text-subtle,var(--muted-foreground))]">
            Bloque editable (título, texto, CTA, imagen, variante).
          </div>
          <div className="mt-4 text-xs [color:var(--text-subtle,var(--muted-foreground))]">Próximamente</div>
        </section>

        <section className="rounded-xl border border-border p-4 sm:p-6 [background:var(--surface-2,var(--card))] [color:var(--card-foreground,var(--foreground))]">
          <div className="text-sm font-semibold text-foreground">Sección 2</div>
          <div className="mt-1 text-sm [color:var(--text-subtle,var(--muted-foreground))]">
            Bloque editable con variantes controladas.
          </div>
          <div className="mt-4 text-xs [color:var(--text-subtle,var(--muted-foreground))]">Próximamente</div>
        </section>

        <section className="rounded-xl border border-border p-4 sm:p-6 [background:var(--surface-2,var(--card))] [color:var(--card-foreground,var(--foreground))]">
          <div className="text-sm font-semibold text-foreground">Sección 3</div>
          <div className="mt-1 text-sm [color:var(--text-subtle,var(--muted-foreground))]">
            Bloque editable (contenido + media + CTA).
          </div>
          <div className="mt-4 text-xs [color:var(--text-subtle,var(--muted-foreground))]">Próximamente</div>
        </section>
      </div>
    </>
  );
}
