import type { LabPiece } from "@/lib/content-lab/types";
import type { SectionId } from "@/lib/taller/sections/types";
import { mapLabPieceToSectionPayload } from "@/lib/content-lab/mappers/labPieceToSectionPayload";
import { getMissingRequiredSectionFields } from "@/lib/content-lab/mappers/getMissingRequiredSectionFields";

export type LabPieceValidationSummary = {
  sectionId: SectionId;
  payload: Record<string, unknown>;
  missingRequiredFields: string[];
  isComplete: boolean;
};

export function getLabPieceValidationSummary(
  labPiece: LabPiece
): LabPieceValidationSummary {
  const { sectionId, payload } = mapLabPieceToSectionPayload(labPiece);
  const missingRequiredFields = getMissingRequiredSectionFields(labPiece);
  const isComplete = missingRequiredFields.length === 0;

  return {
    sectionId,
    payload,
    missingRequiredFields,
    isComplete,
  };
}
