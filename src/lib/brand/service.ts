// src/lib/brand/service.ts
"use client";

import type { Brand } from "./types";
import { DEFAULT_BRAND, loadBrandFromStorage, saveBrandToStorage } from "./storage";
import { applyBrandToDocument } from "./apply";

export const BRAND_CHANNEL = "bcc:brand";
export const BRAND_STORAGE_KEY = "bcc:brand";

type Listener = () => void;

let currentBrand: Brand = DEFAULT_BRAND;
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((l) => l());
}

export function getBrand(): Brand {
  return currentBrand;
}

export function setBrand(next: Brand) {
  currentBrand = next;

  // 1) Persistencia (para que al refrescar funcione)
  saveBrandToStorage(next);

  // 2) Aplicar tokens al documento (misma pestaña, instantáneo)
  applyBrandToDocument(next);

  // 3) Notificar store (React useSyncExternalStore)
  notify();

  // 4) Evento local (misma pestaña)
  window.dispatchEvent(new Event(BRAND_CHANNEL));

  // 5) Cross-tab (otras pestañas)
  if (typeof BroadcastChannel !== "undefined") {
    const bc = new BroadcastChannel(BRAND_CHANNEL);
    bc.postMessage({ type: "brand:update" });
    bc.close();
  }
}

export function subscribeBrand(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * Rehidrata desde localStorage (por si alguien lo cambia manualmente o tras refresh)
 * y vuelve a aplicar.
 */
export function syncBrandFromStorage() {
  const fromStorage = loadBrandFromStorage();
  currentBrand = fromStorage;
  applyBrandToDocument(fromStorage);
  notify();
}
