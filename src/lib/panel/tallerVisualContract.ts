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
  success: string;
  successForeground: string;
  successSoft: string;
  warning: string;
  warningForeground: string;
  warningSoft: string;
  danger: string;
  dangerForeground: string;
  dangerSoft: string;
  processing: string;
  processingForeground: string;
  processingSoft: string;
  taskSurface: string;
  taskSurfaceForeground: string;
  focusRing: string;
  borderSubtle: string;
  borderDefault: string;
  borderStrong: string;
  elevationBase: string;
  elevationInteractive: string;
  elevationTask: string;
  elevationOverlay: string;
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
  const background = "var(--background)";
  const surface = "var(--panel-surface-1)";
  const surfaceRaised = "var(--panel-surface-2)";
  const surfaceHigh = "var(--panel-surface-3)";
  const card = "var(--card)";
  const panel = "var(--surface-3, var(--panel-surface-3))";
  const popover = "var(--surface-3, var(--card))";

  return {
    background,
    backgroundSubtle: "var(--panel-surface-1)",
    surface,
    surfaceRaised,
    surfaceHigh,
    surfaceInverse: "var(--foreground)",
    textPrimary: "var(--foreground)",
    textSecondary: "var(--foreground)",
    textMuted: "var(--muted-foreground)",
    textOnInverse: "var(--background)",
    textOnPrimary: "var(--primary-foreground)",
    primary: "var(--primary)",
    primaryForeground: "var(--primary-foreground)",
    secondary: "var(--surface-2, var(--card))",
    secondaryForeground: "var(--foreground)",
    link: "var(--link, var(--primary))",
    linkHover: "var(--link-hover, var(--primary))",
    success: "var(--success)",
    successForeground: "var(--success-foreground)",
    successSoft: "var(--success-soft)",
    warning: "var(--warning)",
    warningForeground: "var(--warning-foreground)",
    warningSoft: "var(--warning-soft)",
    danger: "var(--danger)",
    dangerForeground: "var(--danger-foreground)",
    dangerSoft: "var(--danger-soft)",
    processing: "var(--processing)",
    processingForeground: "var(--processing-foreground)",
    processingSoft: "var(--processing-soft)",
    taskSurface: "var(--task-surface)",
    taskSurfaceForeground: "var(--task-surface-foreground, var(--foreground))",
    focusRing: "var(--ring)",
    borderSubtle: "var(--panel-border, var(--border))",
    borderDefault: "var(--panel-border, var(--border))",
    borderStrong: "var(--border)",
    elevationBase: "var(--elevation-base, var(--panel-shadow-1))",
    elevationInteractive: "var(--elevation-interactive, var(--panel-shadow-2))",
    elevationTask: "var(--elevation-task, var(--panel-shadow-2))",
    elevationOverlay: "var(--elevation-overlay, var(--panel-shadow-3))",
    shadow1: "var(--panel-shadow-1)",
    shadow2: "var(--panel-shadow-2)",
    shadow3: "var(--panel-shadow-3)",
    chromeBg: "var(--panel-topbar)",
    chromeBorder: "var(--panel-border, var(--border))",
    chromeText: "var(--foreground)",
    chromeTextMuted: "var(--muted-foreground)",
    chromeActiveBg: "var(--surface-3, var(--card))",
    chromeActiveText: "var(--foreground)",
    chromeHoverBg: "var(--surface-2, var(--card))",
    card,
    cardForeground: "var(--foreground)",
    panel,
    panelForeground: "var(--foreground)",
    muted: "var(--muted)",
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
    "--taller-success": tokens.success,
    "--taller-success-foreground": tokens.successForeground,
    "--taller-success-soft": tokens.successSoft,
    "--taller-warning": tokens.warning,
    "--taller-warning-foreground": tokens.warningForeground,
    "--taller-warning-soft": tokens.warningSoft,
    "--taller-danger": tokens.danger,
    "--taller-danger-foreground": tokens.dangerForeground,
    "--taller-danger-soft": tokens.dangerSoft,
    "--taller-processing": tokens.processing,
    "--taller-processing-foreground": tokens.processingForeground,
    "--taller-processing-soft": tokens.processingSoft,
    "--taller-task-surface": tokens.taskSurface,
    "--taller-task-surface-foreground": tokens.taskSurfaceForeground,
    "--taller-focus-ring": tokens.focusRing,
    "--taller-border-subtle": tokens.borderSubtle,
    "--taller-border-default": tokens.borderDefault,
    "--taller-border-strong": tokens.borderStrong,
    "--taller-elevation-base": tokens.elevationBase,
    "--taller-elevation-interactive": tokens.elevationInteractive,
    "--taller-elevation-task": tokens.elevationTask,
    "--taller-elevation-overlay": tokens.elevationOverlay,
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

export type TallerLabVisualTokensV1 = {
  workspaceTopStrip: string;
  sidebarFrame: string;
  sidebarCard: string;
  chipSurface: string;
  chipBorder: string;
  accent: string;
  accentForeground: string;
  accentSoft: string;
  accentBorder: string;
  accentStrong: string;
  controlSurface: string;
  controlBorder: string;
  controlShadow: string;
  canvasBackdrop: string;
  canvasStage: string;
  canvasTexture: string;
  canvasTextureSize: string;
};

export function resolveTallerLabVisualTokensV1(): TallerLabVisualTokensV1 {
  return {
    workspaceTopStrip:
      "color-mix(in oklab, var(--panel-topbar,var(--panel-surface-1,var(--background))) 68%, var(--foreground) 32%)",
    sidebarFrame:
      "color-mix(in oklab, var(--panel-sidebar,var(--surface-2,var(--card))) 74%, var(--panel-surface-3,var(--surface-3,var(--card))) 26%)",
    sidebarCard:
      "color-mix(in oklab, var(--panel-surface-3,var(--surface-3,var(--card))) 66%, var(--panel-surface-1,var(--background)) 34%)",
    chipSurface:
      "color-mix(in oklab, var(--panel-surface-3,var(--surface-3,var(--card))) 72%, var(--foreground) 28%)",
    chipBorder: "color-mix(in oklab, var(--border) 84%, transparent)",
    accent: "var(--accent,var(--processing,var(--primary)))",
    accentForeground: "var(--accent-foreground,var(--processing-foreground,var(--foreground)))",
    accentSoft:
      "color-mix(in oklab, var(--accent,var(--processing,var(--primary))) 24%, var(--panel-surface-3,var(--surface-3,var(--card))) 76%)",
    accentBorder:
      "color-mix(in oklab, var(--accent,var(--processing,var(--primary))) 46%, transparent)",
    accentStrong:
      "color-mix(in oklab, var(--accent,var(--processing,var(--primary))) 74%, var(--foreground) 26%)",
    controlSurface:
      "color-mix(in oklab, var(--surface-2,var(--card)) 72%, var(--panel-surface-3,var(--surface-3,var(--card))) 28%)",
    controlBorder: "color-mix(in oklab, var(--border) 92%, transparent)",
    controlShadow:
      "0 1px 0 color-mix(in oklab, var(--foreground) 12%, transparent), 0 0 0 1px color-mix(in oklab, var(--foreground) 9%, transparent), var(--elevation-interactive, var(--panel-shadow-2))",
    canvasBackdrop:
      "color-mix(in oklab, var(--background) 76%, var(--panel-surface-2,var(--surface-2,var(--card))) 24%)",
    canvasStage:
      "color-mix(in oklab, var(--background) 90%, var(--panel-surface-1,var(--background)) 10%)",
    canvasTexture:
      "radial-gradient(circle at 1px 1px, color-mix(in oklab, var(--foreground) 10%, transparent) 0.72px, transparent 0.94px),radial-gradient(circle at 3px 3px, color-mix(in oklab, var(--foreground) 6%, transparent) 0.5px, transparent 0.82px)",
    canvasTextureSize: "7px 7px",
  };
}

export function getTallerLabVisualCssVars(): Record<`--taller-lab-${string}`, string> {
  const tokens = resolveTallerLabVisualTokensV1();
  return {
    "--taller-lab-workspace-top-strip": tokens.workspaceTopStrip,
    "--taller-lab-sidebar-frame": tokens.sidebarFrame,
    "--taller-lab-sidebar-card": tokens.sidebarCard,
    "--taller-lab-chip-surface": tokens.chipSurface,
    "--taller-lab-chip-border": tokens.chipBorder,
    "--taller-lab-accent": tokens.accent,
    "--taller-lab-accent-foreground": tokens.accentForeground,
    "--taller-lab-accent-soft": tokens.accentSoft,
    "--taller-lab-accent-border": tokens.accentBorder,
    "--taller-lab-accent-strong": tokens.accentStrong,
    "--taller-lab-control-surface": tokens.controlSurface,
    "--taller-lab-control-border": tokens.controlBorder,
    "--taller-lab-control-shadow": tokens.controlShadow,
    "--taller-lab-canvas-backdrop": tokens.canvasBackdrop,
    "--taller-lab-canvas-stage": tokens.canvasStage,
    "--taller-lab-canvas-texture": tokens.canvasTexture,
    "--taller-lab-canvas-texture-size": tokens.canvasTextureSize,
  };
}
