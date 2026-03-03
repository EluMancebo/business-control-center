// src/app/panel/settings/security/page.tsx
import Link from "next/link";

export default function PanelSecuritySettingsPage() {
  return (
    <main id="panel-security-page" className="mx-auto w-full max-w-3xl px-6 py-8">
      <header id="panel-security-header" className="mb-6">
        <h1 id="panel-security-title" className="text-2xl font-semibold">
          Seguridad
        </h1>
        <p id="panel-security-subtitle" className="mt-1 text-sm text-muted-foreground">
          Gestión de contraseña (v0).
        </p>
      </header>

      <div id="panel-security-card" className="rounded-2xl border border-border bg-card p-6">
        <p id="panel-security-text" className="text-sm text-muted-foreground">
          Próximamente: cambio de contraseña real conectado a tu API/auth.
        </p>

        <div id="panel-security-actions" className="mt-4">
          <Link
            id="panel-security-back"
            href="/panel/settings"
            className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium hover:bg-muted"
          >
            Volver a Ajustes
          </Link>
        </div>
      </div>
    </main>
  );
}    