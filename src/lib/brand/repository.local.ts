// src/lib/brand/repository.local.ts
import type { Brand } from "./types";
import {
  getBrandStorageKey,
  getDefaultBrandForScope,
  type BrandScope,
  loadBrandFromStorage,
  saveBrandToStorage,
} from "./storage";

type BrandRepository = {
  source: "local";
  get(scope: BrandScope, businessSlug?: string): Brand;
  set(scope: BrandScope, next: Brand, businessSlug?: string): void;
};

export const repositoryLocal: BrandRepository = {
  source: "local",

  get(scope: BrandScope, businessSlug?: string): Brand {
    const storageKey = getBrandStorageKey(scope, businessSlug);
    const fallback = getDefaultBrandForScope(scope);
    return loadBrandFromStorage(storageKey, fallback);
  },

  set(scope: BrandScope, next: Brand, businessSlug?: string) {
    const storageKey = getBrandStorageKey(scope, businessSlug);
    saveBrandToStorage(storageKey, next);
  },
};  