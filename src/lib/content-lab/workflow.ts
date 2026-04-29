import type { LabPiece, LabPieceStatus } from "@/lib/content-lab/types";

export const allowedTransitions: Record<LabPieceStatus, LabPieceStatus[]> = {
  draft: ["candidate"],
  candidate: ["approved", "blocked", "draft"],
  approved: ["obsolete", "candidate"],
  blocked: ["draft"],
  obsolete: [],
};

export function canTransitionLabPiece(from: LabPieceStatus, to: LabPieceStatus): boolean {
  return allowedTransitions[from].includes(to);
}

export function transitionLabPiece(piece: LabPiece, nextStatus: LabPieceStatus): LabPiece {
  if (!canTransitionLabPiece(piece.status, nextStatus)) {
    return piece;
  }

  return {
    ...piece,
    status: nextStatus,
    updatedAt: new Date().toISOString(),
  };
}
