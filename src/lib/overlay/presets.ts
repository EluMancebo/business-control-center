import type { OverlayPreset } from "./types";

export const OVERLAY_PRESETS: OverlayPreset[] = [
  {
    id: "none",
    label: "None",
    tone: "neutral",
    strength: "none",
    structure: "flat",
    textPolicy: "auto",
    allowedContexts: ["hero", "card", "banner", "popup"],
  },
  {
    id: "soft-neutral",
    label: "Soft Neutral",
    tone: "neutral",
    strength: "soft",
    structure: "gradient",
    textPolicy: "auto",
    allowedContexts: ["hero", "banner"],
  },
  {
    id: "focus-dark",
    label: "Focus Dark",
    tone: "dark",
    strength: "medium",
    structure: "gradient",
    textPolicy: "light",
    allowedContexts: ["hero", "popup"],
  },
];
