 "use client";

import { useSyncExternalStore } from "react";
import type { HeroData } from "./types";
import { getHero, subscribeHero } from "./service";

export function useHero(): HeroData {
  return useSyncExternalStore(
    (onStoreChange) => subscribeHero(onStoreChange),
    () => getHero(),
    () => getHero()
  );
}
   