import type { ApprovalArtifact } from "@/lib/content-lab/types";
import type { ContentPieceType } from "@/lib/content/types";

export type PresetVaultItemStatus = "approved" | "archived";

export type PresetVaultRulesOfUse = {
  editableFields: string[];
  allowedZones: string[];
};

export type PresetVaultItem = {
  id: string;
  pieceId: string;
  pieceType: ContentPieceType;
  version: number;
  status: PresetVaultItemStatus;
  name: string;
  description?: string;
  approval: ApprovalArtifact;
  rulesOfUse: PresetVaultRulesOfUse;
  createdAt?: string;
  archivedAt?: string;
};
