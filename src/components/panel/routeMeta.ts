 //src/components/panel/routeMeta.ts

export type RouteMeta = {
  title: string;
  subtitle?: string;
};

type RouteMetaMap = Record<string, RouteMeta>;

export const ROUTE_META: RouteMetaMap = {
  "/panel/dashboard": {
    title: "Overview",
    subtitle: "Client layer operational summary",
  },

  "/panel/web": {
    title: "Web",
    subtitle: "Public website overview",
  },

  "/panel/web-control": {
    title: "Creative Studio · Overview",
    subtitle: "Configure and maintain website sections",
  },

  "/panel/web-control/hero": {
    title: "Creative Studio · Hero",
    subtitle: "Hero section content and media",
  },

  "/panel/web-control/services": {
    title: "Creative Studio · Services",
    subtitle: "Service catalog and highlights",
  },

  "/panel/web-control/offers": {
    title: "Creative Studio · Offers",
    subtitle: "Offers and campaigns",
  },

  "/panel/web-control/testimonials": {
    title: "Creative Studio · Testimonials",
    subtitle: "Social proof and testimonials",
  },

  "/panel/web-control/hours": {
    title: "Creative Studio · Hours",
    subtitle: "Business hours and availability",
  },

  "/panel/web-control/location": {
    title: "Creative Studio · Location",
    subtitle: "Address, map and contact",
  },

  "/panel/web-control/brand": {
    title: "Creative Studio · Brand",
    subtitle: "Brand settings for client website",
  },

  "/panel/web-control/home": {
    title: "Creative Studio · Home",
    subtitle: "Home composition and layout",
  },

  "/panel/leads": {
    title: "Leads",
    subtitle: "Lead pipeline and follow-up",
  },

  "/panel/appointments": {
    title: "Appointments",
    subtitle: "Schedule and appointment control",
  },

  "/panel/marketing": {
    title: "Marketing · Campaigns (legacy)",
    subtitle: "Legacy campaigns workspace",
  },

  "/panel/settings": {
    title: "Settings · Overview",
    subtitle: "Client panel settings overview",
  },

  "/panel/settings/appearance": {
    title: "Settings · Appearance",
    subtitle: "Panel appearance controls",
  },

  "/panel/settings/access": {
    title: "Settings · Access & Security",
    subtitle: "User access and credentials",
  },

  "/panel/settings/security": {
    title: "Settings · Security",
    subtitle: "Security controls and policies",
  },

  "/panel/taller": {
    title: "Studio · Inicio",
    subtitle: "Capa 1 · Factory and governance workspace",
  },

  "/panel/taller/brand": {
    title: "Studio · Brand System",
    subtitle: "System identity and foundational tokens",
  },

  "/panel/taller/media": {
    title: "Studio · Media",
    subtitle: "Master media assets for the system",
  },

  "/panel/taller/web-brand": {
    title: "Studio · Content Lab (legacy)",
    subtitle: "Legacy bridge while Content Lab is consolidated",
  },

  "/panel/taller/presets/hero": {
    title: "Studio · Components (Hero legacy)",
    subtitle: "Legacy Hero components catalog",
  },

  "/panel/taller/presets/header": {
    title: "Studio · Components Header (legacy)",
    subtitle: "Legacy reusable header structures",
  },

  "/panel/taller/presets/footer": {
    title: "Studio · Components Footer (legacy)",
    subtitle: "Legacy reusable footer structures",
  },

  "/panel/taller/presets/layouts": {
    title: "Studio · Components Layouts (legacy)",
    subtitle: "Legacy page composition templates",
  },

  "/panel/taller/content": {
    title: "Studio · Content Lab",
    subtitle: "Content governance and composition rules",
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
    subtitle: "Gestión del sistema",
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

   
