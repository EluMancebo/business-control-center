//src/lib/web/hero/types.ts

export type HeroAppearanceVariant = "transparent" | "soft" | "solid";

export type HeroData = {
  badge: string;
  title: string;
  description: string;

  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;

  logoUrl?: string;

  // ✅ necesario: lo guardas en Mongo y lo parseas en la API
  logoSvg?: string;

  backgroundImageUrl?: string;
  heroAppearanceVariant?: HeroAppearanceVariant;
};

export const DEFAULT_HERO: HeroData = {
  badge: "Control total sin romper el diseño",
  title: "El centro de mando para tu negocio local",
  description:
    "Publica ofertas, popups, heros por eventos, campañas y recordatorios. Captura leads, crea landings y automatiza citas y tareas. Todo con roles y seguridad.",
  primaryCtaLabel: "Ver panel (demo)",
  primaryCtaHref: "/panel/dashboard",
  secondaryCtaLabel: "Ver funciones",
  secondaryCtaHref: "#features",
  logoUrl: "/brand/logo-mark.svg",
  logoSvg: "",
  backgroundImageUrl: "",
  heroAppearanceVariant: "soft",
};  
