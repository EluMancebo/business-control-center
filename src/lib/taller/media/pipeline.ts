import { put } from "@vercel/blob";
import sharp from "sharp";
import {
  updateSystemAssetPipelineRepository,
  upsertSystemAssetVariantRepository,
} from "@/lib/taller/media/repository";
import type { AssetItem, AssetVariantKey, ProcessedAssetResult } from "@/lib/taller/media/types";

const THUMBNAIL_WIDTH = 300;
const OPTIMIZED_MAX_WIDTH = 1600;
const TRANSPARENCY_ALPHA_THRESHOLD = 24;
const MAX_VECTOR_COLOR_COUNT = 16;

function getBlobReadWriteToken() {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    throw new Error("Missing BLOB_READ_WRITE_TOKEN environment variable");
  }
  return token;
}

function toSafeSourceId(value: string): string {
  const normalized = String(value || "").trim();
  if (!normalized) throw new Error("Invalid source asset id");
  return normalized;
}

function buildDerivedStorageKey(sourceKey: string, variant: string, extension: string): string {
  const clean = String(sourceKey || "").trim().replace(/^\/+/, "");
  const withoutExtension = clean.replace(/\.[a-z0-9]+$/i, "");
  const base = withoutExtension || `system/${Date.now()}-asset`;
  return `${base}-${variant}.${extension}`;
}

function bufferToArrayBuffer(buffer: Buffer): ArrayBuffer {
  return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer;
}

async function fetchBinary(url: string): Promise<Buffer> {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Unable to read source asset (${response.status})`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

function channelToHex(value: number): string {
  return value.toString(16).padStart(2, "0");
}

function pixelToCssColor(r: number, g: number, b: number, a: number): string {
  if (a >= 250) {
    return `#${channelToHex(r)}${channelToHex(g)}${channelToHex(b)}`;
  }
  const alpha = Math.max(0, Math.min(1, a / 255));
  return `rgba(${r},${g},${b},${alpha.toFixed(3)})`;
}

function quantizeChannel(value: number): number {
  return Math.round(value / 32) * 32;
}

async function detectVectorizableRaster(args: {
  raster: Buffer;
  width: number;
  height: number;
  hasAlpha: boolean;
}): Promise<boolean> {
  if (!args.hasAlpha) return false;
  if (args.width <= 0 || args.height <= 0) return false;
  if (args.width > 2200 || args.height > 2200) return false;

  const sample = await sharp(args.raster)
    .ensureAlpha()
    .resize({ width: 64, height: 64, fit: "inside", withoutEnlargement: true })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const totalPixels = (sample.info.width || 0) * (sample.info.height || 0);
  if (!totalPixels) return false;

  const channels = sample.info.channels || 4;
  const data = sample.data;
  const colors = new Set<string>();
  let transparentPixels = 0;

  for (let i = 0; i < data.length; i += channels) {
    const alpha = channels > 3 ? data[i + 3] : 255;
    if (alpha < TRANSPARENCY_ALPHA_THRESHOLD) {
      transparentPixels += 1;
      continue;
    }

    const r = quantizeChannel(data[i] || 0);
    const g = quantizeChannel(data[i + 1] || 0);
    const b = quantizeChannel(data[i + 2] || 0);
    colors.add(`${r}-${g}-${b}`);
    if (colors.size > MAX_VECTOR_COLOR_COUNT) return false;
  }

  const transparencyRatio = transparentPixels / totalPixels;
  return transparencyRatio >= 0.08 && colors.size > 0 && colors.size <= MAX_VECTOR_COLOR_COUNT;
}

