// src/app/page.tsx
import Image from "next/image";
import BrandBadge from "@/components/brand/BrandBadge";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 border-b border-(--border) bg-(--background)/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          {/* LEFT */}
          <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            {/* Marca */}
            <div className="inline-flex max-w-full items-center gap-1 rounded-xl border border-(--border) bg-(--card)/70 px-3 py-1.5 shadow-sm backdrop-blur">
              <Image
                src="/brand/logo-mark.svg"
                alt="BCC"
                width={48}
                height={48}
                priority
                className="h-12 w-12"
              />
              <div className="min-w-0 flex flex-col leading-tight">
                <span className="truncate text-lg font-extrabold tracking-tight text-foreground">
                  BCC
                </span>
                <span className="truncate text-[11px] font-medium text-(--muted-foreground)">
                  Business Control Center
                </span>
              </div>
            </div>

            {/* Badge (en móvil debajo) */}
            <div className="w-full sm:w-auto">
              <BrandBadge />
            </div>
          </div>

          {/* RIGHT */}
          <nav className="flex flex-wrap items-center gap-2 sm:justify-end">
            <a
              href="#features"
              className="rounded-lg px-3 py-2 text-sm text-(--muted-foreground) hover:bg-(--muted)"
            >
              Funciones
            </a>
            <a
              href="/panel/dashboard"
              className="rounded-lg bg-(--primary) px-4 py-2 text-sm font-semibold text-(--primary-foreground) hover:opacity-90"
            >
              Entrar al panel
            </a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="inline-flex rounded-full bg-(--muted) px-3 py-1 text-xs font-semibold text-(--muted-foreground)">
              Control total sin romper el diseño
            </p>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
              El <span className="text-foreground">centro de mando</span> para tu negocio local
            </h1>
            <p className="mt-4 text-(--muted-foreground)">
              Publica ofertas, popups, heros por eventos, campañas y recordatorios. Captura leads,
              crea landings y automatiza citas y tareas. Todo con roles y seguridad.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="/panel/dashboard"
                className="rounded-xl bg-(--primary) px-5 py-3 text-sm font-semibold text-(--primary-foreground) hover:opacity-90"
              >
                Ver panel (demo)
              </a>
              <a
                href="#features"
                className="rounded-xl border border-(--border) px-5 py-3 text-sm font-semibold text-foreground hover:bg-(--muted)"
              >
                Ver funciones
              </a>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3 text-center text-xs text-(--muted-foreground)">
              <div className="rounded-xl bg-(--muted) p-3">
                <p className="text-lg font-bold text-foreground">+Leads</p>
                <p>Captura & seguimiento</p>
              </div>
              <div className="rounded-xl bg-(--muted) p-3">
                <p className="text-lg font-bold text-foreground">+Ventas</p>
                <p>Funnels & landings</p>
              </div>
              <div className="rounded-xl bg-(--muted) p-3">
                <p className="text-lg font-bold text-foreground">+Orden</p>
                <p>Citas & tareas</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-(--border) bg-(--card) p-4 text-(--card-foreground) shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Vista previa del panel</p>
              <span className="rounded-full bg-(--muted) px-3 py-1 text-xs font-semibold text-(--muted-foreground)">
                Connected
              </span>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-(--muted) p-4">
                <p className="text-xs text-(--muted-foreground)">Campañas activas</p>
                <p className="mt-1 text-2xl font-bold">3</p>
              </div>
              <div className="rounded-xl bg-(--muted) p-4">
                <p className="text-xs text-(--muted-foreground)">Leads hoy</p>
                <p className="mt-1 text-2xl font-bold">12</p>
              </div>
              <div className="rounded-xl bg-(--muted) p-4">
                <p className="text-xs text-(--muted-foreground)">Citas pendientes</p>
                <p className="mt-1 text-2xl font-bold">5</p>
              </div>
              <div className="rounded-xl bg-(--muted) p-4">
                <p className="text-xs text-(--muted-foreground)">Contenido programado</p>
                <p className="mt-1 text-2xl font-bold">7</p>
              </div>
            </div>

            <div className="mt-4 rounded-xl bg-(--primary) p-4 text-(--primary-foreground)">
              <p className="text-sm font-semibold">Hoy: “San Valentín”</p>
              <p className="mt-1 text-xs opacity-80">
                Hero especial + popup 10% + campaña WhatsApp + landing.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="border-t border-(--border) bg-(--muted)">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <h2 className="text-2xl font-bold">Funciones clave</h2>
          <p className="mt-2 text-(--muted-foreground)">
            Construido para que el cliente gestione contenido y marketing sin “romper” la web.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { t: "Heros & Popups", d: "Eventos, fiestas locales, vacaciones, campañas. Plantillas seguras." },
              { t: "Campañas & Landings", d: "Objetivo, canal, estado, programación y medición." },
              { t: "Leads", d: "Captura, etiquetado, pipeline y seguimiento." },
              { t: "Citas", d: "Reserva y automatización de tareas." },
              { t: "Redes & WhatsApp", d: "Publicaciones y comunicaciones rápidas." },
              { t: "Temas & Branding", d: "Paletas (mono/análoga/complementaria/triádica) y tipografías." },
            ].map((f) => (
              <div key={f.t} className="rounded-2xl border border-(--border) bg-(--card) p-5 shadow-sm">
                <p className="text-sm font-semibold text-(--card-foreground)">{f.t}</p>
                <p className="mt-2 text-sm text-(--muted-foreground)">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-(--border)">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-8 text-sm text-(--muted-foreground)">
          <p>© {new Date().getFullYear()} Business Control Center</p>
          <p>Next.js 15 • MongoDB Atlas • Vercel</p>
        </div>
      </footer>
    </main>
  );
}
