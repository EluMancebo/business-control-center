import Link from "next/link";
import PageHeader from "@/components/panel/PageHeader";
import PanelBadge from "@/components/panel/ui/PanelBadge";
import PanelCard from "@/components/panel/ui/PanelCard";

type StudioStatus = "active" | "partial" | "future";

type BadgeTone = "success" | "processing" | "neutral";

type StudioFeature = {
  id: string;
  title: string;
  description: string;
  href?: string;
  status: StudioStatus;
};

type ContentSummaryFeature = {
  id: string;
  title: string;
  status: StudioStatus;
};

const STATUS_META: Record<StudioStatus, { label: string; tone: BadgeTone }> = {
  active: { label: "Activo", tone: "success" },
  partial: { label: "Parcial", tone: "processing" },
  future: { label: "Proximamente", tone: "neutral" },
};

const STUDIO_FEATURES: StudioFeature[] = [
  {
    id: "studio-brand-system",
    title: "Brand System",
    description: "Identidad visual, lenguaje y reglas base del sistema.",
    href: "/panel/taller/brand",
    status: "active",
  },
  {
    id: "studio-content",
    title: "Content",
    description: "Dominio de composicion autorizada y recursos del sistema.",
    href: "/panel/taller/content",
    status: "active",
  },
  {
    id: "studio-marketing",
    title: "Marketing",
    description: "Dominio de gobierno comercial en preparacion.",
    status: "future",
  },
  {
    id: "studio-crm",
    title: "CRM",
    description: "Relacion y operativa de clientes en preparacion.",
    status: "future",
  },
  {
    id: "studio-booking",
    title: "Reservas",
    description: "Gobierno de disponibilidad y agenda proximamente.",
    status: "future",
  },
  {
    id: "studio-automations",
    title: "Automatizaciones",
    description: "Reglas automatizadas del sistema en roadmap.",
    status: "future",
  },
  {
    id: "studio-settings",
    title: "Ajustes",
    description: "Configuracion general del entorno de Studio.",
    href: "/panel/settings",
    status: "active",
  },
];

const CONTENT_SUMMARY_FEATURES: ContentSummaryFeature[] = [
  {
    id: "content-summary-lab",
    title: "Content Lab",
    status: "partial",
  },
  {
    id: "content-summary-components",
    title: "Components",
    status: "partial",
  },
  {
    id: "content-summary-media",
    title: "Media",
    status: "active",
  },
  {
    id: "content-summary-presets",
    title: "Presets",
    status: "partial",
  },
];

function ContentSummaryChips() {
  return (
    <div className="mt-3 flex flex-wrap gap-1.5 sm:mt-2 sm:justify-end">
      {CONTENT_SUMMARY_FEATURES.map((feature) => (
        <PanelBadge key={feature.id} tone={STATUS_META[feature.status].tone} size="sm">
          {feature.title}
        </PanelBadge>
      ))}
    </div>
  );
}

function FeatureCard({ feature }: { feature: StudioFeature }) {
  const status = STATUS_META[feature.status];
  const isClickable = Boolean(feature.href) && feature.status !== "future";
  const isContentParent = feature.id === "studio-content";

  if (isClickable && feature.href) {
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
            <h3 className="text-sm font-semibold text-foreground sm:text-base">{feature.title}</h3>
            <PanelBadge
              tone={status.tone}
              className="transition-transform duration-150 group-hover:scale-[1.03]"
            >
              {status.label}
            </PanelBadge>
          </div>
          <p className="mt-2 text-sm [color:var(--text-subtle,var(--muted-foreground))]">
            {feature.description}
          </p>
          {isContentParent ? <ContentSummaryChips /> : null}
        </PanelCard>
      </Link>
    );
  }

  return (
    <PanelCard
      className={`h-full p-4 sm:p-5 ${feature.status === "future" ? "opacity-70 pointer-events-none" : ""}`}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-semibold text-foreground sm:text-base">{feature.title}</h3>
        <PanelBadge tone={status.tone}>{status.label}</PanelBadge>
      </div>
      <p className="mt-2 text-sm [color:var(--text-subtle,var(--muted-foreground))]">
        {feature.description}
      </p>
      {isContentParent ? <ContentSummaryChips /> : null}
    </PanelCard>
  );
}

export default function TallerPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <PageHeader
        title="Inicio"
        description="Hub maestro de Studio para recorrer dominios, estado operativo y accesos clave de Capa 1."
      />

      <section>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Dominios Studio</h2>
          <PanelBadge tone="success" size="md">
            Capa 1
          </PanelBadge>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {STUDIO_FEATURES.map((feature) => (
            <FeatureCard key={feature.id} feature={feature} />
          ))}
        </div>
      </section>

    </main>
  );
}