async function createApproximateVectorSvg(raster: Buffer): Promise<{
  svg: Buffer;
  width: number;
  height: number;
}> {
  const sample = await sharp(raster)
    .ensureAlpha()
    .resize({ width: 72, height: 72, fit: "inside", withoutEnlargement: true })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const width = sample.info.width || 1;
  const height = sample.info.height || 1;
  const channels = sample.info.channels || 4;
  const data = sample.data;
  const rects: string[] = [];

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const offset = (y * width + x) * channels;
      const r = data[offset] || 0;
      const g = data[offset + 1] || 0;
      const b = data[offset + 2] || 0;
      const a = channels > 3 ? data[offset + 3] || 0 : 255;
      if (a < TRANSPARENCY_ALPHA_THRESHOLD) continue;

      rects.push(`<rect x="${x}" y="${y}" width="1" height="1" fill="${pixelToCssColor(r, g, b, a)}"/>`);
    }
  }

  const svgText = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}"`,
    ` width="${width}" height="${height}" shape-rendering="crispEdges">`,
    rects.join(""),
    "</svg>",
  ].join("");

  return { svg: Buffer.from(svgText, "utf8"), width, height };
}

export async function processAsset(asset: AssetItem): Promise<ProcessedAssetResult> {
  const sourceAssetId = toSafeSourceId(asset._id);
  const generatedVariantKeys: AssetVariantKey[] = [];

  if (asset.sourceAssetId || asset.variantKey !== "original") {
    return {
      sourceAssetId,
      pipelineStatus: asset.pipelineStatus,
      pipelineStage: asset.pipelineStage,
      pipelineError: asset.pipelineError,
      generatedVariantKeys,
      vectorizable: false,
    };
  }

  if (asset.scope !== "system" || asset.businessId !== null) {
    return {
      sourceAssetId,
      pipelineStatus: "skipped",
      pipelineStage: "done",
      pipelineError: "",
      generatedVariantKeys,
      vectorizable: false,
    };
  }

  if (asset.kind !== "image") {
    await updateSystemAssetPipelineRepository(sourceAssetId, {
      pipelineStatus: "ready",
      pipelineStage: "done",
      pipelineError: "",
    });

    return {
      sourceAssetId,
      pipelineStatus: "ready",
      pipelineStage: "done",
      pipelineError: "",
      generatedVariantKeys,
      vectorizable: false,
    };
  }

  try {
    await updateSystemAssetPipelineRepository(sourceAssetId, {
      pipelineStatus: "processing",
      pipelineStage: "ingest",
      pipelineError: "",
    });

    const originalRaster = await fetchBinary(asset.url);
    const originalMeta = await sharp(originalRaster).metadata();
    const originalWidth = Number(originalMeta.width || 0);
    const originalHeight = Number(originalMeta.height || 0);
    const hasAlpha = Boolean(originalMeta.hasAlpha);

    await updateSystemAssetPipelineRepository(sourceAssetId, {
      width: originalWidth,
      height: originalHeight,
      pipelineStatus: "processing",
      pipelineStage: "analyze",
      pipelineError: "",
    });

    await updateSystemAssetPipelineRepository(sourceAssetId, {
      pipelineStatus: "processing",
      pipelineStage: "derive",
      pipelineError: "",
    });

    const thumbnailOutput = await sharp(originalRaster)
      .rotate()
      .resize({ width: THUMBNAIL_WIDTH, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 72 })
      .toBuffer({ resolveWithObject: true });

    const thumbnailBlob = await put(
      buildDerivedStorageKey(asset.key, "thumbnail", "webp"),
      new Blob([bufferToArrayBuffer(thumbnailOutput.data)], { type: "image/webp" }),
      {
        token: getBlobReadWriteToken(),
        access: "public",
        contentType: "image/webp",
      }
    );

    await upsertSystemAssetVariantRepository({
      businessId: null,
      scope: "system",
      kind: "image",
      bucket: "vercel-blob",
      key: thumbnailBlob.pathname,
      url: thumbnailBlob.url,
      label: `${asset.label} · thumbnail`,
      tags: asset.tags,
      allowedIn: asset.allowedIn,
      mime: "image/webp",
      bytes: thumbnailOutput.data.byteLength,
      width: Number(thumbnailOutput.info.width || 0),
      height: Number(thumbnailOutput.info.height || 0),
      sourceAssetId,
      variantKey: "thumbnail",
      pipelineStatus: "ready",
      pipelineStage: "done",
      pipelineError: "",
      status: "active",
    });
    generatedVariantKeys.push("thumbnail");

    const optimizedOutput = await sharp(originalRaster)
      .rotate()
      .resize({ width: OPTIMIZED_MAX_WIDTH, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 84 })
      .toBuffer({ resolveWithObject: true });

    const optimizedBlob = await put(
      buildDerivedStorageKey(asset.key, "optimized", "webp"),
      new Blob([bufferToArrayBuffer(optimizedOutput.data)], { type: "image/webp" }),
      {
        token: getBlobReadWriteToken(),
        access: "public",
        contentType: "image/webp",
      }
    );

    await upsertSystemAssetVariantRepository({
      businessId: null,
      scope: "system",
      kind: "image",
      bucket: "vercel-blob",
      key: optimizedBlob.pathname,
      url: optimizedBlob.url,
      label: `${asset.label} · optimized`,
      tags: asset.tags,
      allowedIn: asset.allowedIn,
      mime: "image/webp",
      bytes: optimizedOutput.data.byteLength,
      width: Number(optimizedOutput.info.width || 0),
      height: Number(optimizedOutput.info.height || 0),
      sourceAssetId,
      variantKey: "optimized",
      pipelineStatus: "ready",
      pipelineStage: "done",
      pipelineError: "",
      status: "active",
    });
    generatedVariantKeys.push("optimized");

    const vectorizable = await detectVectorizableRaster({
      raster: originalRaster,
      width: originalWidth,
      height: originalHeight,
      hasAlpha,
    });

    if (vectorizable) {
      await updateSystemAssetPipelineRepository(sourceAssetId, {
        pipelineStatus: "processing",
        pipelineStage: "vectorize",
        pipelineError: "",
      });

      const vectorized = await createApproximateVectorSvg(originalRaster);
      const svgBlob = await put(
        buildDerivedStorageKey(asset.key, "vectorized-svg", "svg"),
        new Blob([bufferToArrayBuffer(vectorized.svg)], { type: "image/svg+xml" }),
        {
          token: getBlobReadWriteToken(),
          access: "public",
          contentType: "image/svg+xml",
        }
      );

      await upsertSystemAssetVariantRepository({
        businessId: null,
        scope: "system",
        kind: "svg",
        bucket: "vercel-blob",
        key: svgBlob.pathname,
        url: svgBlob.url,
        label: `${asset.label} · vectorized`,
        tags: asset.tags,
        allowedIn: asset.allowedIn,
        mime: "image/svg+xml",
        bytes: vectorized.svg.byteLength,
        width: vectorized.width,
        height: vectorized.height,
        sourceAssetId,
        variantKey: "vectorized-svg",
        pipelineStatus: "ready",
        pipelineStage: "done",
        pipelineError: "",
        status: "active",
      });
      generatedVariantKeys.push("vectorized-svg");
    }

    await updateSystemAssetPipelineRepository(sourceAssetId, {
      pipelineStatus: "ready",
      pipelineStage: "done",
      pipelineError: "",
    });

    return {
      sourceAssetId,
      pipelineStatus: "ready",
      pipelineStage: "done",
      pipelineError: "",
      generatedVariantKeys,
      vectorizable,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Pipeline processing failed";

    await updateSystemAssetPipelineRepository(sourceAssetId, {
      pipelineStatus: "failed",
      pipelineStage: "done",
      pipelineError: message,
    });

    return {
      sourceAssetId,
      pipelineStatus: "failed",
      pipelineStage: "done",
      pipelineError: message,
      generatedVariantKeys,
      vectorizable: false,
    };
  }
}
