const SHAPE_TAGS = ["path", "circle", "rect", "polygon", "polyline", "ellipse", "line"] as const;
const RGB_CHANNEL_MAX = 255;

export type SvgAnalysis = {
  pathsCount: number;
  colorsCount: number;
  isMonochrome: boolean;
  complexity: "low" | "medium" | "high";
  suggestedType: "logo" | "icon" | "illustration";
};

type ShapeCounts = {
  pathsCount: number;
  totalShapesCount: number;
};

type ComplexityInput = {
  totalShapesCount: number;
  pathsCount: number;
  colorsCount: number;
};

type SuggestedTypeInput = ComplexityInput & {
  complexity: SvgAnalysis["complexity"];
  isMonochrome: boolean;
};

export function sanitizeSvgInput(svgInput: string): string {
  if (typeof svgInput !== "string") {
    return "";
  }

  const trimmed = svgInput.trim();
  if (!trimmed) {
    return "";
  }

  const startIndex = trimmed.search(/<svg[\s>]/i);
  if (startIndex < 0) {
    return "";
  }

  const endIndex = trimmed.toLowerCase().lastIndexOf("</svg>");
  const svgSlice =
    endIndex >= startIndex ? trimmed.slice(startIndex, endIndex + "</svg>".length) : trimmed.slice(startIndex);

  return svgSlice.replace(/<!--[\s\S]*?-->/g, "").replace(/\s+/g, " ").trim();
}

export function extractShapeCounts(svgInput: string): ShapeCounts {
  const countsByTag = SHAPE_TAGS.reduce<Record<(typeof SHAPE_TAGS)[number], number>>(
    (acc, tag) => {
      const matches = svgInput.match(new RegExp(`<${tag}\\b`, "gi"));
      acc[tag] = matches ? matches.length : 0;
      return acc;
    },
    {
      path: 0,
      circle: 0,
      rect: 0,
      polygon: 0,
      polyline: 0,
      ellipse: 0,
      line: 0,
    }
  );

  const totalShapesCount = Object.values(countsByTag).reduce((total, value) => total + value, 0);

  return {
    pathsCount: countsByTag.path + countsByTag.polygon + countsByTag.polyline,
    totalShapesCount,
  };
}

function normalizeHexColor(rawValue: string): string | null {
  const hexValue = rawValue.toLowerCase();

  if (!/^#[0-9a-f]{3,8}$/i.test(hexValue)) {
    return null;
  }

  if (hexValue.length === 4) {
    const [, r, g, b] = hexValue;
    return `#${r}${r}${g}${g}${b}${b}`;
  }

  if (hexValue.length === 5) {
    const [, r, g, b] = hexValue;
    return `#${r}${r}${g}${g}${b}${b}`;
  }

  if (hexValue.length === 9) {
    return hexValue.slice(0, 7);
  }

  return hexValue;
}

function parseRgbChannel(rawValue: string): number | null {
  const value = rawValue.trim();

  if (value.endsWith("%")) {
    const percent = Number.parseFloat(value.slice(0, -1));
    if (Number.isNaN(percent)) {
      return null;
    }
    const normalized = Math.round((percent / 100) * RGB_CHANNEL_MAX);
    return Math.max(0, Math.min(RGB_CHANNEL_MAX, normalized));
  }

  const numericValue = Number.parseFloat(value);
  if (Number.isNaN(numericValue)) {
    return null;
  }

  const rounded = Math.round(numericValue);
  return Math.max(0, Math.min(RGB_CHANNEL_MAX, rounded));
}

function normalizeRgbLikeColor(rawValue: string): string | null {
  const rgbMatch = rawValue
    .trim()
    .toLowerCase()
    .match(/^rgba?\(([^)]+)\)$/i);

  if (!rgbMatch) {
    return null;
  }

  const channels = rgbMatch[1].split(",").map((value) => value.trim());
  if (channels.length < 3) {
    return null;
  }

  const [r, g, b] = channels;
  const rValue = parseRgbChannel(r);
  const gValue = parseRgbChannel(g);
  const bValue = parseRgbChannel(b);

  if (rValue === null || gValue === null || bValue === null) {
    return null;
  }

  return `rgb(${rValue},${gValue},${bValue})`;
}

