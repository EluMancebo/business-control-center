import { useState, type CSSProperties } from "react";
import type {
  BrandAccentStyle,
  BrandHarmonyStrategy,
  BrandSemanticTokens,
  BrandTypographyPreset,
} from "@/lib/brand-theme";

type BrandThemePreviewSurfaceProps = {
  previewEnabled: boolean;
  harmony: BrandHarmonyStrategy;
  accentStyle: BrandAccentStyle;
  typographyPreset: BrandTypographyPreset;
  showCompositionPanel?: boolean;
  modeLabel?: string;
  paletteLabel?: string;
  presetRoleLabel?: string;
  presetModulationPercent?: number;
  previewVariables: Record<string, string>;
  resolvedTokens: BrandSemanticTokens;
};

type SignalSwatch = {
  label: string;
  value: string;
};

type PreviewMode = "hero" | "card" | "promo" | "popup";

const PREVIEW_MODE_OPTIONS: Array<{ key: PreviewMode; label: string }> = [
  { key: "hero", label: "Hero" },
  { key: "card", label: "Card" },
  { key: "promo", label: "Promo" },
  { key: "popup", label: "Popup" },
];

const PREVIEW_SURFACE_SEMANTIC_VARS: Record<`--preview-${string}`, string> = {
  "--preview-background": "var(--background)",
  "--preview-surface":
    "color-mix(in oklab, var(--background) 82%, var(--surface-2,var(--card)))",
  "--preview-card":
    "color-mix(in oklab, var(--surface-2,var(--card)) 44%, var(--surface-3,var(--muted)))",
  "--preview-panel":
    "color-mix(in oklab, var(--surface-3,var(--muted)) 82%, var(--border))",
  "--preview-popover":
    "color-mix(in oklab, var(--surface-3,var(--muted)) 68%, var(--border))",
  "--preview-border": "color-mix(in oklab, var(--border) 56%, transparent)",
};

const PREVIEW_SURFACE_SCALE: Array<{ label: string; token: string }> = [
  { label: "Background", token: "var(--preview-background)" },
  { label: "Surface", token: "var(--preview-surface)" },
  { label: "Card", token: "var(--preview-card)" },
  { label: "Panel", token: "var(--preview-panel)" },
  { label: "Popover", token: "var(--preview-popover)" },
];

const INTERACTIVE_CONTROL_CLASS =
  "transition-all duration-200 hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 [focus-visible:ring-color:var(--ring)] focus-visible:ring-offset-2 [focus-visible:ring-offset-color:var(--preview-card)]";

function StatusChip({ text }: { text: string }) {
  return (
    <span
      title={text}
      className="inline-flex max-w-[12rem] shrink-0 items-center truncate whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-medium leading-tight text-muted-foreground shadow-[0_4px_10px_-8px_rgba(15,23,42,0.45)] [border-color:var(--preview-border)] [background:var(--preview-popover)]"
    >
      {text}
    </span>
  );
}

