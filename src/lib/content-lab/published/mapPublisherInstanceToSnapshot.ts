import type { PresetVaultItem } from "@/lib/content-lab/preset-vault/types";
import type { PublisherInstance } from "@/lib/content-lab/publisher/types";
import type {
  PublishedCta,
  PublishedMedia,
  PublishedPiecePayload,
  PublishedPieceSnapshot,
  PublishedRenderableZone,
} from "@/lib/content-lab/published/types";

export type MapPublisherInstanceToSnapshotInput = {
  instance: PublisherInstance;
  presetVaultItem: PresetVaultItem;
  version: number;
  publishedAt: string;
  publishedByUserId?: string;
};

const PUBLISHED_ZONES: PublishedRenderableZone[] = [
  "home.hero",
  "home.banner",
  "landing.hero",
  "landing.banner",
  "campaign.hero",
  "campaign.banner",
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toPublishedCta(value: unknown): PublishedCta | undefined {
  if (!isRecord(value) || typeof value.label !== "string") {
    return undefined;
  }

  const cta: PublishedCta = { label: value.label };

  if (typeof value.href === "string") {
    cta.href = value.href;
  }

  return cta;
}

function toPublishedMedia(value: unknown): PublishedMedia | undefined {
  if (!isRecord(value) || typeof value.url !== "string") {
    return undefined;
  }

  const media: PublishedMedia = { url: value.url };

  if (typeof value.assetId === "string") {
    media.assetId = value.assetId;
  }
  if (typeof value.alt === "string") {
    media.alt = value.alt;
  }
  if (typeof value.width === "number") {
    media.width = value.width;
  }
  if (typeof value.height === "number") {
    media.height = value.height;
  }
  if (typeof value.format === "string") {
    media.format = value.format;
  }

  return media;
}

export function mapPublisherInstanceToSnapshot(
  input: MapPublisherInstanceToSnapshotInput
): PublishedPieceSnapshot {
  const { instance, presetVaultItem, version, publishedAt, publishedByUserId } = input;

  if (instance.pieceType !== "hero" && instance.pieceType !== "banner") {
    throw new Error("Publisher instance pieceType must be hero or banner.");
  }
  if (!instance.zone || !PUBLISHED_ZONES.includes(instance.zone)) {
    throw new Error("Publisher instance zone is required.");
  }
  if (version < 1) {
    throw new Error("Published version must be greater than or equal to 1.");
  }
  if (publishedAt.trim() === "") {
    throw new Error("publishedAt is required.");
  }

  const payload: PublishedPiecePayload = {};
  const editableFields = instance.editableFields;

  if (typeof editableFields.badgeText === "string") {
    payload.badgeText = editableFields.badgeText;
  }
  if (typeof editableFields.headline === "string") {
    payload.headline = editableFields.headline;
  }
  if (typeof editableFields.subheadline === "string") {
    payload.subheadline = editableFields.subheadline;
  }
  if (typeof editableFields.accent === "string") {
    payload.accent = editableFields.accent;
  }
  if (typeof editableFields.overlay === "string") {
    payload.overlay = editableFields.overlay;
  }

  const primaryCta = toPublishedCta(editableFields.primaryCta);
  if (primaryCta) {
    payload.primaryCta = primaryCta;
  }

  const secondaryCta = toPublishedCta(editableFields.secondaryCta);
  if (secondaryCta) {
    payload.secondaryCta = secondaryCta;
  }

  const media = toPublishedMedia(editableFields.media);
  if (media) {
    payload.media = media;
  }

  return {
    id: instance.id,
    businessId: instance.businessId,
    pieceType: instance.pieceType,
    zone: instance.zone,
    status: "published",
    meta: {
      version,
      publishedAt,
      publishedByUserId,
      sourcePresetVaultItemId: presetVaultItem.id,
      sourcePublisherInstanceId: instance.id,
    },
    payload,
  };
}
