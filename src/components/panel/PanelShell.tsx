// src/components/panel/PanelShell.tsx

"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import type { Capability } from "@/lib/auth/capabilities";
import type { SessionPayload } from "@/lib/auth/serverSession";
import BrandHydrator from "@/components/brand/BrandHydrator";

function getPanelLayer(pathname: string): "studio" | "client" {
  if (pathname === "/panel/taller" || pathname.startsWith("/panel/taller/")) {
    return "studio";
  }

  return "client";
}

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
      "/panel/web-control/brand": "Web Control · Apariencia",
      "/panel/web-control/home": "Web Control · Home",
    };
    return map[pathname] ?? "Web Control";
  }

  if (pathname === "/panel/taller" || pathname.startsWith("/panel/taller/")) {
    const map: Record<string, string> = {
      "/panel/taller": "Taller",
      "/panel/taller/brand": "Taller · Brand",
      "/panel/taller/media": "Taller · Media",
      "/panel/taller/web-brand": "Taller · Web Brand",
      "/panel/taller/presets/hero": "Taller · Presets · Hero",
      "/panel/taller/presets/header": "Taller · Presets · Header",
      "/panel/taller/presets/footer": "Taller · Presets · Footer",
      "/panel/taller/presets/layouts": "Taller · Presets · Layouts",
    };
    return map[pathname] ?? "Taller";
  }

  return "Studio";
}

function getStudioHubHref(pathname: string) {
  if (pathname === "/panel/taller" || pathname.startsWith("/panel/taller/")) return "/panel/taller";
  return "/panel/dashboard";
}

const STUDIO_ENTER_MS = 520;
const STUDIO_EXIT_MS = 380;

function shortId(value: string | undefined, keep = 6) {
  if (!value) return "—";
  if (value.length <= keep * 2) return value;
  return `${value.slice(0, keep)}…${value.slice(-keep)}`;
}

function ArrowLeftIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4">
      <path
        d="M15 6l-6 6 6 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4">
      <path
        d="M4 11.5L12 5l8 6.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7 10.5V19h10v-8.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function readActiveBusinessSlug(): string | undefined {
  if (typeof window === "undefined") return undefined;
  const value = window.localStorage.getItem("bcc:activeBusinessSlug");
  const trimmed = value?.trim() ?? "";
  return trimmed || undefined;
}

type StudioStage = "idle" | "enter-ready" | "entering" | "exiting";

