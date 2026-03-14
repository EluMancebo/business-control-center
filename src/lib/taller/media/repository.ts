import { Asset } from "@/models/Asset";
import type { AssetCreateInput, AssetListQuery } from "./types";

export async function listSystemAssetsRepository(query: AssetListQuery) {
  return Asset.find(query).sort({ createdAt: -1 }).limit(200).lean();
}

export async function createSystemAssetRepository(input: AssetCreateInput) {
  return Asset.create(input);
}
