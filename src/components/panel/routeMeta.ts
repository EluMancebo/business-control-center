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

  "/panel/taller": {
    title: "Taller",
    subtitle: "Capa 1 · Diseño, presets y reglas del sistema",
  },

  "/panel/taller/brand": {
    title: "Taller · Brand",
    subtitle: "Identidad visual y elementos del sistema",
  },

  "/panel/taller/media": {
    title: "Taller · Media",
    subtitle: "Recursos visuales maestros del sistema",
  },

  "/panel/taller/web-brand": {
    title: "Taller · Web Brand",
    subtitle: "Marca base para webs, campañas y landings",
  },

  "/panel/taller/presets/hero": {
    title: "Taller · Presets · Hero",
    subtitle: "Crear, editar y mantener presets reales de Hero",
  },

  "/panel/taller/presets/header": {
    title: "Taller · Presets · Header",
    subtitle: "Base estructural de cabeceras reutilizables",
  },

  "/panel/taller/presets/footer": {
    title: "Taller · Presets · Footer",
    subtitle: "Base estructural de footers reutilizables",
  },

  "/panel/taller/presets/layouts": {
    title: "Taller · Presets · Layouts",
    subtitle: "Estructuras y composiciones base de página",
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

   
