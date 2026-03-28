export type SurfaceTokens = {
  bgBase: string;
  bgSubtle: string;
  surface1: string;
  surface2: string;
  surface3: string;
  surfaceInverse: string;
  borderSubtle: string;
  borderDefault: string;
  borderStrong: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textOnInverse: string;
};

export function deriveSurfaceTokens(): SurfaceTokens {
  return {
    bgBase: "#ffffff",
    bgSubtle: "#f8fafc",
    surface1: "#ffffff",
    surface2: "#f8fafc",
    surface3: "#e2e8f0",
    surfaceInverse: "#0f172a",
    borderSubtle: "#e2e8f0",
    borderDefault: "#cbd5e1",
    borderStrong: "#94a3b8",
    textPrimary: "#0f172a",
    textSecondary: "#334155",
    textMuted: "#64748b",
    textOnInverse: "#ffffff",
  };
}
