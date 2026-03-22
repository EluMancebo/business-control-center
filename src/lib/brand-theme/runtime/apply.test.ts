import assert from "node:assert/strict";
import test from "node:test";
import {
  applyBrandThemeRuntime,
  applyBrandThemeRuntimeFromPipelineResult,
  removeBrandThemeRuntime,
} from "./apply";

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

test("runtime/apply: aplica variables semanticas y data attrs legacy", () => {
  const target = new MemoryTarget();
  const reset = applyBrandThemeRuntime({
    target,
    cssVariables: {
      "--background": "#101010",
      "--foreground": "#f3f4f6",
      "--accent": "#2563eb",
    },
    legacy: {
      palette: "ocean",
      mode: "dark",
    },
  });

  assert.equal(target.style.getPropertyValue("--background"), "#101010");
  assert.equal(target.style.getPropertyValue("--foreground"), "#f3f4f6");
  assert.equal(target.style.getPropertyValue("--accent"), "#2563eb");
  assert.equal(target.getAttribute("data-brand-palette"), "ocean");
  assert.equal(target.getAttribute("data-brand-mode"), "dark");

  reset();
});

test("runtime/apply: cleanup restaura estado previo", () => {
  const target = new MemoryTarget();
  target.style.setProperty("--background", "#ffffff");
  target.setAttribute("data-brand-palette", "bcc");
  target.setAttribute("data-brand-mode", "light");

  const reset = applyBrandThemeRuntime({
    target,
    cssVariables: {
      "--background": "#0a0a0a",
      "--foreground": "#ededed",
    },
    legacy: {
      palette: "mono",
      mode: "dark",
    },
  });

  assert.equal(target.style.getPropertyValue("--background"), "#0a0a0a");
  assert.equal(target.getAttribute("data-brand-palette"), "mono");
  assert.equal(target.getAttribute("data-brand-mode"), "dark");

  reset();

  assert.equal(target.style.getPropertyValue("--background"), "#ffffff");
  assert.equal(target.style.getPropertyValue("--foreground"), "");
  assert.equal(target.getAttribute("data-brand-palette"), "bcc");
  assert.equal(target.getAttribute("data-brand-mode"), "light");
});

test("runtime/apply: remove permite unset de vars y attrs legacy", () => {
  const target = new MemoryTarget();
  target.style.setProperty("--background", "#111111");
  target.style.setProperty("--accent", "#2563eb");
  target.setAttribute("data-brand-palette", "sunset");
  target.setAttribute("data-brand-mode", "dark");

  removeBrandThemeRuntime({
    target,
    cssVariableNames: ["--accent"],
    clearLegacyDataAttrs: true,
  });

  assert.equal(target.style.getPropertyValue("--background"), "#111111");
  assert.equal(target.style.getPropertyValue("--accent"), "");
  assert.equal(target.getAttribute("data-brand-palette"), null);
  assert.equal(target.getAttribute("data-brand-mode"), null);
});

test("runtime/apply: acepta payload equivalente desde pipeline", () => {
  const target = new MemoryTarget();
  const reset = applyBrandThemeRuntimeFromPipelineResult({
    target,
    result: {
      cssVariables: {
        "--background": "#ffffff",
        "--foreground": "#171717",
      },
      brand: {
        brandName: "BCC",
        palette: "bcc",
        mode: "system",
      },
    },
  });

  assert.equal(target.style.getPropertyValue("--background"), "#ffffff");
  assert.equal(target.style.getPropertyValue("--foreground"), "#171717");
  assert.equal(target.getAttribute("data-brand-palette"), "bcc");
  assert.equal(target.getAttribute("data-brand-mode"), "system");

  reset();
});

