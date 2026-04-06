import { analyzeSvg, type SvgAnalysis } from "@/lib/media/analyzer";
import { optimizeSvg } from "@/lib/media/optimizer";

export type SvgAnimationType = "none" | "fade" | "draw" | "reveal" | "stagger";
export type SvgAnimationConfidence = "low" | "medium" | "high";
export type SvgAnimationEasing = "easeOut" | "easeInOut";

export type SvgAnimationSuitability = {
  isAnimatable: boolean;
  recommendedAnimation: SvgAnimationType;
  confidence: SvgAnimationConfidence;
  reasons: string[];
};

export type SvgAnimationRecipe = {
  type: SvgAnimationType;
  durationMs: number;
  delayMs?: number;
  staggerMs?: number;
  easing: SvgAnimationEasing;
};

export type SvgAnimationAssessmentInput = {
  optimizedSvg: string;
  analysis: SvgAnalysis;
};

export type SvgAnimationDecision = {
  suitability: SvgAnimationSuitability;
  recipe: SvgAnimationRecipe;
};

export type SvgAnimationDecisionFromRawSvg = SvgAnimationDecision & {
  optimizedSvg: string;
  analysis: SvgAnalysis;
};

const DRAW_MAX_PATHS = 12;
const STAGGER_MIN_PATHS = 3;
const STAGGER_MAX_PATHS = 10;
const HIGH_COLOR_THRESHOLD = 6;
const MEDIUM_COLOR_THRESHOLD = 3;
const DRAW_MAX_COLORS = 2;

const SVG_OPEN_TAG_REGEX = /<svg[\s>]/i;
const SVG_CLOSE_TAG_REGEX = /<\/svg>/i;

const NONE_RECIPE: SvgAnimationRecipe = {
  type: "none",
  durationMs: 0,
  easing: "easeOut",
};

const ANIMATION_RECIPES: Record<Exclude<SvgAnimationType, "none">, SvgAnimationRecipe> = {
  // UI transitions 180-280ms, conservador.
  fade: {
    type: "fade",
    durationMs: 220,
    easing: "easeInOut",
  },
  // Operational panels/overlays 240-380ms.
  draw: {
    type: "draw",
    durationMs: 260,
    delayMs: 30,
    easing: "easeInOut",
  },
  // UI transitions 180-280ms.
  reveal: {
    type: "reveal",
    durationMs: 240,
    delayMs: 20,
    easing: "easeOut",
  },
  // Operational timing con stagger suave.
  stagger: {
    type: "stagger",
    durationMs: 320,
    delayMs: 30,
    staggerMs: 45,
    easing: "easeInOut",
  },
};

function hasValidOptimizedSvg(optimizedSvg: string): boolean {
  if (!optimizedSvg.trim()) {
    return false;
  }

  return SVG_OPEN_TAG_REGEX.test(optimizedSvg) && SVG_CLOSE_TAG_REGEX.test(optimizedSvg);
}

function createNonAnimatableSuitability(
  confidence: SvgAnimationConfidence,
  reasons: string[]
): SvgAnimationSuitability {
  return {
    isAnimatable: false,
    recommendedAnimation: "none",
    confidence,
    reasons,
  };
}

function canUseDrawAnimation(analysis: SvgAnalysis): boolean {
  return (
    analysis.pathsCount > 0 &&
    analysis.pathsCount <= DRAW_MAX_PATHS &&
    analysis.colorsCount <= DRAW_MAX_COLORS &&
    analysis.complexity !== "high"
  );
}

function canUseStaggerAnimation(analysis: SvgAnalysis): boolean {
  return (
    analysis.pathsCount >= STAGGER_MIN_PATHS &&
    analysis.pathsCount <= STAGGER_MAX_PATHS &&
    analysis.colorsCount <= MEDIUM_COLOR_THRESHOLD &&
    analysis.complexity === "medium"
  );
}

export function assessSvgAnimationSuitability({
  optimizedSvg,
  analysis,
}: SvgAnimationAssessmentInput): SvgAnimationSuitability {
  const reasons: string[] = [];

  if (!hasValidOptimizedSvg(optimizedSvg)) {
    return createNonAnimatableSuitability("low", ["Optimized SVG is empty or invalid."]);
  }

  if (analysis.complexity === "high" || analysis.suggestedType === "illustration") {
    reasons.push("SVG complexity is high or classified as illustration.");
    reasons.push("Conservative decision to avoid visual overload.");
    return createNonAnimatableSuitability("high", reasons);
  }

  if (analysis.colorsCount > HIGH_COLOR_THRESHOLD) {
    reasons.push("Color count is too high for safe entry animation.");
    reasons.push("Conservative fallback avoids over-animation.");
    return createNonAnimatableSuitability("high", reasons);
  }

  if (analysis.suggestedType === "icon") {
    if (analysis.isMonochrome && canUseDrawAnimation(analysis)) {
      reasons.push("Icon is simple, monochrome, and path count is suitable for draw.");
      return {
        isAnimatable: true,
        recommendedAnimation: "draw",
        confidence: "high",
        reasons,
      };
    }

    reasons.push("Icon detected but draw constraints are not fully met.");
    reasons.push("Using reveal as conservative alternative.");
    return {
      isAnimatable: true,
      recommendedAnimation: "reveal",
      confidence: "medium",
      reasons,
    };
  }

  if (analysis.suggestedType === "logo") {
    if (analysis.isMonochrome && canUseDrawAnimation(analysis)) {
      reasons.push("Logo is monochrome with manageable path density.");
      reasons.push("Draw can emphasize identity without excess.");
      return {
        isAnimatable: true,
        recommendedAnimation: "draw",
        confidence: "medium",
        reasons,
      };
    }

    if (canUseStaggerAnimation(analysis)) {
      reasons.push("Logo has moderate complexity and segmented structure hints.");
      reasons.push("Stagger can remain subtle within operational timing.");
      return {
        isAnimatable: true,
        recommendedAnimation: "stagger",
        confidence: "medium",
        reasons,
      };
    }

    reasons.push("Logo does not clearly qualify for draw/stagger.");
    reasons.push("Fade selected as safest professional baseline.");
    return {
      isAnimatable: true,
      recommendedAnimation: "fade",
      confidence: "medium",
      reasons,
    };
  }

  reasons.push("Classification is not explicit enough for structured animation.");
  reasons.push("Applying conservative fade fallback.");
  return {
    isAnimatable: true,
    recommendedAnimation: "fade",
    confidence: "low",
    reasons,
  };
}

export function buildSvgAnimationRecipe(
  suitability: SvgAnimationSuitability
): SvgAnimationRecipe {
  if (!suitability.isAnimatable || suitability.recommendedAnimation === "none") {
    return NONE_RECIPE;
  }

  return ANIMATION_RECIPES[suitability.recommendedAnimation];
}

export function decideSvgAnimation(
  input: SvgAnimationAssessmentInput
): SvgAnimationDecision {
  const suitability = assessSvgAnimationSuitability(input);
  const recipe = buildSvgAnimationRecipe(suitability);

  return {
    suitability,
    recipe,
  };
}

export function decideSvgAnimationFromRawSvg(
  svgInput: string
): SvgAnimationDecisionFromRawSvg {
  const optimizedSvg = optimizeSvg(svgInput);
  const analysis = analyzeSvg(optimizedSvg);
  const { suitability, recipe } = decideSvgAnimation({
    optimizedSvg,
    analysis,
  });

  return {
    optimizedSvg,
    analysis,
    suitability,
    recipe,
  };
}
