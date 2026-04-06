const SVG_CLOSE_TAG = "</svg>";

export function sanitizeSvgInput(svgInput: string): string {
  if (typeof svgInput !== "string") {
    return "";
  }

  const normalizedInput = svgInput.replace(/^\uFEFF/, "").trim();
  if (!normalizedInput) {
    return "";
  }

  const startIndex = normalizedInput.search(/<svg[\s>]/i);
  if (startIndex < 0) {
    return "";
  }

  const lower = normalizedInput.toLowerCase();
  const endIndex = lower.lastIndexOf(SVG_CLOSE_TAG);
  if (endIndex < startIndex) {
    return normalizedInput.slice(startIndex).trim();
  }

  return normalizedInput.slice(startIndex, endIndex + SVG_CLOSE_TAG.length).trim();
}

export function removeSvgComments(svgInput: string): string {
  return svgInput.replace(/<!--[\s\S]*?-->/g, "");
}

export function stripXmlNoise(svgInput: string): string {
  return svgInput
    .replace(/<\?(?:xml|xml-stylesheet)[\s\S]*?\?>/gi, "")
    .replace(/<!doctype[\s\S]*?>/gi, "")
    .replace(/<metadata\b[\s\S]*?<\/metadata>/gi, "")
    .replace(
      /\s(?:xmlns:(?:inkscape|sodipodi)|inkscape:[\w:-]+|sodipodi:[\w:-]+)\s*=\s*(?:"[^"]*"|'[^']*')/gi,
      ""
    );
}

export function removeTrivialEmptyNodes(svgInput: string): string {
  let current = svgInput;
  let previous = "";

  while (current !== previous) {
    previous = current;
    current = current.replace(/<g\b[^>]*>\s*<\/g>/gi, "");
    current = current.replace(/<defs\b[^>]*>\s*<\/defs>/gi, "");
  }

  return current;
}

export function normalizeSvgWhitespace(svgInput: string): string {
  return svgInput
    .replace(/\r\n?/g, "\n")
    .replace(/>\s+</g, "><")
    .replace(/\s+\/>/g, "/>")
    .trim();
}

export function optimizeSvg(svgInput: string): string {
  const sanitized = sanitizeSvgInput(svgInput);
  if (!sanitized) {
    return "";
  }

  const withoutComments = removeSvgComments(sanitized);
  const withoutNoise = stripXmlNoise(withoutComments);
  const withoutTrivialNodes = removeTrivialEmptyNodes(withoutNoise);
  return normalizeSvgWhitespace(withoutTrivialNodes);
}
