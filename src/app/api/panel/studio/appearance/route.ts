import { NextResponse } from "next/server";
import type { BrandMode, BrandPaletteKey } from "@/lib/brand/types";
import type {
  BrandAccentStyle,
  BrandHarmonyStrategy,
  BrandTypographyPreset,
} from "@/lib/brand-theme";
import { dbConnect } from "@/lib/db";
import {
  BRAND_THEME_ACCENT_STYLE_OPTIONS,
  BRAND_THEME_HARMONY_OPTIONS,
  BRAND_THEME_TYPOGRAPHY_OPTIONS,
  DEFAULT_BRAND_THEME_CONFIG,
} from "@/lib/brand-theme";
import { requireSession } from "@/lib/auth/serverSession";
import { StudioAppearanceConfig } from "@/models/StudioAppearanceConfig";

const STUDIO_APPEARANCE_KEY = "studio";
const ATMOSPHERE_OPTIONS: BrandPaletteKey[] = ["bcc", "ocean", "sunset", "mono"];
const MODE_OPTIONS: BrandMode[] = ["system", "light", "dark"];

type StudioAppearancePayload = {
  mode: BrandMode;
  atmosphere: BrandPaletteKey;
  harmony: BrandHarmonyStrategy;
  accentStyle: BrandAccentStyle;
  typography: BrandTypographyPreset;
};

function asMode(input: unknown): BrandMode | null {
  return typeof input === "string" && MODE_OPTIONS.includes(input as BrandMode)
    ? (input as BrandMode)
    : null;
}

function asAtmosphere(input: unknown): BrandPaletteKey | null {
  return typeof input === "string" && ATMOSPHERE_OPTIONS.includes(input as BrandPaletteKey)
    ? (input as BrandPaletteKey)
    : null;
}

function asHarmony(input: unknown): BrandHarmonyStrategy | null {
  return typeof input === "string" &&
    BRAND_THEME_HARMONY_OPTIONS.includes(input as BrandHarmonyStrategy)
    ? (input as BrandHarmonyStrategy)
    : null;
}

function asAccentStyle(input: unknown): BrandAccentStyle | null {
  return typeof input === "string" &&
    BRAND_THEME_ACCENT_STYLE_OPTIONS.includes(input as BrandAccentStyle)
    ? (input as BrandAccentStyle)
    : null;
}

function asTypography(input: unknown): BrandTypographyPreset | null {
  return typeof input === "string" &&
    BRAND_THEME_TYPOGRAPHY_OPTIONS.includes(input as BrandTypographyPreset)
    ? (input as BrandTypographyPreset)
    : null;
}

function isRecord(input: unknown): input is Record<string, unknown> {
  return typeof input === "object" && input !== null && !Array.isArray(input);
}

function defaultPayload(): StudioAppearancePayload {
  return {
    mode: "system",
    atmosphere: "bcc",
    harmony: DEFAULT_BRAND_THEME_CONFIG.harmony,
    accentStyle: DEFAULT_BRAND_THEME_CONFIG.accentStyle,
    typography: DEFAULT_BRAND_THEME_CONFIG.typographyPreset,
  };
}

function toPayload(doc: unknown): StudioAppearancePayload {
  if (!isRecord(doc)) return defaultPayload();
  const fallback = defaultPayload();
  return {
    mode: asMode(doc.mode) ?? fallback.mode,
    atmosphere: asAtmosphere(doc.atmosphere) ?? fallback.atmosphere,
    harmony: asHarmony(doc.harmony) ?? fallback.harmony,
    accentStyle: asAccentStyle(doc.accentStyle) ?? fallback.accentStyle,
    typography: asTypography(doc.typography) ?? fallback.typography,
  };
}

async function requireStudioAppearanceAccess() {
  const session = await requireSession();
  if (session.role !== "owner" && session.role !== "admin") {
    throw new Error("FORBIDDEN_ROLE");
  }
}

export async function GET() {
  try {
    await requireStudioAppearanceAccess();
    await dbConnect();

    const doc = await StudioAppearanceConfig.findOne({
      key: STUDIO_APPEARANCE_KEY,
    }).lean();

    return NextResponse.json({
      ok: true,
      config: toPayload(doc),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN";
    const status =
      message === "NO_TOKEN" || message === "INVALID_TOKEN"
        ? 401
        : message === "FORBIDDEN_ROLE"
          ? 403
          : 500;
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}

export async function PUT(req: Request) {
  try {
    await requireStudioAppearanceAccess();
    await dbConnect();

    const raw = (await req.json().catch(() => null)) as unknown;
    if (!isRecord(raw)) {
      return NextResponse.json(
        { ok: false, error: "INVALID_BODY" },
        { status: 400 }
      );
    }

    const payload = {
      mode: asMode(raw.mode),
      atmosphere: asAtmosphere(raw.atmosphere),
      harmony: asHarmony(raw.harmony),
      accentStyle: asAccentStyle(raw.accentStyle),
      typography: asTypography(raw.typography),
    };

    if (
      !payload.mode ||
      !payload.atmosphere ||
      !payload.harmony ||
      !payload.accentStyle ||
      !payload.typography
    ) {
      return NextResponse.json(
        { ok: false, error: "INVALID_FIELDS" },
        { status: 400 }
      );
    }

    const updated = await StudioAppearanceConfig.findOneAndUpdate(
      { key: STUDIO_APPEARANCE_KEY },
      {
        $set: {
          key: STUDIO_APPEARANCE_KEY,
          mode: payload.mode,
          atmosphere: payload.atmosphere,
          harmony: payload.harmony,
          accentStyle: payload.accentStyle,
          typography: payload.typography,
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).lean();

    return NextResponse.json({
      ok: true,
      config: toPayload(updated),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN";
    const status =
      message === "NO_TOKEN" || message === "INVALID_TOKEN"
        ? 401
        : message === "FORBIDDEN_ROLE"
          ? 403
          : 500;
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}
