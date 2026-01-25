export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-sm text-slate-600">
              Business Control Center · Vista general
            </p>
          </div>
          <div className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
            Sistema operativo
          </div>
        </header>

        {/* KPIs */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Leads hoy", value: "12" },
            { label: "Campañas activas", value: "3" },
            { label: "Citas pendientes", value: "5" },
            { label: "Contenido programado", value: "7" },
          ].map((kpi) => (
            <div
              key={kpi.label}
              className="rounded-2xl bg-white p-5 shadow-sm"
            >
              <p className="text-xs text-slate-500">{kpi.label}</p>
              <p className="mt-2 text-3xl font-bold">{kpi.value}</p>
            </div>
          ))}
        </section>

        {/* Main grid */}
        <section className="grid gap-6 lg:grid-cols-3">
          {/* Campaigns */}
          <div className="lg:col-span-2 rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Campañas recientes</h2>
            <ul className="mt-4 space-y-3">
              {[
                "San Valentín · Popup + Hero",
                "Rebajas Invierno · Landing",
                "WhatsApp Fidelización",
              ].map((c) => (
                <li
                  key={c}
                  className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"
                >
                  <span className="text-sm">{c}</span>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                    Activa
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Branding */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Branding</h2>
            <p className="mt-2 text-sm text-slate-600">
              Esquema de color activo
            </p>

            <div className="mt-4 flex gap-2">
              <div className="h-8 w-8 rounded-full bg-slate-900" />
              <div className="h-8 w-8 rounded-full bg-slate-700" />
              <div className="h-8 w-8 rounded-full bg-slate-500" />
              <div className="h-8 w-8 rounded-full bg-slate-300" />
            </div>

            <p className="mt-4 text-xs text-slate-500">
              Modo: Monocromático · Editable por el cliente
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
