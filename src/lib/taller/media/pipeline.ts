import { put } from "@vercel/blob";
import sharp from "sharp";
import { prepareSvgPipelineResult } from "@/lib/media/svg-pipeline";
import { generateAnimatedSvg } from "@/lib/media/animator";
import {
  updateSystemAssetPipelineRepository,
  upsertSystemAssetVariantRepository,
  findVariantBySourceRepository,
} from "@/lib/taller/media/repository";
import type { AssetItem, AssetVariantKey, ProcessedAssetResult } from "@/lib/taller/media/types";

const THUMBNAIL_WIDTH = 300;
const OPTIMIZED_MAX_WIDTH = 1600;
const TRANSPARENCY_ALPHA_THRESHOLD = 24;
const VECTOR_ICON_MAX_COLORS = 10;
const VECTOR_LOGO_MAX_COLORS = 20;
const VECTOR_ICON_MIN_TRANSPARENCY = 0.12;
const VECTOR_LOGO_MIN_TRANSPARENCY = 0.04;
const VECTOR_MAX_DIMENSION = 2400;
const VECTOR_ICON_MAX_DIMENSION = 900;
const DOMINANT_ALPHA_THRESHOLD = 176;
const DOMINANT_COLOR_STEP = 48;
const DOMINANT_MIN_SHARE = 0.015;
const CATEGORY_ICON_MAX_DOMINANT_COLORS = 8;
const CATEGORY_LOGO_MAX_DOMINANT_COLORS = 16;
const CATEGORY_ICON_EXTREME_SAMPLED_COLORS = 180;
const CATEGORY_LOGO_EXTREME_SAMPLED_COLORS = 260;
type DerivedVariantKey = Exclude<AssetVariantKey, "original">;
type VectorizationAnalysis = NonNullable<ProcessedAssetResult["vectorizationAnalysis"]>;
type VisualCategoryHint = VectorizationAnalysis["kind"] | null;

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

function quantizeDominantChannel(value: number): number {
  const quantized = Math.round(value / DOMINANT_COLOR_STEP) * DOMINANT_COLOR_STEP;
  if (quantized < 0) return 0;
  if (quantized > 255) return 255;
  return quantized;
}

function countDominantColors(args: {
  bucketCounts: Map<string, number>;
  solidPixelCount: number;
}): number {
  if (args.solidPixelCount <= 0 || args.bucketCounts.size === 0) return 0;

  let dominantColorCount = 0;
  for (const count of args.bucketCounts.values()) {
    if (count / args.solidPixelCount >= DOMINANT_MIN_SHARE) {
      dominantColorCount += 1;
    }
  }

  if (dominantColorCount === 0) return 1;
  return dominantColorCount;
}

function isRootUsableAsset(asset: AssetItem): boolean {
  const hasParent = Boolean(String(asset.sourceAssetId || "").trim());
  if (hasParent) return false;
  return (
    asset.variantKey !== "thumbnail" &&
    asset.variantKey !== "optimized" &&
    asset.variantKey !== "vectorized-svg"
  );
}

function extractVisualCategoryHint(tags: string[]): VisualCategoryHint {
  for (const rawTag of tags) {
    const tag = String(rawTag || "").trim().toLowerCase();
    if (!tag) continue;

    const value = tag.startsWith("visual:") ? tag.slice("visual:".length).trim() : tag;
    if (
      value === "logo" ||
      value === "icon" ||
      value === "shape" ||
      value === "photo" ||
      value === "texture" ||
      value === "illustration"
    ) {
      return value;
    }
  }

  return null;
}

