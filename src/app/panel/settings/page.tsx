import Link from "next/link";

export const dynamic = "force-dynamic";

export default function PanelSettingsPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Ajustes</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Apariencia del panel (paleta) y contraseñas por rol.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-base font-semibold">Apariencia (paleta del panel)</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Editor actual (v0). Está en “Brand”, pero hoy afecta a la UI del panel.
          </p>
          <div className="mt-4">
            <Link
              id="settings-go-appearance"
              href="/panel/settings/appearance"
              className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium hover:bg-muted"
            >
              Abrir
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-base font-semibold">Contraseñas y accesos</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Gestión de claves por área (Marketing, Web, etc). Solo propietario (v0 demo).
          </p>
          <div className="mt-4">
            <Link
              id="settings-go-access"
              href="/panel/settings/access"
              className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium hover:bg-muted"
            >
              Abrir
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
