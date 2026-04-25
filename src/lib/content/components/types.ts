export type ComponentCategory =
  | "navigation"
  | "typography"
  | "media"
  | "actions"
  | "layout"
  | "overlay"
  | "footer"
  | "global";

export type ComponentId =
  | "nav-burger"
  | "nav-bar"
  | "theme-toggle"
  | "badge"
  | "headline"
  | "subheadline"
  | "cta-button"
  | "cta-group"
  | "background-media"
  | "logo"
  | "overlay"
  | "contact-strip"
  | "animated-signature"
  | "scroll-top";

export interface ComponentDefinition {
  id: ComponentId;
  category: ComponentCategory;
  label: string;
  description?: string;
  enabled: boolean;
}
