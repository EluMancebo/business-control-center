import PageHeader from "@/components/panel/PageHeader";
import PanelBadge from "@/components/panel/ui/PanelBadge";
import PanelButton from "@/components/panel/ui/PanelButton";
import PanelCard from "@/components/panel/ui/PanelCard";
import ContentLabCandidateFlow from "./ContentLabCandidateFlow";

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

type ContentModelItem = {
  id: string;
  title: string;
  description: string;
};

type ContentDomainStatus = {
  id: string;
  area: string;
  phase: string;
  statusLabel: string;
  statusTone: "neutral" | "success";
};

const CONTENT_HUB_CARDS: ContentHubCard[] = [
  {
    id: "content-hub-lab",
    title: "Content Lab",
    description: "Gobierno creativo y reglas de composicion autorizada por Studio.",
    statusLabel: "Disponible",
    statusTone: "success",
    href: "/panel/taller/content-lab",
    ctaLabel: "Abrir Content Lab",
  },
  {
    id: "content-hub-components",
    title: "Components",
    description: "Bloques autorizados y reutilizables para composicion segura.",
    statusLabel: "Disponible",
    statusTone: "success",
    href: "/panel/taller/content/components",
    ctaLabel: "Abrir Components",
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
    ctaLabel: "Proximamente",
    disabled: true,
  },
];

const CONTENT_MODEL: ContentModelItem[] = [
  {
    id: "content-model-authorize",
    title: "Studio autoriza",
    description: "Content centraliza estructuras, recursos y puntos de partida permitidos.",
  },
  {
    id: "content-model-lab",
    title: "Content Lab",
    description: "Definira reglas de composicion y controles de calidad del dominio.",
  },
  {
    id: "content-model-components",
    title: "Components",
    description: "Reunira bloques reutilizables para piezas consistentes.",
  },
  {
    id: "content-model-media",
    title: "Media",
    description: "Abastece recursos visuales disponibles para composicion.",
  },
  {
    id: "content-model-presets",
    title: "Presets",
    description: "Ofrecera configuraciones de inicio seguras para acelerar produccion.",
  },
  {
    id: "content-model-consumption",
    title: "Consumo posterior",
    description: "Panel / Creative Studio consumira lo autorizado en siguientes iteraciones.",
  },
];

const CONTENT_STATUS: ContentDomainStatus[] = [
  {
    id: "content-status-media",
    area: "Media",
    phase: "Disponible",
    statusLabel: "Acceso activo",
    statusTone: "success",
  },
  {
    id: "content-status-lab",
    area: "Content Lab",
    phase: "Disponible",
    statusLabel: "Acceso activo",
    statusTone: "success",
  },
  {
    id: "content-status-components",
    area: "Components",
    phase: "En preparacion",
    statusLabel: "Proximamente",
    statusTone: "neutral",
  },
  {
    id: "content-status-presets",
    area: "Presets",
    phase: "Pendiente",
    statusLabel: "Proximamente",
    statusTone: "neutral",
  },
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
          <PanelCard key={card.id} variant="interactive" className="group flex h-full flex-col">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-base font-semibold text-foreground sm:text-lg">{card.title}</h2>
              <PanelBadge
                tone={card.statusTone}
                className="transition-transform duration-150 group-hover:scale-[1.03]"
              >
                {card.statusLabel}
              </PanelBadge>
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
          <h2 className="text-base font-semibold">Modelo operativo de Content</h2>
          <p className="mt-2 text-sm [color:var(--text-subtle,var(--muted-foreground))]">
            Content funciona como dominio de gobierno creativo: define lo autorizado hoy y prepara
            lo que el panel operativo consumira despues.
          </p>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {CONTENT_MODEL.map((item) => (
              <div
                key={item.id}
                className="rounded-lg border border-border px-3 py-2 [background:var(--surface-1,var(--background))]"
              >
                <div className="text-sm font-medium text-foreground">{item.title}</div>
                <p className="mt-1 text-sm [color:var(--text-subtle,var(--muted-foreground))]">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </PanelCard>
      </section>

      <section className="mt-6">
        <PanelCard>
          <h2 className="text-base font-semibold">Estado del dominio</h2>
          <p className="mt-2 text-sm [color:var(--text-subtle,var(--muted-foreground))]">
            Vista rapida de lo disponible, en preparacion y pendiente para arrancar Content.
          </p>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {CONTENT_STATUS.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2 [background:var(--surface-1,var(--background))]"
              >
                <div>
                  <div className="text-sm font-medium text-foreground">{item.area}</div>
                  <div className="text-xs [color:var(--text-subtle,var(--muted-foreground))]">
                    {item.phase}
                  </div>
                </div>
                <PanelBadge tone={item.statusTone}>{item.statusLabel}</PanelBadge>
              </div>
            ))}
          </div>
        </PanelCard>
      </section>

      <section className="mt-6">
        <ContentLabCandidateFlow />
      </section>
    </main>
  );
}
