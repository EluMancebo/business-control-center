import type {
  BrandAccentStyle,
  BrandHarmonyStrategy,
  BrandTypographyPreset,
} from "@/lib/brand-theme";

type BrandThemePreviewSurfaceProps = {
  previewEnabled: boolean;
  harmony: BrandHarmonyStrategy;
  accentStyle: BrandAccentStyle;
  typographyPreset: BrandTypographyPreset;
};

export default function BrandThemePreviewSurface({
  previewEnabled,
  harmony,
  accentStyle,
  typographyPreset,
}: BrandThemePreviewSurfaceProps) {
  return (
    <section
      className={[
        "mt-4 rounded-xl border border-border bg-card p-4",
        "bg-card [background:var(--surface-2)]",
        "[font-family:var(--font-sans),system-ui,sans-serif]",
      ].join(" ")}
    >
      <header className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-foreground">Theme Preview Surface</h3>
        <span
          className={[
            "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold",
            "bg-muted text-muted-foreground",
            "[background:var(--badge-bg)] [color:var(--badge-fg)]",
          ].join(" ")}
        >
          {previewEnabled ? "Preview ON" : "Preview OFF"}
        </span>
      </header>

      <div className="rounded-xl border border-border bg-card p-4 [background:var(--surface-3)]">
        <div
          className={[
            "relative overflow-hidden rounded-xl border border-border p-4",
            "bg-muted",
            "[background:linear-gradient(140deg,var(--accent-soft),var(--background))]",
          ].join(" ")}
        >
          <div className="absolute inset-0 [background:var(--hero-overlay)]" />
          <div className="relative z-10">
            <p
              className={[
                "inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold",
                "bg-muted text-muted-foreground",
                "[background:var(--badge-bg)] [color:var(--badge-fg)]",
              ].join(" ")}
            >
              Hero / Banner sample
            </p>
            <h4 className="mt-2 text-lg font-bold text-foreground">
              Brand Theme preview en vivo
            </h4>
            <p className="mt-1 text-sm text-muted-foreground">
              Esta superficie consume los tokens resueltos del preview runtime.
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <h5 className="text-base font-semibold text-foreground">
            Typography sample: Agiliza campanas sin perder control visual
          </h5>
          <p className="text-sm text-muted-foreground">
            The quick brown fox jumps over the lazy dog. 0123456789
          </p>
          <p className="text-xs text-muted-foreground">
            harmony: <span className="font-medium text-foreground">{harmony}</span> · accentStyle:{" "}
            <span className="font-medium text-foreground">{accentStyle}</span> · typography:{" "}
            <span className="font-medium text-foreground">{typographyPreset}</span>
          </p>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            className={[
              "rounded-lg px-3 py-2 text-sm font-semibold transition-opacity hover:opacity-90",
              "bg-primary text-primary-foreground",
              "[background:var(--cta-primary)] [color:var(--cta-primary-foreground)]",
              "hover:[background:var(--cta-primary-hover)]",
            ].join(" ")}
          >
            Primary CTA
          </button>

          <button
            type="button"
            className={[
              "rounded-lg px-3 py-2 text-sm font-semibold transition-opacity hover:opacity-90",
              "bg-muted text-foreground",
              "[background:var(--cta-secondary)] [color:var(--cta-secondary-foreground)]",
              "hover:[background:var(--cta-secondary-hover)]",
            ].join(" ")}
          >
            Secondary CTA
          </button>

          <a
            href="#"
            className={[
              "text-sm font-semibold underline-offset-2 hover:underline",
              "text-primary",
              "[color:var(--link)] hover:[color:var(--link-hover)]",
            ].join(" ")}
          >
            Example link
          </a>
        </div>
      </div>
    </section>
  );
}
