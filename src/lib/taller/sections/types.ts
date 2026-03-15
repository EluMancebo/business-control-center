// src/lib/taller/sections/types.ts

export type SectionId = "hero"; // Extensible en el futuro (e.g. "services")

export type SectionVariantSource = "presets";

export type SectionSlotType = "text" | "textarea" | "url" | "image" | "svg";

export type SectionSlot = {
  key: string; // Debe coincidir con una propiedad de payload
  label: string;
  type: SectionSlotType;
  required: boolean;
  description?: string;
};

export type SectionPayloadSchemaField = {
  type: SectionSlotType;
  required: boolean;
};

export type SectionPayloadSchema = Record<string, SectionPayloadSchemaField>;

export type SectionDefinition = {
  id: SectionId;
  label: string;
  description: string;
  variantSource: SectionVariantSource; // Indica de dónde se obtienen las variantes (keys)
  slots: SectionSlot[]; // Campos editables por el usuario
  payloadSchema: SectionPayloadSchema; // Schema mínimo para payloads de la sección
};
