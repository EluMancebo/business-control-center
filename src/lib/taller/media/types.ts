import type { SvgAnalysis } from "@/lib/media/analyzer";
import type { SvgAnimationDecision } from "@/lib/media/animation";

export type AssetScope = "system" | "tenant";
export type MediaFormatKind = "image" | "svg" | "video" | "pdf";
export type AssetKind = MediaFormatKind;
export type AssetStatus = "active" | "archived";
export type AssetVariantKey = "original" | "thumbnail" | "optimized" | "vectorized-svg";
export type AssetPipelineStatus = "queued" | "processing" | "ready" | "failed" | "skipped";
export type AssetPipelineStage = "ingest" | "analyze" | "derive" | "vectorize" | "done";
export type AssetBusinessId = string | null;
export type VectorizationKind = "logo" | "icon" | "shape" | "photo" | "texture" | "illustration";
export type MediaAssetRole =
  | "logo"
  | "icon"
  | "photo"
  | "illustration"
  | "texture"
  | "document"
  | "video";
export type MediaPreferredUsage =
  | "hero-background"
  | "hero-logo"
  | "navbar-logo"
  | "footer-mark"
  | "banner-background"
  | "popup-media"
  | "gallery-item"
  | "social-asset"
  | "card-media"
  | "document-embed";
export type MediaAllowedComponent =
  | "hero"
  | "banner"
  | "header"
  | "footer"
  | "popup"
  | "card"
  | "gallery"
  | "social"
  | "document";
export type MediaReviewStatus = "draft" | "reviewed" | "approved" | "rejected" | "deprecated";
export type MediaOrientation = "landscape" | "portrait" | "square" | "unknown";

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
  formatKind: MediaFormatKind;
  assetRole: MediaAssetRole;
  preferredUsage: MediaPreferredUsage | null;
  allowedComponents: MediaAllowedComponent[];
  reviewStatus: MediaReviewStatus;
  orientation: MediaOrientation;
  aspectRatio: string | null;
  brandCritical: boolean;
  vectorizable: boolean;
  animable: boolean;
  isDerivative: boolean;
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
  status?: AssetStatus;
  tags?: string;
  allowedIn?: string;
  assetRole?: MediaAssetRole;
  formatKind?: MediaFormatKind;
  allowedComponent?: MediaAllowedComponent;
  preferredUsage?: MediaPreferredUsage;
  reviewStatus?: MediaReviewStatus;
  orientation?: MediaOrientation;
  variantKey?: AssetVariantKey;
  pipelineStatus?: AssetPipelineStatus;
};

export type AssetCreateInput = AssetOwnership & {
  kind: AssetKind;
  formatKind?: MediaFormatKind;
  assetRole?: MediaAssetRole;
  preferredUsage?: MediaPreferredUsage | null;
  allowedComponents?: MediaAllowedComponent[];
  reviewStatus?: MediaReviewStatus;
  orientation?: MediaOrientation;
  aspectRatio?: string | null;
  brandCritical?: boolean;
  vectorizable?: boolean;
  animable?: boolean;
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
  assetRole?: MediaAssetRole;
  preferredUsage?: MediaPreferredUsage | null;
  allowedComponents?: MediaAllowedComponent[];
  reviewStatus?: MediaReviewStatus;
  orientation?: MediaOrientation;
  aspectRatio?: string | null;
  brandCritical?: boolean;
  vectorizable?: boolean;
  animable?: boolean;
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
