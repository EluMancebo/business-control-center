import Link from "next/link";
import PageHeader from "@/components/panel/PageHeader";
import PanelBadge from "@/components/panel/ui/PanelBadge";
import PanelCard from "@/components/panel/ui/PanelCard";

type BadgeTone = "success" | "processing" | "neutral";

type StudioFeature = {
  id: string;
  name: string;
  description: string;
  statusLabel: string;
  statusTone: BadgeTone;
  href?: string;
};

type ContentFeature = {
  id: string;
  name: string;
  description: string;
  statusLabel: string;
  statusTone: BadgeTone;
  href?: string;
};

const STUDIO_FEATURES: StudioFeature[] = [
  {
    id: "studio-brand-system",
    name: "Brand System",
    description: "Identidad visual y reglas base del sistema.",
    statusLabel: "Disponible",
    statusTone: "success",
    href: "/panel/taller/brand",
  },
  {
    id: "studio-marketing",
    name: "Marketing",
    description: "Dominio de gobierno comercial en preparacion.",
    statusLabel: "En preparacion",
    statusTone: "processing",
  },
  {
    id: "studio-crm",
    name: "CRM",
    description: "Flujo de relacion y gestion de clientes en preparacion.",
    statusLabel: "En preparacion",
    statusTone: "processing",
  },
  {
    id: "studio-booking",
    name: "Reservas",
    description: "Gobierno de disponibilidad y agenda proximamente.",
    statusLabel: "Proximamente",
    statusTone: "neutral",
  },
  {
    id: "studio-automations",
    name: "Automatizaciones",
    description: "Reglas automatizadas del sistema proximamente.",
    statusLabel: "Proximamente",
    statusTone: "neutral",
  },
  {
    id: "studio-settings",
    name: "Ajustes",
    description: "Configuracion general del entorno de trabajo.",
    statusLabel: "Disponible",
    statusTone: "success",
    href: "/panel/settings",
  },
];

const CONTENT_FEATURES: ContentFeature[] = [
  {
    id: "content-domain",
    name: "Content",
    description: "Entrada del dominio para composicion autorizada.",
    statusLabel: "Disponible",
    statusTone: "success",
    href: "/panel/taller/content",
  },
  {
    id: "content-lab",
    name: "Content Lab",
    description: "Reglas y calidad de composicion en preparacion.",
    statusLabel: "En preparacion",
    statusTone: "processing",
  },
  {
    id: "content-components",
    name: "Components",
    description: "Bloques reutilizables del dominio proximamente.",
    statusLabel: "Proximamente",
    statusTone: "neutral",
  },
  {
    id: "content-media",
    name: "Media",
    description: "Recursos visuales ya disponibles para el dominio.",
    statusLabel: "Disponible",
    statusTone: "success",
    href: "/panel/taller/media",
  },
  {
    id: "content-presets",
    name: "Presets",
    description: "Puntos de partida seguros en preparacion.",
    statusLabel: "En preparacion",
    statusTone: "processing",
  },
];

function FeatureCard({
  feature,
}: {
  feature: StudioFeature | ContentFeature;
}) {
  if (feature.href) {
    return (
      <Link
        href={feature.href}
        className="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <PanelCard
          variant="interactive"
          className="h-full p-4 transition-transform duration-150 group-hover:-translate-y-px group-active:translate-y-0 sm:p-5"
        >
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-sm font-semibold text-foreground sm:text-base">{feature.name}</h3>
            <PanelBadge
              tone={feature.statusTone}
              className="transition-transform duration-150 group-hover:scale-[1.03]"
            >
              {feature.statusLabel}
            </PanelBadge>
          </div>
          <p className="mt-2 text-sm [color:var(--text-subtle,var(--muted-foreground))]">
            {feature.description}
          </p>
        </PanelCard>
      </Link>
    );
  }

  return (
    <PanelCard className="h-full p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-semibold text-foreground sm:text-base">{feature.name}</h3>
        <PanelBadge tone={feature.statusTone}>{feature.statusLabel}</PanelBadge>
      </div>
      <p className="mt-2 text-sm [color:var(--text-subtle,var(--muted-foreground))]">
        {feature.description}
      </p>
    </PanelCard>
  );
}

export default function TallerPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <PageHeader
        title="Inicio"
        description="Centro de mando de Studio para recorrer dominios, estados y accesos clave de Capa 1."
      />

      <section>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Dominios Studio</h2>
          <PanelBadge tone="success" size="md">
            Capa 1 activa
          </PanelBadge>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {STUDIO_FEATURES.map((feature) => (
            <FeatureCard key={feature.id} feature={feature} />
          ))}
        </div>
      </section>

      <section className="mt-6">
        <PanelCard variant="task">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold">Content</h2>
              <p className="mt-1 text-sm [color:var(--text-subtle,var(--muted-foreground))]">
                Dominio padre de composicion autorizada con sus features hijas visibles.
              </p>
            </div>
            <PanelBadge tone="success" size="md">
              Dominio activo
            </PanelBadge>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {CONTENT_FEATURES.map((feature) => (
              <FeatureCard key={feature.id} feature={feature} />
            ))}
          </div>
        </PanelCard>
      </section>
    </main>
  );
}
