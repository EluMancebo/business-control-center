"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

function getStudioTitle(pathname: string) {
  if (pathname.startsWith("/panel/web-control/")) {
    const map: Record<string, string> = {
      "/panel/web-control": "Web Control",
      "/panel/web-control/hero": "Web Control · Hero",
      "/panel/web-control/services": "Web Control · Servicios",
      "/panel/web-control/offers": "Web Control · Ofertas",
      "/panel/web-control/testimonials": "Web Control · Testimonios",
      "/panel/web-control/hours": "Web Control · Horario",
      "/panel/web-control/location": "Web Control · Ubicación",
      "/panel/web-control/brand": "Web Control · Brand",
      "/panel/web-control/home": "Web Control · Home",
    };
    return map[pathname] ?? "Web Control";
  }

  if (pathname.startsWith("/panel/taller/")) {
    return "Taller · Studio";
  }

  return "Studio";
}

function getStudioHubHref(pathname: string) {
  if (pathname.startsWith("/panel/web-control/")) return "/panel/web-control";
  if (pathname.startsWith("/panel/taller/")) return "/panel/taller";
  return "/panel/dashboard";
}

const STUDIO_ANIM_MS = 1100; // igual que en globals.css

export default function PanelShell({
  children,
  role,
}: {
  children: React.ReactNode;
  role?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [mobileOpen, setMobileOpen] = useState(false);
  const isAdmin = role === "admin";

  const isStudio = useMemo(() => {
    const p = pathname || "";
    return p.startsWith("/panel/web-control/") || p.startsWith("/panel/taller/");
  }, [pathname]);

  const studioTitle = useMemo(() => getStudioTitle(pathname || ""), [pathname]);
  const studioHubHref = useMemo(() => getStudioHubHref(pathname || ""), [pathname]);

  // ✅ salida animada
  const [studioExiting, setStudioExiting] = useState(false);

  useEffect(() => {
    // cada vez que cambiamos de ruta (dentro del studio), reseteamos estado salida
    setStudioExiting(false);
  }, [pathname]);

  function exitStudio() {
    // evita doble click
    if (studioExiting) return;

    setStudioExiting(true);
    window.setTimeout(() => {
      router.push(studioHubHref);
    }, STUDIO_ANIM_MS);
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "Escape") return;

      if (isStudio) {
        e.preventDefault();
        exitStudio();
        return;
      }

      setMobileOpen(false);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStudio, studioHubHref, studioExiting]);

  useEffect(() => {
    const shouldLock = mobileOpen || isStudio;
    if (!shouldLock) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [mobileOpen, isStudio]);

  if (isStudio) {
    return (
      <div className="fixed inset-0 z-100 bg-background text-foreground">
        <div
          key={pathname}
          className={[
            "absolute inset-0",
            studioExiting ? "bcc-studio-slide-out" : "bcc-studio-slide-in",
          ].join(" ")}
        >
          <div className="flex h-14 items-center justify-between border-b border-border bg-background px-4">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={exitStudio}
                className="inline-flex h-9 items-center justify-center rounded-lg border border-border bg-background px-3 text-sm font-semibold hover:bg-muted"
                aria-label="Volver al menú"
                title="Volver al menú"
              >
                ← Menú
              </button>

              {/* icono característico (integrado con paleta) */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/brand/logo-mark.svg"
                alt=""
                className="h-5 w-5 opacity-80"
                draggable={false}
              />

              <div className="min-w-0">
                <div className="truncate text-sm font-semibold">{studioTitle}</div>
                <div className="truncate text-xs text-muted-foreground">
                  Estás editando esta sección (Studio)
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={exitStudio}
              className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-3 text-sm font-semibold text-primary-foreground hover:opacity-90"
              aria-label="Salir de Studio"
              title="Salir de Studio"
            >
              Salir <span className="ml-2">✕</span>
            </button>
          </div>

          <div className="h-[calc(100vh-56px)] overflow-hidden">{children}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen max-w-7xl">
        <div className="hidden sm:block">
          <Sidebar isAdmin={isAdmin} />
        </div>

        <div className={`sm:hidden ${mobileOpen ? "pointer-events-auto" : "pointer-events-none"}`}>
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
