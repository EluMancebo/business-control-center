// src/components/panel/nav.ts

import type { Capability } from "@/lib/auth/capabilities";

export type NavLinkItem = {
  type: "link";
  label: string;
  href: string;
  disabled?: boolean;
  capability?: Capability;
};

export type NavChildItem = {
  label: string;
  href: string;
  disabled?: boolean;
  capability?: Capability;
};

export type NavGroupItem = {
  type: "group";
  label: string;
  disabled?: boolean;
  capability?: Capability;
  items: NavChildItem[];
};

export type NavItem = NavLinkItem | NavGroupItem;

export const NAV: NavItem[] = [
  { type: "link", label: "Dashboard", href: "/panel/dashboard" },

  { type: "link", label: "Web pública", href: "/panel/web" },

  {
    type: "group",
    label: "Web Control",
    capability: "CAN_EDIT_WEB",
    items: [
      { label: "Panel", href: "/panel/web-control", capability: "CAN_EDIT_WEB" },
      { label: "Hero", href: "/panel/web-control/hero", capability: "CAN_EDIT_WEB" },
      { label: "Servicios", href: "/panel/web-control/services", capability: "CAN_EDIT_WEB" },
      { label: "Ofertas", href: "/panel/web-control/offers", capability: "CAN_EDIT_WEB" },
      { label: "Testimonios", href: "/panel/web-control/testimonials", capability: "CAN_EDIT_WEB" },
      { label: "Horario", href: "/panel/web-control/hours", capability: "CAN_EDIT_WEB" },
      { label: "Ubicación", href: "/panel/web-control/location", capability: "CAN_EDIT_WEB" },
      { label: "Apariencia", href: "/panel/web-control/brand", capability: "CAN_EDIT_WEB" },
    ],
  },

  {
    type: "group",
    label: "Taller",
    items: [
      { label: "Panel", href: "/panel/taller" },
      { label: "Brand", href: "/panel/taller/brand" },
      { label: "Media", href: "/panel/taller/media" },
      { label: "Web Brand", href: "/panel/taller/web-brand" },
      { label: "Presets · Hero", href: "/panel/taller/presets/hero" },
      { label: "Presets · Header", href: "/panel/taller/presets/header", disabled: true },
      { label: "Presets · Footer", href: "/panel/taller/presets/footer", disabled: true },
      { label: "Presets · Layouts", href: "/panel/taller/presets/layouts", disabled: true },
    ],
  },

  {
    type: "group",
    label: "Marketing",
    capability: "CAN_VIEW_ASSIGNED_LEADS",
    items: [{ label: "Campañas", href: "/panel/marketing", disabled: true }],
  },

  { type: "link", label: "Leads", href: "/panel/leads", capability: "CAN_VIEW_ASSIGNED_LEADS" },
  { type: "link", label: "Citas", href: "/panel/appointments", capability: "CAN_MANAGE_APPOINTMENTS" },

  {
    type: "group",
    label: "Ajustes",
    items: [
      { label: "Panel (resumen)", href: "/panel/settings" },
      { label: "Apariencia (paleta del panel)", href: "/panel/settings/appearance" },
      { label: "Contraseñas y accesos", href: "/panel/settings/access", capability: "CAN_MANAGE_USERS" },
    ],
  },
];

