import assert from "node:assert/strict";
import test from "node:test";
import { BRAND_THEME_STATE_V1_SCHEMA_VERSION } from "../state/v1";
import { resolveBrandHydratorThemeResolution } from "./hydrator";

test("runtime/hydrator: flag OFF mantiene fallback legacy", () => {
  const resolution = resolveBrandHydratorThemeResolution({
    scope: "panel",
    businessSlug: "mi-negocio",
    semanticRuntimeEnabled: false,
    stateV1: {
      schemaVersion: BRAND_THEME_STATE_V1_SCHEMA_VERSION,
      scope: "panel",
    },
  });

  assert.equal(resolution.kind, "legacy");
  if (resolution.kind !== "legacy") return;
  assert.equal(resolution.reason, "flag-off");
});

test("runtime/hydrator: sin v1 hace fallback legacy", () => {
  const resolution = resolveBrandHydratorThemeResolution({
    scope: "web",
    businessSlug: "mi-negocio",
    semanticRuntimeEnabled: true,
    stateV1: null,
  });

  assert.equal(resolution.kind, "legacy");
  if (resolution.kind !== "legacy") return;
  assert.equal(resolution.reason, "missing-v1");
});

test("runtime/hydrator: v1 invalido hace fallback legacy", () => {
  const resolution = resolveBrandHydratorThemeResolution({
    scope: "system",
    semanticRuntimeEnabled: true,
    stateV1: {
      schemaVersion: 999,
      scope: "system",
    },
  });

  assert.equal(resolution.kind, "legacy");
  if (resolution.kind !== "legacy") return;
  assert.equal(resolution.reason, "invalid-v1");
});

test("runtime/hydrator: v1 valido + flag ON resuelve runtime semantico", () => {
  const resolution = resolveBrandHydratorThemeResolution({
    scope: "studio",
    semanticRuntimeEnabled: true,
    stateV1: {
      schemaVersion: BRAND_THEME_STATE_V1_SCHEMA_VERSION,
      scope: "studio",
      legacy: {
        brandName: "Studio Brand",
        palette: "ocean",
        mode: "dark",
      },
      seed: {
        source: "manual",
        primary: "#2563eb",
        accent: { mode: "manual", value: "#7c3aed" },
        neutral: { mode: "auto", strategy: "derive-from-primary" },
      },
      config: {
        harmony: "analogous",
        accentStyle: "balanced",
        typographyPreset: "modern",
        presetModulationPercent: 26,
      },
    },
  });

  assert.equal(resolution.kind, "semantic");
  if (resolution.kind !== "semantic") return;

  assert.equal(resolution.pipeline.state.scope, "studio");
  assert.equal(resolution.pipeline.brand.palette, "ocean");
  assert.equal(typeof resolution.pipeline.cssVariables["--background"], "string");
});

