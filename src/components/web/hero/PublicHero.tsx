import CreatedByMini from "@/components/footer/CreatedByMini";

type HeroData = {
  badge: string;
  title: string;
  description: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
  backgroundImageUrl?: string;
  logoUrl?: string;
  logoSvg?: string;
};

type BusinessPublic = {
  name?: string;
  slug: string;
  activeHeroVariantKey: string;
  address?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
};

const HEADER_FOOTER_LOGO_FALLBACK = "/brand/LogoHeadCaballerosBarberia.png";
const HERO_LOGO_FALLBACK = "/brand/LogoHeroCaballerosBarberia.png";

function splitTitle(raw: string) {
  const t = String(raw || "").trim();
  if (!t) return { a: "", b: "" };
  const idx = t.indexOf(".");
  if (idx === -1) return { a: t, b: "" };
  return { a: t.slice(0, idx + 1).trim(), b: t.slice(idx + 1).trim() };
}

function Icon({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex h-5 w-5 items-center justify-center rounded-md border border-white/10 bg-black/20 text-white/80">
      {children}
    </span>
  );
}

export function PublicHero({ data, business }: { data: HeroData; business?: BusinessPublic }) {
  // ✅ Solo SVG real, si no -> logoUrl
  const hasInlineSvg =
    Boolean(data.logoSvg) && data.logoSvg!.trim().length > 0 && data.logoSvg!.includes("<svg");

  const heroLogoSrc = data.logoUrl?.trim() ? data.logoUrl : HERO_LOGO_FALLBACK;
  const headerLogoSrc = HEADER_FOOTER_LOGO_FALLBACK;

  const businessName = business?.name || data.badge || "Business";
  const address = business?.address || "Dirección (pendiente)";
  const phone = business?.phone || "Teléfono";
  const whatsapp = business?.whatsapp || "WhatsApp";
  const email = business?.email || "email@cliente.com";

  const { a: titleA, b: titleB } = splitTitle(data.title);

  return (
    <section className="relative h-svh w-full overflow-hidden">
      {/* Fondo */}
      <div className="absolute inset-0">
        {data.backgroundImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={data.backgroundImageUrl}
            alt=""
            className="h-full w-full object-cover object-[50%_15%]"
            draggable={false}
          />
        ) : (
          <div className="h-full w-full bg-linear-to-b from-background to-background/70" />
        )}
        <div className="absolute inset-0 bg-black/55" />
      </div>

      {/* Header: logo a la izquierda + nav centrado y más grande */}
      <header className="absolute inset-x-0 top-0 z-20">
        <div className="relative flex w-full items-center px-6 py-5">
          {/* Izquierda */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={headerLogoSrc}
            alt="Logo"
            className="h-16 w-auto opacity-95"
            draggable={false}
          />

          {/* Centro */}
          <nav className="hidden sm:flex absolute left-1/2 -translate-x-1/2 items-center gap-3">
            <a className="rounded-full border border-white/10 bg-black/25 px-5 py-2 text-sm font-semibold text-white/90 hover:bg-black/35">
              Home
            </a>
            <a className="rounded-full border border-white/10 bg-black/15 px-5 py-2 text-sm font-semibold text-white/80 hover:bg-black/25">
              Services
            </a>
            <a className="rounded-full border border-white/10 bg-black/15 px-5 py-2 text-sm font-semibold text-white/80 hover:bg-black/25">
              Contact
            </a>
          </nav>
        </div>
      </header>

      {/* Contenido centrado */}
      <div className="relative z-10 flex h-full items-center justify-center px-6">
        <div className="w-full max-w-6xl">
          <div className="grid w-full grid-cols-1 items-center gap-10 lg:grid-cols-2">
            {/* Texto */}
            <div className="text-left">
              {data.badge ? (
                <span className="inline-flex items-center rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs font-semibold tracking-wide text-white/90">
                  {data.badge}
                </span>
              ) : null}

              <h1 className="mt-5 max-w-2xl text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
                <span className="block">{titleA}</span>
                {titleB ? <span className="block text-primary">{titleB}</span> : null}
              </h1>

              <p className="mt-4 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">
                {data.description}
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <a
                  href={data.primaryCtaHref}
                  className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black shadow-sm transition hover:bg-white/90"
                >
                  {data.primaryCtaLabel}
                </a>

                <a
                  href={data.secondaryCtaHref}
                  className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-transparent px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  {data.secondaryCtaLabel}
                </a>
              </div>
            </div>

            {/* Logo grande (sin blur pegote) */}
            <div className="flex justify-center lg:justify-end">
              <div className="rounded-3xl border border-white/10 bg-black/20 p-8 shadow-sm">
                {hasInlineSvg ? (
                  <div
                    className="hero-logo-svg h-64 w-64 sm:h-80 sm:w-80"
                    dangerouslySetInnerHTML={{ __html: data.logoSvg! }}
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={heroLogoSrc}
                    alt="Logo principal"
                    className="h-64 w-auto sm:h-80"
                    draggable={false}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Footer integrado: extremos + centro */}
          <div className="mt-10 flex w-full items-center justify-between gap-4">
            {/* Izquierda */}
            <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-xs text-white/80">
              <div className="flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={headerLogoSrc} alt="" className="h-6 w-auto opacity-90" />
                <span>
                  © 2026 <span className="font-semibold text-white">{businessName}</span>
                </span>
              </div>
            </div>

            {/* Centro */}
            <div className="hidden sm:block rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-xs text-white/80">
              <div className="flex flex-wrap items-center justify-center gap-3">
                <span className="inline-flex items-center gap-2">
                  <Icon>📍</Icon>
                  <span className="text-white/75">{address}</span>
                </span>
                <span className="inline-flex items-center gap-2">
                  <Icon>☎️</Icon>
                  <span className="text-white/75">{phone}</span>
                </span>
                <span className="inline-flex items-center gap-2">
                  <Icon>💬</Icon>
                  <span className="text-white/75">{whatsapp}</span>
                </span>
                <span className="inline-flex items-center gap-2">
                  <Icon>✉️</Icon>
                  <span className="text-white/75">{email}</span>
                </span>
              </div>
            </div>

            {/* Derecha: tu bloque completo en pequeño */}
            <div className="max-w-xs hero-footer-wall">
              <CreatedByMini />
            </div>
          </div>

          {/* Centro en móvil (fila extra) */}
          <div className="mt-3 sm:hidden rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-xs text-white/80">
            <div className="flex flex-wrap items-center justify-center gap-3">
              <span className="inline-flex items-center gap-2">
                <Icon>📍</Icon>
                <span className="text-white/75">{address}</span>
              </span>
              <span className="inline-flex items-center gap-2">
                <Icon>☎️</Icon>
                <span className="text-white/75">{phone}</span>
              </span>
              <span className="inline-flex items-center gap-2">
                <Icon>💬</Icon>
                <span className="text-white/75">{whatsapp}</span>
              </span>
              <span className="inline-flex items-center gap-2">
                <Icon>✉️</Icon>
                <span className="text-white/75">{email}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}  