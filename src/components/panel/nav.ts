// src/components/panel/nav.ts

import type { Capability } from "@/lib/auth/capabilities";

export type NavLayer = "studio" | "client" | "shared";

export type NavLinkItem = {
  id: string;
  layer: NavLayer;
  type: "link";
  label: string;
  href: string;
  disabled?: boolean;
  capability?: Capability;
};

export type NavChildItem = {
  id: string;
  label: string;
  href: string;
  subgroupId?: string;
  subgroupLabel?: string;
  disabled?: boolean;
  capability?: Capability;
};

export type NavGroupItem = {
  id: string;
  layer: NavLayer;
  type: "group";
  label: string;
  disabled?: boolean;
  capability?: Capability;
  items: NavChildItem[];
};

export type NavItem = NavLinkItem | NavGroupItem;

export const NAV: NavItem[] = [
  { id: "dashboard", layer: "client", type: "link", label: "Inicio", href: "/panel/dashboard" },

  { id: "taller", layer: "studio", type: "link", label: "Inicio", href: "/panel/taller" },
  { id: "brand", layer: "studio", type: "link", label: "Brand System", href: "/panel/taller/brand" },

  {
    id: "content",
    layer: "studio",
    type: "group",
    label: "Content",
    items: [
      {
        id: "content",
        label: "Content",
        href: "/panel/taller/content",
      },
      {
        id: "content-lab",
        label: "Content Lab",
        href: "/panel/taller/content-lab",
      },
      {
        id: "presets-hero",
        label: "Components",
        href: "/panel/taller/presets/hero",
        disabled: true,
      },
      { id: "media", label: "Media", href: "/panel/taller/media" },
      {
        id: "presets",
        label: "Presets",
        href: "/panel/taller/presets/layouts",
        disabled: true,
      },
    ],
  },

  { id: "presets-header", layer: "studio", type: "link", label: "Marketing (proximamente)", href: "/panel/taller/presets/header", disabled: true },
  { id: "presets-footer", layer: "studio", type: "link", label: "CRM (proximamente)", href: "/panel/taller/presets/footer", disabled: true },
  { id: "presets-layouts", layer: "studio", type: "link", label: "Reservas (proximamente)", href: "/panel/taller/presets/layouts", disabled: true },
  { id: "studio-automations", layer: "studio", type: "link", label: "Automatizaciones (proximamente)", href: "/panel/taller/presets/layouts", disabled: true },

  {
    id: "studio-settings",
    layer: "studio",
    type: "group",
    label: "Ajustes",
    items: [
      { id: "panel-summary", label: "Ajustes", href: "/panel/settings" },
      { id: "panel-appearance", label: "Appearance", href: "/panel/settings/appearance" },
      { id: "access-security", label: "Access & Security", href: "/panel/settings/access", capability: "CAN_MANAGE_USERS" },
    ],
  },

  {
    id: "web-control",
    layer: "client",
    type: "group",
    label: "Creative Studio",
    capability: "CAN_EDIT_WEB",
    items: [
      { id: "panel", label: "Inicio", href: "/panel/web-control", capability: "CAN_EDIT_WEB" },
      { id: "hero", label: "Portada", href: "/panel/web-control/hero", capability: "CAN_EDIT_WEB" },
      { id: "services", label: "Contenido", href: "/panel/web-control/services", capability: "CAN_EDIT_WEB" },
      { id: "location", label: "Ubicacion y horario", href: "/panel/web-control/location", capability: "CAN_EDIT_WEB" },
      { id: "appearance", label: "Apariencia web", href: "/panel/web-control/brand", capability: "CAN_EDIT_WEB" },
    ],
  },

  {
    id: "marketing",
    layer: "client",
    type: "group",
    label: "Marketing",
    capability: "CAN_VIEW_ASSIGNED_LEADS",
    items: [{ id: "campaigns", label: "Marketing (proximamente)", href: "/panel/marketing", disabled: true }],
  },

  { id: "leads", layer: "client", type: "link", label: "CRM", href: "/panel/leads", capability: "CAN_VIEW_ASSIGNED_LEADS" },
  { id: "appointments", layer: "client", type: "link", label: "Reservas", href: "/panel/appointments", capability: "CAN_MANAGE_APPOINTMENTS" },
  { id: "panel-automations", layer: "client", type: "link", label: "Automatizaciones (proximamente)", href: "/panel/settings/security", disabled: true },
  { id: "web-public", layer: "client", type: "link", label: "Web publica", href: "/panel/web" },

  {
    id: "settings",
    layer: "client",
    type: "group",
    label: "Ajustes",
    items: [
      { id: "panel-summary", label: "Ajustes", href: "/panel/settings" },
      { id: "panel-appearance", label: "Appearance", href: "/panel/settings/appearance" },
      { id: "access-security", label: "Access & Security", href: "/panel/settings/access", capability: "CAN_MANAGE_USERS" },
    ],
  },
];
