import PageHeader from "@/components/panel/PageHeader";
import PanelBadge from "@/components/panel/ui/PanelBadge";
import PanelButton from "@/components/panel/ui/PanelButton";
import PanelCard from "@/components/panel/ui/PanelCard";

type ContentHubCard = {
  id: string;
  title: string;
  description: string;
  statusLabel: string;
  statusTone: "neutral" | "success";
  href?: string;
  ctaLabel: string;
  disabled?: boolean;
};

type StudioDomainSummary = {
  id: string;
  name: string;
  statusLabel: string;
  statusTone: "neutral" | "success";
};

const CONTENT_HUB_CARDS: ContentHubCard[] = [
  {
    id: "content-hub-lab",
    title: "Content Lab",
    description: "Gobierno creativo y reglas de composicion autorizada por Studio.",
    statusLabel: "Proximamente",
    statusTone: "neutral",
    ctaLabel: "En roadmap",
    disabled: true,
  },
  {
    id: "content-hub-components",
    title: "Components",
    description: "Bloques autorizados y reutilizables para composicion segura.",
    statusLabel: "Proximamente",
    statusTone: "neutral",
    ctaLabel: "En roadmap",
    disabled: true,
  },
  {
    id: "content-hub-media",
    title: "Media",
    description: "Recursos visuales disponibles para composicion y uso tipado.",
    statusLabel: "Disponible",
    statusTone: "success",
    href: "/panel/taller/media",
    ctaLabel: "Abrir Media",
  },
  {
    id: "content-hub-presets",
    title: "Presets",
    description: "Puntos de partida reutilizables y seguros para futuras piezas.",
    statusLabel: "Proximamente",
    statusTone: "neutral",
    ctaLabel: "En roadmap",
    disabled: true,
  },
];

const STUDIO_DOMAIN_SUMMARY: StudioDomainSummary[] = [
  { id: "studio-brand-system", name: "Brand System", statusLabel: "Disponible", statusTone: "success" },
  { id: "studio-content", name: "Content", statusLabel: "Disponible", statusTone: "success" },
  { id: "studio-marketing", name: "Marketing", statusLabel: "Proximamente", statusTone: "neutral" },
  { id: "studio-crm", name: "CRM", statusLabel: "Proximamente", statusTone: "neutral" },
  { id: "studio-booking", name: "Reservas", statusLabel: "Proximamente", statusTone: "neutral" },
  { id: "studio-automations", name: "Automatizaciones", statusLabel: "Proximamente", statusTone: "neutral" },
  { id: "studio-settings", name: "Ajustes", statusLabel: "Disponible", statusTone: "success" },
];

export default function TallerContentPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <PageHeader
        title="Content"
        description="Dominio de composicion autorizada en Studio: estructuras, recursos y puntos de partida para producir piezas sin romper el sistema."
      />

      <section className="grid gap-4 sm:gap-5 md:grid-cols-2">
        {CONTENT_HUB_CARDS.map((card) => (
          <PanelCard key={card.id} variant="interactive" className="flex h-full flex-col">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-base font-semibold text-foreground sm:text-lg">{card.title}</h2>
              <PanelBadge tone={card.statusTone}>{card.statusLabel}</PanelBadge>
            </div>

            <p className="mt-2 text-sm [color:var(--text-subtle,var(--muted-foreground))]">
              {card.description}
            </p>

            <div className="mt-4">
              {card.href ? (
                <PanelButton id={`${card.id}-cta`} href={card.href} variant="secondary">
                  {card.ctaLabel}
                </PanelButton>
              ) : (
                <PanelButton id={`${card.id}-cta`} variant="secondary" disabled>
                  {card.ctaLabel}
                </PanelButton>
              )}
            </div>
          </PanelCard>
        ))}
      </section>

      <section className="mt-6">
        <PanelCard variant="task">
          <h2 className="text-base font-semibold">Relacion entre dominios</h2>
          <div className="mt-2 space-y-2 text-sm [color:var(--text-subtle,var(--muted-foreground))]">
            <p>Brand System define identidad, reglas y lenguaje visual.</p>
            <p>Content organiza composicion autorizada y recursos reutilizables.</p>
            <p>
              Panel / Creative Studio consumira lo autorizado desde Studio en las siguientes
              iteraciones.
            </p>
          </div>
        </PanelCard>
      </section>

      <section className="mt-6">
        <PanelCard>
          <h2 className="text-base font-semibold">Estado actual de Studio</h2>
          <p className="mt-2 text-sm [color:var(--text-subtle,var(--muted-foreground))]">
            Resumen operativo de las areas del dominio Studio para esta fase.
          </p>

          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {STUDIO_DOMAIN_SUMMARY.map((domain) => (
              <div
                key={domain.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2 [background:var(--surface-1,var(--background))]"
              >
                <span className="text-sm font-medium text-foreground">{domain.name}</span>
                <PanelBadge tone={domain.statusTone}>{domain.statusLabel}</PanelBadge>
              </div>
            ))}
          </div>
        </PanelCard>
      </section>
    </main>
  );
}
