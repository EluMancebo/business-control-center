import assert from "node:assert/strict";
import test from "node:test";
import { BRAND_THEME_STATE_V1_SCHEMA_VERSION } from "./v1";
import {
  BRAND_THEME_STATE_V1_STORAGE_KEY_BASE,
  getBrandThemeStateStorageKeyV1,
  loadBrandThemeStateV1,
  removeBrandThemeStateV1,
  saveBrandThemeStateV1,
} from "./storage.v1";

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
    const keys = Array.from(this.map.keys());
    return keys[index] ?? null;
  }

  removeItem(key: string): void {
    this.map.delete(key);
  }

  setItem(key: string, value: string): void {
    this.map.set(key, value);
  }
}

function withMockStorage(fn: (storage: MemoryStorage) => void): void {
  const previous = (globalThis as { localStorage?: Storage }).localStorage;
  const mock = new MemoryStorage();
  (globalThis as { localStorage?: Storage }).localStorage = mock;

  try {
    fn(mock);
  } finally {
    if (previous) {
      (globalThis as { localStorage?: Storage }).localStorage = previous;
    } else {
      delete (globalThis as { localStorage?: Storage }).localStorage;
    }
  }
}

test("storage.v1: key generation por scope", () => {
  assert.equal(
    getBrandThemeStateStorageKeyV1("system"),
    `${BRAND_THEME_STATE_V1_STORAGE_KEY_BASE}.system`
  );
  assert.equal(
    getBrandThemeStateStorageKeyV1("studio"),
    `${BRAND_THEME_STATE_V1_STORAGE_KEY_BASE}.studio`
  );
  assert.equal(
    getBrandThemeStateStorageKeyV1("panel"),
    `${BRAND_THEME_STATE_V1_STORAGE_KEY_BASE}.panel`
  );
  assert.equal(
    getBrandThemeStateStorageKeyV1("web"),
    `${BRAND_THEME_STATE_V1_STORAGE_KEY_BASE}.web`
  );
});

test("storage.v1: businessSlug opcional y normalizado", () => {
  const key = getBrandThemeStateStorageKeyV1("web", "  Caballeros Barberia  ");
  assert.equal(key, `${BRAND_THEME_STATE_V1_STORAGE_KEY_BASE}.web.caballeros-barberia`);
});

test("storage.v1: serializacion + deserializacion por save/load", () => {
  withMockStorage(() => {
    const saved = saveBrandThemeStateV1(
      "panel",
      {
        schemaVersion: BRAND_THEME_STATE_V1_SCHEMA_VERSION,
        scope: "panel",
        legacy: {
          brandName: "Panel Brand",
          palette: "mono",
          mode: "light",
        },
        seed: {
          source: "manual",
          primary: "#224466",
          accent: { mode: "manual", value: "#123456" },
          neutral: { mode: "auto", strategy: "derive-from-primary" },
        },
        config: {
          harmony: "analogous",
          accentStyle: "balanced",
          typographyPreset: "modern",
          presetModulationPercent: 33,
        },
      },
      "my-business"
    );

    assert.ok(saved);
    if (!saved) return;

    const loaded = loadBrandThemeStateV1("panel", "my-business");
    assert.ok(loaded);
    if (!loaded) return;

    assert.equal(loaded.scope, "panel");
    assert.equal(loaded.legacy.brandName, "Panel Brand");
    assert.equal(loaded.seed.accent.mode, "manual");
    assert.equal(loaded.seed.neutral.mode, "auto");
  });
});

test("storage.v1: payload invalido en storage devuelve null", () => {
  withMockStorage((storage) => {
    const key = getBrandThemeStateStorageKeyV1("panel", "biz");
    storage.setItem(key, "{invalid-json");
    assert.equal(loadBrandThemeStateV1("panel", "biz"), null);
  });
});

test("storage.v1: remove elimina estado guardado", () => {
  withMockStorage(() => {
    const saved = saveBrandThemeStateV1(
      "web",
      {
        schemaVersion: BRAND_THEME_STATE_V1_SCHEMA_VERSION,
        scope: "web",
      },
      "biz"
    );
    assert.ok(saved);

    const removed = removeBrandThemeStateV1("web", "biz");
    assert.equal(removed, true);
    assert.equal(loadBrandThemeStateV1("web", "biz"), null);
  });
});

