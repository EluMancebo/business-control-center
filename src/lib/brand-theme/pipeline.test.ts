import assert from "node:assert/strict";
import test from "node:test";
import { toBrandCssVariables } from "./tokens";
import { resolveBrandThemePipelineFromStateV1 } from "./pipeline";
import { BRAND_THEME_STATE_V1_SCHEMA_VERSION } from "./state/v1";

test("pipeline: resuelve desde estado v1 valido", () => {
  const result = resolveBrandThemePipelineFromStateV1({
    schemaVersion: BRAND_THEME_STATE_V1_SCHEMA_VERSION,
    scope: "system",
    legacy: {
      brandName: "BCC",
      palette: "sunset",
      mode: "light",
    },
    seed: {
      source: "manual",
      primary: "#2563eb",
      accent: { mode: "manual", value: "#0ea5e9" },
      neutral: { mode: "manual", value: "#dbeafe" },
    },
    config: {
      harmony: "analogous",
      accentStyle: "balanced",
      typographyPreset: "modern",
      presetModulationPercent: 26,
    },
  });

  assert.ok(result);
  if (!result) return;

  assert.equal(result.source, "palette-seed");
  assert.equal(result.state.schemaVersion, BRAND_THEME_STATE_V1_SCHEMA_VERSION);
  assert.equal(result.brand.palette, "sunset");
  assert.equal(result.seedInput.primary, "#2563eb");
  assert.equal(result.semanticTokens.typographyPreset, "modern");
  assert.equal(result.seedAccentSource, "explicit-blend");
  assert.ok(result.normalizedSeedBase);
  assert.ok(result.normalizedSeed);
});

test("pipeline: cssVariables consistentes con semanticTokens", () => {
  const result = resolveBrandThemePipelineFromStateV1({
    schemaVersion: BRAND_THEME_STATE_V1_SCHEMA_VERSION,
    scope: "panel",
    legacy: {
      brandName: "Panel Brand",
      palette: "ocean",
      mode: "dark",
    },
    seed: {
      source: "manual",
      primary: "#2563eb",
      accent: { mode: "manual", value: "#7c3aed" },
      neutral: { mode: "manual", value: "#cbd5e1" },
    },
    config: {
      harmony: "triadic",
      accentStyle: "expressive",
      typographyPreset: "geometric",
      presetModulationPercent: 31,
    },
  });

  assert.ok(result);
  if (!result) return;

  const expectedCoreVariables = toBrandCssVariables(result.semanticTokens);
  for (const [name, value] of Object.entries(expectedCoreVariables)) {
    assert.equal(result.cssVariables[name], value);
  }
  assert.equal(result.cssVariables["--brand-typography-preset"], "geometric");
  assert.equal(typeof result.cssVariables["--font-sans"], "string");
  assert.ok(result.cssVariables["--font-sans"].length > 0);
});

test("pipeline: accent/neutral manual", () => {
  const result = resolveBrandThemePipelineFromStateV1({
    schemaVersion: BRAND_THEME_STATE_V1_SCHEMA_VERSION,
    scope: "studio",
    legacy: {
      brandName: "Studio",
      palette: "bcc",
      mode: "light",
    },
    seed: {
      source: "manual",
      primary: "#224466",
      accent: { mode: "manual", value: "#123abc" },
      neutral: { mode: "manual", value: "#aabbcc" },
    },
    config: {
      harmony: "complementary",
      accentStyle: "minimal",
      typographyPreset: "classic",
      presetModulationPercent: 10,
    },
  });

  assert.ok(result);
  if (!result) return;

  assert.equal(result.seedInput.accent, "#123abc");
  assert.equal(result.seedInput.neutral, "#aabbcc");
  assert.equal(result.normalizedSeedBase?.accent, "#123abc");
  assert.equal(result.normalizedSeed?.neutral, "#aabbcc");
  assert.equal(result.seedAccentSource, "explicit-blend");
});

test("pipeline: accent/neutral auto", () => {
  const result = resolveBrandThemePipelineFromStateV1({
    schemaVersion: BRAND_THEME_STATE_V1_SCHEMA_VERSION,
    scope: "web",
    businessSlug: "mi-negocio",
    legacy: {
      brandName: "Web Brand",
      palette: "mono",
      mode: "system",
    },
    seed: {
      source: "hero",
      primary: "#336699",
      accent: { mode: "auto", strategy: "derive-from-primary" },
      neutral: { mode: "auto", strategy: "derive-from-source" },
    },
    config: {
      harmony: "split-complementary",
      accentStyle: "balanced",
      typographyPreset: "editorial",
      presetModulationPercent: 40,
    },
  });

  assert.ok(result);
  if (!result) return;

  assert.equal(result.seedInput.accent, "");
  assert.equal(result.seedInput.neutral, "");
  assert.ok(Boolean(result.normalizedSeed?.accent));
  assert.ok(Boolean(result.normalizedSeed?.neutral));
  assert.equal(result.seedAccentSource, "derived");
  assert.notEqual(result.normalizedSeedBase?.accent, result.normalizedSeed?.accent);
});

