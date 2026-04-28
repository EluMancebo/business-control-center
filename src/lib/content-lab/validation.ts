import { BLOCK_DEFINITIONS } from "@/lib/content-lab/blockCapabilities";
import type { LabPiece, ValidationSummary } from "@/lib/content-lab/types";

function normalizeValue(value?: string) {
  return typeof value === "string" ? value.trim() : "";
}

export function validateLabPiece(piece: LabPiece): ValidationSummary {
  const editableSlots = piece.editableSlots ?? [];
  const slotsByKey = new Map(editableSlots.map((slot) => [slot.key, slot]));
  const blockDefinition = piece.blockType ? BLOCK_DEFINITIONS[piece.blockType] : undefined;

  const missingRequired = blockDefinition
    ? blockDefinition.slots
        .filter((slot) => slot.required && normalizeValue(slotsByKey.get(slot.key)?.value) === "")
        .map((slot) => slot.label)
    : editableSlots
        .filter((slot) => slot.required && normalizeValue(slot.value) === "")
        .map((slot) => slot.label);

  const warnings = blockDefinition
    ? blockDefinition.slots
        .filter(
          (slot) =>
            typeof slot.maxLength === "number" &&
            normalizeValue(slotsByKey.get(slot.key)?.value).length > slot.maxLength
        )
        .map((slot) => `${slot.label}: supera la longitud recomendada`)
    : editableSlots
        .filter(
          (slot) =>
            typeof slot.maxLength === "number" && normalizeValue(slot.value).length > slot.maxLength
        )
        .map((slot) => `${slot.label}: supera la longitud recomendada`);

  const blockers: string[] = [];

  if (missingRequired.length > 0) {
    blockers.push(`Faltan campos requeridos: ${missingRequired.join(", ")}`);
  }

  let score = 88;
  score -= missingRequired.length * 26;
  score -= warnings.length * 6;
  score = Math.max(0, Math.min(100, score));

  const candidateViable = blockers.length === 0 && score >= 70;
  const approvedViable = blockers.length === 0 && score >= 82;

  if (piece.status === "candidate" && !candidateViable) {
    blockers.push("La pieza candidata no cumple el minimo de calidad.");
  }

  if (piece.status === "approved" && !approvedViable) {
    blockers.push("La pieza aprobada no cumple el minimo de aprobacion.");
  }

  if (blockers.length > 0) {
    score = Math.min(score, 55);
  }

  return {
    score,
    missingRequired,
    warnings,
    blockers,
  };
}
