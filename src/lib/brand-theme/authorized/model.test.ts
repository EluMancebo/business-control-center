import assert from "node:assert/strict";
import test from "node:test";
import { BRAND_THEME_STATE_V1_SCHEMA_VERSION } from "../state/v1";
import { SYSTEM_AUTHORIZED_THEME_PRESETS } from "./presets";
import {
  applyLayer2SelectionToBrandThemeStateV1,
  createDefaultBusinessThemePolicy,
  normalizeBusinessThemePolicy,
  resolveAuthorizedPresetForBusiness,
  sanitizeLayer2Overrides,
} from "./model";

test("authorized/model: crea policy por defecto con presets activos por scope", () => {
  const policy = createDefaultBusinessThemePolicy({
    scope: "web",
    businessSlug: "Caballeros Barberia",
  });

  assert.equal(policy.scope, "web");
  assert.equal(policy.businessSlug, "caballeros-barberia");
  assert.ok(policy.allowedPresetIds.length > 0);
  assert.ok(typeof policy.defaultPresetId === "string");
});

test("authorized/model: normaliza policy filtrando presets fuera de catalogo", () => {
  const normalized = normalizeBusinessThemePolicy(
    {
      schemaVersion: 1,
      scope: "web",
      businessSlug: "caballeros",
      allowedPresetIds: ["web-brand-balanced", "no-existe"],
      defaultPresetId: "no-existe",
      adjustableFields: ["harmony", "accentStyle", "invalid-field"],
    },
    {
      fallbackScope: "web",
      fallbackBusinessSlug: "caballeros",
      presets: SYSTEM_AUTHORIZED_THEME_PRESETS,
    }
  );

  assert.ok(normalized);
  if (!normalized) return;

  assert.deepEqual(normalized.allowedPresetIds, ["web-brand-balanced"]);
  assert.equal(normalized.defaultPresetId, "web-brand-balanced");
  assert.deepEqual(normalized.adjustableFields, ["harmony", "accentStyle"]);
});

test("authorized/model: aplica selection a BrandThemeStateV1 respetando policy", () => {
  const base = {
    schemaVersion: BRAND_THEME_STATE_V1_SCHEMA_VERSION,
    scope: "web",
    businessSlug: "caballeros",
    legacy: {
      brandName: "Caballeros",
      palette: "bcc",
      mode: "system",
    },
    seed: {
      source: "manual",
      primary: "#2563eb",
      accent: { mode: "auto", strategy: "derive-from-primary" },
      neutral: { mode: "auto", strategy: "derive-from-primary" },
    },
    config: {
      harmony: "analogous",
      accentStyle: "balanced",
      typographyPreset: "modern",
      presetModulationPercent: 26,
    },
  } as const;

  const policy = createDefaultBusinessThemePolicy({
    scope: "web",
    businessSlug: "caballeros",
  });

  const selection = {
    schemaVersion: 1,
    scope: "web",
    businessSlug: "caballeros",
    draft: {
      presetId: "web-campaign-expressive",
      overrides: {
        harmony: "triadic",
        mode: "dark",
        presetModulationPercent: 90,
      },
    },
  } as const;

  const applied = applyLayer2SelectionToBrandThemeStateV1({
    baseState: base,
    policy: {
      ...policy,
      allowedPresetIds: ["web-campaign-expressive"],
      adjustableFields: ["harmony", "presetModulationPercent"],
    },
    selection,
    stage: "draft",
  });

  assert.equal(applied.legacy.palette, "sunset");
  assert.equal(applied.legacy.mode, "light");
  assert.equal(applied.config.harmony, "triadic");
  assert.equal(applied.config.presetModulationPercent, 60);
  assert.equal(applied.seed.primary, "#2563eb");
});

test("authorized/model: fallback de preset cuando selection no esta autorizada", () => {
  const policy = createDefaultBusinessThemePolicy({
    scope: "panel",
    businessSlug: "bcc-panel",
  });

  const selection = {
    schemaVersion: 1,
    scope: "panel",
    businessSlug: "bcc-panel",
    draft: { presetId: "web-campaign-expressive" },
  } as const;

  const preset = resolveAuthorizedPresetForBusiness({
    scope: "panel",
    policy,
    selection,
    stage: "draft",
  });

  assert.ok(preset);
  if (!preset) return;

  assert.equal(preset.scope, "panel");
  assert.ok(policy.allowedPresetIds.includes(preset.id));
});

test("authorized/model: sanitiza overrides segun campos ajustables", () => {
  const preset = SYSTEM_AUTHORIZED_THEME_PRESETS.find(
    (item) => item.id === "web-brand-balanced"
  );
  assert.ok(preset);
  if (!preset) return;

  const policy = createDefaultBusinessThemePolicy({
    scope: "web",
    businessSlug: "caballeros",
  });

  const sanitized = sanitizeLayer2Overrides({
    preset,
    policy: {
      ...policy,
      adjustableFields: ["typographyPreset"],
    },
    overrides: {
      typographyPreset: "editorial",
      harmony: "complementary",
    },
  });

  assert.deepEqual(sanitized, { typographyPreset: "editorial" });
});
