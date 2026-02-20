// src/app/page.tsx
import Image from "next/image";
import Link from "next/link";
import BrandBadge from "@/components/brand/BrandBadge";
import { dbConnect } from "@/lib/db";
import { HeroConfig } from "@/models/HeroConfig";
import { DEFAULT_HERO } from "@/lib/web/hero/types";

async function getPublishedHero() {
  await dbConnect();
  const doc = await HeroConfig.findOne({
    status: "published",
    variantKey: "default",
  }).lean();

  return doc?.data ?? DEFAULT_HERO;
}

export default async function HomePage() {
  const hero = await getPublishedHero();

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Top bar */}
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col items-stretch gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-xl border border-border bg-card/70 px-3 py-1.5 shadow-sm backdrop-blur">
              <Image
                src="/brand/logo-mark.svg"
                alt="BCC"
                width={48}
                height={48}
                priority
                className="h-12 w-12"
              />

              <div className="flex min-w-0 flex-col leading-tight">
                <span className="text-lg font-extrabold tracking-tight text-foreground">
                  BCC
                </span>
                <span className="truncate text-[11px] font-medium text-muted-foreground">
                  Business Control Center
                </span>
              </div>
            </div>

            <BrandBadge />
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-2 sm:justify-end">
            <a
              href="#features"
              className="rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted"
            >
              Funciones
            </a>

            <Link
              href="/panel/dashboard"
              className="shrink-0 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              Entrar al panel
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            {/* Badge + mini logo (si existe) */}
            <div className="flex flex-wrap items-center gap-3">
              {hero.logoUrl ? (
                <div className="inline-flex items-center gap-3 rounded-xl border border-border bg-card/60 px-3 py-2 backdrop-blur">
                  <Image
                    src={hero.logoUrl}
                    alt="Logo"
                    width={40}
                    height={40}
                    className="h-10 w-10 object-contain"
                  />
                  <span className="text-sm font-semibold text-foreground">Logo</span>
                </div>
              ) : null}

              <div className="inline-flex rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                {hero.badge}
              </div>
            </div>

            <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
              {hero.title}
            </h1>

            <p className="mt-4 text-muted-foreground">{hero.description}</p>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={hero.primaryCtaHref}
                className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90"
              >
                {hero.primaryCtaLabel}
              </a>
              <a
                href={hero.secondaryCtaHref}
                className="rounded-xl border border-border px-5 py-3 text-sm font-semibold text-foreground hover:bg-muted"
              >
                {hero.secondaryCtaLabel}
              </a>
            </div>
          </div>

          {/* Fake dashboard preview */}
          <div className="rounded-2xl border border-border bg-card p-4 text-card-foreground shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Vista previa del panel</p>
              <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                Connected
              </span>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-muted p-4">
                <p className="text-xs text-muted-foreground">Campañas activas</p>
                <p className="mt-1 text-2xl font-bold text-foreground">3</p>
              </div>
              <div className="rounded-xl bg-muted p-4">
                <p className="text-xs text-muted-foreground">Leads hoy</p>
                <p className="mt-1 text-2xl font-bold text-foreground">12</p>
              </div>
              <div className="rounded-xl bg-muted p-4">
                <p className="text-xs text-muted-foreground">Citas pendientes</p>
                <p className="mt-1 text-2xl font-bold text-foreground">5</p>
              </div>
              <div className="rounded-xl bg-muted p-4">
                <p className="text-xs text-muted-foreground">Contenido programado</p>
                <p className="mt-1 text-2xl font-bold text-foreground">7</p>
              </div>
            </div>

            <div className="mt-4 rounded-xl bg-primary p-4 text-primary-foreground">
              <p className="text-sm font-semibold">Hoy: “San Valentín”</p>
              <p className="mt-1 text-xs opacity-80">
                Hero especial + popup 10% + campaña WhatsApp + landing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-border bg-muted">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <h2 className="text-2xl font-bold text-foreground">Funciones clave</h2>
          <p className="mt-2 text-muted-foreground">
            Construido para que el cliente gestione contenido y marketing sin “romper” la web.
          </p>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-8 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Business Control Center</p>
          <p>Next.js 15 • MongoDB Atlas • Vercel</p>
        </div>
      </footer>
    </main>
  );
}


