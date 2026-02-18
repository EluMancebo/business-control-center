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

export function PublicHero({ data }: { data: HeroData }) {
  const hasInlineSvg = Boolean(data.logoSvg && data.logoSvg.trim().length > 0);

  return (
    <section className="relative overflow-hidden border-b border-border">
      {/* Fondo */}
      <div className="absolute inset-0">
        {data.backgroundImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={data.backgroundImageUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-linear-to-b from-background to-background/70" />
        )}
        <div className="absolute inset-0 bg-black/55" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:py-20">
        <div className="mb-8 flex items-center gap-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-sm backdrop-blur">
            {hasInlineSvg ? (
              <div
                className="hero-logo-svg h-12 w-12 sm:h-14 sm:w-14"
                dangerouslySetInnerHTML={{ __html: data.logoSvg! }}
              />
            ) : data.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={data.logoUrl}
                alt="Logo"
                className="h-12 w-12 sm:h-14 sm:w-14"
              />
            ) : null}
          </div>

          {data.badge ? (
            <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold tracking-wide text-white/90 backdrop-blur">
              {data.badge}
            </span>
          ) : null}
        </div>

        <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
          {data.title}
        </h1>

        <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg">
          {data.description}
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
          <a
            href={data.primaryCtaHref}
            className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black shadow-sm transition hover:bg-white/90"
          >
            {data.primaryCtaLabel}
          </a>

          <a
            href={data.secondaryCtaHref}
            className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/0 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            {data.secondaryCtaLabel}
          </a>
        </div>
      </div>
    </section>
  );
}

