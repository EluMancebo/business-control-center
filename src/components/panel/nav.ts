export type NavLink = {
  type: "link";
  label: string;
  href: string;
  disabled?: boolean;
};

export type NavGroup = {
  type: "group";
  label: string;
  items: NavLink[];
  disabled?: boolean;
};

export type NavItem = NavLink | NavGroup;

export const NAV: NavItem[] = [
  { type: "link", label: "Dashboard", href: "/panel/dashboard" },
  { type: "link", label: "Web pública", href: "/panel/web" },

{
  type: "group",
  label: "Web Control",
  items: [
    { type: "link", label: "Home", href: "/panel/web-control/home", disabled: false },
    { type: "link", label: "Hero", href: "/panel/web-control/hero", disabled: false },
    { type: "link", label: "Servicios", href: "/panel/web-control/services", disabled: false },
    { type: "link", label: "Ofertas", href: "/panel/web-control/offers", disabled: false },
    { type: "link", label: "Testimonios", href: "/panel/web-control/testimonials", disabled: false },
    { type: "link", label: "Horario", href: "/panel/web-control/hours", disabled: false },
    { type: "link", label: "Ubicación", href: "/panel/web-control/location", disabled: false },
  ],
},
  

  {
    type: "group",
    label: "Marketing",
    items: [
      { type: "link", label: "Campañas", href: "/panel/marketing/campaigns", disabled: true },
      { type: "link", label: "Landings", href: "/panel/marketing/landings", disabled: true },
      { type: "link", label: "RRSS", href: "/panel/marketing/social", disabled: true },
    ],
  },

  { type: "link", label: "Leads", href: "/panel/leads", disabled: true },
  { type: "link", label: "Citas", href: "/panel/citas", disabled: true },

  { type: "link", label: "Brand", href: "/panel/brand", disabled: true },
  { type: "link", label: "Media", href: "/panel/media", disabled: true },

  { type: "link", label: "Ajustes", href: "/panel/settings", disabled: true },
];

