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
  const values =
    labPiece.blocks && labPiece.blocks.length > 0
      ? labPiece.blocks.map((block) => ({ key: block.key, value: block.value }))
      : (labPiece.editableSlots ?? []).map((slot) => ({ key: slot.key, value: slot.value ?? "" }));

  for (const item of values) {
    if (item.key in schema) {
      payload[item.key] = item.value;
    }
  }

  return {
    sectionId: labPiece.type as SectionId,
    payload,
  };
}
