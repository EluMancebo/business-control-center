// src/components/web/hero/PublicHero.tsx
import React from "react";
import CreatedByMini from "@/components/footer/CreatedByMini";

export type HeroData = {
  title?: string;
  subtitle?: string;
  ctaPrimaryLabel?: string;
  ctaSecondaryLabel?: string;
  ctaPrimaryHref?: string;
  ctaSecondaryHref?: string;
  badge?: string;
  backgroundImageUrl?: string;
  logoUrl?: string;
  logoSvg?: string;
  [key: string]: unknown;
};

export type BusinessPublic = {
  name?: string;
  slug: string;
  activeHeroVariantKey?: string;
  logoUrl?: string;
  [key: string]: unknown;
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
        "bg-black/20 text-white/90",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

export default function PublicHero({ data, business }: PublicHeroProps) {
  const titleRaw = (data.title as string) ?? "El centro de mando de tu negocio";
  const { lead: titleLead, accent: titleAccent } = splitTitleForAccent(titleRaw);

  const subtitle =
    (data.subtitle as string) ??
    "Publica ofertas, popups, heros por eventos, campañas y recordatorios.";

  const badge = (data.badge as string) ?? "Barbería Premium";
  const cta1 = (data.ctaPrimaryLabel as string) ?? "Pedir cita";
  const cta2 = (data.ctaSecondaryLabel as string) ?? "Servicios";

  const href1 = (data.ctaPrimaryHref as string) ?? "#";
  const href2 = (data.ctaSecondaryHref as string) ?? "#";

  const bg = normalizeAssetUrl(data.backgroundImageUrl);

  const headerLogoUrl =
    normalizeAssetUrl(business?.logoUrl) ?? normalizeAssetUrl(data.logoUrl);

  const heroLogoUrl =
    normalizeAssetUrl(data.logoUrl) ?? normalizeAssetUrl(business?.logoUrl);

  return (
    <section className="relative h-svh w-full overflow-hidden">
      {bg ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={bg}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60" />
        </>
      ) : (
        <div className="absolute inset-0 bg-linear-to-b from-black via-black/90 to-black" />
      )}

      <div className="relative z-10 mx-auto flex h-svh w-full max-w-6xl flex-col px-6">
        {/* HEADER */}
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

            <div className="hidden text-sm font-semibold text-white/90 sm:block">
              {business?.name ?? "Business Control Center"}
            </div>
          </div>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-3 md:flex">
            <a
              href="#"
              className="rounded-full bg-black/20 px-4 py-2 text-xs font-semibold text-white/85 hover:bg-black/30"
            >
              Home
            </a>
            <a
              href="#"
              className="rounded-full bg-black/20 px-4 py-2 text-xs font-semibold text-white/85 hover:bg-black/30"
            >
              Services
            </a>
            <a
              href="#"
              className="rounded-full bg-black/20 px-4 py-2 text-xs font-semibold text-white/85 hover:bg-black/30"
            >
              Contact
            </a>
          </nav>

          {/* ✅ Mobile menu (slide desde la derecha) */}
          <div className="md:hidden">
            <input id="bcc-mobile-menu" type="checkbox" className="peer sr-only" />

            <label
              htmlFor="bcc-mobile-menu"
              className="cursor-pointer rounded-xl bg-black/20 p-2 hover:bg-black/30"
              aria-label="Abrir menú"
            >
              <span className="block h-0.5 w-6 bg-white/90" />
              <span className="mt-1 block h-0.5 w-6 bg-white/90" />
              <span className="mt-1 block h-0.5 w-6 bg-white/90" />
            </label>

            <label
              htmlFor="bcc-mobile-menu"
              className="pointer-events-none fixed inset-0 z-40 bg-black/45 opacity-0 transition-opacity duration-500 peer-checked:pointer-events-auto peer-checked:opacity-100"
              aria-label="Cerrar menú"
            />

            <div className="fixed inset-y-0 right-0 z-50 w-64 translate-x-full bg-black/80 p-4 text-white/90 shadow-2xl transition-transform duration-700 ease-out peer-checked:translate-x-0">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold">
                  {business?.name ?? "Menú"}
                </div>

                <label
                  htmlFor="bcc-mobile-menu"
                  className="cursor-pointer rounded-lg bg-white/10 px-3 py-1 text-xs hover:bg-white/15"
                >
                  Cerrar
                </label>
              </div>

              <div className="mt-4 space-y-2">
                <a href="#" className="block rounded-xl px-3 py-2 hover:bg-white/10">
                  Home
                </a>
                <a href="#" className="block rounded-xl px-3 py-2 hover:bg-white/10">
                  Services
                </a>
                <a href="#" className="block rounded-xl px-3 py-2 hover:bg-white/10">
                  Contact
                </a>
              </div>
            </div>
          </div>
        </header>

        {/* MAIN */}
        <main className="min-h-0 flex-1 pt-5">
          <div className="grid grid-cols-1 items-center gap-5 md:grid-cols-2 md:gap-8">
            {/* Texto */}
            <div className="max-w-xl">
              <Pill className="mb-3">{badge}</Pill>

              <h1 className="text-balance text-3xl font-extrabold leading-[1.02] tracking-tight text-white sm:text-5xl md:text-6xl">
                <span>{titleLead || titleRaw}</span>
                {titleAccent ? (
                  <>
                    <br />
                    <span className="text-primary">{titleAccent}</span>
                  </>
                ) : null}
              </h1>

              <p className="mt-3 max-w-lg text-sm text-white/80 sm:text-base md:text-lg">
                {subtitle}
              </p>

              {/* CTAs desktop */}
              <div className="mt-5 hidden flex-wrap items-center gap-3 md:flex">
                <a
                  href={href1}
                  className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-black hover:bg-white/90"
                >
                  {cta1}
                </a>

                <a
                  href={href2}
                  className="inline-flex items-center justify-center rounded-xl bg-black/20 px-5 py-2.5 text-sm font-semibold text-white hover:bg-black/30"
                >
                  {cta2}
                </a>
              </div>
            </div>

            {/* Logo: en móvil centrado */}
            <div className="mx-auto w-full max-w-md md:max-w-xl">
              <div className="relative mx-auto flex aspect-16/7 w-full items-center justify-center rounded-[28px] bg-black/15 sm:aspect-video md:aspect-16/10">
                {heroLogoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={heroLogoUrl}
                    alt={business?.name ?? "Logo"}
                    className="max-h-24 w-auto opacity-95 sm:max-h-44 md:max-h-65"
                  />
                ) : (
                  <div className="text-center text-white/80">
                    <div className="text-sm">Logo principal</div>
                    <div className="mt-2 text-xs text-white/50">
                      (pendiente de asset)
                    </div>
                  </div>
                )}
              </div>

              {/* CTAs móvil: MÁS ARRIBA y más compactos */}
              <div className="mt-3 grid grid-cols-2 gap-3 md:hidden">
                <a
                  href={href1}
                  className="inline-flex w-full items-center justify-center rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-white/90"
                >
                  {cta1}
                </a>

                <a
                  href={href2}
                  className="inline-flex w-full items-center justify-center rounded-xl bg-black/20 px-4 py-2 text-sm font-semibold text-white hover:bg-black/30"
                >
                  {cta2}
                </a>
              </div>
            </div>
          </div>
        </main>

        {/* FOOTER abajo */}
        <footer className="mt-auto pb-3">
          <div className="rounded-2xl bg-black/15 px-4 py-2 text-white/85">
            <div className="flex flex-col items-center justify-between gap-2 md:flex-row md:items-end">
              <div className="text-center text-[11px] md:text-left md:text-xs">
                © 2026{" "}
                <span className="font-semibold text-white/95">
                  {business?.name ?? "Caballeros Barbería"}
                </span>
              </div>

              <div className="hidden flex-wrap items-center justify-center gap-5 text-xs sm:flex">
                <span>📍 Dirección (pendiente)</span>
                <span>☎️ Teléfono</span>
                <span>💬 WhatsApp</span>
                <span>✉️ email@cliente.com</span>
              </div>

              <div className="flex items-center gap-3 text-[11px] sm:hidden">
                <span>📍</span>
                <span>☎️</span>
                <span>💬</span>
                <span>✉️</span>
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