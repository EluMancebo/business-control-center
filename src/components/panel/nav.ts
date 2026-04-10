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
  { id: "dashboard", layer: "client", type: "link", label: "Overview", href: "/panel/dashboard" },

  { id: "web-public", layer: "client", type: "link", label: "Web", href: "/panel/web" },

  {
    id: "web-control",
    layer: "client",
    type: "group",
    label: "Creative Studio",
    capability: "CAN_EDIT_WEB",
    items: [
      { id: "panel", label: "Overview", href: "/panel/web-control", capability: "CAN_EDIT_WEB" },
      { id: "hero", label: "Hero", href: "/panel/web-control/hero", capability: "CAN_EDIT_WEB" },
      { id: "services", label: "Services", href: "/panel/web-control/services", capability: "CAN_EDIT_WEB" },
      { id: "offers", label: "Offers", href: "/panel/web-control/offers", capability: "CAN_EDIT_WEB" },
      { id: "testimonials", label: "Testimonials", href: "/panel/web-control/testimonials", capability: "CAN_EDIT_WEB" },
      { id: "hours", label: "Hours", href: "/panel/web-control/hours", capability: "CAN_EDIT_WEB" },
      { id: "location", label: "Location", href: "/panel/web-control/location", capability: "CAN_EDIT_WEB" },
      { id: "appearance", label: "Brand", href: "/panel/web-control/brand", capability: "CAN_EDIT_WEB" },
    ],
  },

  {
    id: "taller",
    layer: "studio",
    type: "group",
    label: "Studio",
    items: [
      { id: "panel", label: "Inicio", href: "/panel/taller" },
      { id: "brand", label: "Brand System", href: "/panel/taller/brand" },
      { id: "media", label: "Media", href: "/panel/taller/media" },
      { id: "web-brand", label: "Content Lab (legacy)", href: "/panel/taller/web-brand" },
      { id: "presets-hero", label: "Components (Hero legacy)", href: "/panel/taller/presets/hero" },
      { id: "presets-header", label: "Components Header (legacy)", href: "/panel/taller/presets/header", disabled: true },
      { id: "presets-footer", label: "Components Footer (legacy)", href: "/panel/taller/presets/footer", disabled: true },
      { id: "presets-layouts", label: "Components Layouts (legacy)", href: "/panel/taller/presets/layouts", disabled: true },
    ],
  },

  {
    id: "marketing",
    layer: "client",
    type: "group",
    label: "Marketing",
    capability: "CAN_VIEW_ASSIGNED_LEADS",
    items: [{ id: "campaigns", label: "Campaigns (legacy)", href: "/panel/marketing", disabled: true }],
  },

  { id: "leads", layer: "client", type: "link", label: "Leads", href: "/panel/leads", capability: "CAN_VIEW_ASSIGNED_LEADS" },
  { id: "appointments", layer: "client", type: "link", label: "Appointments", href: "/panel/appointments", capability: "CAN_MANAGE_APPOINTMENTS" },

  {
    id: "settings",
    layer: "client",
    type: "group",
    label: "Settings",
    items: [
      { id: "panel-summary", label: "Overview", href: "/panel/settings" },
      { id: "panel-appearance", label: "Appearance", href: "/panel/settings/appearance" },
      { id: "access-security", label: "Access & Security", href: "/panel/settings/access", capability: "CAN_MANAGE_USERS" },
    ],
  },
];

