export type OverlayPreset = {
  id: string;
  label: string;
  tone: "neutral" | "primary" | "dark";
  strength: "none" | "soft" | "medium" | "strong";
  structure: "flat" | "gradient";
  textPolicy: "light" | "dark" | "auto";
  allowedContexts: Array<"hero" | "card" | "banner" | "popup">;
};
