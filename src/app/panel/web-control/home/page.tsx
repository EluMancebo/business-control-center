import PageHeader from "../../../../components/panel/PageHeader";

export default function WebControlHomePage() {
  return (
    <>
      <PageHeader
        title="Web Control · Home"
        description="Gestiona las secciones principales de tu web sin romper el diseño."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-xl border border-zinc-200 bg-white p-4 sm:p-6">
          <div className="text-sm font-semibold text-zinc-900">Sección 1</div>
          <div className="mt-1 text-sm text-zinc-500">
            Bloque editable (título, texto, CTA, imagen, variante).
          </div>
          <div className="mt-4 text-xs text-zinc-500">Próximamente</div>
        </section>

        <section className="rounded-xl border border-zinc-200 bg-white p-4 sm:p-6">
          <div className="text-sm font-semibold text-zinc-900">Sección 2</div>
          <div className="mt-1 text-sm text-zinc-500">
            Bloque editable con variantes controladas.
          </div>
          <div className="mt-4 text-xs text-zinc-500">Próximamente</div>
        </section>

        <section className="rounded-xl border border-zinc-200 bg-white p-4 sm:p-6">
          <div className="text-sm font-semibold text-zinc-900">Sección 3</div>
          <div className="mt-1 text-sm text-zinc-500">
            Bloque editable (contenido + media + CTA).
          </div>
          <div className="mt-4 text-xs text-zinc-500">Próximamente</div>
        </section>
      </div>
    </>
  );
}
