import type { CSSProperties } from "react";
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

function StatusChip({ text }: { text: string }) {
  return (
    <span
      title={text}
      className="inline-flex max-w-[12rem] shrink-0 items-center truncate whitespace-nowrap rounded-full border border-border/55 bg-background/75 px-2.5 py-1 text-[11px] font-medium leading-tight text-muted-foreground shadow-[0_4px_10px_-8px_rgba(15,23,42,0.45)]"
    >
      {text}
    </span>
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
      style={previewVariables as CSSProperties}
      className={[
        "h-full rounded-xl border border-border/55 p-4 shadow-[0_14px_28px_-18px_rgba(15,23,42,0.45)]",
        "[background:color-mix(in_oklab,var(--surface-2,var(--card))_90%,white)]",
        "[font-family:var(--font-sans),system-ui,sans-serif]",
      ].join(" ")}
    >
      <header className="mb-3 min-w-0 space-y-2">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-foreground">Preview representativa</h3>
          <p className="text-xs text-muted-foreground">
            Mini web para validar contraste, atmósfera y lectura de acciones.
          </p>
        </div>

        <div className="flex min-w-0 flex-wrap items-center gap-1.5">
          <StatusChip text={previewEnabled ? "Preview ON" : "Preview OFF"} />
          <StatusChip text={`Harmony: ${harmony}`} />
          {modeLabel ? <StatusChip text={`Mode: ${modeLabel}`} /> : null}
          <StatusChip text={`Style: ${accentStyle}`} />
          <StatusChip text={`Type: ${typographyPreset}`} />
          {paletteLabel ? <StatusChip text={`Preset: ${paletteLabel}`} /> : null}
        </div>
      </header>

      <div className="mb-3 rounded-lg border border-border/55 bg-background/65 px-3 py-2 text-[11px] text-muted-foreground shadow-[0_8px_18px_-16px_rgba(15,23,42,0.45)]">
        <p>{presetRoleLabel ?? "Preset modula superficies y atmósfera sin reemplazar la seed."}</p>
        <p className="mt-0.5">
          Intensidad visible del preset:{" "}
          <span className="font-semibold text-foreground">{presetModulationPercent}%</span>
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-border/55 shadow-[0_14px_30px_-22px_rgba(15,23,42,0.55),inset_0_1px_0_rgba(255,255,255,0.14)] [background:var(--background)]">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/45 px-4 py-2 [background:var(--surface-2,var(--card))]">
          <p className="text-xs font-semibold text-foreground">Web pública (simulación)</p>
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
            <span className="rounded-full border border-border/55 bg-background/80 px-2 py-0.5">Inicio</span>
            <span className="rounded-full border border-border/55 bg-background/80 px-2 py-0.5">Servicios</span>
            <span className="rounded-full border border-border/55 bg-background/80 px-2 py-0.5">Contacto</span>
          </div>
        </div>

        <div
          className={[
            "grid gap-3 p-3",
            showCompositionPanel
              ? "xl:grid-cols-[minmax(0,1.55fr)_minmax(240px,0.85fr)]"
              : "grid-cols-1",
          ].join(" ")}
        >
          <div
            className={[
              "grid min-w-0 gap-3 grid-rows-[auto_auto_auto_auto]",
              showCompositionPanel ? "min-h-[420px]" : "min-h-[360px]",
            ].join(" ")}
          >
            <article className="rounded-lg border border-border/55 shadow-[0_12px_26px_-18px_rgba(15,23,42,0.45)] [background:linear-gradient(150deg,var(--accent-soft),var(--background))]">
              <div className="border-b border-border/45 p-4">
                <span className="inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold [background:var(--badge-bg)] [color:var(--badge-fg)]">
                  Hero / Banner
                </span>
                <h4 className="mt-2 text-xl font-semibold text-foreground">Dirección cromática aplicada</h4>
                <p className="mt-1 text-sm text-muted-foreground">
                  Lectura rápida de contraste, jerarquía y tono visual para decidir branding.
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    className="rounded-lg px-3 py-2 text-sm font-semibold shadow-sm transition [background:var(--cta-primary)] [color:var(--cta-primary-foreground)] hover:[background:var(--cta-primary-hover)]"
                  >
                    Primary CTA
                  </button>
                  <button
                    type="button"
                    className="rounded-lg px-3 py-2 text-sm font-semibold shadow-sm transition [background:var(--cta-secondary)] [color:var(--cta-secondary-foreground)] hover:[background:var(--cta-secondary-hover)]"
                  >
                    Secondary CTA
                  </button>
                  <a
                    href="#"
                    className="text-sm font-semibold underline-offset-2 transition hover:underline [color:var(--link)] hover:[color:var(--link-hover)]"
                  >
                    Example link
                  </a>
                </div>
              </div>

              <div className="grid gap-2 p-3 sm:grid-cols-2">
                <div className="rounded-md border border-border/55 p-2 shadow-[0_8px_18px_-16px_rgba(15,23,42,0.5)] [background:var(--surface-2,var(--card))]">
                  <p className="text-[11px] font-semibold text-foreground">Card destacada</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Superficie de contenido principal.
                  </p>
                </div>
                <div className="rounded-md border border-border/55 p-2 shadow-[0_8px_18px_-16px_rgba(15,23,42,0.5)] [background:var(--card)] [color:var(--card-foreground)]">
                  <p className="text-[11px] font-semibold text-foreground">Sección secundaria</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Bloque elevado con legibilidad robusta.
                  </p>
                </div>
              </div>
            </article>

            <section className="rounded-lg border border-border/55 p-3 shadow-[0_10px_20px_-16px_rgba(15,23,42,0.45)] [background:var(--surface-2,var(--card))]">
              <p className="text-xs font-semibold text-foreground">Franja de listado / carrusel</p>
              <div className="mt-2 grid gap-2 sm:grid-cols-3">
                <div className="rounded-md border border-border/55 p-2 [background:var(--surface-3,var(--card))]">
                  <p className="text-[11px] font-semibold text-foreground">Item 1</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">surface3 + border</p>
                </div>
                <div className="rounded-md border border-border/55 p-2 [background:var(--surface-3,var(--card))]">
                  <p className="text-[11px] font-semibold text-foreground">Item 2</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">accent de apoyo</p>
                </div>
                <div className="rounded-md border border-border/55 p-2 [background:var(--surface-3,var(--card))]">
                  <p className="text-[11px] font-semibold text-foreground">Item 3</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">link y hover</p>
                </div>
              </div>
            </section>

            <footer className="rounded-lg border border-border/55 p-3 shadow-[0_10px_20px_-16px_rgba(15,23,42,0.45)] [background:var(--surface-2,var(--card))]">
              <p className="text-xs font-semibold text-foreground">Footer</p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Cierre visual para validar continuidad de superficies y contraste global.
              </p>
            </footer>
          </div>

          {showCompositionPanel ? (
            <aside className="min-w-0 rounded-lg border border-border/55 p-3 shadow-[0_10px_20px_-16px_rgba(15,23,42,0.45)] [background:var(--surface-2,var(--card))]">
              <p className="text-xs font-semibold text-muted-foreground">Composición cromática visible</p>
              <div className="mt-2 grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
                {signalSwatches.map((item) => (
                  <div
                    key={`${item.label}-${item.value}`}
                    className="min-w-0 rounded-md border border-border/55 bg-background/75 p-2"
                  >
                    <span
                      aria-hidden
                      className="mb-1 inline-flex h-4 w-full rounded border border-border/55"
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
