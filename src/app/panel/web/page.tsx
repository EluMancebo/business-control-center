export default function WebControlPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-zinc-900">Web pública</h1>
        <p className="text-sm text-zinc-600">
          Edita los textos y el aspecto principal de tu landing. (MVP: sin
          guardar todavía)
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Formulario (mock) */}
        <section className="rounded-xl border border-zinc-200 bg-white p-4 sm:p-6">
          <h2 className="text-sm font-semibold text-zinc-900">
            Configuración de portada
          </h2>
          <p className="mt-1 text-sm text-zinc-600">
            Estos campos controlarán el Hero de la web pública.
          </p>

          <form className="mt-4 space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-zinc-800">
                Título (Hero)
              </label>
              <input
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-400"
                placeholder="Ej: Controla tu negocio en un solo lugar"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-zinc-800">
                Subtítulo
              </label>
              <textarea
                className="min-h-24 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-400"
                placeholder="Ej: CRM, campañas y web pública conectados."
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-sm font-medium text-zinc-800">
                  Texto del CTA
                </label>
                <input
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-400"
                  placeholder="Ej: Empezar ahora"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-zinc-800">
                  Enlace del CTA
                </label>
                <input
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-400"
                  placeholder="Ej: /#pricing"
                />
              </div>
            </div>

            <button
              type="button"
              className="inline-flex items-center justify-center rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
            >
              Guardar cambios (mock)
            </button>

            <p className="text-xs text-zinc-500">
              En el siguiente commit lo conectamos a MongoDB y revalidamos la
              home pública.
            </p>
          </form>
        </section>

        {/* Preview (mock) */}
        <section className="rounded-xl border border-zinc-200 bg-white p-4 sm:p-6">
          <h2 className="text-sm font-semibold text-zinc-900">
            Vista previa (mock)
          </h2>
          <p className="mt-1 text-sm text-zinc-600">
            Así se verá el Hero en la landing.
          </p>

          <div className="mt-4 rounded-xl border border-zinc-200 bg-zinc-50 p-6">
            <div className="text-xs font-medium text-zinc-500">
              HERO SECTION
            </div>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900">
              Controla tu negocio en un solo lugar
            </h3>
            <p className="mt-2 text-sm text-zinc-700">
              CRM, campañas y web pública conectados en un panel moderno.
            </p>
            <div className="mt-4">
              <span className="inline-flex rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white">
                Empezar ahora
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
