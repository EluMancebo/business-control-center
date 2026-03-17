export type AssetScope = "system" | "tenant";
export type AssetKind = "image" | "svg" | "video";
export type AssetStatus = "active" | "archived";

export type AssetItem = {
  _id: string;
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
  status: AssetStatus;
  createdAt?: string;
};

export type AssetListQuery = {
  businessId: null;
  scope: "system";
  status: AssetStatus;
  tags?: string;
};

export type AssetCreateInput = {
  businessId: null;
  scope: "system";
  kind: AssetKind;
  bucket: "vercel-blob";
  key: string;
  url: string;
  label: string;
  tags: string[];
  allowedIn: string[];
  mime: string;
  bytes: number;
  status: "active";
};

export type AssetUpdateMetadataInput = {
  label: string;
  tags: string[];
  allowedIn: string[];
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
