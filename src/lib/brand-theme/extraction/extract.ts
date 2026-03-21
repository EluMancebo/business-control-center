import { normalizeHexColor } from "../palette";
import type { BrandPaletteSeedSource } from "../types";
import type {
  ExtractedColorCandidate,
  ExtractedPaletteProposal,
  ExtractedPaletteResult,
  ExtractPaletteFromImageOptions,
} from "./types";

type RGB = { r: number; g: number; b: number };
type HSL = { h: number; s: number; l: number };

const DEFAULT_MAX_DIMENSION = 96;
const DEFAULT_QUANTIZATION_STEP = 24;
const DEFAULT_MIN_ALPHA = 96;
const DEFAULT_MAX_CANDIDATES = 8;
const WEIGHT_DAMPING_EXPONENT = 0.72;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function normalizeRgbChannel(value: number): number {
  return clamp(Math.round(value), 0, 255);
}

function rgbToHex(rgb: RGB): string {
  const toHex = (value: number) => normalizeRgbChannel(value).toString(16).padStart(2, "0");
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}

function hexToRgb(input: string): RGB | null {
  const normalized = normalizeHexColor(input);
  if (!normalized) return null;
  const hex = normalized.slice(1);
  return {
    r: parseInt(hex.slice(0, 2), 16),
    g: parseInt(hex.slice(2, 4), 16),
    b: parseInt(hex.slice(4, 6), 16),
  };
}