function normalizeColorValue(rawValue: string): string | null {
  const normalized = rawValue.trim().toLowerCase();

  if (!normalized) {
    return null;
  }

  if (
    normalized === "none" ||
    normalized === "transparent" ||
    normalized === "currentcolor" ||
    normalized === "inherit" ||
    normalized.startsWith("url(") ||
    normalized.startsWith("var(")
  ) {
    return null;
  }

  const hexColor = normalizeHexColor(normalized);
  if (hexColor) {
    return hexColor;
  }

  const rgbColor = normalizeRgbLikeColor(normalized);
  if (rgbColor) {
    return rgbColor;
  }

  return normalized;
}

function addColorToSet(colorSet: Set<string>, rawColorValue: string): void {
  const normalizedColor = normalizeColorValue(rawColorValue);
  if (normalizedColor) {
    colorSet.add(normalizedColor);
  }
}

export function extractColorSet(svgInput: string): Set<string> {
  const colors = new Set<string>();
  const fillOrStrokeRegex = /\b(?:fill|stroke)\s*=\s*["']([^"']+)["']/gi;
  const styleRegex = /\bstyle\s*=\s*["']([^"']+)["']/gi;

  let colorMatch = fillOrStrokeRegex.exec(svgInput);
  while (colorMatch) {
    addColorToSet(colors, colorMatch[1]);
    colorMatch = fillOrStrokeRegex.exec(svgInput);
  }

  let styleMatch = styleRegex.exec(svgInput);
  while (styleMatch) {
    const declarations = styleMatch[1].split(";");
    for (const declaration of declarations) {
      const [property, value] = declaration.split(":");
      if (!property || !value) {
        continue;
      }

      const normalizedProperty = property.trim().toLowerCase();
      if (normalizedProperty === "fill" || normalizedProperty === "stroke") {
        addColorToSet(colors, value);
      }
    }

    styleMatch = styleRegex.exec(svgInput);
  }

  return colors;
}

export function inferComplexity({
  totalShapesCount,
  pathsCount,
  colorsCount,
}: ComplexityInput): SvgAnalysis["complexity"] {
  if (totalShapesCount > 120 || pathsCount > 80 || colorsCount > 30) {
    return "high";
  }

  if (totalShapesCount > 30 || pathsCount > 15 || colorsCount > 8) {
    return "medium";
  }

  return "low";
}

export function inferSuggestedType({
  complexity,
  totalShapesCount,
  pathsCount,
  colorsCount,
  isMonochrome,
}: SuggestedTypeInput): SvgAnalysis["suggestedType"] {
  if (complexity === "high" || totalShapesCount > 120 || colorsCount > 30) {
    return "illustration";
  }

  const isIconCandidate =
    complexity === "low" &&
    totalShapesCount <= 6 &&
    pathsCount <= 4 &&
    (isMonochrome || colorsCount <= 2);

  if (isIconCandidate) {
    return "icon";
  }

  return "logo";
}

export function analyzeSvg(svgInput: string): SvgAnalysis {
  const sanitizedInput = sanitizeSvgInput(svgInput);
  const { pathsCount, totalShapesCount } = extractShapeCounts(sanitizedInput);
  const colors = extractColorSet(sanitizedInput);
  const colorsCount = colors.size;
  const isMonochrome = colorsCount <= 1;
  const complexity = inferComplexity({
    totalShapesCount,
    pathsCount,
    colorsCount,
  });
  const suggestedType = inferSuggestedType({
    complexity,
    totalShapesCount,
    pathsCount,
    colorsCount,
    isMonochrome,
  });

  return {
    pathsCount,
    colorsCount,
    isMonochrome,
    complexity,
    suggestedType,
  };
}
