import type { SvgAnimationType } from "@/lib/media/animation";

const SVG_OPEN_TAG_RE = /<svg\b([^>]*)>/i;
const CLASS_ATTR_RE = /\bclass\s*=\s*(["'])([^"']*)\1/i;
const SVG_OPEN_LEN = "<svg".length;

export function injectClassInSvgRoot(svgString: string, className: string): string {
  const tagMatch = SVG_OPEN_TAG_RE.exec(svgString);
  if (!tagMatch) return svgString;

  const tagStart = tagMatch.index;
  const tagFull = tagMatch[0];
  const tagEnd = tagStart + tagFull.length;
  const tagAttrs = tagMatch[1];

  const classMatch = CLASS_ATTR_RE.exec(tagAttrs);

  if (classMatch) {
    const quote = classMatch[1] as '"' | "'";
    const existing = classMatch[2].trim();
    const merged = existing ? `${existing} ${className}` : className;
    const replacement = `class=${quote}${merged}${quote}`;
    const attrAbsStart = tagStart + SVG_OPEN_LEN + classMatch.index;
    const attrAbsEnd = attrAbsStart + classMatch[0].length;
    return svgString.slice(0, attrAbsStart) + replacement + svgString.slice(attrAbsEnd);
  }

  const newTag = `${tagFull.slice(0, -1)} class="${className}">`;
  return svgString.slice(0, tagStart) + newTag + svgString.slice(tagEnd);
}

export function injectStyleAsFirstChild(svgString: string, cssBlock: string): string {
  const tagMatch = SVG_OPEN_TAG_RE.exec(svgString);
  if (!tagMatch) return svgString;

  const insertAt = tagMatch.index + tagMatch[0].length;
  return svgString.slice(0, insertAt) + `<style>${cssBlock}</style>` + svgString.slice(insertAt);
}

export function injectAnimationIntoSvg(
  svgString: string,
  cssBlock: string,
  animationType: SvgAnimationType
): string {
  if (animationType === "none") return svgString;
  if (!svgString.trim()) return svgString;
  if (!cssBlock.trim()) return svgString;
  if (!SVG_OPEN_TAG_RE.test(svgString)) return svgString;

  const className = `bcc-anim-${animationType}`;
  const withClass = injectClassInSvgRoot(svgString, className);
  return injectStyleAsFirstChild(withClass, cssBlock);
}
