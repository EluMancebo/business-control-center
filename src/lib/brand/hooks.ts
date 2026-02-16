// src/lib/brand/hooks.ts
"use client";

import { useSyncExternalStore } from "react";
import type { Brand } from "./types";
import { getBrand, subscribeBrand } from "./service";

export function useBrand(): Brand {
  return useSyncExternalStore(
    (onStoreChange) => subscribeBrand(onStoreChange),
    () => getBrand(),
    () => getBrand()
  );
}
 
 