function rgbToHsl(rgb: RGB): HSL {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;
  if (delta !== 0) {
    if (max === r) h = ((g - b) / delta) % 6;
    else if (max === g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;
    h *= 60;
  }

  const l = (max + min) / 2;
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

  return { h: (h + 360) % 360, s: s * 100, l: l * 100 };
}

function hslToRgb(hsl: HSL): RGB {
  const h = ((hsl.h % 360) + 360) % 360;
  const s = clamp(hsl.s, 0, 100) / 100;
  const l = clamp(hsl.l, 0, 100) / 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r1 = 0;
  let g1 = 0;
  let b1 = 0;

  if (h < 60) {
    r1 = c;
    g1 = x;
  } else if (h < 120) {
    r1 = x;
    g1 = c;
  } else if (h < 180) {
    g1 = c;
    b1 = x;
  } else if (h < 240) {
    g1 = x;
    b1 = c;
  } else if (h < 300) {
    r1 = x;
    b1 = c;
  } else {
    r1 = c;
    b1 = x;
  }

  return {
    r: (r1 + m) * 255,
    g: (g1 + m) * 255,
    b: (b1 + m) * 255,
  };
}

function transformHexHsl(
  color: string,
  transform: (input: HSL) => HSL
): string {
  const rgb = hexToRgb(color);
  if (!rgb) return color;
  return rgbToHex(hslToRgb(transform(rgbToHsl(rgb))));
}

function quantizeChannel(channel: number, step: number): number {
  const safeStep = clamp(Math.round(step), 4, 64);
  const quantized = Math.round(channel / safeStep) * safeStep;
  return normalizeRgbChannel(quantized);
}

function buildPrimaryFallback(candidates: ExtractedColorCandidate[]): string {
  const firstChromatic = candidates.find(
    (candidate) =>
      candidate.saturation >= 20 && candidate.lightness >= 18 && candidate.lightness <= 86
  );
  if (firstChromatic) return firstChromatic.hex;
  return candidates[0]?.hex ?? "#2563eb";
}

function hueDistance(a: number, b: number): number {
  const diff = Math.abs(a - b);
  return Math.min(diff, 360 - diff);
}

function deriveAccentFallback(primary: string): string {
  const primaryRgb = hexToRgb(primary);
  const primaryHsl = primaryRgb ? rgbToHsl(primaryRgb) : null;

  return transformHexHsl(primary, (hsl) => ({
    h: hsl.h + 36,
    s: clamp(hsl.s + 8, 12, 96),
    l: clamp(
      primaryHsl && primaryHsl.l < 30 ? primaryHsl.l + 22 : hsl.l - 6,
      24,
      84
    ),
  }));
}

function deriveNeutralFallback(primary: string): string {
  return transformHexHsl(primary, (hsl) => ({
    h: hsl.h,
    s: clamp(hsl.s * 0.2, 4, 22),
    l: clamp(hsl.l + 34, 16, 88),
  }));
}

function isWarmMetalHue(hue: number): boolean {
  return hue >= 18 && hue <= 54;
}

function getWeightInfluence(weight: number): number {
  return Math.pow(clamp(weight, 0, 1), WEIGHT_DAMPING_EXPONENT);
}

function getBalancedLightnessScore(lightness: number): number {
  const normalizedDistance = Math.abs(lightness - 50) / 50;
  return clamp(1 - normalizedDistance * 0.9, 0.18, 1);
}

function getWarmAccentBoost(candidate: ExtractedColorCandidate): number {
  if (
    isWarmMetalHue(candidate.hue) &&
    candidate.saturation >= 20 &&
    candidate.saturation <= 92 &&
    candidate.lightness >= 24 &&
    candidate.lightness <= 80
  ) {
    return 1.26;
  }
  return 1;
}

function pickPrimary(candidates: ExtractedColorCandidate[]): string {
  if (candidates.length === 0) return "#2563eb";

  const scored = candidates.map((candidate) => {
    const weightScore = getWeightInfluence(candidate.weight);
    const saturationScore = 0.32 + clamp(candidate.saturation / 100, 0, 1) * 0.88;
    const balancedLightness = getBalancedLightnessScore(candidate.lightness);
    const veryDarkPenalty = candidate.lightness < 16 ? 0.18 : candidate.lightness < 22 ? 0.45 : 1;
    const veryLightPenalty = candidate.lightness > 92 ? 0.3 : candidate.lightness > 86 ? 0.62 : 1;
    const lowChromaPenalty = candidate.saturation < 12 ? 0.24 : 1;
    const warmBoost = getWarmAccentBoost(candidate);
    const score =
      weightScore *
      saturationScore *
      balancedLightness *
      veryDarkPenalty *
      veryLightPenalty *
      lowChromaPenalty *
      warmBoost;
    return { candidate, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored[0]?.candidate.hex ?? buildPrimaryFallback(candidates);
}

function pickAccent(candidates: ExtractedColorCandidate[], primary: string): string {
  const primaryRgb = hexToRgb(primary);
  const primaryHsl = primaryRgb ? rgbToHsl(primaryRgb) : null;

  if (!primaryHsl || candidates.length === 0) {
    return deriveAccentFallback(primary);
  }

  const scored = candidates
    .filter(
      (candidate) =>
        candidate.hex !== primary &&
        candidate.saturation >= 16 &&
        candidate.lightness >= 16 &&
        candidate.lightness <= 88
    )
    .map((candidate) => {
      const distance = hueDistance(candidate.hue, primaryHsl.h);
      const weightScore = getWeightInfluence(candidate.weight);
      const saturationScore = 0.45 + clamp(candidate.saturation / 100, 0, 1);
      const distanceScore = 0.38 + distance / 180;
      const balancedLightness = getBalancedLightnessScore(candidate.lightness);
      const darkPenalty = candidate.lightness < 22 ? 0.34 : 1;
      const warmBoost = getWarmAccentBoost(candidate);
      const score =
        weightScore * saturationScore * distanceScore * balancedLightness * darkPenalty * warmBoost;
      return { candidate, score };
    })
    .sort((a, b) => b.score - a.score);

  return scored[0]?.candidate.hex ?? deriveAccentFallback(primary);
}

function pickNeutral(candidates: ExtractedColorCandidate[], primary: string): string {
  const neutralCandidate = candidates
    .filter((candidate) => candidate.saturation <= 24 && candidate.lightness >= 14 && candidate.lightness <= 90)
    .map((candidate) => {
      const weightScore = getWeightInfluence(candidate.weight);
      const lowSaturationScore = clamp(1 - candidate.saturation / 28, 0.18, 1.05);
      const balancedLightness = getBalancedLightnessScore(candidate.lightness);
      return {
        candidate,
        score: weightScore * lowSaturationScore * balancedLightness,
      };
    })
    .sort((a, b) => b.score - a.score)[0]?.candidate;

  if (neutralCandidate) return neutralCandidate.hex;
  return deriveNeutralFallback(primary);
}

function toCandidates(
  colorMap: Map<string, { rgb: RGB; count: number }>,
  totalPixels: number,
  maxCandidates: number
): ExtractedColorCandidate[] {
  const entries = Array.from(colorMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, maxCandidates);

  return entries.map((entry) => {
    const hsl = rgbToHsl(entry.rgb);
    return {
      hex: rgbToHex(entry.rgb),
      weight: entry.count / totalPixels,
      hue: hsl.h,
      saturation: hsl.s,
      lightness: hsl.l,
    };
  });
}

function inferSource(input?: BrandPaletteSeedSource): BrandPaletteSeedSource {
  if (input === "logo" || input === "hero") return input;
  return "manual";
}

async function loadImageElement(imageUrl: string): Promise<HTMLImageElement> {
  return await new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = () =>
      reject(
        new Error(
          "No se pudo cargar la imagen para extraer paleta. Verifica la URL o CORS del origen."
        )
      );
    image.src = imageUrl;
  });
}

export function buildPaletteProposalFromCandidates(
  candidates: ExtractedColorCandidate[],
  source?: BrandPaletteSeedSource
): ExtractedPaletteProposal {
  const primary = pickPrimary(candidates);
  const accent = pickAccent(candidates, primary);
  const neutral = pickNeutral(candidates, primary);

  return {
    source: inferSource(source),
    primary,
    accent,
    neutral,
  };
}

export async function extractPaletteFromImageUrl(
  imageUrl: string,
  options?: ExtractPaletteFromImageOptions
): Promise<ExtractedPaletteResult> {
  const cleanUrl = imageUrl.trim();
  if (!cleanUrl) {
    throw new Error("URL de imagen vacia.");
  }

  if (typeof window === "undefined" || typeof document === "undefined") {
    throw new Error("La extraccion de paleta solo esta disponible en cliente.");
  }

  const image = await loadImageElement(cleanUrl);
  const maxDimension = clamp(options?.maxDimension ?? DEFAULT_MAX_DIMENSION, 32, 256);
  const maxSide = Math.max(image.naturalWidth, image.naturalHeight, 1);
  const scale = Math.min(1, maxDimension / maxSide);
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("No se pudo inicializar el analisis de imagen.");

  context.drawImage(image, 0, 0, width, height);

  let imageData: ImageData;
  try {
    imageData = context.getImageData(0, 0, width, height);
  } catch {
    throw new Error(
      "No se pudo leer pixeles de la imagen (posible restriccion CORS en el origen)."
    );
  }

  const data = imageData.data;
  const quantizationStep = options?.quantizationStep ?? DEFAULT_QUANTIZATION_STEP;
  const minAlpha = clamp(options?.minAlpha ?? DEFAULT_MIN_ALPHA, 0, 255);
  const maxCandidates = clamp(options?.maxCandidates ?? DEFAULT_MAX_CANDIDATES, 3, 12);

  const colorMap = new Map<string, { rgb: RGB; count: number }>();
  let sampledPixels = 0;

  for (let index = 0; index < data.length; index += 4) {
    const alpha = data[index + 3];
    if (alpha < minAlpha) continue;

    const rgb: RGB = {
      r: quantizeChannel(data[index], quantizationStep),
      g: quantizeChannel(data[index + 1], quantizationStep),
      b: quantizeChannel(data[index + 2], quantizationStep),
    };

    const key = `${rgb.r}-${rgb.g}-${rgb.b}`;
    const current = colorMap.get(key);
    if (!current) {
      colorMap.set(key, { rgb, count: 1 });
    } else {
      current.count += 1;
    }
    sampledPixels += 1;
  }

  if (sampledPixels === 0 || colorMap.size === 0) {
    throw new Error("No se encontraron colores utiles en la imagen seleccionada.");
  }

  const candidates = toCandidates(colorMap, sampledPixels, maxCandidates);
  const proposal = buildPaletteProposalFromCandidates(candidates, options?.source);

  return {
    imageUrl: cleanUrl,
    imageWidth: image.naturalWidth,
    imageHeight: image.naturalHeight,
    sampledPixels,
    candidates,
    proposal,
  };
}
