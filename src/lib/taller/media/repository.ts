import { Asset } from "@/models/Asset";
import type {
  AssetCreateInput,
  AssetPipelineStage,
  AssetPipelineStatus,
  AssetVariantKey,
  AssetListQuery,
  AssetUpdateMetadataInput,
} from "./types";

const DEFAULT_VARIANT_KEY: AssetVariantKey = "original";
const DEFAULT_PIPELINE_STATUS: AssetPipelineStatus = "ready";
const DEFAULT_PIPELINE_STAGE: AssetPipelineStage = "done";

type AssetPipelineUpdateInput = {
  width?: number;
  height?: number;
  pipelineStatus?: AssetPipelineStatus;
  pipelineStage?: AssetPipelineStage;
  pipelineError?: string;
};

function toDimension(value: number | undefined): number {
  if (typeof value !== "number" || Number.isNaN(value)) return 0;
  return value;
}

function toSourceAssetId(value: string | null | undefined): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized ? normalized : null;
}

function toPipelineError(value: string | undefined): string {
  if (typeof value !== "string") return "";
  return value;
}

function getInitialPipelineDefaults(kind: AssetCreateInput["kind"]): {
  pipelineStatus: AssetPipelineStatus;
  pipelineStage: AssetPipelineStage;
} {
  if (kind === "image") {
    return { pipelineStatus: "queued", pipelineStage: "ingest" };
  }

  return {
    pipelineStatus: DEFAULT_PIPELINE_STATUS,
    pipelineStage: DEFAULT_PIPELINE_STAGE,
  };
}

export async function listSystemAssetsRepository(query: AssetListQuery) {
  return Asset.find(query).sort({ createdAt: -1 }).limit(200).lean();
}

export async function createSystemAssetRepository(input: AssetCreateInput) {
  const initialPipeline = getInitialPipelineDefaults(input.kind);

  return Asset.create({
    ...input,
    width: toDimension(input.width),
    height: toDimension(input.height),
    sourceAssetId: toSourceAssetId(input.sourceAssetId),
    variantKey: input.variantKey ?? DEFAULT_VARIANT_KEY,
    pipelineStatus: input.pipelineStatus ?? initialPipeline.pipelineStatus,
    pipelineStage: input.pipelineStage ?? initialPipeline.pipelineStage,
    pipelineError: toPipelineError(input.pipelineError),
  });
}

export async function updateSystemAssetPipelineRepository(id: string, input: AssetPipelineUpdateInput) {
  const next: Record<string, unknown> = {};

  if (typeof input.width === "number") next.width = toDimension(input.width);
  if (typeof input.height === "number") next.height = toDimension(input.height);
  if (input.pipelineStatus) next.pipelineStatus = input.pipelineStatus;
  if (input.pipelineStage) next.pipelineStage = input.pipelineStage;
  if (typeof input.pipelineError === "string") next.pipelineError = toPipelineError(input.pipelineError);

  if (Object.keys(next).length === 0) {
    return Asset.findOne({ _id: id, scope: "system", businessId: null }).lean();
  }

  return Asset.findOneAndUpdate(
    { _id: id, scope: "system", businessId: null },
    { $set: next },
    { new: true, lean: true }
  );
}

export async function upsertSystemAssetVariantRepository(input: AssetCreateInput) {
  const sourceAssetId = toSourceAssetId(input.sourceAssetId);
  if (!sourceAssetId) {
    throw new Error("sourceAssetId is required for derived variants");
  }

  const initialPipeline = getInitialPipelineDefaults(input.kind);
  const variantKey = input.variantKey ?? DEFAULT_VARIANT_KEY;

  return Asset.findOneAndUpdate(
    {
      scope: "system",
      businessId: null,
      sourceAssetId,
      variantKey,
    },
    {
      $set: {
        kind: input.kind,
        bucket: input.bucket,
        key: input.key,
        url: input.url,
        label: input.label,
        tags: input.tags,
        allowedIn: input.allowedIn,
        mime: input.mime,
        bytes: input.bytes,
        width: toDimension(input.width),
        height: toDimension(input.height),
        sourceAssetId,
        variantKey,
        pipelineStatus: input.pipelineStatus ?? initialPipeline.pipelineStatus,
        pipelineStage: input.pipelineStage ?? initialPipeline.pipelineStage,
        pipelineError: toPipelineError(input.pipelineError),
        status: input.status,
      },
    },
    {
      upsert: true,
      new: true,
      lean: true,
      setDefaultsOnInsert: true,
    }
  );
}

export async function findSystemAssetByIdRepository(id: string) {
  return Asset.findOne({ _id: id, scope: "system", businessId: null }).lean();
}

export async function updateSystemAssetMetadataRepository(
  id: string,
  input: AssetUpdateMetadataInput
) {
  return Asset.findOneAndUpdate(
    { _id: id, scope: "system", businessId: null },
    {
      $set: {
        label: input.label,
        tags: input.tags,
        allowedIn: input.allowedIn,
      },
    },
    { new: true, lean: true }
  );
}

export async function deleteSystemAssetRepository(id: string) {
  return Asset.findOneAndDelete({ _id: id, scope: "system", businessId: null }).lean();
}
