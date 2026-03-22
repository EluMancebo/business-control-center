import assert from "node:assert/strict";
import test from "node:test";
import { getBrandStorageKey, loadBrandFromStorage, saveBrandToStorage } from "@/lib/brand/storage";
import { loadBrandThemeStateV1 } from "./storage.v1";
import {
  buildBrandThemeStateV1FromEditorInput,
  persistLegacyAndBrandThemeShadow,
  shadowWriteBrandThemeStateV1FromEditorInput,
  saveBrandThemeStateV1Shadow,
} from "./from-editor";

class MemoryStorage implements Storage {
  private readonly map = new Map<string, string>();

  get length(): number {
    return this.map.size;
  }

  clear(): void {
    this.map.clear();
  }

  getItem(key: string): string | null {
    return this.map.has(key) ? this.map.get(key)! : null;
  }

  key(index: number): string | null {
    return Array.from(this.map.keys())[index] ?? null;
  }

  removeItem(key: string): void {
    this.map.delete(key);
  }

  setItem(key: string, value: string): void {
    this.map.set(key, value);
  }
}

function withMockWindowStorage(fn: (storage: MemoryStorage) => void): void {
  const previousWindow = (globalThis as { window?: { localStorage: Storage } }).window;
  const storage = new MemoryStorage();
  (globalThis as { window?: { localStorage: Storage } }).window = {
    localStorage: storage,
  };

  try {
    fn(storage);
  } finally {
    if (previousWindow) {
      (globalThis as { window?: { localStorage: Storage } }).window = previousWindow;
    } else {
      delete (globalThis as { window?: { localStorage: Storage } }).window;
    }
  }
}

test("from-editor: construye mapping correcto con auto/manual y legacy", () => {
  const state = buildBrandThemeStateV1FromEditorInput({
    scope: "panel",
    businessSlug: "  Mi Negocio  ",
    brand: {
      brandName: "Caballeros",
      palette: "ocean",
      mode: "dark",
    },
    seed: {
      source: "hero",
      primary: "#2563eb",
      accent: "#123ABC",
      neutral: "",
      sourceRef: {
        assetId: "asset_01",
        imageUrl: " https://cdn.example/hero.png ",
      },
    },
    config: {
      harmony: "triadic",
      accentStyle: "expressive",
      typographyPreset: "editorial",
      presetModulationPercent: 26,
    },
  });

  assert.equal(state.scope, "panel");
  assert.equal(state.businessSlug, "Mi Negocio");
  assert.equal(state.legacy.brandName, "Caballeros");
  assert.equal(state.legacy.palette, "ocean");
  assert.equal(state.legacy.mode, "dark");
  assert.equal(state.seed.source, "hero");
  assert.equal(state.seed.primary, "#2563eb");
  assert.equal(state.seed.accent.mode, "manual");
  if (state.seed.accent.mode === "manual") {
    assert.equal(state.seed.accent.value, "#123abc");
  }
  assert.equal(state.seed.neutral.mode, "auto");
  assert.equal(state.seed.sourceRef?.assetId, "asset_01");
  assert.equal(state.seed.sourceRef?.imageUrl, "https://cdn.example/hero.png");
  assert.equal(state.config.harmony, "triadic");
  assert.equal(state.config.accentStyle, "expressive");
  assert.equal(state.config.typographyPreset, "editorial");
  assert.equal(state.config.presetModulationPercent, 26);
});

test("from-editor: valores invalidos de accent/neutral se degradan a auto", () => {
  const state = buildBrandThemeStateV1FromEditorInput({
    scope: "system",
    brand: {
      brandName: "BCC",
      palette: "bcc",
      mode: "light",
    },
    seed: {
      source: "manual",
      primary: "#2563eb",
      accent: "#zzzzzz",
      neutral: "invalido",
    },
    config: {
      harmony: "analogous",
      accentStyle: "balanced",
      typographyPreset: "modern",
      presetModulationPercent: 26,
    },
  });

  assert.equal(state.seed.accent.mode, "auto");
  assert.equal(state.seed.neutral.mode, "auto");
  assert.equal(state.seed.sourceRef, undefined);
});

test("from-editor: persistencia v1 en paralelo a legacy v0", () => {
  withMockWindowStorage(() => {
    const legacyKey = getBrandStorageKey("panel", "mi-negocio");
    saveBrandToStorage(legacyKey, {
      brandName: "Legacy Brand",
      palette: "sunset",
      mode: "system",
    });

    const savedV1 = shadowWriteBrandThemeStateV1FromEditorInput({
      scope: "panel",
      businessSlug: "mi-negocio",
      brand: {
        brandName: "Legacy Brand",
        palette: "sunset",
        mode: "system",
      },
      seed: {
        source: "manual",
        primary: "#2563eb",
        accent: "",
        neutral: "",
      },
      config: {
        harmony: "analogous",
        accentStyle: "balanced",
        typographyPreset: "modern",
        presetModulationPercent: 26,
      },
    });

    assert.ok(savedV1);
    const loadedLegacy = loadBrandFromStorage(legacyKey, {
      brandName: "fallback",
      palette: "bcc",
      mode: "light",
    });
    const loadedV1 = loadBrandThemeStateV1("panel", "mi-negocio");

    assert.equal(loadedLegacy.brandName, "Legacy Brand");
    assert.equal(loadedLegacy.palette, "sunset");
    assert.equal(loadedLegacy.mode, "system");
    assert.ok(loadedV1);
    if (!loadedV1) return;
    assert.equal(loadedV1.scope, "panel");
    assert.equal(loadedV1.businessSlug, "mi-negocio");
    assert.equal(loadedV1.legacy.palette, "sunset");
  });
});

test("from-editor: shadow-write falla de forma controlada", () => {
  const state = buildBrandThemeStateV1FromEditorInput({
    scope: "panel",
    businessSlug: "biz",
    brand: {
      brandName: "Panel",
      palette: "bcc",
      mode: "light",
    },
    seed: {
      source: "manual",
      primary: "#2563eb",
      accent: "",
      neutral: "",
    },
    config: {
      harmony: "analogous",
      accentStyle: "balanced",
      typographyPreset: "modern",
      presetModulationPercent: 26,
    },
  });

  const result = saveBrandThemeStateV1Shadow({
    scope: "panel",
    businessSlug: "biz",
    state,
    save: () => {
      throw new Error("storage failed");
    },
  });

  assert.equal(result, null);
});

test("from-editor: no regresion de flujo legacy si shadow falla", () => {
  let legacyCalls = 0;
  let shadowCalls = 0;

  const result = persistLegacyAndBrandThemeShadow({
    persistLegacy: () => {
      legacyCalls += 1;
    },
    persistShadow: () => {
      shadowCalls += 1;
      throw new Error("shadow failed");
    },
  });

  assert.equal(result, null);
  assert.equal(legacyCalls, 1);
  assert.equal(shadowCalls, 1);
});

