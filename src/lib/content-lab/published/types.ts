export type PublishedPieceType = "hero" | "banner";

export type PublishedPieceStatus = "published" | "archived";

export type PublishedRenderableZone =
  | "home.hero"
  | "home.banner"
  | "landing.hero"
  | "landing.banner"
  | "campaign.hero"
  | "campaign.banner";

export type PublishedCta = {
  label: string;
  href?: string;
};

export type PublishedMedia = {
  assetId?: string;
  url: string;
  alt?: string;
  width?: number;
  height?: number;
  format?: string;
};

export type PublishedPiecePayload = {
  badgeText?: string;
  headline?: string;
  subheadline?: string;
  primaryCta?: PublishedCta;
  secondaryCta?: PublishedCta;
  media?: PublishedMedia;
  accent?: string;
  overlay?: string;
};

export type PublishedPieceMeta = {
  version: number;
  publishedAt: string;
  publishedByUserId?: string;
  sourcePresetVaultItemId: string;
  sourcePublisherInstanceId: string;
};

export type PublishedPieceSnapshot = {
  id: string;
  businessId: string;
  pieceType: PublishedPieceType;
  zone: PublishedRenderableZone;
  status: PublishedPieceStatus;
  meta: PublishedPieceMeta;
  payload: PublishedPiecePayload;
};
