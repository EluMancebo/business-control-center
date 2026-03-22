import type { BrandScope } from "@/lib/brand/storage";
import {
  resolveBrandThemePipelineFromStateV1,
  type BrandThemePipelineResult,
} from "../pipeline";

export type BrandHydratorThemeResolution =
  | { kind: "legacy"; reason: "flag-off" | "missing-v1" | "invalid-v1" }
  | { kind: "semantic"; pipeline: BrandThemePipelineResult };

export function resolveBrandHydratorThemeResolution(input: {
  scope: BrandScope;
  businessSlug?: string;
  semanticRuntimeEnabled: boolean;
  stateV1: unknown | null;
}): BrandHydratorThemeResolution {
  if (!input.semanticRuntimeEnabled) {
    return { kind: "legacy", reason: "flag-off" };
  }

  if (!input.stateV1) {
    return { kind: "legacy", reason: "missing-v1" };
  }

  const pipeline = resolveBrandThemePipelineFromStateV1(input.stateV1, {
    fallbackScope: input.scope,
    fallbackBusinessSlug: input.businessSlug,
    systemModeFallback: "light",
  });

  if (!pipeline) {
    return { kind: "legacy", reason: "invalid-v1" };
  }

  return { kind: "semantic", pipeline };
}

