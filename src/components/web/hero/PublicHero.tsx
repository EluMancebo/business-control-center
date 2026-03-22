// src/components/web/hero/PublicHero.tsx
import React from "react";
import CreatedByMini from "@/components/footer/CreatedByMini";

export type HeroData = {
  badge?: string;
  title?: string;
  description?: string;

  primaryCtaLabel?: string;
  primaryCtaHref?: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;

  backgroundImageUrl?: string;
  logoUrl?: string;
  logoSvg?: string;
};

export type BusinessPublic = {
  name?: string;
  slug: string;
  activeHeroVariantKey?: string;
  logoUrl?: string;
};

type PublicHeroProps = {
  data: HeroData;
  business?: BusinessPublic;
};

function normalizeAssetUrl(url?: string): string | undefined {
  if (typeof url !== "string") return undefined;
  const u = url.trim();
  if (!u) return undefined;

  if (
    u.startsWith("http://") ||
    u.startsWith("https://") ||
    u.startsWith("blob:") ||
    u.startsWith("data:")
  ) {
    return u;
  }

  if (u.startsWith("/")) return u;
  return `/${u}`;
}

function splitTitleForAccent(raw: string): { lead: string; accent?: string } {
  const t = String(raw ?? "").trim();
  if (!t) return { lead: "" };

  const idx = t.indexOf(".");
  if (idx === -1) return { lead: t };

  const lead = t.slice(0, idx + 1).trim();
  const rest = t.slice(idx + 1).trim();
  if (!rest) return { lead };

  return { lead, accent: rest };
}