function DiagnosticActionStates() {
  return (
    <div className="mt-3 grid gap-2 lg:grid-cols-2">
      <div className="rounded-md border p-2 [border-color:var(--preview-border)] [background:var(--preview-popover)]">
        <p className="text-[11px] font-semibold text-foreground">CTA primario</p>
        <div className="mt-1 flex flex-wrap gap-1.5">
          <button
            type="button"
            className="rounded-md px-2.5 py-1.5 text-[11px] font-semibold [background:var(--cta-primary)] [color:var(--cta-primary-foreground)]"
          >
            Default
          </button>
          <button
            type="button"
            className="-translate-y-px rounded-md px-2.5 py-1.5 text-[11px] font-semibold [background:var(--cta-primary-hover)] [color:var(--cta-primary-foreground)]"
          >
            Hover
          </button>
          <button
            type="button"
            className="rounded-md px-2.5 py-1.5 text-[11px] font-semibold opacity-95 [background:var(--cta-primary-hover)] [color:var(--cta-primary-foreground)]"
          >
            Active
          </button>
          <button
            type="button"
            className="rounded-md px-2.5 py-1.5 text-[11px] font-semibold ring-2 [background:var(--cta-primary)] [color:var(--cta-primary-foreground)] [ring-color:var(--ring)] ring-offset-2 [ring-offset-color:var(--preview-popover)]"
          >
            Focus
          </button>
        </div>
      </div>

      <div className="rounded-md border p-2 [border-color:var(--preview-border)] [background:var(--preview-popover)]">
        <p className="text-[11px] font-semibold text-foreground">CTA secundario</p>
        <div className="mt-1 flex flex-wrap gap-1.5">
          <button
            type="button"
            className="rounded-md px-2.5 py-1.5 text-[11px] font-semibold [background:var(--cta-secondary)] [color:var(--cta-secondary-foreground)]"
          >
            Default
          </button>
          <button
            type="button"
            className="-translate-y-px rounded-md px-2.5 py-1.5 text-[11px] font-semibold [background:var(--cta-secondary-hover)] [color:var(--cta-secondary-foreground)]"
          >
            Hover
          </button>
          <button
            type="button"
            className="rounded-md px-2.5 py-1.5 text-[11px] font-semibold opacity-95 [background:var(--cta-secondary-hover)] [color:var(--cta-secondary-foreground)]"
          >
            Active
          </button>
          <button
            type="button"
            className="rounded-md px-2.5 py-1.5 text-[11px] font-semibold ring-2 [background:var(--cta-secondary)] [color:var(--cta-secondary-foreground)] [ring-color:var(--ring)] ring-offset-2 [ring-offset-color:var(--preview-popover)]"
          >
            Focus
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BrandThemePreviewSurface({
  previewEnabled,
  harmony,
  accentStyle,
  typographyPreset,
  showCompositionPanel = true,
  modeLabel,
  paletteLabel,
  presetRoleLabel,
  presetModulationPercent = 0,
  previewVariables,
  resolvedTokens,
}: BrandThemePreviewSurfaceProps) {
  const [previewMode, setPreviewMode] = useState<PreviewMode>("hero");
  const showDiagnosticLayer = previewEnabled;
  const showDiagnosticCompositionPanel = showCompositionPanel && showDiagnosticLayer;
  const compactDiagnosticHeader = showDiagnosticCompositionPanel;
  const previewSemanticVars = {
    ...(previewVariables as Record<string, string>),
    ...PREVIEW_SURFACE_SEMANTIC_VARS,
  } as CSSProperties;
  const contextMetaChipClass = [
    "rounded-full border [border-color:var(--preview-border)] [background:var(--preview-popover)]",
    compactDiagnosticHeader ? "px-1.5 py-px" : "px-2 py-0.5",
  ].join(" ");

  const signalSwatches: SignalSwatch[] = [
    { label: "Primary", value: resolvedTokens.primary },
    { label: "Accent", value: resolvedTokens.accent },
    { label: "Accent strong", value: resolvedTokens.accentStrong },
    { label: "Link", value: resolvedTokens.link },
    { label: "Surface 2", value: resolvedTokens.surface2 },
    { label: "Surface 3", value: resolvedTokens.surface3 },
    { label: "Card", value: resolvedTokens.card },
  ];

  return (
    <section
      style={previewSemanticVars}
      className={[
        "h-full rounded-xl border p-4 shadow-[0_14px_28px_-18px_rgba(15,23,42,0.45)]",
        "[border-color:var(--preview-border)]",
        "[background:var(--preview-surface)]",
        "[font-family:var(--font-sans),system-ui,sans-serif]",
      ].join(" ")}
    >
      <header className="mb-3 min-w-0 space-y-2">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-foreground">Preview por contexto</h3>
          <p className="text-xs text-muted-foreground">
            Valida la paleta en Hero, Card, Promo y Popup sin salir de Brand Lab.
          </p>
        </div>

        <div className="flex min-w-0 flex-wrap items-center gap-1.5">
          <StatusChip text={showDiagnosticLayer ? "Diagnóstico ON" : "Diagnóstico OFF"} />
          <StatusChip text={`Harmony: ${harmony}`} />
          {modeLabel ? <StatusChip text={`Mode: ${modeLabel}`} /> : null}
          <StatusChip text={`Style: ${accentStyle}`} />
          <StatusChip text={`Type: ${typographyPreset}`} />
          {paletteLabel ? <StatusChip text={`Preset: ${paletteLabel}`} /> : null}
        </div>
        {!showDiagnosticLayer ? (
          <p className="text-[11px] text-muted-foreground">
            Vista operativa: muestra salida final del sistema. Activa diagnóstico para capas auxiliares.
          </p>
        ) : null}

        <div className="overflow-x-auto">
          <div className="inline-flex min-w-full gap-1 rounded-lg border p-1 [border-color:var(--preview-border)] [background:var(--preview-panel)]">
            {PREVIEW_MODE_OPTIONS.map((item) => {
              const selected = item.key === previewMode;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setPreviewMode(item.key)}
                  aria-pressed={selected}
                  className={[
                    "h-9 min-w-[84px] flex-1 rounded-md px-3 text-xs font-semibold",
                    INTERACTIVE_CONTROL_CLASS,
                    selected
                      ? "bg-primary text-primary-foreground shadow-[0_8px_16px_-12px_rgba(37,99,235,0.55)]"
                      : "[background:var(--preview-popover)] text-foreground hover:[background:var(--preview-panel)]",
                  ].join(" ")}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {!showDiagnosticLayer ? (
        <div className="mb-3 rounded-lg border px-3 py-2 text-[11px] text-muted-foreground shadow-[0_8px_18px_-16px_rgba(15,23,42,0.45)] [border-color:var(--preview-border)] [background:var(--preview-popover)]">
          <p>{presetRoleLabel ?? "Preset modula superficies y atmósfera sin reemplazar la seed."}</p>
          <p className="mt-0.5">
            Intensidad visible del preset:{" "}
            <span className="font-semibold text-foreground">{presetModulationPercent}%</span>
          </p>
        </div>
      ) : null}

      {showDiagnosticLayer ? (
        <section
          className={[
            "rounded-lg border p-3 [border-color:var(--preview-border)] [background:var(--preview-popover)]",
            showDiagnosticCompositionPanel ? "mb-2" : "mb-3",
          ].join(" ")}
        >
          <p className="text-[11px] font-semibold text-foreground">Escala de superficies (diagnóstico)</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-5">
            {PREVIEW_SURFACE_SCALE.map((item) => (
              <div
                key={item.label}
                className="rounded-md border p-1.5 [border-color:var(--preview-border)] [background:var(--preview-surface)]"
              >
                <span
                  aria-hidden
                  className="mb-1 inline-flex h-5 w-full rounded border [border-color:var(--preview-border)]"
                  style={{ background: item.token }}
                />
                <p className="text-[10px] font-semibold leading-tight text-foreground">{item.label}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <div className="overflow-hidden rounded-xl border shadow-[0_14px_30px_-22px_rgba(15,23,42,0.55),inset_0_1px_0_rgba(255,255,255,0.14)] [border-color:var(--preview-border)] [background:var(--preview-background)]">
        <div
          className={[
            "flex flex-wrap items-center justify-between border-b [border-color:var(--preview-border)] [background:var(--preview-surface)]",
            compactDiagnosticHeader ? "gap-1.5 px-3 py-1.5" : "gap-2 px-4 py-2",
          ].join(" ")}
        >
          <p className="text-xs font-semibold text-foreground">Contexto: {previewMode.toUpperCase()}</p>
          <div
            className={[
              "flex flex-wrap items-center text-muted-foreground",
              compactDiagnosticHeader ? "gap-1 text-[10px]" : "gap-2 text-[11px]",
            ].join(" ")}
          >
            <span className={contextMetaChipClass}>Contraste</span>
            <span className={contextMetaChipClass}>Jerarquía</span>
            <span className={contextMetaChipClass}>Acción</span>
          </div>
        </div>

        <div
          className={[
            compactDiagnosticHeader ? "grid gap-3 px-4 pb-4 pt-3" : "grid gap-4 p-4",
            showDiagnosticCompositionPanel
              ? "lg:grid-cols-[minmax(0,1.92fr)_minmax(184px,0.52fr)]"
              : "grid-cols-1",
          ].join(" ")}
        >
          <div className={["grid min-w-0 gap-4", showDiagnosticCompositionPanel ? "min-h-[438px]" : "min-h-[420px]"].join(" ")}>
            {previewMode === "hero" ? (
              <article className="rounded-lg border shadow-[0_12px_26px_-18px_rgba(15,23,42,0.45)] [border-color:var(--preview-border)] [background:linear-gradient(150deg,var(--accent-soft),var(--preview-background))]">
                <div className="border-b p-4 [border-color:var(--preview-border)]">
                  <span className="inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold [background:var(--badge-bg)] [color:var(--badge-fg)]">
                    Hero
                  </span>
                  <h4 className="mt-2 text-xl font-semibold text-foreground">Mensaje principal del negocio</h4>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Evaluación rápida del hero para contraste y prioridad visual.
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      className={`rounded-lg px-3 py-2 text-sm font-semibold shadow-sm [background:var(--cta-primary)] [color:var(--cta-primary-foreground)] hover:[background:var(--cta-primary-hover)] ${INTERACTIVE_CONTROL_CLASS}`}
                    >
                      Reservar
                    </button>
                    <button
                      type="button"
                      className={`rounded-lg px-3 py-2 text-sm font-semibold shadow-sm [background:var(--cta-secondary)] [color:var(--cta-secondary-foreground)] hover:[background:var(--cta-secondary-hover)] ${INTERACTIVE_CONTROL_CLASS}`}
                    >
                      Ver servicios
                    </button>
                  </div>
                </div>
                <div className="grid gap-2 p-3 sm:grid-cols-2">
                  <div className="rounded-md border p-2 [border-color:var(--preview-border)] [background:var(--preview-surface)]">
                    <p className="text-[11px] font-semibold text-foreground">Bloque destacado</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">Superficie principal de apoyo.</p>
                  </div>
                  <div className="rounded-md border p-2 [border-color:var(--preview-border)] [background:var(--preview-card)] [color:var(--card-foreground)]">
                    <p className="text-[11px] font-semibold text-foreground">Bloque secundario</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">Legibilidad en capas altas.</p>
                  </div>
                </div>
                {showDiagnosticLayer ? <DiagnosticActionStates /> : null}
              </article>
            ) : null}

            {previewMode === "card" ? (
              <section className="rounded-lg border p-4 shadow-[0_10px_20px_-16px_rgba(15,23,42,0.45)] [border-color:var(--preview-border)] [background:var(--preview-surface)]">
                <p className="text-xs font-semibold text-foreground">Card list</p>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  <article className="rounded-md border p-3 [border-color:var(--preview-border)] [background:var(--preview-card)] transition-all duration-200 hover:-translate-y-px hover:[background:var(--preview-popover)]">
                    <p className="text-xs font-semibold text-foreground">Card principal</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">Texto base sobre card.</p>
                    <a href="#" className="mt-2 inline-flex text-[11px] font-semibold [color:var(--link)] transition-colors hover:[color:var(--link-hover)]">
                      Ver detalle
                    </a>
                  </article>
                  <article className="rounded-md border p-3 [border-color:var(--preview-border)] [background:var(--preview-panel)] transition-all duration-200 hover:-translate-y-px hover:[background:var(--preview-popover)]">
                    <p className="text-xs font-semibold text-foreground">Card secundaria</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">Prueba de superficies y borde.</p>
                    <button
                      type="button"
                      className={`mt-2 rounded-md px-2.5 py-1 text-[11px] font-semibold [background:var(--cta-secondary)] [color:var(--cta-secondary-foreground)] hover:[background:var(--cta-secondary-hover)] ${INTERACTIVE_CONTROL_CLASS}`}
                    >
                      Acción
                    </button>
                  </article>
                  <article className="rounded-md border p-3 sm:col-span-2 [border-color:var(--preview-border)] [background:var(--preview-card)]">
                    <p className="text-xs font-semibold text-foreground">Card horizontal</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      Comprobación de lectura en layout de lista.
                    </p>
                  </article>
                </div>
                {showDiagnosticLayer ? <DiagnosticActionStates /> : null}
              </section>
            ) : null}

            {previewMode === "promo" ? (
              <article className="overflow-hidden rounded-lg border shadow-[0_10px_20px_-16px_rgba(15,23,42,0.45)] [border-color:var(--preview-border)] [background:var(--preview-card)]">
                <div className="border-b p-4 [border-color:var(--preview-border)] [background:linear-gradient(120deg,var(--accent-soft),var(--preview-background))]">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Promo activa
                  </p>
                  <h4 className="mt-1 text-lg font-semibold text-foreground">Oferta destacada de temporada</h4>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Validación visual de banner promocional con CTA principal.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 p-3">
                  <button
                    type="button"
                    className={`rounded-md px-3 py-1.5 text-xs font-semibold [background:var(--cta-primary)] [color:var(--cta-primary-foreground)] hover:[background:var(--cta-primary-hover)] ${INTERACTIVE_CONTROL_CLASS}`}
                  >
                    Activar promo
                  </button>
                  <button
                    type="button"
                    className={`rounded-md px-3 py-1.5 text-xs font-semibold [background:var(--cta-secondary)] [color:var(--cta-secondary-foreground)] hover:[background:var(--cta-secondary-hover)] ${INTERACTIVE_CONTROL_CLASS}`}
                  >
                    Ver condiciones
                  </button>
                </div>
                <div className="px-3 pb-3">
                  {showDiagnosticLayer ? <DiagnosticActionStates /> : null}
                </div>
              </article>
            ) : null}

            {previewMode === "popup" ? (
              <section className="rounded-lg border p-3 [border-color:var(--preview-border)] [background:var(--preview-surface)]">
                <p className="text-xs font-semibold text-foreground">Popup modal</p>
                <div className="mt-2 rounded-md border p-4 [border-color:var(--preview-border)] [background:var(--preview-panel)]">
                  <div className="mx-auto max-w-sm rounded-lg border p-3 [border-color:var(--preview-border)] [background:var(--preview-card)]">
                    <p className="text-xs font-semibold text-foreground">Nuevo lead</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      Popup para captar interés con contraste de primer plano.
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                      <button
                        type="button"
                        className={`rounded-md px-2.5 py-1.5 text-[11px] font-semibold [background:var(--cta-primary)] [color:var(--cta-primary-foreground)] hover:[background:var(--cta-primary-hover)] ${INTERACTIVE_CONTROL_CLASS}`}
                      >
                        Confirmar
                      </button>
                      <button
                        type="button"
                        className={`rounded-md border px-2.5 py-1.5 text-[11px] font-semibold text-foreground [border-color:var(--preview-border)] [background:var(--preview-popover)] hover:[background:var(--preview-panel)] ${INTERACTIVE_CONTROL_CLASS}`}
                      >
                        Cerrar
                      </button>
                    </div>
                    {showDiagnosticLayer ? <DiagnosticActionStates /> : null}
                  </div>
                </div>
              </section>
            ) : null}
          </div>

          {showDiagnosticCompositionPanel ? (
            <aside className="min-w-0 self-start rounded-lg border p-2.5 shadow-[0_8px_14px_-16px_rgba(15,23,42,0.38)] [border-color:var(--preview-border)] [background:var(--preview-popover)]">
              <p className="text-xs font-semibold text-muted-foreground">Composición cromática visible</p>
              <div className="mt-2 grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
                {signalSwatches.map((item) => (
                  <div
                    key={`${item.label}-${item.value}`}
                    className="min-w-0 rounded-md border p-1.5 [border-color:var(--preview-border)] [background:var(--preview-surface)]"
                  >
                    <span
                      aria-hidden
                      className="mb-1 inline-flex h-4 w-full rounded border [border-color:var(--preview-border)]"
                      style={{ backgroundColor: item.value }}
                    />
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-foreground">{item.label}</p>
                    <p
                      title={item.value}
                      className="truncate font-mono text-[10px] leading-tight text-muted-foreground"
                    >
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </aside>
          ) : null}
        </div>
      </div>
    </section>
  );
}
