import type { ComponentDefinition } from "@/lib/content/components/types";

export const COMPONENT_REGISTRY: ComponentDefinition[] = [
  { id: "nav-burger", category: "navigation", label: "Hamburguesa", enabled: true },
  { id: "nav-bar", category: "navigation", label: "Barra navegación", enabled: false },

  { id: "theme-toggle", category: "global", label: "Modo oscuro/claro", enabled: true },

  { id: "badge", category: "typography", label: "Badge", enabled: true },
  { id: "headline", category: "typography", label: "Titular (H1)", enabled: true },
  { id: "subheadline", category: "typography", label: "Subtitular", enabled: true },

  { id: "cta-button", category: "actions", label: "Botón CTA", enabled: true },
  { id: "cta-group", category: "actions", label: "Grupo CTA", enabled: true },

  { id: "background-media", category: "media", label: "Fondo", enabled: true },
  { id: "logo", category: "media", label: "Logo", enabled: true },

  { id: "overlay", category: "overlay", label: "Overlay / Tinte", enabled: true },

  { id: "contact-strip", category: "footer", label: "Datos contacto hero", enabled: true },
  { id: "animated-signature", category: "footer", label: "Firma animada", enabled: true },

  { id: "scroll-top", category: "global", label: "Volver arriba", enabled: false },
];
