import type { BrandPaletteSeedSource } from "../types";

export type ExtractedColorCandidate = {
  hex: string;
  weight: number;
  hue: number;
  saturation: number;
  lightness: number;
};

export type ExtractedPaletteProposal = {
  source: BrandPaletteSeedSource;
  primary: string;
  accent: string;
  neutral: string;
};

export type ExtractedPaletteResult = {
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
  sampledPixels: number;
  candidates: ExtractedColorCandidate[];
  proposal: ExtractedPaletteProposal;
};

export type ExtractPaletteFromImageOptions = {
  source?: BrandPaletteSeedSource;
  maxDimension?: number;
  quantizationStep?: number;
  minAlpha?: number;
  maxCandidates?: number;
};
