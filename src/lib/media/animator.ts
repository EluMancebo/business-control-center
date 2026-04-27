import {
  decideSvgAnimation,
  type SvgAnimationDecision,
  type SvgAnimationRecipe,
} from "@/lib/media/animation";
import { buildAnimationCSS } from "@/lib/media/animation-recipes";
import { injectAnimationIntoSvg } from "@/lib/media/animation-injector";
import { analyzeSvg, type SvgAnalysis } from "@/lib/media/analyzer";

const FORCE_FALLBACK_RECIPE: SvgAnimationRecipe = {
  type: "fade",
  durationMs: 220,
  easing: "easeInOut",
};

export type AnimatedSvgResult = {
  animatedSvg: string;
  decision: SvgAnimationDecision;
  analysis: SvgAnalysis;
  applied: boolean;
  reason: string;
};

export type AnimateSvgOptions = {
  force?: boolean;
  analysis?: SvgAnalysis;
};

export function generateAnimatedSvg(
  optimizedSvg: string,
  options?: AnimateSvgOptions
): AnimatedSvgResult {
  // CASO 1: input vacío o inválido
  if (!optimizedSvg.trim()) {
    const analysis = options?.analysis ?? analyzeSvg(optimizedSvg);
    const decision = decideSvgAnimation({ optimizedSvg, analysis });
    return {
      animatedSvg: optimizedSvg,
      decision,
      analysis,
      applied: false,
      reason: "SVG input vacío o inválido",
    };
  }

  // CASO 2: reutilizar analysis si se proporciona
  const analysis = options?.analysis ?? analyzeSvg(optimizedSvg);
  const decision = decideSvgAnimation({ optimizedSvg, analysis });
  const { suitability, recipe } = decision;
  const joinedReasons =
    suitability.reasons.length > 0
      ? suitability.reasons.join(" · ")
      : "Sin detalles disponibles";

  // CASO 4: no animable sin force
  if (!suitability.isAnimatable && !options?.force) {
    return {
      animatedSvg: optimizedSvg,
      decision,
      analysis,
      applied: false,
      reason: `No animable: ${joinedReasons}`,
    };
  }

  // CASO 5: no animable CON force → fallback fade
  if (!suitability.isAnimatable && options?.force) {
    const css = buildAnimationCSS(FORCE_FALLBACK_RECIPE);
    const animatedSvg = injectAnimationIntoSvg(optimizedSvg, css, FORCE_FALLBACK_RECIPE.type);
    return {
      animatedSvg,
      decision,
      analysis,
      applied: true,
      reason: `Forzado: ${joinedReasons} → aplicado fade`,
    };
  }

  // CASO 6: isAnimatable true pero recipe.type === "none" (defensivo)
  const css = buildAnimationCSS(recipe);
  if (!css.trim()) {
    return {
      animatedSvg: optimizedSvg,
      decision,
      analysis,
      applied: false,
      reason: "Tipo de animación 'none', no aplica",
    };
  }

  // CASO 3: animación normal
  const animatedSvg = injectAnimationIntoSvg(optimizedSvg, css, recipe.type);
  return {
    animatedSvg,
    decision,
    analysis,
    applied: true,
    reason: `${joinedReasons} · animación ${recipe.type} aplicada`,
  };
}
