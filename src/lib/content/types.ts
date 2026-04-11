import type { AssetKind } from "@/lib/taller/media/types";

export type ContentStatus = "draft" | "ready" | "archived";

export type ContentValidationState = "valid" | "invalid" | "incomplete";

export type ContentBlockType = "text" | "image" | "cta" | "title" | "gallery";

export type ContentMediaKind = Extract<AssetKind, "image" | "video" | "svg">;

export type ContentBlock = {
  id: string;
  type: ContentBlockType;
  label: string;
  status: ContentStatus;
  allowedMediaKinds?: ContentMediaKind[];
  editableFields?: string[];
};

export type ContentPreset = {
  id: string;
  name: string;
  description?: string;
  status: ContentStatus;
  allowedBlockTypes: ContentBlockType[];
  maxBlocks?: number;
  source?: "system" | "custom";
};

export type ContentPiece = {
  id: string;
  presetId: string;
  blocks: ContentBlock[];
  status: ContentStatus;
  validationState: ContentValidationState;
  createdAt?: string;
  updatedAt?: string;
};