export default function PanelShell({
  children,
  role,
  isAdmin,
  capabilities,
  session,
}: {
  children: React.ReactNode;
  role?: string;
  isAdmin?: boolean;
  capabilities?: Capability[];
  session?: SessionPayload;
}) {
  const router = useRouter();
  const pathname = usePathname() || "";

  const [mobileOpen, setMobileOpen] = useState(false);
  const [studioStage, setStudioStage] = useState<StudioStage>("idle");
  const [activeBusinessSlug, setActiveBusinessSlug] = useState<string | undefined>(undefined);

  const computedIsAdmin = isAdmin ?? role === "admin";
  const caps = capabilities ?? [];

  const userId = session?.sub;
  const businessId = session?.businessId;

  const previousPathRef = useRef(pathname);
  const enterReadyFrameRef = useRef<number | null>(null);
  const enterFrameRef = useRef<number | null>(null);
  const enterTimeoutRef = useRef<number | null>(null);
  const exitTimeoutRef = useRef<number | null>(null);

  const layer = useMemo(() => getPanelLayer(pathname), [pathname]);
  const isStudio = layer === "studio";

  const studioTitle = useMemo(() => getStudioTitle(pathname), [pathname]);
  const studioHubHref = useMemo(() => getStudioHubHref(pathname), [pathname]);
  const isTallerStudio = useMemo(
    () => pathname === "/panel/taller" || pathname.startsWith("/panel/taller/"),
    [pathname]
  );
  const isTallerHub = useMemo(() => pathname === "/panel/taller", [pathname]);
  const isStudioFullscreen = isStudio && !isTallerHub;
  const studioBackHref = useMemo(
    () => (isTallerHub ? "/panel/dashboard" : studioHubHref),
    [isTallerHub, studioHubHref]
  );
  const clientShellBackgroundClass = computedIsAdmin
    ? "[background:var(--panel-background,var(--background))]"
    : "[background:var(--panel-background,var(--background))]";
  const clientTopbarSurfaceClass = computedIsAdmin
    ? "[background:var(--panel-surface-2,var(--surface-3,var(--card)))]"
    : "[background:var(--panel-topbar,var(--surface-3,var(--card)))]";
  const clientSidebarSurfaceClass = computedIsAdmin
    ? "[background:var(--surface-2,var(--card))]"
    : "[background:var(--panel-sidebar,var(--surface-2,var(--card)))]";

  // Autoridad de apariencia por capa:
  // - Capa 1 (admin): studio
  // - Capa 2 (cliente): panel
  const brandScope = useMemo(
    () => (computedIsAdmin ? "studio" : "panel"),
    [computedIsAdmin]
  );
  const brandBusinessSlug = useMemo(
    () => (brandScope === "panel" ? activeBusinessSlug : undefined),
    [brandScope, activeBusinessSlug]
  );

  const clearStudioTimers = useCallback(() => {
    if (enterReadyFrameRef.current !== null) {
      window.cancelAnimationFrame(enterReadyFrameRef.current);
      enterReadyFrameRef.current = null;
    }

    if (enterFrameRef.current !== null) {
      window.cancelAnimationFrame(enterFrameRef.current);
      enterFrameRef.current = null;
    }

    if (enterTimeoutRef.current !== null) {
      window.clearTimeout(enterTimeoutRef.current);
      enterTimeoutRef.current = null;
    }

    if (exitTimeoutRef.current !== null) {
      window.clearTimeout(exitTimeoutRef.current);
      exitTimeoutRef.current = null;
    }
  }, []);

  const leaveStudio = useCallback(
    (nextHref: string) => {
      if (!isStudio || studioStage === "exiting") return;

      clearStudioTimers();
      setStudioStage("exiting");
      const targetHref = nextHref === pathname ? "/panel/dashboard" : nextHref;

      exitTimeoutRef.current = window.setTimeout(() => {
        router.push(targetHref);
      }, STUDIO_EXIT_MS);
    },
    [clearStudioTimers, isStudio, pathname, router, studioStage]
  );

  // Prepare enter-ready before paint to avoid first-frame flash on Studio entry.
  useLayoutEffect(() => {
    const previousPath = previousPathRef.current;
    const wasStudio = getPanelLayer(previousPath) === "studio";
    const nowStudio = layer === "studio";

    if (wasStudio && nowStudio) {
      // Navigation between Studio child routes must not keep transient animation states.
      clearStudioTimers();
      enterReadyFrameRef.current = window.requestAnimationFrame(() => {
        setStudioStage("idle");
        enterReadyFrameRef.current = null;
      });
    }

    if (!wasStudio && nowStudio) {
      clearStudioTimers();

      enterReadyFrameRef.current = window.requestAnimationFrame(() => {
        setStudioStage("enter-ready");

        enterFrameRef.current = window.requestAnimationFrame(() => {
          setStudioStage("entering");

          enterTimeoutRef.current = window.setTimeout(() => {
            setStudioStage("idle");
            enterTimeoutRef.current = null;
          }, STUDIO_ENTER_MS);

          enterFrameRef.current = null;
        });

        enterReadyFrameRef.current = null;
      });
    }

    if (wasStudio && !nowStudio) {
      clearStudioTimers();
      window.requestAnimationFrame(() => {
        setStudioStage("idle");
      });
    }

    previousPathRef.current = pathname;

    return () => {
      if (enterReadyFrameRef.current !== null) {
        window.cancelAnimationFrame(enterReadyFrameRef.current);
        enterReadyFrameRef.current = null;
      }

      if (enterFrameRef.current !== null) {
        window.cancelAnimationFrame(enterFrameRef.current);
        enterFrameRef.current = null;
      }
    };
  }, [pathname, layer, clearStudioTimers]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "Escape") return;

      if (isStudioFullscreen) {
        e.preventDefault();
        leaveStudio(studioHubHref);
        return;
      }

      setMobileOpen(false);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isStudioFullscreen, leaveStudio, studioHubHref]);

  useEffect(() => {
    const sync = () => {
      setActiveBusinessSlug(readActiveBusinessSlug());
    };

    sync();
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  useEffect(() => {
    const shouldLock = mobileOpen || isStudioFullscreen;
    if (!shouldLock) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [mobileOpen, isStudioFullscreen]);

  useEffect(() => {
    return () => {
      clearStudioTimers();
    };
  }, [clearStudioTimers]);

  if (isStudioFullscreen) {
    const studioMotionClass =
      studioStage === "enter-ready"
        ? "bcc-studio-enter-ready"
        : studioStage === "entering"
          ? "bcc-studio-slide-in"
          : studioStage === "exiting"
            ? "bcc-studio-slide-out"
            : "";
    const studioRootClass = "fixed inset-0 z-100 bg-background text-foreground";
    const studioTopbarClass =
      "border-b border-border shadow-sm backdrop-blur [background:var(--surface-3,var(--card))]";
    const studioSecondaryButtonClass =
      "inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-border px-3 text-sm font-semibold disabled:pointer-events-none disabled:opacity-60 [background:var(--cta-secondary,var(--background))] [color:var(--cta-secondary-foreground,var(--foreground))] hover:[background:var(--cta-secondary-hover,var(--muted))]";
    const studioBadgeClass =
      "inline-flex items-center rounded-full border border-border px-1.5 py-0 text-[10px] font-medium [background:var(--badge-bg,var(--muted))] [color:var(--badge-fg,var(--foreground))] [border-color:var(--badge-bg,var(--border))]";

    return (
      <div className={studioRootClass}>
        <BrandHydrator scope={brandScope} businessSlug={brandBusinessSlug} />

        <div className={["absolute inset-0", studioMotionClass].filter(Boolean).join(" ")}>
          <div className={studioTopbarClass}>
            <div className="mx-auto flex h-14 max-w-400 items-center justify-between px-4">
              <div className="flex min-w-0 items-center gap-3">
                {!isTallerHub ? (
                  <button
                    type="button"
                    onClick={() => leaveStudio(studioBackHref)}
                    className={studioSecondaryButtonClass}
                    aria-label="Ir a Inicio Studio"
                    title="Ir a Inicio Studio"
                    disabled={studioStage === "exiting"}
                  >
                    <ArrowLeftIcon />
                    <span>Inicio Studio</span>
                  </button>
                ) : null}

                <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border shadow-sm [background:var(--surface-3,var(--background))]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/brand/logo-mark.svg"
                    alt="Logo Business Control Center"
                    className="h-5 w-5 opacity-90"
                    draggable={false}
                  />
                </div>

                <div className="min-w-0">
                  <div className="flex min-w-0 items-center gap-2">
                    <div className="truncate text-sm font-semibold">{studioTitle}</div>
                    {isTallerStudio ? <span className={studioBadgeClass}>Capa 1</span> : null}
                  </div>
                  <div className="truncate text-xs [color:var(--text-subtle,var(--muted-foreground))]">
                    Estás editando esta sección del sistema
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => leaveStudio("/panel/dashboard")}
                className={studioSecondaryButtonClass}
                aria-label="Ir al menú principal"
                title="Ir al menú principal"
                disabled={studioStage === "exiting"}
              >
                <HomeIcon />
                <span>Inicio</span>
              </button>
            </div>
          </div>

          <div className="h-[calc(100vh-56px)] overflow-y-auto overflow-x-hidden bcc-scrollbar">
            {children}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={["min-h-screen text-foreground", clientShellBackgroundClass].join(" ")}
      data-role={role ?? ""}
      data-business-id={businessId ?? ""}
      data-user-id={userId ?? ""}
    >
      <BrandHydrator scope={brandScope} businessSlug={brandBusinessSlug} />

      <div className="flex min-h-screen w-full">
        <div className="hidden sm:block">
          <Sidebar isAdmin={computedIsAdmin} capabilities={caps} />
        </div>

        <div className={`sm:hidden ${mobileOpen ? "pointer-events-auto" : "pointer-events-none"}`}>
          <div
            className={`fixed inset-0 z-40 transition-opacity duration-300 [background:var(--hero-overlay-strong,rgba(0,0,0,0.45))] ${
              mobileOpen ? "opacity-100" : "opacity-0"
            }`}
            onClick={() => setMobileOpen(false)}
          />

          <div
            className={`fixed inset-y-0 left-0 z-50 w-72 border-r border-border shadow-2xl transition-transform duration-300 ease-out ${clientSidebarSurfaceClass} ${
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
                className="rounded-lg border border-border px-3 py-2 text-sm [background:var(--cta-secondary,var(--background))] [color:var(--cta-secondary-foreground,var(--foreground))] hover:[background:var(--cta-secondary-hover,var(--muted))]"
                aria-label="Cerrar menú"
                title="Cerrar menú"
              >
                ✕
              </button>
            </div>

            <div className="h-[calc(100vh-57px)] overflow-y-auto bcc-scrollbar">
              <Sidebar
                isAdmin={computedIsAdmin}
                capabilities={caps}
                onNavigate={() => setMobileOpen(false)}
              />
            </div>
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <div
            className={[
              "border-b border-border px-4 py-2 text-xs shadow-sm sm:px-6 [color:var(--text-subtle,var(--muted-foreground))]",
              clientTopbarSurfaceClass,
            ].join(" ")}
          >
            <span className="font-medium text-foreground">Sesión:</span>{" "}
            rol <span className="font-medium text-foreground">{role ?? "—"}</span>{" "}
            · business <span className="font-medium text-foreground">{shortId(businessId)}</span>{" "}
            · user <span className="font-medium text-foreground">{shortId(userId)}</span>
            {computedIsAdmin ? (
              <span className="ml-2 rounded-md px-2 py-0.5 text-[11px] [background:var(--badge-bg,var(--muted))] [color:var(--badge-fg,var(--foreground))]">
                ADMIN
              </span>
            ) : null}
          </div>

          <Topbar onOpenMenu={() => setMobileOpen(true)} />

          <main
            className={[
              "flex-1 p-4 sm:p-6",
              isTallerHub
                ? "[background:var(--background)]"
                : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <div className="mx-auto w-full">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
