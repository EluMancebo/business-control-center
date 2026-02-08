export type NavItem =
  | { type: "link"; label: string; href: string }
  | { type: "group"; label: string; items: { label: string; href: string }[] };

export const NAV: NavItem[] = [
  { type: "link", label: "Dashboard", href: "/panel/dashboard" },
  { type: "link", label: "Web pública", href: "/panel/web" },

  {
    type: "group",
    label: "Marketing",
    items: [
      { label: "Web", href: "/panel/marketing/web" },
      { label: "Campañas", href: "/panel/marketing/campaigns" },
    ],
  },
];
