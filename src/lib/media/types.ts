import type {
  AssetKind,
  AssetPipelineStage,
  AssetPipelineStatus,
  AssetVariantKey,
} from "@/lib/taller/media/types";

type LegacyMediaAssetType = Extract<AssetKind, "image" | "svg">;

export type MediaAsset = {
  id: string;
  type: LegacyMediaAssetType;
  url: string;
  width?: number;
  height?: number;
  sourceAssetId?: string | null;
  variantKey?: AssetVariantKey;
  pipelineStatus?: AssetPipelineStatus;
  pipelineStage?: AssetPipelineStage;
  pipelineError?: string;
  metadata?: {
    dominantColor?: string;
    brightness?: "low" | "medium" | "high";
    contrast?: "low" | "medium" | "high";
    suggestedOverlay?: string;
  };
  variants?: {
    original?: string;
    optimized?: string;
    svg?: string;
  };
  createdAt: string;
};
