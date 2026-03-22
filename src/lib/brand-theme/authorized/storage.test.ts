import assert from "node:assert/strict";
import test from "node:test";
import { SYSTEM_AUTHORIZED_THEME_PRESETS } from "./presets";
import {
  BUSINESS_THEME_POLICY_STORAGE_KEY_BASE,
  LAYER2_THEME_SELECTION_STORAGE_KEY_BASE,
  getBusinessThemePolicyStorageKey,
  getLayer2ThemeSelectionStorageKey,
  loadBusinessThemePolicy,
  loadLayer2ThemeSelection,
  removeBusinessThemePolicy,
  removeLayer2ThemeSelection,
  saveBusinessThemePolicy,
  saveLayer2ThemeSelection,
} from "./storage";

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

test("authorized/storage: key generation policy + selection", () => {
  assert.equal(
    getBusinessThemePolicyStorageKey("web", "Caballeros Barberia"),
    `${BUSINESS_THEME_POLICY_STORAGE_KEY_BASE}.web.caballeros-barberia`
  );
  assert.equal(
    getLayer2ThemeSelectionStorageKey("panel", "Panel Norte"),
    `${LAYER2_THEME_SELECTION_STORAGE_KEY_BASE}.panel.panel-norte`
  );
});

test("authorized/storage: save/load policy", () => {
  withMockStorage(() => {
    const saved = saveBusinessThemePolicy(
      "web",
      "caballeros",
      {
        schemaVersion: 1,
        scope: "web",
        businessSlug: "caballeros",
        allowedPresetIds: ["web-brand-balanced"],
        defaultPresetId: "web-brand-balanced",
        adjustableFields: ["harmony", "accentStyle"],
      },
      SYSTEM_AUTHORIZED_THEME_PRESETS
    );

    assert.ok(saved);
    if (!saved) return;

    const loaded = loadBusinessThemePolicy(
      "web",
      "caballeros",
      SYSTEM_AUTHORIZED_THEME_PRESETS
    );
    assert.ok(loaded);
    if (!loaded) return;

    assert.equal(loaded.scope, "web");
    assert.deepEqual(loaded.allowedPresetIds, ["web-brand-balanced"]);
  });
});

test("authorized/storage: save/load selection", () => {
  withMockStorage(() => {
    const saved = saveLayer2ThemeSelection("web", "caballeros", {
      schemaVersion: 1,
      scope: "web",
      businessSlug: "caballeros",
      draft: {
        presetId: "web-brand-balanced",
        overrides: {
          harmony: "analogous",
          presetModulationPercent: 30,
        },
      },
    });

    assert.ok(saved);
    if (!saved) return;

    const loaded = loadLayer2ThemeSelection("web", "caballeros");
    assert.ok(loaded);
    if (!loaded) return;

    assert.equal(loaded.scope, "web");
    assert.equal(loaded.draft.presetId, "web-brand-balanced");
  });
});

test("authorized/storage: remove policy + selection", () => {
  withMockStorage(() => {
    saveBusinessThemePolicy(
      "panel",
      "north",
      {
        schemaVersion: 1,
        scope: "panel",
        businessSlug: "north",
        allowedPresetIds: ["panel-balanced-default"],
        defaultPresetId: "panel-balanced-default",
        adjustableFields: ["harmony"],
      },
      SYSTEM_AUTHORIZED_THEME_PRESETS
    );
    saveLayer2ThemeSelection("panel", "north", {
      schemaVersion: 1,
      scope: "panel",
      businessSlug: "north",
      draft: { presetId: "panel-balanced-default" },
    });

    assert.equal(removeBusinessThemePolicy("panel", "north"), true);
    assert.equal(removeLayer2ThemeSelection("panel", "north"), true);
    assert.equal(loadBusinessThemePolicy("panel", "north"), null);
    assert.equal(loadLayer2ThemeSelection("panel", "north"), null);
  });
});
