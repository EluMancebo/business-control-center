import { analyzeSvg, type SvgAnalysis } from "@/lib/media/analyzer";
import { decideSvgAnimation, type SvgAnimationDecision } from "@/lib/media/animation";
import { optimizeSvg } from "@/lib/media/optimizer";

export type PreparedSvgPipelineResult = {
  optimizedSvg: string;
  analysis: SvgAnalysis;
  animation: SvgAnimationDecision;
};

export function prepareSvgPipelineResult(svgInput: string): PreparedSvgPipelineResult {
  const optimizedSvg = optimizeSvg(svgInput);
  const analysis = analyzeSvg(optimizedSvg);
  const animation = decideSvgAnimation({
    optimizedSvg,
    analysis,
  });

  return {
    optimizedSvg,
    analysis,
    animation,
  };
}
