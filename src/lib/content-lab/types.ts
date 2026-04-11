import type { ContentBlockType, ContentMediaKind, ContentPieceType } from "@/lib/content/types";

export type LabPieceStatus = "draft" | "in_review" | "approved" | "rejected" | "archived";

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
  blockDefinitionId?: string;
  blocks: LabPieceBlockValue[];
  presetId?: string;
  rulesetId?: string;
  createdAt?: string;
  updatedAt?: string;
};
