  // src/components/panel/nav.ts

export type NavLinkItem = {
  type: "link";
  label: string;
  href: string;
  disabled?: boolean;
};

export type NavChildItem = {
  label: string;
  href: string;
  disabled?: boolean;
};

export type NavGroupItem = {
  type: "group";
  label: string;
  disabled?: boolean;
  items: NavChildItem[];
};

export type NavItem = NavLinkItem | NavGroupItem;

export const NAV: NavItem[] = [
  { type: "link", label: "Dashboard", href: "/panel/dashboard" },
  { type: "link", label: "Web pública", href: "/panel/web" },

  {
    type: "group",
    label: "Web Control",
    items: [
      { label: "Panel", href: "/panel/web-control" },
      { label: "Hero", href: "/panel/web-control/hero" },
      { label: "Servicios", href: "/panel/web-control/services" },
      { label: "Ofertas", href: "/panel/web-control/offers" },
      { label: "Testimonios", href: "/panel/web-control/testimonials" },
      { label: "Horario", href: "/panel/web-control/hours" },
      { label: "Ubicación", href: "/panel/web-control/location" },
      { label: "Apariencia", href: "/panel/web-control/brand" },
    ],
  },

  {
    type: "group",
    label: "Marketing",
    items: [{ label: "Campañas", href: "/panel/marketing", disabled: true }],
  },

  { type: "link", label: "Leads", href: "/panel/leads", disabled: true },
  { type: "link", label: "Citas", href: "/panel/appointments", disabled: true },
  { type: "link", label: "Brand", href: "/panel/web-control/brand", disabled: true },
  { type: "link", label: "Media", href: "/panel/media", disabled: true },

  {
    type: "group",
    label: "Ajustes",
    items: [
      { label: "Panel (resumen)", href: "/panel/settings" },

      // ✅ Ruta limpia “Ajustes/Apariencia” (redirige a lo que hoy funciona)
      { label: "Apariencia (paleta del panel)", href: "/panel/settings/appearance" },

      // ✅ Gestión de claves por rol (propietario)
      { label: "Contraseñas y accesos", href: "/panel/settings/access" },
    ],
  },
];