 //src/lib/brand/Service.ts
 
 "use client";

import type { Brand } from "./types";
import { applyBrandToDocument } from "./apply";
import { DEFAULT_BRAND, loadBrandFromStorage, saveBrandToStorage } from "./storage";

type Listener = () => void;

type Store = {
  storageKey: string;
  channel: string;
  brand: Brand;
  listeners: Set<Listener>;
};

export type SetBrandOptions = {
  applyToDocument?: boolean; // default true
};

// ✅ key compuesta para evitar colisiones
function makeKey(storageKey: string, channel: string) {
  return `${storageKey}::${channel}`;
}

const stores = new Map<string, Store>();

function notify(store: Store) {
  store.listeners.forEach((l) => l());
}

function getOrCreateStore(storageKey: string, channel: string, fallback?: Brand): Store {
  const key = makeKey(storageKey, channel);

  const existing = stores.get(key);
  if (existing) return existing;

  const initial = loadBrandFromStorage(storageKey, fallback ?? DEFAULT_BRAND);

  const store: Store = {
    storageKey,
    channel,
    brand: initial,
    listeners: new Set<Listener>(),
  };

  stores.set(key, store);
  return store;
}

const DEFAULT_STORAGE_KEY = "bcc.brand.v0";
const DEFAULT_CHANNEL = "bcc:brand";

export function getBrand(
  storageKey: string = DEFAULT_STORAGE_KEY,
  channel: string = DEFAULT_CHANNEL,
  fallback?: Brand
): Brand {
  return getOrCreateStore(storageKey, channel, fallback).brand;
}

export function setBrand(
  next: Brand,
  storageKey: string = DEFAULT_STORAGE_KEY,
  channel: string = DEFAULT_CHANNEL,
  fallback?: Brand,
  options?: SetBrandOptions
) {
  const store = getOrCreateStore(storageKey, channel, fallback);
  store.brand = next;

  // Persistencia
  saveBrandToStorage(storageKey, next);

  // Aplicación al documento (solo si procede)
  const apply = options?.applyToDocument !== false;
  if (apply) applyBrandToDocument(next);

  // Notificar
  notify(store);

  // Evento local
  window.dispatchEvent(new Event(channel));

  // Cross-tab
  if (typeof BroadcastChannel !== "undefined") {
    const bc = new BroadcastChannel(channel);
    bc.postMessage({ type: "brand:update" });
    bc.close();
  }
}

export function subscribeBrand(
  listener: Listener,
  storageKey: string = DEFAULT_STORAGE_KEY,
  channel: string = DEFAULT_CHANNEL,
  fallback?: Brand
) {
  const store = getOrCreateStore(storageKey, channel, fallback);
  store.listeners.add(listener);
  return () => store.listeners.delete(listener);
}

export function syncBrandFromStorage(
  storageKey: string = DEFAULT_STORAGE_KEY,
  channel: string = DEFAULT_CHANNEL,
  fallback?: Brand,
  options?: SetBrandOptions
) {
  const store = getOrCreateStore(storageKey, channel, fallback);
  const fromStorage = loadBrandFromStorage(storageKey, fallback ?? DEFAULT_BRAND);
  store.brand = fromStorage;

  // ✅ IMPORTANTE: en modo "web" dentro del panel, NO aplicar al documento del panel
  const apply = options?.applyToDocument !== false;
  if (apply) applyBrandToDocument(fromStorage);

  notify(store);
} 