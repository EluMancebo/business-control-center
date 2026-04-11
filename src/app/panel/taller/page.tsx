import PageHeader from "@/components/panel/PageHeader";
import PanelBadge from "@/components/panel/ui/PanelBadge";
import PanelButton from "@/components/panel/ui/PanelButton";
import PanelCard from "@/components/panel/ui/PanelCard";

type StudioDomain = {
  id: string;
  name: string;
  statusLabel: string;
  statusTone: "neutral" | "success";
};

type ContentAccess = {
  id: string;
  label: string;
  href?: string;
  disabled?: boolean;
};

const STUDIO_DOMAINS: StudioDomain[] = [
  { id: "domain-brand-system", name: "Brand System", statusLabel: "Disponible", statusTone: "success" },
  { id: "domain-content", name: "Content", statusLabel: "Disponible", statusTone: "success" },
  { id: "domain-marketing", name: "Marketing", statusLabel: "Proximamente", statusTone: "neutral" },
  { id: "domain-crm", name: "CRM", statusLabel: "Proximamente", statusTone: "neutral" },
  { id: "domain-booking", name: "Reservas", statusLabel: "Proximamente", statusTone: "neutral" },
  { id: "domain-automations", name: "Automatizaciones", statusLabel: "Proximamente", statusTone: "neutral" },
  { id: "domain-settings", name: "Ajustes", statusLabel: "Disponible", statusTone: "success" },
];

const CONTENT_ACCESSES: ContentAccess[] = [
  { id: "content-access-content", label: "Content", href: "/panel/taller/content" },
  { id: "content-access-lab", label: "Content Lab", disabled: true },
  { id: "content-access-components", label: "Components", disabled: true },
  { id: "content-access-media", label: "Media", href: "/panel/taller/media" },
  { id: "content-access-presets", label: "Presets", disabled: true },
];

export default function TallerPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <PageHeader
        title="Inicio"
        description="Gobierno de Studio: dominios base, estados actuales y accesos principales."
      />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {STUDIO_DOMAINS.map((domain) => (
          <PanelCard key={domain.id} className="flex items-center justify-between gap-3 p-4 sm:p-5">
            <h2 className="text-sm font-semibold text-foreground sm:text-base">{domain.name}</h2>
            <PanelBadge tone={domain.statusTone}>{domain.statusLabel}</PanelBadge>
          </PanelCard>
        ))}
      </section>

      <section className="mt-6">
        <PanelCard>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold">Content</h2>
              <p className="mt-1 text-sm [color:var(--text-subtle,var(--muted-foreground))]">
                Accesos de entrada para composicion autorizada y recursos del dominio.
              </p>
            </div>
            <PanelBadge tone="success">Disponible</PanelBadge>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {CONTENT_ACCESSES.map((entry) => (
              <div
                key={entry.id}
                className="rounded-lg border border-border p-3 [background:var(--surface-1,var(--background))]"
              >
                <div className="text-sm font-medium text-foreground">{entry.label}</div>
                <div className="mt-3">
                  {entry.href ? (
                    <PanelButton id={`${entry.id}-open`} href={entry.href} variant="secondary">
                      Abrir
                    </PanelButton>
                  ) : (
                    <PanelButton id={`${entry.id}-open`} variant="secondary" disabled>
                      Proximamente
                    </PanelButton>
                  )}
                </div>
              </div>
            ))}
          </div>
        </PanelCard>
      </section>
    </main>
  );
}