async function analyzeVectorizationCandidate(args: {
  raster: Buffer;
  width: number;
  height: number;
  hasAlpha: boolean;
  categoryHint: VisualCategoryHint;
}): Promise<VectorizationAnalysis> {
  if (args.categoryHint === "photo") {
    return {
      kind: "photo",
      candidate: false,
      reason: "No apto para SVG: categoría visual 'photo' excluida en fase 1.",
      sampledColorCount: 0,
      dominantColorCount: 0,
      transparencyRatio: 0,
    };
  }
  if (args.categoryHint === "texture") {
    return {
      kind: "texture",
      candidate: false,
      reason: "No apto para SVG: categoría visual 'texture' excluida en fase 1.",
      sampledColorCount: 0,
      dominantColorCount: 0,
      transparencyRatio: 0,
    };
  }

  if (args.width <= 0 || args.height <= 0) {
    return {
      kind: args.categoryHint ?? "illustration",
      candidate: false,
      reason: "No apto para SVG: dimensiones inválidas.",
      sampledColorCount: 0,
      dominantColorCount: 0,
      transparencyRatio: 0,
    };
  }
  if (args.width > VECTOR_MAX_DIMENSION || args.height > VECTOR_MAX_DIMENSION) {
    return {
      kind: args.categoryHint ?? "photo",
      candidate: false,
      reason: "No apto para SVG: imagen demasiado grande para vectorización fase 1.",
      sampledColorCount: 0,
      dominantColorCount: 0,
      transparencyRatio: 0,
    };
  }

  const sample = await sharp(args.raster)
    .ensureAlpha()
    .resize({ width: 64, height: 64, fit: "inside", withoutEnlargement: true })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const totalPixels = (sample.info.width || 0) * (sample.info.height || 0);
  if (!totalPixels) {
    return {
      kind: args.categoryHint ?? "illustration",
      candidate: false,
      reason: "No apto para SVG: no se pudo muestrear el raster.",
      sampledColorCount: 0,
      dominantColorCount: 0,
      transparencyRatio: 0,
    };
  }

  const channels = sample.info.channels || 4;
  const data = sample.data;
  const colors = new Set<string>();
  const dominantBuckets = new Map<string, number>();
  let transparentPixels = 0;
  let dominantSolidPixels = 0;

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

    if (alpha >= DOMINANT_ALPHA_THRESHOLD) {
      dominantSolidPixels += 1;
      const dr = quantizeDominantChannel(data[i] || 0);
      const dg = quantizeDominantChannel(data[i + 1] || 0);
      const db = quantizeDominantChannel(data[i + 2] || 0);
      const key = `${dr}-${dg}-${db}`;
      dominantBuckets.set(key, (dominantBuckets.get(key) ?? 0) + 1);
    }
  }

  const transparencyRatio = transparentPixels / totalPixels;
  const sampledColorCount = colors.size;
  const dominantColorCount = countDominantColors({
    bucketCounts: dominantBuckets,
    solidPixelCount: dominantSolidPixels,
  });

  if (args.categoryHint === "icon" || args.categoryHint === "logo") {
    const maxDominantColors =
      args.categoryHint === "icon"
        ? CATEGORY_ICON_MAX_DOMINANT_COLORS
        : CATEGORY_LOGO_MAX_DOMINANT_COLORS;
    const extremeSampledLimit =
      args.categoryHint === "icon"
        ? CATEGORY_ICON_EXTREME_SAMPLED_COLORS
        : CATEGORY_LOGO_EXTREME_SAMPLED_COLORS;

    if (dominantColorCount > maxDominantColors) {
      return {
        kind: args.categoryHint,
        candidate: false,
        reason: `No apto para SVG: ${args.categoryHint} con demasiados colores dominantes (${dominantColorCount}).`,
        sampledColorCount,
        dominantColorCount,
        transparencyRatio,
      };
    }

    if (
      sampledColorCount > extremeSampledLimit &&
      dominantColorCount > Math.ceil(maxDominantColors * 1.5)
    ) {
      return {
        kind: args.categoryHint,
        candidate: false,
        reason: `No apto para SVG: ${args.categoryHint} con complejidad raster extrema.`,
        sampledColorCount,
        dominantColorCount,
        transparencyRatio,
      };
    }

    if (
      args.categoryHint === "icon" &&
      (args.width > VECTOR_ICON_MAX_DIMENSION * 2 || args.height > VECTOR_ICON_MAX_DIMENSION * 2)
    ) {
      return {
        kind: "icon",
        candidate: false,
        reason: "No apto para SVG: icono demasiado grande para fase 1.",
        sampledColorCount,
        dominantColorCount,
        transparencyRatio,
      };
    }

    return {
      kind: args.categoryHint,
      candidate: true,
      reason: `Candidato SVG por categoría visual '${args.categoryHint}'.`,
      sampledColorCount,
      dominantColorCount,
      transparencyRatio,
    };
  }

  if (args.categoryHint === "shape") {
    const candidate = sampledColorCount <= 6 && transparencyRatio >= 0.02;
    return {
      kind: "shape",
      candidate,
      reason: candidate
        ? "Candidato SVG: shape simple detectado en fase 1."
        : "No apto para SVG en fase 1: shape con complejidad alta.",
      sampledColorCount,
      dominantColorCount,
      transparencyRatio,
    };
  }

  if (!args.hasAlpha) {
    return {
      kind: args.categoryHint ?? "photo",
      candidate: false,
      reason: "No apto para SVG: sin transparencia útil para esta categoría.",
      sampledColorCount,
      dominantColorCount,
      transparencyRatio,
    };
  }

  let kind: VectorizationAnalysis["kind"] = "illustration";
  if (sampledColorCount > 42) {
    kind = "photo";
  } else if (sampledColorCount <= 4 && transparencyRatio < VECTOR_LOGO_MIN_TRANSPARENCY) {
    kind = "shape";
  } else if (
    sampledColorCount <= VECTOR_ICON_MAX_COLORS &&
    transparencyRatio >= VECTOR_ICON_MIN_TRANSPARENCY &&
    args.width <= VECTOR_ICON_MAX_DIMENSION &&
    args.height <= VECTOR_ICON_MAX_DIMENSION
  ) {
    kind = "icon";
  } else if (
    sampledColorCount <= VECTOR_LOGO_MAX_COLORS &&
    transparencyRatio >= VECTOR_LOGO_MIN_TRANSPARENCY
  ) {
    kind = "logo";
  }

  const candidate = kind === "logo" || kind === "icon";
  const reason = candidate
    ? kind === "icon"
      ? "Candidato SVG: icono simple detectado."
      : "Candidato SVG: logo simplificado detectado."
    : kind === "photo"
      ? "No apto para SVG: detectado como foto o raster complejo."
      : kind === "shape"
        ? "No apto para SVG en fase 1: shape sin señal suficiente de logo/icono."
        : "No apto para SVG: detectado como ilustración compleja.";

  return {
    kind,
    candidate,
    reason,
    sampledColorCount,
    dominantColorCount,
    transparencyRatio,
  };
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

