// src/lib/brand/repository.ts
import type { Brand } from "./types";

export type BrandSource = "local" | "api";

export interface BrandRepository {
  source: BrandSource;
  get(): Brand;
  set(next: Brand): void;
}