test("pipeline: alinea seed base y seed resuelta sin estado engañoso", () => {
  const result = resolveBrandThemePipelineFromStateV1({
    schemaVersion: BRAND_THEME_STATE_V1_SCHEMA_VERSION,
    scope: "system",
    legacy: {
      brandName: "BCC",
      palette: "bcc",
      mode: "light",
    },
    seed: {
      source: "manual",
      primary: "#2563eb",
      accent: { mode: "manual", value: "#ff0000" },
      neutral: { mode: "manual", value: "#dbeafe" },
    },
    config: {
      harmony: "complementary",
      accentStyle: "balanced",
      typographyPreset: "modern",
      presetModulationPercent: 26,
    },
  });

  assert.ok(result);
  if (!result) return;

  assert.equal(result.seedAccentSource, "explicit-blend");
  assert.equal(result.normalizedSeedBase?.accent, "#ff0000");
  assert.notEqual(result.normalizedSeed?.accent, result.normalizedSeedBase?.accent);
});

test("pipeline: accentStyle tiene efecto en seed-path automatico", () => {
  const baseInput = {
    schemaVersion: BRAND_THEME_STATE_V1_SCHEMA_VERSION,
    scope: "system",
    legacy: {
      brandName: "BCC",
      palette: "ocean",
      mode: "light",
    },
    seed: {
      source: "manual" as const,
      primary: "#2563eb",
      accent: { mode: "auto" as const, strategy: "derive-from-primary" as const },
      neutral: { mode: "auto" as const, strategy: "derive-from-primary" as const },
    },
    config: {
      harmony: "analogous" as const,
      typographyPreset: "modern" as const,
      presetModulationPercent: 26,
    },
  };

  const minimal = resolveBrandThemePipelineFromStateV1({
    ...baseInput,
    config: { ...baseInput.config, accentStyle: "minimal" as const },
  });
  const expressive = resolveBrandThemePipelineFromStateV1({
    ...baseInput,
    config: { ...baseInput.config, accentStyle: "expressive" as const },
  });

  assert.ok(minimal);
  assert.ok(expressive);
  if (!minimal || !expressive) return;

  assert.equal(minimal.seedAccentSource, "derived");
  assert.equal(expressive.seedAccentSource, "derived");
  assert.notEqual(minimal.semanticTokensBase.accent, expressive.semanticTokensBase.accent);
  assert.notEqual(minimal.semanticTokensBase.accentStrong, expressive.semanticTokensBase.accentStrong);
});

test("pipeline: harmonies generan salidas distinguibles en AUTO", () => {
  const make = (harmony: "monochromatic" | "analogous" | "complementary" | "triadic") =>
    resolveBrandThemePipelineFromStateV1({
      schemaVersion: BRAND_THEME_STATE_V1_SCHEMA_VERSION,
      scope: "system",
      legacy: {
        brandName: "BCC",
        palette: "ocean",
        mode: "light",
      },
      seed: {
        source: "manual",
        primary: "#2563eb",
        accent: { mode: "auto", strategy: "derive-from-primary" },
        neutral: { mode: "auto", strategy: "derive-from-primary" },
      },
      config: {
        harmony,
        accentStyle: "balanced",
        typographyPreset: "modern",
        presetModulationPercent: 26,
      },
    });

  const mono = make("monochromatic");
  const analogous = make("analogous");
  const complementary = make("complementary");
  const triadic = make("triadic");

  assert.ok(mono && analogous && complementary && triadic);
  if (!mono || !analogous || !complementary || !triadic) return;

  const accents = new Set([
    mono.semanticTokensBase.accent,
    analogous.semanticTokensBase.accent,
    complementary.semanticTokensBase.accent,
    triadic.semanticTokensBase.accent,
  ]);
  assert.ok(accents.size >= 3);
});

