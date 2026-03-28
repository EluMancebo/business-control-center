export type TallerPanelVisualTokensV1 = {
  background: string;
  backgroundSubtle: string;
  surface: string;
  surfaceRaised: string;
  surfaceHigh: string;
  surfaceInverse: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textOnInverse: string;
  textOnPrimary: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  link: string;
  linkHover: string;
  focusRing: string;
  borderSubtle: string;
  borderDefault: string;
  borderStrong: string;
  shadow1: string;
  shadow2: string;
  shadow3: string;
  chromeBg: string;
  chromeBorder: string;
  chromeText: string;
  chromeTextMuted: string;
  chromeActiveBg: string;
  chromeActiveText: string;
  chromeHoverBg: string;
  card: string;
  cardForeground: string;
  panel: string;
  panelForeground: string;
  muted: string;
  mutedForeground: string;
  popover: string;
  popoverForeground: string;
};

export type TallerSurfaceLevel = "background" | "surface" | "card" | "panel" | "popover";

export type TallerSurfaceScaleEntry = {
  level: TallerSurfaceLevel;
  token: string;
};

export function resolveTallerPanelVisualTokensV1(): TallerPanelVisualTokensV1 {
  // Escalera tonal local de Taller (light-first):
  // background < surface < surfaceRaised/card < surfaceHigh/panel/popover
  const background =
    "color-mix(in oklab, var(--panel-background) 98%, var(--panel-surface-1))";
  const surface = "color-mix(in oklab, var(--panel-surface-1) 82%, var(--panel-surface-2))";
  const surfaceRaised =
    "color-mix(in oklab, var(--panel-surface-2) 68%, var(--panel-surface-3))";
  const surfaceHigh = "color-mix(in oklab, var(--panel-surface-3) 88%, var(--panel-border))";
  const card = "color-mix(in oklab, var(--panel-surface-2) 58%, var(--panel-surface-3))";
  const panel = "color-mix(in oklab, var(--panel-surface-3) 88%, var(--panel-border))";
  const popover = "color-mix(in oklab, var(--panel-surface-3) 62%, var(--panel-border))";

  return {
    background,
    backgroundSubtle: "color-mix(in oklab, var(--panel-surface-1) 80%, var(--panel-background))",
    surface,
    surfaceRaised,
    surfaceHigh,
    surfaceInverse: "color-mix(in oklab, var(--foreground) 88%, #0f172a)",
    textPrimary: "var(--foreground)",
    textSecondary: "color-mix(in oklab, var(--foreground) 78%, var(--muted-foreground))",
    textMuted: "var(--muted-foreground)",
    textOnInverse: "#f8fafc",
    textOnPrimary: "var(--primary-foreground)",
    primary: "var(--primary)",
    primaryForeground: "var(--primary-foreground)",
    secondary: "color-mix(in oklab, var(--panel-surface-3) 72%, var(--panel-card))",
    secondaryForeground: "var(--foreground)",
    link: "var(--link, var(--primary))",
    linkHover: "var(--link-hover, var(--primary))",
    focusRing: "var(--ring)",
    borderSubtle: "color-mix(in oklab, var(--panel-border) 56%, transparent)",
    borderDefault: "var(--panel-border)",
    borderStrong: "color-mix(in oklab, var(--border) 88%, var(--foreground))",
    shadow1: "var(--panel-shadow-1)",
    shadow2: "var(--panel-shadow-2)",
    shadow3: "var(--panel-shadow-3)",
    chromeBg:
      "color-mix(in oklab, var(--panel-topbar) 82%, var(--panel-surface-2))",
    chromeBorder: "var(--panel-border)",
    chromeText: "var(--foreground)",
    chromeTextMuted: "var(--muted-foreground)",
    chromeActiveBg: "color-mix(in oklab, var(--primary) 16%, var(--panel-surface-3))",
    chromeActiveText: "var(--foreground)",
    chromeHoverBg: "color-mix(in oklab, var(--panel-surface-3) 78%, var(--panel-surface-2))",
    card,
    cardForeground: "var(--foreground)",
    panel,
    panelForeground: "var(--foreground)",
    muted: "color-mix(in oklab, var(--muted) 88%, var(--panel-surface-1))",
    mutedForeground: "var(--muted-foreground)",
    popover,
    popoverForeground: "var(--foreground)",
  };
}

export function getTallerPanelSurfaceScaleDiagnostics(
  tokens: Pick<TallerPanelVisualTokensV1, TallerSurfaceLevel> = resolveTallerPanelVisualTokensV1()
): TallerSurfaceScaleEntry[] {
  return [
    { level: "background", token: tokens.background },
    { level: "surface", token: tokens.surface },
    { level: "card", token: tokens.card },
    { level: "panel", token: tokens.panel },
    { level: "popover", token: tokens.popover },
  ];
}

export function hasDistinctTallerPanelSurfaceLevels(
  tokens: Pick<TallerPanelVisualTokensV1, TallerSurfaceLevel> = resolveTallerPanelVisualTokensV1()
): boolean {
  const uniqueTokens = new Set(getTallerPanelSurfaceScaleDiagnostics(tokens).map((entry) => entry.token));
  return uniqueTokens.size === 5;
}

export function getTallerPanelVisualCssVars(): Record<`--taller-${string}`, string> {
  const tokens = resolveTallerPanelVisualTokensV1();
  return {
    "--taller-background": tokens.background,
    "--taller-background-subtle": tokens.backgroundSubtle,
    "--taller-surface": tokens.surface,
    "--taller-surface-raised": tokens.surfaceRaised,
    "--taller-surface-high": tokens.surfaceHigh,
    "--taller-surface-inverse": tokens.surfaceInverse,
    "--taller-text-primary": tokens.textPrimary,
    "--taller-text-secondary": tokens.textSecondary,
    "--taller-text-muted": tokens.textMuted,
    "--taller-text-on-inverse": tokens.textOnInverse,
    "--taller-text-on-primary": tokens.textOnPrimary,
    "--taller-primary": tokens.primary,
    "--taller-primary-foreground": tokens.primaryForeground,
    "--taller-secondary": tokens.secondary,
    "--taller-secondary-foreground": tokens.secondaryForeground,
    "--taller-link": tokens.link,
    "--taller-link-hover": tokens.linkHover,
    "--taller-focus-ring": tokens.focusRing,
    "--taller-border-subtle": tokens.borderSubtle,
    "--taller-border-default": tokens.borderDefault,
    "--taller-border-strong": tokens.borderStrong,
    "--taller-shadow-1": tokens.shadow1,
    "--taller-shadow-2": tokens.shadow2,
    "--taller-shadow-3": tokens.shadow3,
    "--taller-chrome-bg": tokens.chromeBg,
    "--taller-chrome-border": tokens.chromeBorder,
    "--taller-chrome-text": tokens.chromeText,
    "--taller-chrome-text-muted": tokens.chromeTextMuted,
    "--taller-chrome-active-bg": tokens.chromeActiveBg,
    "--taller-chrome-active-text": tokens.chromeActiveText,
    "--taller-chrome-hover-bg": tokens.chromeHoverBg,
    "--taller-card": tokens.card,
    "--taller-card-foreground": tokens.cardForeground,
    "--taller-panel": tokens.panel,
    "--taller-panel-foreground": tokens.panelForeground,
    "--taller-muted": tokens.muted,
    "--taller-muted-foreground": tokens.mutedForeground,
    "--taller-popover": tokens.popover,
    "--taller-popover-foreground": tokens.popoverForeground,
  };
}
