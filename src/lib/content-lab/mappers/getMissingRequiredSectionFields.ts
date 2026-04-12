import type { LabPiece } from "@/lib/content-lab/types";
import type { SectionId } from "@/lib/taller/sections/types";
import { getSectionDefinition } from "@/lib/taller/sections/registry";
import { mapLabPieceToSectionPayload } from "@/lib/content-lab/mappers/labPieceToSectionPayload";

export function getMissingRequiredSectionFields(labPiece: LabPiece): string[] {
  const sectionId = labPiece.type as SectionId;
  const section = getSectionDefinition(sectionId);

  if (!section) {
    return [];
  }

  const { payload } = mapLabPieceToSectionPayload(labPiece);
  const missingFields: string[] = [];

  for (const [key, field] of Object.entries(section.payloadSchema)) {
    if (!field.required) {
      continue;
    }

    const value = payload[key];

    if (value === undefined) {
      missingFields.push(key);
      continue;
    }

    if (typeof value === "string" && value.trim() === "") {
      missingFields.push(key);
    }
  }

  return missingFields;
}
