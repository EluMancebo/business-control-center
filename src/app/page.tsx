export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      {/* Top bar */}
      <header className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-slate-900" />
            <div className="leading-tight">
              <p className="text-sm font-semibold">Business Control Center</p>
              <p className="text-xs text-slate-500">SalonPilot-ready • SaaS Control Hub</p>
            </div>
          </div>

          <nav className="flex items-center gap-2">
            <a
              href="#features"
              className="rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"
            >
              Funciones
            </a>
            <a
              href="/panel/dashboard"
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
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
            <p className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
              Control total sin romper el diseño
            </p>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
              El <span className="text-slate-900">centro de mando</span> para tu negocio local
            </h1>
            <p className="mt-4 text-slate-600">
              Publica ofertas, popups, heros por eventos, campañas y recordatorios. Captura leads,
              crea landings y automatiza citas y tareas. Todo con roles y seguridad.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="/panel/dashboard"
                className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Ver panel (demo)
              </a>
              <a
                href="#features"
                className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50"
              >
                Ver funciones
              </a>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3 text-center text-xs text-slate-600">
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-lg font-bold text-slate-900">+Leads</p>
                <p>Captura & seguimiento</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-lg font-bold text-slate-900">+Ventas</p>
                <p>Funnels & landings</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-lg font-bold text-slate-900">+Orden</p>
                <p>Citas & tareas</p>
              </div>
            </div>
          </div>

          {/* Fake dashboard preview */}
          <div className="rounded-2xl border bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Vista previa del panel</p>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                Connected
              </span>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Campañas activas</p>
                <p className="mt-1 text-2xl font-bold">3</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Leads hoy</p>
                <p className="mt-1 text-2xl font-bold">12</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Citas pendientes</p>
                <p className="mt-1 text-2xl font-bold">5</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Contenido programado</p>
                <p className="mt-1 text-2xl font-bold">7</p>
              </div>
            </div>
            <div className="mt-4 rounded-xl bg-slate-900 p-4 text-white">
              <p className="text-sm font-semibold">Hoy: “San Valentín”</p>
              <p className="mt-1 text-xs text-white/80">
                Hero especial + popup 10% + campaña WhatsApp + landing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <h2 className="text-2xl font-bold">Funciones clave</h2>
          <p className="mt-2 text-slate-600">
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
              <div key={f.t} className="rounded-2xl border bg-white p-5 shadow-sm">
                <p className="text-sm font-semibold">{f.t}</p>
                <p className="mt-2 text-sm text-slate-600">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-8 text-sm text-slate-500">
          <p>© {new Date().getFullYear()} Business Control Center</p>
          <p>Next.js 15 • MongoDB Atlas • Vercel</p>
        </div>
      </footer>
    </main>
  );
}
