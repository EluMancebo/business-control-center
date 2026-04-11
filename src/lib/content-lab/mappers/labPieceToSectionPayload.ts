import type { LabPiece } from "@/lib/content-lab/types";
import type { SectionId } from "@/lib/taller/sections/types";

export type SectionPayloadResult = {
  sectionId: SectionId;
  payload: Record<string, unknown>;
};

export function mapLabPieceToSectionPayload(
  labPiece: LabPiece
): SectionPayloadResult {
  const payload: Record<string, unknown> = {};

  for (const block of labPiece.blocks) {
    payload[block.key] = block.value;
  }

  return {
    sectionId: labPiece.type as SectionId,
    payload,
  };
}
