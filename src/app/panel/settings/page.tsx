import PageHeader from "@/components/panel/PageHeader";
import PanelCard from "@/components/panel/ui/PanelCard";
import PanelButton from "@/components/panel/ui/PanelButton";

export const dynamic = "force-dynamic";

export default function PanelSettingsPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-8">
      <PageHeader
        title="Ajustes"
        description="Apariencia del panel (paleta) y contraseñas por rol."
      />

      <section className="grid gap-4 md:grid-cols-2">
        <PanelCard>
          <h2 className="text-base font-semibold">Apariencia (paleta del panel)</h2>
          <p className="mt-2 text-sm [color:var(--text-subtle,var(--muted-foreground))]">
            Configura la apariencia global del panel con opciones seguras.
          </p>
          <div className="mt-4">
            <PanelButton
              id="settings-go-appearance"
              href="/panel/settings/appearance"
              variant="secondary"
            >
              Abrir
            </PanelButton>
          </div>
        </PanelCard>

        <PanelCard>
          <h2 className="text-base font-semibold">Contraseñas y accesos</h2>
          <p className="mt-2 text-sm [color:var(--text-subtle,var(--muted-foreground))]">
            Gestión de claves por área (Marketing, Web, etc). Solo propietario (v0 demo).
          </p>
          <div className="mt-4">
            <PanelButton
              id="settings-go-access"
              href="/panel/settings/access"
              variant="secondary"
            >
              Abrir
            </PanelButton>
          </div>
        </PanelCard>
      </section>
    </main>
  );
}
