//src/components/panel/routeMeta.ts

export type RouteMeta = {
  title: string;
  subtitle?: string;
};

type RouteMetaMap = Record<string, RouteMeta>;

export const ROUTE_META: RouteMetaMap = {
  "/panel/dashboard": {
    title: "Inicio",
    subtitle: "Client layer operational summary",
  },

  "/panel/web": {
    title: "Web publica",
    subtitle: "Public website overview",
  },

  "/panel/web-control": {
    title: "Creative Studio",
    subtitle: "Configure and maintain website sections",
  },

  "/panel/web-control/hero": {
    title: "Portada",
    subtitle: "Hero section content and media",
  },

  "/panel/web-control/services": {
    title: "Contenido",
    subtitle: "Content structure and composition",
  },

  "/panel/web-control/offers": {
    title: "Creative Studio - Offers",
    subtitle: "Offers and campaigns",
  },

  "/panel/web-control/testimonials": {
    title: "Creative Studio - Testimonials",
    subtitle: "Social proof and testimonials",
  },

  "/panel/web-control/hours": {
    title: "Creative Studio - Hours",
    subtitle: "Business hours and availability",
  },

  "/panel/web-control/location": {
    title: "Ubicacion y horario",
    subtitle: "Address, map and contact",
  },

  "/panel/web-control/brand": {
    title: "Apariencia web",
    subtitle: "Brand settings for client website",
  },

  "/panel/web-control/home": {
    title: "Creative Studio - Home",
    subtitle: "Home composition and layout",
  },

  "/panel/leads": {
    title: "CRM",
    subtitle: "Lead pipeline and follow-up",
  },

  "/panel/appointments": {
    title: "Reservas",
    subtitle: "Schedule and appointment control",
  },

  "/panel/marketing": {
    title: "Marketing (proximamente)",
    subtitle: "Planned marketing workspace",
  },

  "/panel/settings": {
    title: "Ajustes",
    subtitle: "Client panel settings overview",
  },

  "/panel/settings/appearance": {
    title: "Ajustes - Apariencia",
    subtitle: "Panel appearance controls",
  },

  "/panel/settings/access": {
    title: "Ajustes - Acceso y seguridad",
    subtitle: "User access and credentials",
  },

  "/panel/settings/security": {
    title: "Ajustes - Seguridad",
    subtitle: "Security controls and policies",
  },

  "/panel/taller": {
    title: "Inicio",
    subtitle: "Capa 1 - Factory and governance workspace",
  },

  "/panel/taller/brand": {
    title: "Brand System",
    subtitle: "System identity and foundational tokens",
  },

  "/panel/taller/media": {
    title: "Media",
    subtitle: "Master media assets for the system",
  },

  "/panel/taller/web-brand": {
    title: "Legacy (legacy)",
    subtitle: "Legacy bridge while Content Lab is consolidated",
  },

  "/panel/taller/presets/hero": {
    title: "Components (proximamente)",
    subtitle: "Planned reusable components",
  },

  "/panel/taller/presets/header": {
    title: "Marketing (proximamente)",
    subtitle: "Planned governance domain",
  },

  "/panel/taller/presets/footer": {
    title: "CRM (proximamente)",
    subtitle: "Planned governance domain",
  },

  "/panel/taller/presets/layouts": {
    title: "Presets (proximamente)",
    subtitle: "Planned governance presets",
  },

  "/panel/taller/content": {
    title: "Content",
    subtitle: "Hub del dominio de composicion autorizada en Studio",
  },
};

export function getRouteMeta(pathname: string): RouteMeta {
  if (ROUTE_META[pathname]) return ROUTE_META[pathname];

  const match = Object.keys(ROUTE_META)
    .sort((a, b) => b.length - a.length)
    .find((key) => pathname === key || pathname.startsWith(key + "/"));

  if (match) return ROUTE_META[match];

  return {
    title: "Panel",
    subtitle: "Gestion del sistema",
  };
}

export type Crumb = { label: string; href: string };

function prettifySegment(segment: string) {
  return segment
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function buildBreadcrumbs(pathname: string): Crumb[] {
  if (!pathname.startsWith("/panel")) return [];

  const parts = pathname.split("/").filter(Boolean);
  const crumbs: Crumb[] = [];

  let acc = "";
  for (let i = 0; i < parts.length; i++) {
    acc += "/" + parts[i];
    const href = acc;

    const meta = ROUTE_META[href];
    const label = meta?.title ?? prettifySegment(parts[i]);

    crumbs.push({ label, href });
  }

  return crumbs;
}
