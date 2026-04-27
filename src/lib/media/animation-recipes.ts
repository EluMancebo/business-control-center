import type { SvgAnimationEasing, SvgAnimationRecipe } from "@/lib/media/animation";

const EASING: Record<SvgAnimationEasing, string> = {
  easeOut: "cubic-bezier(0.16,1,0.3,1)",
  easeInOut: "cubic-bezier(0.65,0,0.35,1)",
};

const DEFAULT_STAGGER_MS = 40;

export function buildFadeCSS(recipe: SvgAnimationRecipe): string {
  const ease = EASING[recipe.easing];
  const delay = recipe.delayMs ?? 0;
  return (
    `@keyframes bcc-fade{from{opacity:0}to{opacity:1}}` +
    `.bcc-anim-fade{opacity:0;animation:bcc-fade ${recipe.durationMs}ms ${ease} ${delay}ms forwards;}`
  );
}

export function buildDrawCSS(recipe: SvgAnimationRecipe): string {
  const ease = EASING[recipe.easing];
  const delay = recipe.delayMs ?? 0;
  return (
    `@keyframes bcc-draw{to{stroke-dashoffset:0}}` +
    `.bcc-anim-draw path{stroke-dasharray:1000;stroke-dashoffset:1000;animation:bcc-draw ${recipe.durationMs}ms ${ease} ${delay}ms forwards;}`
  );
}

export function buildRevealCSS(recipe: SvgAnimationRecipe): string {
  const ease = EASING[recipe.easing];
  const delay = recipe.delayMs ?? 0;
  return (
    `@keyframes bcc-reveal{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}` +
    `.bcc-anim-reveal{opacity:0;transform:translateY(8px);animation:bcc-reveal ${recipe.durationMs}ms ${ease} ${delay}ms forwards;}`
  );
}

export function buildStaggerCSS(recipe: SvgAnimationRecipe): string {
  const ease = EASING[recipe.easing];
  const delay = recipe.delayMs ?? 0;
  const stagger = recipe.staggerMs ?? DEFAULT_STAGGER_MS;
  const nthDelays = Array.from({ length: 10 }, (_, i) =>
    `.bcc-anim-stagger>*:nth-child(${i + 1}){animation-delay:${delay + i * stagger}ms;}`
  ).join("");
  return (
    `@keyframes bcc-stagger{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}` +
    `.bcc-anim-stagger>*{opacity:0;animation:bcc-stagger ${recipe.durationMs}ms ${ease} forwards;}` +
    nthDelays
  );
}

export function buildAnimationCSS(recipe: SvgAnimationRecipe): string {
  switch (recipe.type) {
    case "fade":    return buildFadeCSS(recipe);
    case "draw":    return buildDrawCSS(recipe);
    case "reveal":  return buildRevealCSS(recipe);
    case "stagger": return buildStaggerCSS(recipe);
    case "none":    return "";
  }
}
