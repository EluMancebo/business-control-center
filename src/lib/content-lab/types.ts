import type { ContentBlockType, ContentMediaKind, ContentPieceType } from "@/lib/content/types";

export type LabPieceStatus =
  | "draft"
  | "candidate"
  | "approved"
  | "obsolete"
  | "blocked";

export type LabPieceType = "hero" | "banner";

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
  audience: string;
  tone: string;
  channel: string;
  ctaIntent: string;
  restrictions?: string[];
  createdAt?: string;
  updatedAt?: string;
  constraints?: string[];
  notes?: string;
};

export type EditableSlot = {
  key: string;
  label: string;
  type: "text" | "textarea" | "cta" | "media" | "accent";
  required: boolean;
  maxLength?: number;
  value?: string;
};

export type ValidationSummary = {
  score: number;
  missingRequired: string[];
  warnings: string[];
  blockers: string[];
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
  type: LabPieceType;
  blockType?: "hero" | "banner";
  title: string;
  status: LabPieceStatus;
  briefId?: string;
  contextBriefId?: string;
  summary?: string;
  editableSlots?: EditableSlot[];
  validationSummary?: ValidationSummary;
  approval?: ApprovalArtifact;
  blockDefinitionId?: string;
  blocks?: LabPieceBlockValue[];
  presetId?: string;
  rulesetId?: string;
  createdAt?: string;
  updatedAt?: string;
};