test("pipeline: AUTO y manual producen rutas diferenciadas", () => {
  const manual = resolveBrandThemePipelineFromStateV1({
    schemaVersion: BRAND_THEME_STATE_V1_SCHEMA_VERSION,
    scope: "system",
    legacy: {
      brandName: "BCC",
      palette: "bcc",
      mode: "light",
    },
    seed: {
      source: "manual",
      primary: "#2563eb",
      accent: { mode: "manual", value: "#ff3b30" },
      neutral: { mode: "auto", strategy: "derive-from-primary" },
    },
    config: {
      harmony: "complementary",
      accentStyle: "expressive",
      typographyPreset: "modern",
      presetModulationPercent: 26,
    },
  });
  const auto = resolveBrandThemePipelineFromStateV1({
    schemaVersion: BRAND_THEME_STATE_V1_SCHEMA_VERSION,
    scope: "system",
    legacy: {
      brandName: "BCC",
      palette: "bcc",
      mode: "light",
    },
    seed: {
      source: "manual",
      primary: "#2563eb",
      accent: { mode: "auto", strategy: "derive-from-primary" },
      neutral: { mode: "auto", strategy: "derive-from-primary" },
    },
    config: {
      harmony: "complementary",
      accentStyle: "expressive",
      typographyPreset: "modern",
      presetModulationPercent: 26,
    },
  });

  assert.ok(manual && auto);
  if (!manual || !auto) return;

  assert.equal(manual.seedAccentSource, "explicit-blend");
  assert.equal(auto.seedAccentSource, "derived");
  assert.notEqual(manual.semanticTokensBase.accent, auto.semanticTokensBase.accent);
});

test("pipeline: conserva legacy palette/mode en estado normalizado", () => {
  const result = resolveBrandThemePipelineFromStateV1({
    schemaVersion: BRAND_THEME_STATE_V1_SCHEMA_VERSION,
    scope: "web",
    legacy: {
      brandName: "Legacy Name",
      palette: "sunset",
      mode: "dark",
    },
  });

  assert.ok(result);
  if (!result) return;

  assert.equal(result.state.legacy.brandName, "Legacy Name");
  assert.equal(result.state.legacy.palette, "sunset");
  assert.equal(result.state.legacy.mode, "dark");
  assert.equal(result.brand.palette, "sunset");
  assert.equal(result.resolvedMode, "dark");
});

test("pipeline: comportamiento ante estado incompleto o invalido", () => {
  const missingSchema = resolveBrandThemePipelineFromStateV1({
    scope: "panel",
  });
  assert.equal(missingSchema, null);

  const wrongSchema = resolveBrandThemePipelineFromStateV1({
    schemaVersion: 999,
    scope: "panel",
  });
  assert.equal(wrongSchema, null);
});

test("pipeline: modulacion opcional preserva semanticTokensBase cuando se desactiva", () => {
  const input = {
    schemaVersion: BRAND_THEME_STATE_V1_SCHEMA_VERSION,
    scope: "system",
    legacy: {
      brandName: "BCC",
      palette: "sunset",
      mode: "light",
    },
    seed: {
      source: "manual",
      primary: "#2563eb",
      accent: { mode: "manual", value: "#7c3aed" },
      neutral: { mode: "manual", value: "#dbeafe" },
    },
    config: {
      harmony: "triadic",
      accentStyle: "expressive",
      typographyPreset: "modern",
      presetModulationPercent: 50,
    },
  } as const;

  const withoutModulation = resolveBrandThemePipelineFromStateV1(input, {
    applyPresetModulation: false,
  });
  const withModulation = resolveBrandThemePipelineFromStateV1(input, {
    applyPresetModulation: true,
  });

  assert.ok(withoutModulation);
  assert.ok(withModulation);
  if (!withoutModulation || !withModulation) return;

  assert.deepEqual(withoutModulation.semanticTokens, withoutModulation.semanticTokensBase);
  assert.notEqual(
    withModulation.semanticTokens.background,
    withModulation.semanticTokensBase.background
  );
});

test("pipeline: primarios extremos mantienen salida estable y determinista", () => {
  const primaries = ["#f8f9fb", "#05070a", "#ffea00", "#00f0ff", "#7a00ff", "#7f7f7f"];

  for (const primary of primaries) {
    const input = {
      schemaVersion: BRAND_THEME_STATE_V1_SCHEMA_VERSION,
      scope: "system",
      legacy: {
        brandName: "BCC",
        palette: "bcc",
        mode: "light",
      },
      seed: {
        source: "manual" as const,
        primary,
        accent: { mode: "auto" as const, strategy: "derive-from-primary" as const },
        neutral: { mode: "auto" as const, strategy: "derive-from-primary" as const },
      },
      config: {
        harmony: "tetradic" as const,
        accentStyle: "expressive" as const,
        typographyPreset: "modern" as const,
        presetModulationPercent: 26,
      },
    };

    const first = resolveBrandThemePipelineFromStateV1(input);
    const second = resolveBrandThemePipelineFromStateV1(input);

    assert.ok(first);
    assert.ok(second);
    if (!first || !second) return;

    assert.equal(first.seedAccentSource, "derived");
    assert.ok(typeof first.cssVariables["--accent"] === "string");
    assert.ok(typeof first.cssVariables["--surface-2"] === "string");
    assert.deepEqual(first, second);
  }
});
