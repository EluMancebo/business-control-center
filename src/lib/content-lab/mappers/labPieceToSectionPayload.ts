import type { LabPiece } from "@/lib/content-lab/types";
import type { SectionId } from "@/lib/taller/sections/types";
import { getSectionDefinition } from "@/lib/taller/sections/registry";

export type SectionPayloadResult = {
  sectionId: SectionId;
  payload: Record<string, unknown>;
};

export function mapLabPieceToSectionPayload(
  labPiece: LabPiece
): SectionPayloadResult {
  const payload: Record<string, unknown> = {};
  const section = getSectionDefinition(labPiece.type as SectionId);
  const schema = section?.payloadSchema ?? {};

  for (const block of labPiece.blocks) {
    if (block.key in schema) {
      payload[block.key] = block.value;
    }
  }

  return {
    sectionId: labPiece.type as SectionId,
    payload,
  };
}
