// src/lib/brand/repository.local.ts
import type { BrandRepository } from "./repository";
import type { Brand } from "./types";
import { loadBrandFromStorage, saveBrandToStorage } from "./storage";

export const localBrandRepository: BrandRepository = {
  source: "local",
  get(): Brand {
    return loadBrandFromStorage();
  },
  set(next: Brand) {
    saveBrandToStorage(next);
  },
};

