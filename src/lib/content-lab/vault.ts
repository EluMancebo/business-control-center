import type { LabPiece, ValidationDimensions, ValidationSummary } from "@/lib/content-lab/types";
import { validateLabPiece } from "@/lib/content-lab/validation";

type VaultCandidate = {
  id: string;
  type: LabPiece["type"];
  title: string;
  summary?: string;
  score: number;
  dimensions?: ValidationDimensions;
};

function resolveValidation(piece: LabPiece): ValidationSummary {
  return piece.validationSummary ?? validateLabPiece(piece);
}

export function isVaultEligible(piece: LabPiece): boolean {
  const validation = resolveValidation(piece);

  return piece.status === "approved" && validation.blockers.length === 0 && validation.score >= 82;
}

export function toVaultCandidate(piece: LabPiece): VaultCandidate {
  const validation = resolveValidation(piece);

  return {
    id: piece.id,
    type: piece.type,
    title: piece.title,
    summary: piece.summary,
    score: validation.score,
    dimensions: validation.dimensions,
  };
}
