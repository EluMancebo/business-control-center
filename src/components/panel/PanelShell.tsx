"use client";

import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function PanelShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  // Cerrar con ESC
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setMobileOpen(false);
    }
    if (mobileOpen) window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <div className="mx-auto flex min-h-screen max-w-7xl">
        {/* Sidebar desktop */}
        <div className="hidden sm:block">
          <Sidebar />
        </div>

        {/* Drawer mobile */}
        <div
          className={`sm:hidden ${
            mobileOpen ? "pointer-events-auto" : "pointer-events-none"
          }`}
        >
          {/* Overlay */}
          <div
            className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 ${
              mobileOpen ? "opacity-100" : "opacity-0"
            }`}
            onClick={() => setMobileOpen(false)}
          />

          {/* Panel deslizante */}
          <div
            className={`fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl transition-transform duration-700 ease-in-out ${
              mobileOpen ? "translate-x-0" : "-translate-x-full"
            }`}
            role="dialog"
            aria-modal="true"
            aria-label="Menú de navegación"
          >
            <div className="flex items-center justify-between border-b border-zinc-200 p-4">
              <div className="text-sm font-semibold">Menú</div>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm hover:bg-zinc-50"
                aria-label="Cerrar menú"
                title="Cerrar menú"
              >
                ✕
              </button>
            </div>

            <div className="h-[calc(100vh-57px)]">
              <Sidebar onNavigate={() => setMobileOpen(false)} />
            </div>
          </div>
        </div>

        {/* Contenido */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* OJO: SOLO UNA Topbar, con props */}
          <Topbar onOpenMenu={() => setMobileOpen(true)} />

          <main className="flex-1 p-4 sm:p-6">
            <div className="mx-auto w-full">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
