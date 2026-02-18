"use client";

import type { HeroData } from "./types";
import { DEFAULT_HERO } from "./types";
import { loadHeroFromStorage, saveHeroToStorage } from "./storage";

export const HERO_CHANNEL = "bcc:hero";

type Listener = () => void;

let currentHero: HeroData = DEFAULT_HERO;
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((l) => l());
}

export function getHero(): HeroData {
  return currentHero;
}

export function setHero(next: HeroData) {
  currentHero = next;

  // 1) Persistencia
  saveHeroToStorage(next);

  // 2) Notificar React
  notify();

  // 3) Evento local (misma pestaña)
  window.dispatchEvent(new Event(HERO_CHANNEL));
}

export function subscribeHero(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * Rehidrata desde localStorage y notifica.
 */
export function syncHeroFromStorage() {
  const fromStorage = loadHeroFromStorage();
  currentHero = fromStorage;
  notify();
}
