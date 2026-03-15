import type { SectionId } from "@/lib/taller/sections/types";

export type RenderContext = "public" | "studio";

export type SectionPayload = Record<string, unknown>;

export type SectionInstance<TPayload extends SectionPayload = SectionPayload> = {
  id: SectionId;
  variant?: string;
  payload?: TPayload;
};

export type PageBlueprint = {
  page: string;
  sections: SectionInstance[];
};
