import type {
  AssetPipelineStage,
  AssetPipelineStatus,
  ProcessedAssetResult as CanonicalProcessedAssetResult,
  AssetVariantKey,
} from "@/lib/taller/media/types";

// Compat temporal: contratos de pipeline canónicos (Bloque A v2)
export type PipelineStatus = AssetPipelineStatus;
export type PipelineStage = AssetPipelineStage;
export type PipelineVariantKey = AssetVariantKey;
export type ProcessedAssetResult = CanonicalProcessedAssetResult;

export type VectorizationStatus = "pending" | "vectorizable" | "not-vectorizable" | "processed";

export type VectorizationResult = {
  status: VectorizationStatus;
  inputAssetId: string;
  outputSvgUrl?: string;
  notes?: string;
};

export type VectorizationCheck = {
  isLikelyVectorizable: boolean;
  reason: string;
};
