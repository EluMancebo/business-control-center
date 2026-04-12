import type { ContentBlockType, ContentMediaKind, ContentPieceType } from "@/lib/content/types";

export type LabPieceStatus =
  | "draft"
  | "candidate"
  | "approved"
  | "obsolete"
  | "blocked";

export type LabPieceApprovalScore = {
  conversion: number;
  communication: number;
  design: number;
  ux: number;
  responsive: number;
  seoA11yPerformance: number;
  total: number;
};

export type ApprovalArtifact = {
  pieceId: string;
  pieceType: ContentPieceType;
  briefId?: string;
  status: Exclude<LabPieceStatus, "draft">;
  score: LabPieceApprovalScore;
  hardBlockers: string[];
  warnings: string[];
  rationale: string[];
  approvedBy?: string;
  approvedAt?: string;
  version: number;
  presetVaultEligible: boolean;
  publishEligible: boolean;
};

export type ContextBrief = {
  id: string;
  objective: string;
  audience?: string;
  channel?: string;
  constraints?: string[];
  notes?: string;
};

export type LabBlockDefinition = {
  id: string;
  type: ContentPieceType;
  label: string;
  allowedBlockTypes: ContentBlockType[];
  requiredBlockTypes?: ContentBlockType[];
  editableFieldsByBlockType?: Partial<Record<ContentBlockType, string[]>>;
  allowedMediaKinds?: ContentMediaKind[];
};

export type DesignRuleset = {
  id: string;
  name: string;
  description?: string;
  allowedBlockTypes: ContentBlockType[];
  requiredBlockTypes?: ContentBlockType[];
  minBlocks?: number;
  maxBlocks?: number;
  lockedFieldsByBlockType?: Partial<Record<ContentBlockType, string[]>>;
};

export type LabPieceBlockValue = {
  key: string;
  type: ContentBlockType;
  value: string;
};

export type LabPiece = {
  id: string;
  type: ContentPieceType;
  title: string;
  contextBriefId: string;
  status: LabPieceStatus;
  approval?: ApprovalArtifact;
  blockDefinitionId?: string;
  blocks: LabPieceBlockValue[];
  presetId?: string;
  rulesetId?: string;
  createdAt?: string;
  updatedAt?: string;
};
