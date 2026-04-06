import type { SvgAnalysis } from "@/lib/media/analyzer";
import type { SvgAnimationDecision } from "@/lib/media/animation";

export type AssetScope = "system" | "tenant";
export type AssetKind = "image" | "svg" | "video";
export type AssetStatus = "active" | "archived";
export type AssetVariantKey = "original" | "thumbnail" | "optimized" | "vectorized-svg";
export type AssetPipelineStatus = "queued" | "processing" | "ready" | "failed" | "skipped";
export type AssetPipelineStage = "ingest" | "analyze" | "derive" | "vectorize" | "done";
export type AssetBusinessId = string | null;
export type VectorizationKind = "logo" | "icon" | "shape" | "photo" | "texture" | "illustration";

type SystemAssetOwnership = {
  scope: "system";
  businessId: null;
};

type TenantAssetOwnership = {
  scope: "tenant";
  businessId: string;
};

export type AssetOwnership = SystemAssetOwnership | TenantAssetOwnership;

export type AssetItem = {
  _id: string;
  businessId: AssetBusinessId;
  scope: AssetScope;
  kind: AssetKind;
  bucket: string;
  key: string;
  url: string;
  label: string;
  tags: string[];
  allowedIn: string[];
  mime: string;
  bytes: number;
  width: number;
  height: number;
  sourceAssetId: string | null;
  variantKey: AssetVariantKey;
  pipelineStatus: AssetPipelineStatus;
  pipelineStage: AssetPipelineStage;
  pipelineError: string;
  status: AssetStatus;
  createdAt?: string;
  updatedAt?: string;
};

export type AssetListQuery = {
  businessId: AssetBusinessId;
  scope: AssetScope;
  status: AssetStatus;
  tags?: string;
  allowedIn?: string;
  variantKey?: AssetVariantKey;
  pipelineStatus?: AssetPipelineStatus;
};

export type AssetCreateInput = AssetOwnership & {
  kind: AssetKind;
  bucket: "vercel-blob";
  key: string;
  url: string;
  label: string;
  tags: string[];
  allowedIn: string[];
  mime: string;
  bytes: number;
  width?: number;
  height?: number;
  sourceAssetId?: string | null;
  variantKey?: AssetVariantKey;
  pipelineStatus?: AssetPipelineStatus;
  pipelineStage?: AssetPipelineStage;
  pipelineError?: string;
  status: "active";
};

export type AssetUpdateMetadataInput = {
  label: string;
  tags: string[];
  allowedIn: string[];
};

export type ProcessedAssetResult = {
  sourceAssetId: string;
  pipelineStatus: AssetPipelineStatus;
  pipelineStage: AssetPipelineStage;
  pipelineError: string;
  generatedVariantKeys: AssetVariantKey[];
  vectorizable: boolean;
  svgAnalysis?: SvgAnalysis;
  svgAnimation?: SvgAnimationDecision;
  vectorizationAnalysis?: {
    kind: VectorizationKind;
    candidate: boolean;
    reason: string;
    sampledColorCount: number;
    dominantColorCount: number;
    transparencyRatio: number;
  };
};

// Nuevos tipos para taxonomía y políticas de media
export type MediaKind =
  | "logo"
  | "hero-image"
  | "gallery-image"
  | "product-image"
  | "news-image"
  | "banner-image"
  | "popup-image"
  | "card-image"
  | "background-image"
  | "document";

export type MediaUsageContext =
  | "brand.logo.header"
  | "brand.logo.footer"
  | "home.hero.background"
  | "home.gallery.item"
  | "home.services.card"
  | "catalog.product.cover"
  | "catalog.product.gallery"
  | "news.item.cover"
  | "popup.campaign.cover";

export type MediaPolicy = {
  allowedMimeTypes: string[];
  maxBytes: number;
  minWidth?: number;
  minHeight?: number;
  recommendedRatio?: string; // e.g. "16:9"
  requiredRatio?: string;
  generateVariants: boolean;
  allowOverlay: boolean;
  requireAltText: boolean;
  cropMode: "none" | "center" | "smart";
};