function Pill({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={[
        "inline-flex items-center rounded-full px-3 py-1 text-xs",
        "[background:var(--hero-overlay,rgba(0,0,0,0.28))] [color:var(--text-inverse,#ffffff)]",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

function FooterInlineItem({ icon, text }: { icon: string; text: string }) {
  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap text-xs [color:color-mix(in_oklab,var(--text-inverse,#ffffff)_85%,transparent)]">
      <span aria-hidden="true">{icon}</span>
      <span>{text}</span>
    </span>
  );
}

export default function PublicHero({ data, business }: PublicHeroProps) {
  const titleRaw = data.title ?? "El centro de mando de tu negocio";
  const { lead: titleLead, accent: titleAccent } = splitTitleForAccent(titleRaw);

  const subtitle =
    data.description ??
    "Publica ofertas, popups, heros por eventos, campañas y recordatorios.";

  const badge = data.badge ?? "Barbería Premium";

  // ✅ CLAVES REALES (coinciden con HeroConfig)
  const cta1 = (data.primaryCtaLabel as string) ?? "Pedir cita";
  const cta2 = (data.secondaryCtaLabel as string)?? "Servicios";
  const href1 = (data.primaryCtaHref as string) ?? "#";
  const href2 = (data.secondaryCtaHref as string) ?? "#";

  const bg = normalizeAssetUrl(data.backgroundImageUrl);

  const headerLogoUrl = normalizeAssetUrl(business?.logoUrl) ?? normalizeAssetUrl(data.logoUrl);
  const heroLogoUrl = normalizeAssetUrl(data.logoUrl) ?? normalizeAssetUrl(business?.logoUrl);

  return (
    <section className="relative min-h-svh w-full overflow-hidden">
      {bg ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={bg} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 [background:var(--hero-overlay-strong,rgba(0,0,0,0.6))]" />
        </>
      ) : (
        <div className="absolute inset-0 [background:linear-gradient(to_bottom,var(--hero-overlay-strong,rgba(0,0,0,0.64)),var(--hero-overlay,rgba(0,0,0,0.42)),var(--hero-overlay-strong,rgba(0,0,0,0.64)))]" />
      )}

      <div className="relative z-10 mx-auto flex min-h-svh w-full max-w-6xl flex-col px-6">
        <header className="flex items-center justify-between pt-5">
          <div className="flex items-center gap-3">
            {headerLogoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={headerLogoUrl}
                alt={business?.name ?? "Logo"}
                className="h-11 w-auto opacity-95 sm:h-12"
              />
            ) : null}

            <div className="hidden text-sm font-semibold [color:color-mix(in_oklab,var(--text-inverse,#ffffff)_90%,transparent)] sm:block">
              {business?.name ?? "Business Control Center"}
            </div>
          </div>

          <nav className="hidden items-center gap-3 md:flex">
            <a
              href="#"
              className="rounded-full px-4 py-2 text-xs font-semibold transition [background:var(--hero-overlay,rgba(0,0,0,0.28))] [color:color-mix(in_oklab,var(--text-inverse,#ffffff)_86%,transparent)] hover:[background:var(--hero-overlay-strong,rgba(0,0,0,0.5))]"
            >
              Home
            </a>
            <a
              href="#"
              className="rounded-full px-4 py-2 text-xs font-semibold transition [background:var(--hero-overlay,rgba(0,0,0,0.28))] [color:color-mix(in_oklab,var(--text-inverse,#ffffff)_86%,transparent)] hover:[background:var(--hero-overlay-strong,rgba(0,0,0,0.5))]"
            >
              Services
            </a>
            <a
              href="#"
              className="rounded-full px-4 py-2 text-xs font-semibold transition [background:var(--hero-overlay,rgba(0,0,0,0.28))] [color:color-mix(in_oklab,var(--text-inverse,#ffffff)_86%,transparent)] hover:[background:var(--hero-overlay-strong,rgba(0,0,0,0.5))]"
            >
              Contact
            </a>
          </nav>

          <div className="md:hidden">
            <input id="bcc-mobile-menu" type="checkbox" className="peer sr-only" />

            <label
              htmlFor="bcc-mobile-menu"
              className="cursor-pointer rounded-xl p-2 transition [background:var(--hero-overlay,rgba(0,0,0,0.28))] hover:[background:var(--hero-overlay-strong,rgba(0,0,0,0.5))]"
              aria-label="Abrir menú"
            >
              <span className="block h-0.5 w-6 [background:var(--text-inverse,#ffffff)]" />
              <span className="mt-1 block h-0.5 w-6 [background:var(--text-inverse,#ffffff)]" />
              <span className="mt-1 block h-0.5 w-6 [background:var(--text-inverse,#ffffff)]" />
            </label>

            <label
              htmlFor="bcc-mobile-menu"
              className="pointer-events-none fixed inset-0 z-40 opacity-0 transition-opacity duration-500 peer-checked:pointer-events-auto peer-checked:opacity-100 [background:var(--hero-overlay-strong,rgba(0,0,0,0.55))]"
              aria-label="Cerrar menú"
            />

            <div className="fixed inset-y-0 right-0 z-50 w-64 translate-x-full p-4 shadow-2xl transition-transform duration-700 ease-out peer-checked:translate-x-0 [background:color-mix(in_oklab,var(--hero-overlay-strong,rgba(0,0,0,0.7))_88%,black)] [color:var(--text-inverse,#ffffff)]">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold">{business?.name ?? "Menú"}</div>

                <label
                  htmlFor="bcc-mobile-menu"
                  className="cursor-pointer rounded-lg px-3 py-1 text-xs transition [background:var(--hero-overlay,rgba(0,0,0,0.28))] hover:[background:var(--hero-overlay-strong,rgba(0,0,0,0.5))]"
                >
                  Cerrar
                </label>
              </div>

              <div className="mt-4 space-y-2">
                <a href="#" className="block rounded-xl px-3 py-2 transition hover:[background:var(--hero-overlay,rgba(0,0,0,0.28))]">
                  Home
                </a>
                <a href="#" className="block rounded-xl px-3 py-2 transition hover:[background:var(--hero-overlay,rgba(0,0,0,0.28))]">
                  Services
                </a>
                <a href="#" className="block rounded-xl px-3 py-2 transition hover:[background:var(--hero-overlay,rgba(0,0,0,0.28))]">
                  Contact
                </a>
              </div>
            </div>
          </div>
        </header>

        <main className="min-h-0 flex-1 pt-5 pb-36 md:pb-0">
          <div className="grid grid-cols-1 items-center gap-5 md:grid-cols-2 md:gap-8">
            <div className="max-w-xl">
              <Pill className="mb-3">{badge}</Pill>

              <h1 className="text-balance text-3xl font-extrabold leading-[1.02] tracking-tight [color:var(--text-inverse,#ffffff)] sm:text-5xl md:text-6xl">
                <span>{titleLead || titleRaw}</span>
                {titleAccent ? (
                  <>
                    <br />
                    <span className="text-primary">{titleAccent}</span>
                  </>
                ) : null}
              </h1>

              <div className="mt-1.6 md:hidden">
                <div className="relative mx-auto flex aspect-16/7 w-full max-w-sm items-center justify-center rounded-3xl [background:var(--hero-overlay,rgba(0,0,0,0.22))]">
                  {heroLogoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={heroLogoUrl}
                      alt={business?.name ?? "Logo"}
                      className="max-h-32 w-auto opacity-95"
                    />
                  ) : (
                    <div className="text-center [color:color-mix(in_oklab,var(--text-inverse,#ffffff)_80%,transparent)]">
                      <div className="text-sm">Logo principal</div>
                      <div className="mt-2 text-xs [color:color-mix(in_oklab,var(--text-inverse,#ffffff)_50%,transparent)]">(pendiente de asset)</div>
                    </div>
                  )}
                </div>
              </div>

              <p className="mt-0.6 max-w-lg rounded-xl px-3 py-2 text-[13px] leading-snug md:hidden [background:var(--hero-overlay,rgba(0,0,0,0.22))] [color:color-mix(in_oklab,var(--text-inverse,#ffffff)_86%,transparent)]">
                {subtitle}
              </p>

              <div className="mt-4  mb-6 grid grid-cols-2 gap-3 md:hidden">
                <a
                  href={href1}
                  className="inline-flex w-full items-center justify-center rounded-xl px-3 py-2 text-xs font-semibold transition [background:var(--cta-primary,var(--primary))] [color:var(--cta-primary-foreground,var(--primary-foreground))] hover:[background:var(--cta-primary-hover,var(--primary))]"
                >
                  {cta1}
                </a>

                <a
                  href={href2}
                  className="inline-flex w-full items-center justify-center rounded-xl px-3 py-2 text-xs font-semibold transition [background:var(--cta-secondary,var(--secondary,var(--background)))] [color:var(--cta-secondary-foreground,var(--foreground))] hover:[background:var(--cta-secondary-hover,var(--muted))]"
                >
                  {cta2}
                </a>
              </div>

              <p className="mt-3 hidden max-w-lg text-sm sm:text-base md:block md:text-lg [color:color-mix(in_oklab,var(--text-inverse,#ffffff)_82%,transparent)]">
                {subtitle}
              </p>

              <div className="mt-5 hidden flex-wrap items-center gap-3 md:flex">
                <a
                  href={href1}
                  className="inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold transition [background:var(--cta-primary,var(--primary))] [color:var(--cta-primary-foreground,var(--primary-foreground))] hover:[background:var(--cta-primary-hover,var(--primary))]"
                >
                  {cta1}
                </a>

                <a
                  href={href2}
                  className="inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold transition [background:var(--cta-secondary,var(--secondary,var(--background)))] [color:var(--cta-secondary-foreground,var(--foreground))] hover:[background:var(--cta-secondary-hover,var(--muted))]"
                >
                  {cta2}
                </a>
              </div>
            </div>

            <div className="mx-auto hidden w-full max-w-md md:block md:max-w-xl">
              <div className="relative mx-auto flex aspect-16/7 w-full items-center justify-center rounded-[28px] [background:var(--hero-overlay,rgba(0,0,0,0.22))] sm:aspect-video md:aspect-16/10">
                {heroLogoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={heroLogoUrl}
                    alt={business?.name ?? "Logo"}
                    className="max-h-44 w-auto opacity-95 md:max-h-65"
                  />
                ) : (
                  <div className="text-center [color:color-mix(in_oklab,var(--text-inverse,#ffffff)_80%,transparent)]">
                    <div className="text-sm">Logo principal</div>
                    <div className="mt-2 text-xs [color:color-mix(in_oklab,var(--text-inverse,#ffffff)_50%,transparent)]">(pendiente de asset)</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>

        <footer className="mt-auto pb-3">
          <div className="rounded-2xl px-4 py-3 [background:var(--hero-overlay,rgba(0,0,0,0.22))] [color:color-mix(in_oklab,var(--text-inverse,#ffffff)_85%,transparent)]">
            <div className="mx-auto flex max-w-5xl flex-col items-center gap-2 md:flex-row md:justify-center md:gap-6">
              <div className="grid w-full max-w-md grid-cols-2 gap-x-4 gap-y-2 md:hidden">
                <div className="flex justify-center">
                  <FooterInlineItem icon="📍" text="Dirección (pendiente)" />
                </div>
                <div className="flex justify-center">
                  <FooterInlineItem icon="☎️" text="Teléfono" />
                </div>
                <div className="flex justify-center">
                  <FooterInlineItem icon="💬" text="WhatsApp" />
                </div>
                <div className="flex justify-center">
                  <FooterInlineItem icon="✉️" text="email@cliente.com" />
                </div>
              </div>

              <div className="hidden flex-wrap items-center justify-center gap-6 md:flex">
                <FooterInlineItem icon="📍" text="Dirección (pendiente)" />
                <FooterInlineItem icon="☎️" text="Teléfono" />
                <FooterInlineItem icon="💬" text="WhatsApp" />
                <FooterInlineItem icon="✉️" text="email@cliente.com" />
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between gap-3 text-[11px] md:text-xs">
              <div className="min-w-0 truncate whitespace-nowrap">
                © 2026{" "}
                <span className="font-semibold [color:var(--text-inverse,#ffffff)]">
                  {business?.name ?? "Caballeros Barbería"}
                </span>
              </div>

              <div className="shrink-0">
                <CreatedByMini />
              </div>
            </div>
          </div>
        </footer>
      </div>
    </section>
  );
}
