"use client";

import { useEffect } from "react";
import { HERO_CHANNEL, getHero, subscribeHero, syncHeroFromStorage } from "@/lib/web/hero/service";

export default function HeroHydrator() {
  useEffect(() => {
    // 1) Al montar: leer storage
    syncHeroFromStorage();

    // 2) Reaccionar a cambios del store
    const unsubscribe = subscribeHero(() => {
      // noop: el store ya notifica, los componentes re-renderizan
      // pero mantenemos simetría con Brand (y por si quieres hooks later)
      void getHero();
    });

    // 3) Evento local (misma pestaña)
    const onLocal = () => syncHeroFromStorage();
    window.addEventListener(HERO_CHANNEL, onLocal);

    // 4) storage cross-tab (opcional)
    const onStorage = (e: StorageEvent) => {
      if (e.key === "bcc:hero.v0") syncHeroFromStorage();
    };
    window.addEventListener("storage", onStorage);

    return () => {
      unsubscribe();
      window.removeEventListener(HERO_CHANNEL, onLocal);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  return null;
}
