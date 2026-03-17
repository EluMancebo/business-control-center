import { Asset } from "@/models/Asset";
import type {
  AssetCreateInput,
  AssetListQuery,
  AssetUpdateMetadataInput,
} from "./types";

export async function listSystemAssetsRepository(query: AssetListQuery) {
  return Asset.find(query).sort({ createdAt: -1 }).limit(200).lean();
}

export async function createSystemAssetRepository(input: AssetCreateInput) {
  return Asset.create(input);
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
