import type { VectorizationCheck, VectorizationResult } from "@/lib/media/pipeline-types";

export function checkIfAssetIsLikelyVectorizable(assetType: "image" | "svg"): VectorizationCheck {
  if (assetType === "svg") {
    return {
      isLikelyVectorizable: true,
      reason: "Already SVG format",
    };
  }

  return {
    isLikelyVectorizable: true,
    reason: "Needs review",
  };
}

export function createMockVectorizationResult(inputAssetId: string): VectorizationResult {
  return {
    status: "processed",
    inputAssetId,
    outputSvgUrl: `/mock-svg/${inputAssetId}.svg`,
    notes: "Mock result only. Real vectorization is not implemented yet.",
  };
}
