import assert from "node:assert/strict";
import test from "node:test";
import {
  resolveBrandPaletteSeedWithHarmony,
  resolveBrandThemeTokensFromPaletteSeed,
  resolveBrandThemeTokensFromPaletteSeedWithMeta,
} from "./palette";

function hexToRgb(input: string): { r: number; g: number; b: number } | null {
  const value = input.trim().toLowerCase();
  if (!value.startsWith("#")) return null;
  const hex = value.slice(1);
  if (!/^[0-9a-f]{6}$/.test(hex)) return null;
  return {
    r: parseInt(hex.slice(0, 2), 16),
    g: parseInt(hex.slice(2, 4), 16),
    b: parseInt(hex.slice(4, 6), 16),
  };
}

function rgbDistance(a: string, b: string): number {
  const ca = hexToRgb(a);
  const cb = hexToRgb(b);
  if (!ca || !cb) return Number.POSITIVE_INFINITY;
  const dr = ca.r - cb.r;
  const dg = ca.g - cb.g;
  const db = ca.b - cb.b;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

function relativeLuminance(input: string): number {
  const rgb = hexToRgb(input);
  if (!rgb) return 0;
  const linear = (channel: number) => {
    const value = channel / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * linear(rgb.r) + 0.7152 * linear(rgb.g) + 0.0722 * linear(rgb.b);
}

function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const light = Math.max(la, lb);
  const dark = Math.min(la, lb);
  return (light + 0.05) / (dark + 0.05);
}

test("palette: seed resolution alinea normalized y resolved segun harmony", () => {
  const resolution = resolveBrandPaletteSeedWithHarmony({
    seed: {
      source: "manual",
      primary: "#2563eb",
      accent: "#ff0000",
      neutral: "#dbeafe",
    },
    harmony: "complementary",
  });

  assert.ok(resolution);
  if (!resolution) return;

  assert.equal(resolution.normalizedSeed.accent, "#ff0000");
  assert.notEqual(resolution.resolvedSeed.accent, resolution.normalizedSeed.accent);
  assert.equal(resolution.accentSource, "explicit-blend");
});

test("palette: accentStyle impacta seed-path cuando accent es AUTO", () => {
  const minimal = resolveBrandThemeTokensFromPaletteSeedWithMeta({
    seed: {
      source: "manual",
      primary: "#2563eb",
      accent: "",
      neutral: "",
    },
    mode: "light",
    config: {
      harmony: "analogous",
      accentStyle: "minimal",
      typographyPreset: "modern",
    },
    options: { systemModeFallback: "light" },
  });

  const expressive = resolveBrandThemeTokensFromPaletteSeedWithMeta({
    seed: {
      source: "manual",
      primary: "#2563eb",
      accent: "",
      neutral: "",
    },
    mode: "light",
    config: {
      harmony: "analogous",
      accentStyle: "expressive",
      typographyPreset: "modern",
    },
    options: { systemModeFallback: "light" },
  });

  assert.ok(minimal);
  assert.ok(expressive);
  if (!minimal || !expressive) return;

  assert.notEqual(minimal.resolvedSeed.accent, expressive.resolvedSeed.accent);
  assert.notEqual(minimal.tokens.accent, expressive.tokens.accent);
});

test("palette: resolveWithMeta conserva estabilidad de tokens y meta", () => {
  const result = resolveBrandThemeTokensFromPaletteSeedWithMeta({
    seed: {
      source: "manual",
      primary: "#2563eb",
      accent: "",
      neutral: "",
    },
    mode: "dark",
    config: {
      harmony: "triadic",
      accentStyle: "balanced",
      typographyPreset: "modern",
    },
    options: { systemModeFallback: "light" },
  });

  assert.ok(result);
  if (!result) return;

  assert.equal(result.accentSource, "derived");
  assert.notEqual(result.normalizedSeed.accent, result.resolvedSeed.accent);
  assert.equal(result.tokens.typographyPreset, "modern");
});

test("palette: harmonies producen diferencias perceptibles en accent AUTO", () => {
  const harmonies = [
    "monochromatic",
    "analogous",
    "complementary",
    "split-complementary",
    "triadic",
    "tetradic",
  ] as const;

  const accents = harmonies.map((harmony) => {
    const resolved = resolveBrandPaletteSeedWithHarmony({
      seed: {
        source: "manual",
        primary: "#2563eb",
        accent: "",
        neutral: "",
      },
      harmony,
      accentStyle: "balanced",
    });

    assert.ok(resolved);
    if (!resolved) return "";
    return resolved.resolvedSeed.accent;
  });

  const unique = new Set(accents);
  assert.ok(unique.size >= 5);
});

test("palette: accent manual se respeta mas que AUTO", () => {
  const manualInputAccent = "#ff3b30";
  const manual = resolveBrandPaletteSeedWithHarmony({
    seed: {
      source: "manual",
      primary: "#2563eb",
      accent: manualInputAccent,
      neutral: "",
    },
    harmony: "complementary",
    accentStyle: "expressive",
  });
  const auto = resolveBrandPaletteSeedWithHarmony({
    seed: {
      source: "manual",
      primary: "#2563eb",
      accent: "",
      neutral: "",
    },
    harmony: "complementary",
    accentStyle: "expressive",
  });

  assert.ok(manual);
  assert.ok(auto);
  if (!manual || !auto) return;

  assert.equal(manual.accentSource, "explicit-blend");
  assert.equal(auto.accentSource, "derived");
  assert.ok(
    rgbDistance(manual.resolvedSeed.accent, manualInputAccent) <
      rgbDistance(auto.resolvedSeed.accent, manualInputAccent)
  );
});

test("palette: neutral AUTO mantiene tinte controlado y estable", () => {
  const result = resolveBrandPaletteSeedWithHarmony({
    seed: {
      source: "manual",
      primary: "#ff0066",
      accent: "",
      neutral: "",
    },
    harmony: "triadic",
    accentStyle: "balanced",
  });

  assert.ok(result);
  if (!result) return;

  const neutralRgb = hexToRgb(result.resolvedSeed.neutral);
  const primaryRgb = hexToRgb(result.resolvedSeed.primary);
  assert.ok(neutralRgb);
  assert.ok(primaryRgb);
  if (!neutralRgb || !primaryRgb) return;

  const neutralSpread =
    Math.max(neutralRgb.r, neutralRgb.g, neutralRgb.b) -
    Math.min(neutralRgb.r, neutralRgb.g, neutralRgb.b);

  assert.notEqual(result.resolvedSeed.neutral, result.resolvedSeed.primary);
  assert.ok(neutralSpread <= 72);
});

test("palette: resultado determinista para mismos inputs", () => {
  const input = {
    seed: {
      source: "manual" as const,
      primary: "#2563eb",
      accent: "",
      neutral: "",
    },
    mode: "light" as const,
    config: {
      harmony: "split-complementary" as const,
      accentStyle: "expressive" as const,
      typographyPreset: "modern" as const,
    },
    options: { systemModeFallback: "light" as const },
  };

  const first = resolveBrandThemeTokensFromPaletteSeedWithMeta(input);
  const second = resolveBrandThemeTokensFromPaletteSeedWithMeta(input);

  assert.deepEqual(first, second);
});

test("palette: no regresion en resolveBrandThemeTokensFromPaletteSeed", () => {
  const tokens = resolveBrandThemeTokensFromPaletteSeed({
    seed: {
      source: "manual",
      primary: "#2563eb",
      accent: "",
      neutral: "",
    },
    mode: "dark",
    config: {
      harmony: "analogous",
      accentStyle: "balanced",
      typographyPreset: "modern",
    },
    options: { systemModeFallback: "light" },
  });

  assert.ok(tokens);
  if (!tokens) return;
  assert.equal(typeof tokens.background, "string");
  assert.equal(typeof tokens.accent, "string");
  assert.equal(typeof tokens.link, "string");
});

test("palette: primarios extremos mantienen contrastes funcionales", () => {
  const primaries = [
    "#7f7f7f",
    "#f8f9fb",
    "#05070a",
    "#ffea00",
    "#00f0ff",
    "#7a00ff",
    "#ff0040",
  ];
  const harmonies = ["monochromatic", "triadic", "tetradic"] as const;
  const modes = ["light", "dark"] as const;

  for (const primary of primaries) {
    for (const harmony of harmonies) {
      for (const mode of modes) {
        const result = resolveBrandThemeTokensFromPaletteSeedWithMeta({
          seed: {
            source: "manual",
            primary,
            accent: "",
            neutral: "",
          },
          mode,
          config: {
            harmony,
            accentStyle: "expressive",
            typographyPreset: "modern",
          },
          options: { systemModeFallback: "light" },
        });

        assert.ok(result);
        if (!result) return;

        assert.ok(contrastRatio(result.tokens.accent, result.tokens.background) >= 2.4);
        assert.ok(contrastRatio(result.tokens.accentStrong, result.tokens.background) >= 3);
        assert.ok(contrastRatio(result.tokens.link, result.tokens.background) >= 3.8);
        assert.ok(contrastRatio(result.tokens.accentSoft, result.tokens.background) >= 1.18);
      }
    }
  }
});

test("palette: harmonies intensas conservan contrato manual frente a AUTO", () => {
  const manualInputAccent = "#ff3b30";
  const harmonies = ["complementary", "triadic", "tetradic"] as const;

  for (const harmony of harmonies) {
    const manual = resolveBrandPaletteSeedWithHarmony({
      seed: {
        source: "manual",
        primary: "#2563eb",
        accent: manualInputAccent,
        neutral: "",
      },
      harmony,
      accentStyle: "expressive",
    });
    const auto = resolveBrandPaletteSeedWithHarmony({
      seed: {
        source: "manual",
        primary: "#2563eb",
        accent: "",
        neutral: "",
      },
      harmony,
      accentStyle: "expressive",
    });

    assert.ok(manual);
    assert.ok(auto);
    if (!manual || !auto) return;

    assert.equal(manual.accentSource, "explicit-blend");
    assert.ok(
      rgbDistance(manual.resolvedSeed.accent, manualInputAccent) <
        rgbDistance(auto.resolvedSeed.accent, manualInputAccent)
    );
  }
});

test("palette: neutral AUTO permanece util en bordes cromaticos", () => {
  const primaries = [
    "#7f7f7f",
    "#f8f9fb",
    "#05070a",
    "#ffea00",
    "#00f0ff",
    "#7a00ff",
    "#ff0040",
  ];

  for (const primary of primaries) {
    const resolved = resolveBrandPaletteSeedWithHarmony({
      seed: {
        source: "manual",
        primary,
        accent: "",
        neutral: "",
      },
      harmony: "triadic",
      accentStyle: "expressive",
    });

    assert.ok(resolved);
    if (!resolved) return;

    const neutral = hexToRgb(resolved.resolvedSeed.neutral);
    assert.ok(neutral);
    if (!neutral) return;

    const spread =
      Math.max(neutral.r, neutral.g, neutral.b) - Math.min(neutral.r, neutral.g, neutral.b);
    assert.ok(spread <= 78);

    const luminance = relativeLuminance(resolved.resolvedSeed.neutral);
    assert.ok(luminance >= 0.08);
    assert.ok(luminance <= 0.72);
  }
});

test("palette: monochromatic vs triadic/tetradic difieren en AUTO expressive", () => {
  const primary = "#00f0ff";
  const harmonies = ["monochromatic", "triadic", "tetradic"] as const;
  const accents = harmonies.map((harmony) => {
    const resolved = resolveBrandPaletteSeedWithHarmony({
      seed: {
        source: "manual",
        primary,
        accent: "",
        neutral: "",
      },
      harmony,
      accentStyle: "expressive",
    });
    assert.ok(resolved);
    if (!resolved) return "";
    return resolved.resolvedSeed.accent;
  });

  assert.ok(new Set(accents).size >= 3);
});
