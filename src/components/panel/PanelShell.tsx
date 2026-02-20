"use client";

import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function PanelShell({
  children,
  role,
}: {
  children: React.ReactNode;
  role?: string;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setMobileOpen(false);
    }
    if (mobileOpen) window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [mobileOpen]);

  const isAdmin = role === "admin";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen max-w-7xl">
        <div className="hidden sm:block">
          <Sidebar isAdmin={isAdmin} />
        </div>

        <div
          className={`sm:hidden ${
            mobileOpen ? "pointer-events-auto" : "pointer-events-none"
          }`}
        >
          <div
            className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 ${
              mobileOpen ? "opacity-100" : "opacity-0"
            }`}
            onClick={() => setMobileOpen(false)}
          />

          <div
            className={`fixed inset-y-0 left-0 z-50 w-72 bg-background shadow-xl transition-transform duration-700 ease-in-out ${
              mobileOpen ? "translate-x-0" : "-translate-x-full"
            }`}
            role="dialog"
            aria-modal="true"
            aria-label="Menú de navegación"
          >
            <div className="flex items-center justify-between border-b border-border p-4">
              <div className="text-sm font-semibold">Menú</div>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm hover:bg-muted"
                aria-label="Cerrar menú"
                title="Cerrar menú"
              >
                ✕
              </button>
            </div>

            <div className="h-[calc(100vh-57px)] overflow-y-auto">
              <Sidebar isAdmin={isAdmin} onNavigate={() => setMobileOpen(false)} />
            </div>
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar onOpenMenu={() => setMobileOpen(true)} />

          <main className="flex-1 p-4 sm:p-6">
            <div className="mx-auto w-full">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
