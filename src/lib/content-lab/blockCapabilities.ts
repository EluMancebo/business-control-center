export type SlotType =
  | "text"
  | "textarea"
  | "cta"
  | "media"
  | "accent";

export type BlockSlotDefinition = {
  key: string;
  label: string;
  type: SlotType;
  required: boolean;
  maxLength?: number;
};

export type BlockDefinition = {
  type: "hero" | "banner";
  slots: BlockSlotDefinition[];
};

export const BLOCK_DEFINITIONS: Record<string, BlockDefinition> = {
  hero: {
    type: "hero",
    slots: [
      { key: "headline", label: "Titular", type: "text", required: true, maxLength: 80 },
      { key: "subheadline", label: "Subtitular", type: "textarea", required: true, maxLength: 140 },
      { key: "cta", label: "CTA principal", type: "cta", required: true, maxLength: 28 },
    ],
  },
  banner: {
    type: "banner",
    slots: [
      { key: "headline", label: "Titular", type: "text", required: true, maxLength: 70 },
      { key: "cta", label: "CTA principal", type: "cta", required: true, maxLength: 24 },
      { key: "accent", label: "Etiqueta", type: "accent", required: false, maxLength: 20 },
    ],
  },
};