export async function processAssetVariant(
  asset: AssetItem,
  variantKey: DerivedVariantKey,
  options?: { force?: boolean }
): Promise<ProcessedAssetResult> {
  const sourceAssetId = toSafeSourceId(asset._id);
  const generatedVariantKeys: AssetVariantKey[] = [];
  let vectorizationAnalysis: VectorizationAnalysis | undefined;
  let svgAnalysis: ProcessedAssetResult["svgAnalysis"];
  let svgAnimation: ProcessedAssetResult["svgAnimation"];

  if (!isRootUsableAsset(asset)) {
    return {
      sourceAssetId,
      pipelineStatus: "skipped",
      pipelineStage: "done",
      pipelineError: "Source asset must be root/original",
      generatedVariantKeys,
      vectorizable: false,
    };
  }

  if (asset.scope !== "system" || asset.businessId !== null) {
    return {
      sourceAssetId,
      pipelineStatus: "skipped",
      pipelineStage: "done",
      pipelineError: "Only system assets are supported",
      generatedVariantKeys,
      vectorizable: false,
    };
  }

  if (asset.kind !== "image") {
    return {
      sourceAssetId,
      pipelineStatus: "skipped",
      pipelineStage: "done",
      pipelineError: "Only image assets can generate derived variants",
      generatedVariantKeys,
      vectorizable: false,
    };
  }

  try {
    await updateSystemAssetPipelineRepository(sourceAssetId, {
      pipelineStatus: "processing",
      pipelineStage: "analyze",
      pipelineError: "",
    });

    const originalRaster = await fetchBinary(asset.url);
    const originalMeta = await sharp(originalRaster).metadata();
    const originalWidth = Number(originalMeta.width || 0);
    const originalHeight = Number(originalMeta.height || 0);
    const hasAlpha = Boolean(originalMeta.hasAlpha);
    const categoryHint = extractVisualCategoryHint(asset.tags);

    await updateSystemAssetPipelineRepository(sourceAssetId, {
      width: originalWidth,
      height: originalHeight,
      pipelineStatus: "processing",
      pipelineStage: variantKey === "vectorized-svg" ? "vectorize" : "derive",
      pipelineError: "",
    });

    if (variantKey === "thumbnail") {
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
    } else if (variantKey === "optimized") {
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
    } else if (variantKey === "animated-svg") {
      const vectorizedVariant = await findVariantBySourceRepository(
        sourceAssetId,
        "vectorized-svg"
      );

      if (!vectorizedVariant) {
        await updateSystemAssetPipelineRepository(sourceAssetId, {
          pipelineStatus: "skipped",
          pipelineStage: "done",
          pipelineError: "Requiere variante vectorized-svg previa",
        });
        return {
          sourceAssetId,
          pipelineStatus: "skipped",
          pipelineStage: "done",
          pipelineError: "Requiere variante vectorized-svg previa",
          generatedVariantKeys,
          vectorizable: false,
        };
      }

      const svgResponse = await fetch(vectorizedVariant.url, { cache: "no-store" });
      const fetchedSvg = await svgResponse.text();

      const animResult = generateAnimatedSvg(fetchedSvg, {
        force: options?.force,
      });

      if (!animResult.applied) {
        await updateSystemAssetPipelineRepository(sourceAssetId, {
          pipelineStatus: "skipped",
          pipelineStage: "done",
          pipelineError: animResult.reason,
        });
        return {
          sourceAssetId,
          pipelineStatus: "skipped",
          pipelineStage: "done",
          pipelineError: animResult.reason,
          generatedVariantKeys,
          vectorizable: true,
          svgAnalysis: animResult.analysis,
          svgAnimation: animResult.decision,
        };
      }

      const animatedBuffer = Buffer.from(animResult.animatedSvg, "utf8");
      const animBlob = await put(
        buildDerivedStorageKey(asset.key, "animated-svg", "svg"),
        new Blob([bufferToArrayBuffer(animatedBuffer)], {
          type: "image/svg+xml",
        }),
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
        key: animBlob.pathname,
        url: animBlob.url,
        label: `${asset.label} · animated`,
        tags: asset.tags,
        allowedIn: asset.allowedIn,
        mime: "image/svg+xml",
        bytes: animatedBuffer.byteLength,
        width: Number(vectorizedVariant.width ?? 0),
        height: Number(vectorizedVariant.height ?? 0),
        sourceAssetId,
        variantKey: "animated-svg",
        pipelineStatus: "ready",
        pipelineStage: "done",
        pipelineError: "",
        status: "active",
      });
      generatedVariantKeys.push("animated-svg");
      svgAnalysis = animResult.analysis;
      svgAnimation = animResult.decision;

    } else {
      vectorizationAnalysis = await analyzeVectorizationCandidate({
        raster: originalRaster,
        width: originalWidth,
        height: originalHeight,
        hasAlpha,
        categoryHint,
      });

      if (!vectorizationAnalysis.candidate) {
        await updateSystemAssetPipelineRepository(sourceAssetId, {
          pipelineStatus: "ready",
          pipelineStage: "done",
          pipelineError: "",
        });

        return {
          sourceAssetId,
          pipelineStatus: "skipped",
          pipelineStage: "done",
          pipelineError: vectorizationAnalysis.reason,
          generatedVariantKeys,
          vectorizable: false,
          vectorizationAnalysis,
        };
      }

      const vectorized = await createApproximateVectorSvg(originalRaster);
      const preparedSvg = prepareSvgPipelineResult(vectorized.svg.toString("utf8"));
      svgAnalysis = preparedSvg.analysis;
      svgAnimation = preparedSvg.animation;
      const optimizedSvg = preparedSvg.optimizedSvg.trim();
      if (!optimizedSvg) {
        throw new Error("SVG optimization pipeline returned empty output");
      }
      const optimizedSvgBuffer = Buffer.from(optimizedSvg, "utf8");

      const svgBlob = await put(
        buildDerivedStorageKey(asset.key, "vectorized-svg", "svg"),
        new Blob([bufferToArrayBuffer(optimizedSvgBuffer)], { type: "image/svg+xml" }),
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
        bytes: optimizedSvgBuffer.byteLength,
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
      vectorizable: true,
      svgAnalysis,
      svgAnimation,
      vectorizationAnalysis,
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

    await updateSystemAssetPipelineRepository(sourceAssetId, {
      width: originalWidth,
      height: originalHeight,
      pipelineStatus: "processing",
      pipelineStage: "analyze",
      pipelineError: "",
    });
    // Modelo manual-selectivo: en upload automático solo dejamos ingest + analyze.
    // La generación de derivados se dispara exclusivamente vía processAssetVariant(...).
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
