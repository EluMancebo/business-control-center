import assert from "node:assert/strict";
import test from "node:test";
import {
  BRAND_THEME_STATE_V1_SCHEMA_VERSION,
  createBrandThemeSeedColorAuto,
  createBrandThemeSeedColorManual,
  isBrandThemeSeedColorAuto,
  isBrandThemeSeedColorManual,
  normalizeBrandThemeStateV1,
  parseBrandThemeStateV1,
  stringifyBrandThemeStateV1,
} from "./v1";

test("v1: payload valido completo", () => {
  const input = {
    schemaVersion: BRAND_THEME_STATE_V1_SCHEMA_VERSION,
    scope: "web",
    businessSlug: "Caballeros-Barberia",
    legacy: {
      brandName: "Caballeros",
      palette: "ocean",
      mode: "dark",
    },
    seed: {
      source: "hero",
      primary: "#336699",
      accent: { mode: "manual", value: "#112233" },
      neutral: { mode: "auto", strategy: "derive-from-source" },
      sourceRef: { assetId: "asset_01", imageUrl: "https://img.example/a.png" },
    },
    config: {
      harmony: "triadic",
      accentStyle: "expressive",
      typographyPreset: "editorial",
      presetModulationPercent: 61,
    },
    meta: {
      updatedAt: "2026-03-21T00:00:00.000Z",
      updatedBy: "qa",
    },
  } as const;

  const state = normalizeBrandThemeStateV1(input);
  assert.ok(state);
  if (!state) return;

  assert.equal(state.scope, "web");
  assert.equal(state.businessSlug, "Caballeros-Barberia");
  assert.equal(state.legacy.brandName, "Caballeros");
  assert.equal(state.legacy.palette, "ocean");
  assert.equal(state.legacy.mode, "dark");
  assert.equal(state.seed.source, "hero");
  assert.equal(state.seed.primary, "#336699");
  assert.equal(state.seed.accent.mode, "manual");
  assert.equal(state.seed.neutral.mode, "auto");
  assert.equal(state.seed.sourceRef?.assetId, "asset_01");
  assert.equal(state.config.harmony, "triadic");
  assert.equal(state.config.accentStyle, "expressive");
  assert.equal(state.config.typographyPreset, "editorial");
  assert.equal(state.config.presetModulationPercent, 61);
  assert.equal(state.meta?.updatedBy, "qa");
});

test("v1: payload minimo normalizable", () => {
  const state = normalizeBrandThemeStateV1({
    schemaVersion: BRAND_THEME_STATE_V1_SCHEMA_VERSION,
    scope: "panel",
  });

  assert.ok(state);
  if (!state) return;

  assert.equal(state.scope, "panel");
  assert.equal(state.seed.source, "manual");
  assert.equal(state.seed.primary, "#2563eb");
  assert.equal(state.seed.accent.mode, "auto");
  assert.equal(state.seed.neutral.mode, "auto");
  assert.equal(state.config.presetModulationPercent, 26);
});

test("v1: payload invalido se rechaza", () => {
  const wrongVersion = normalizeBrandThemeStateV1({
    schemaVersion: 999,
    scope: "panel",
  });
  assert.equal(wrongVersion, null);

  const missingScope = normalizeBrandThemeStateV1({
    schemaVersion: BRAND_THEME_STATE_V1_SCHEMA_VERSION,
  });
  assert.equal(missingScope, null);
});

test("v1: auto/manual accent y neutral", () => {
  const manual = createBrandThemeSeedColorManual("#ABCDEF");
  assert.ok(manual);
  if (!manual) return;

  assert.equal(isBrandThemeSeedColorManual(manual), true);
  assert.equal(isBrandThemeSeedColorAuto(manual), false);
  assert.equal(manual.value, "#abcdef");

  const auto = createBrandThemeSeedColorAuto("derive-from-source");
  assert.equal(isBrandThemeSeedColorAuto(auto), true);
  assert.equal(isBrandThemeSeedColorManual(auto), false);
  assert.equal(auto.strategy, "derive-from-source");
});

test("v1: serializacion y deserializacion", () => {
  const state = normalizeBrandThemeStateV1({
    schemaVersion: BRAND_THEME_STATE_V1_SCHEMA_VERSION,
    scope: "studio",
    legacy: {
      brandName: "Studio Brand",
      palette: "bcc",
      mode: "light",
    },
  });

  assert.ok(state);
  if (!state) return;

  const raw = stringifyBrandThemeStateV1(state);
  const roundTrip = parseBrandThemeStateV1(raw);

  assert.ok(roundTrip);
  if (!roundTrip) return;

  assert.equal(roundTrip.schemaVersion, BRAND_THEME_STATE_V1_SCHEMA_VERSION);
  assert.equal(roundTrip.scope, "studio");
  assert.equal(roundTrip.legacy.brandName, "Studio Brand");
});

test("v1: conserva campos legacy cuando son validos", () => {
  const state = normalizeBrandThemeStateV1({
    schemaVersion: BRAND_THEME_STATE_V1_SCHEMA_VERSION,
    scope: "web",
    legacy: {
      brandName: "Legacy Name",
      palette: "sunset",
      mode: "system",
    },
  });

  assert.ok(state);
  if (!state) return;

  assert.equal(state.legacy.brandName, "Legacy Name");
  assert.equal(state.legacy.palette, "sunset");
  assert.equal(state.legacy.mode, "system");
});

