export type PublisherRenderableZone =
  | "home.hero"
  | "home.banner"
  | "landing.hero"
  | "landing.banner"
  | "campaign.hero"
  | "campaign.banner";

export type PublisherInstanceStatus =
  | "draft"
  | "scheduled"
  | "active"
  | "paused"
  | "archived";

export type PublisherEditableFieldKey =
  | "badgeText"
  | "headline"
  | "subheadline"
  | "primaryCta"
  | "secondaryCta"
  | "media"
  | "accent"
  | "overlay";

export type PublisherEditableValue =
  | string
  | number
  | boolean
  | null
  | { label?: string; href?: string }
  | {
      assetId?: string;
      url?: string;
      alt?: string;
      width?: number;
      height?: number;
      format?: string;
    };

export type PublisherEditableFields = Partial<
  Record<PublisherEditableFieldKey, PublisherEditableValue>
>;

export type PublisherPresetInstance = {
  id: string;
  presetVaultItemId: string;
  sourcePieceId?: string;
  businessId: string;
  pieceType: "hero" | "banner";
  zone: PublisherRenderableZone;
  status: PublisherInstanceStatus;
  editableFields: PublisherEditableFields;
  createdAt: string;
  updatedAt: string;
};

export type PublisherScheduleWindow = {
  startAt?: string;
  endAt?: string;
  priority?: number;
};

export type PublisherInstance = PublisherPresetInstance & {
  schedule?: PublisherScheduleWindow;
};

export type PublisherInstanceRuntime = {
  instanceId: string;
  zone: PublisherRenderableZone;
  pieceType: "hero" | "banner";
  presetVaultItemId: string;
  resolvedVariantKey?: string;
  editableFields: PublisherEditableFields;
};
