 //src/lib/brand/Service.ts
 
 "use client";

import type { Brand } from "./types";
import { DEFAULT_BRAND, loadBrandFromStorage, saveBrandToStorage } from "./storage";

type Listener = () => void;

type Store = {
  storageKey: string;
  channel: string;
  brand: Brand;
  applyToDocument: boolean;
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

function resolveApplyToDocument(
  store: Store,
  options?: SetBrandOptions
): boolean {
  if (typeof options?.applyToDocument === "boolean") {
    return options.applyToDocument;
  }

  return store.applyToDocument;
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
    applyToDocument: true,
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
  store.applyToDocument = resolveApplyToDocument(store, options);

  // Persistencia
  saveBrandToStorage(storageKey, next);

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

export function shouldApplyBrandToDocument(
  storageKey: string = DEFAULT_STORAGE_KEY,
  channel: string = DEFAULT_CHANNEL,
  fallback?: Brand
): boolean {
  return getOrCreateStore(storageKey, channel, fallback).applyToDocument;
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
  store.applyToDocument = resolveApplyToDocument(store, options);

  notify(store);
}
