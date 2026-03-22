import assert from "node:assert/strict";
import test from "node:test";
import { loadBrandThemeStateV1 } from "../state/storage.v1";
import { shadowWriteBrandThemeStateV1FromEditorInput } from "../state/from-editor";
import { resolveBrandHydratorThemeResolution } from "./hydrator";
import { applyBrandThemeRuntimeFromPipelineResult } from "./apply";

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

class MemoryStyle {
  private readonly map = new Map<string, string>();

  getPropertyValue(name: string): string {
    return this.map.get(name) ?? "";
  }

  setProperty(name: string, value: string): void {
    this.map.set(name, value);
  }

  removeProperty(name: string): void {
    this.map.delete(name);
  }
}

class MemoryTarget {
  readonly style = new MemoryStyle();
  private readonly attrs = new Map<string, string>();

  getAttribute(name: string): string | null {
    return this.attrs.has(name) ? this.attrs.get(name)! : null;
  }

  setAttribute(name: string, value: string): void {
    this.attrs.set(name, value);
  }

  removeAttribute(name: string): void {
    this.attrs.delete(name);
  }
}

function withMockWindowStorage(fn: (storage: MemoryStorage) => void): void {
  const previousWindow = (globalThis as { window?: { localStorage: Storage } }).window;
  const previousStorage = (globalThis as { localStorage?: Storage }).localStorage;
  const storage = new MemoryStorage();

  (globalThis as { window?: { localStorage: Storage } }).window = {
    localStorage: storage,
  };
  (globalThis as { localStorage?: Storage }).localStorage = storage;

  try {
    fn(storage);
  } finally {
    if (previousWindow) {
      (globalThis as { window?: { localStorage: Storage } }).window = previousWindow;
    } else {
      delete (globalThis as { window?: { localStorage: Storage } }).window;
    }

    if (previousStorage) {
      (globalThis as { localStorage?: Storage }).localStorage = previousStorage;
    } else {
      delete (globalThis as { localStorage?: Storage }).localStorage;
    }
  }
}

test("system route v1: editor -> storage v1 -> hydrator -> pipeline -> runtime apply", () => {
  withMockWindowStorage(() => {
    const saved = shadowWriteBrandThemeStateV1FromEditorInput({
      scope: "system",
      brand: {
        brandName: "BCC Taller",
        palette: "ocean",
        mode: "dark",
      },
      seed: {
        source: "manual",
        primary: "#2563eb",
        accent: "#7c3aed",
        neutral: "",
      },
      config: {
        harmony: "analogous",
        accentStyle: "balanced",
        typographyPreset: "modern",
        presetModulationPercent: 26,
      },
    });

    assert.ok(saved);
    const loaded = loadBrandThemeStateV1("system");
    assert.ok(loaded);
    if (!loaded) return;

    const resolution = resolveBrandHydratorThemeResolution({
      scope: "system",
      semanticRuntimeEnabled: true,
      stateV1: loaded,
    });

    assert.equal(resolution.kind, "semantic");
    if (resolution.kind !== "semantic") return;

    const target = new MemoryTarget();
    const reset = applyBrandThemeRuntimeFromPipelineResult({
      target,
      result: resolution.pipeline,
    });

    assert.ok(target.style.getPropertyValue("--background").length > 0);
    assert.ok(target.style.getPropertyValue("--foreground").length > 0);
    assert.ok(target.style.getPropertyValue("--accent").length > 0);
    assert.equal(target.getAttribute("data-brand-palette"), "ocean");
    assert.equal(target.getAttribute("data-brand-mode"), "dark");

    reset();
  });
});

test("system route v1: con flag OFF mantiene fallback legacy", () => {
  const resolution = resolveBrandHydratorThemeResolution({
    scope: "system",
    semanticRuntimeEnabled: false,
    stateV1: {
      schemaVersion: 1,
      scope: "system",
    },
  });

  assert.equal(resolution.kind, "legacy");
  if (resolution.kind !== "legacy") return;
  assert.equal(resolution.reason, "flag-off");
});

