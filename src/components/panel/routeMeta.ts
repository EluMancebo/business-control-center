 //src/components/panel/routeMeta.ts
 export type RouteMeta = {
  title: string;
  subtitle?: string;
};

type RouteMetaMap = Record<string, RouteMeta>;

export const ROUTE_META: RouteMetaMap = {
  "/panel/dashboard": {
    title: "Dashboard",
    subtitle: "Resumen general del negocio",
  },
  "/panel/web": {
    title: "Web pública",
    subtitle: "Gestión de la web visible",
  },

  // Taller (Admin)
  "/panel/taller": {
    title: "Taller",
    subtitle: "Capa 1 · Diseño, presets y reglas del sistema",
  },
  "/panel/taller/presets/hero": {
    title: "Taller · Presets · Hero",
    subtitle: "Crear, editar y publicar presets A/B/C",
  },

  // Marketing
  "/panel/marketing/web": {
    title: "Marketing · Web",
    subtitle: "Optimización y contenido web",
  },
  "/panel/marketing/campaigns": {
    title: "Marketing · Campañas",
    subtitle: "Gestión y seguimiento de campañas",
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

export function buildBreadcrumbs(pathname: string): Crumb[] {
  if (!pathname.startsWith("/panel")) return [];

  const parts = pathname.split("/").filter(Boolean);
  const crumbs: Crumb[] = [];

  let acc = "";
  for (let i = 0; i < parts.length; i++) {
    acc += "/" + parts[i];
    const href = acc;

    const meta = ROUTE_META[href];
    const label =
      meta?.title ??
      parts[i]
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());

    crumbs.push({ label, href });
  }

  return crumbs;
}


   
