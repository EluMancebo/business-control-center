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
