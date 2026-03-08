import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { HeroPreset } from "@/models/HeroPreset";

type HeroPresetPublic = {
  key: string;
  label: string;
  description: string;
  tags: string[];
  status: "active" | "archived";
};

export async function GET() {
  await dbConnect();

  const presets = await HeroPreset.find({ status: "active" })
    .sort({ createdAt: -1, label: 1 })
    .lean<Array<HeroPresetPublic>>();

  return NextResponse.json(
    {
      ok: true,
      presets: presets.map((preset) => ({
        key: preset.key,
        label: preset.label,
        description: preset.description ?? "",
        tags: Array.isArray(preset.tags) ? preset.tags : [],
        status: preset.status,
      })),
    },
    { status: 200 }
  );
}    