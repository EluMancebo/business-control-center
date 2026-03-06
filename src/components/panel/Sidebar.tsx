// src/components/panel/Sidebar.tsx

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { NAV, type NavItem, type NavChildItem } from "@/components/panel/nav";
import type { Capability } from "@/lib/auth/capabilities";

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

function getPublicHrefFromSlug(slug: string | null | undefined) {
  const clean = String(slug || "").trim();
  return clean ? `/${encodeURIComponent(clean)}` : "/";
}

function Icon({
  name,
}: {
  name:
    | "dashboard"
    | "web"
    | "webControl"
    | "marketing"
    | "settings"
    | "panel"
    | "hero"
    | "services"
    | "offers"
    | "testimonials"
    | "hours"
    | "location"
    | "brand"
    | "key"
    | "chev";
}) {
  const cls = "h-4 w-4 shrink-0 opacity-85";
  const stroke = "currentColor";

  switch (name) {
    case "dashboard":
      return (
        <svg aria-hidden="true" viewBox="0 0 24 24" className={cls}>
          <path
            fill="currentColor"
            d="M3 13h8V3H3v10zm10 8h8V11h-8v10zM3 21h8v-6H3v6zm10-18v6h8V3h-8z"
          />
        </svg>
      );

    case "web":
      return (
        <svg aria-hidden="true" viewBox="0 0 24 24" className={cls}>
          <path
            fill="currentColor"
            d="M12 2a10 10 0 100 20 10 10 0 000-20zm7.93 9h-3.17a15.6 15.6 0 00-1.1-5.01A8.03 8.03 0 0119.93 11M12 4c.9 0 2.12 1.65 2.84 7H9.16C9.88 5.65 11.1 4 12 4M4.07 13h3.17c.2 1.8.62 3.54 1.1 5.01A8.03 8.03 0 014.07 13m3.17-2H4.07a8.03 8.03 0 014.2-5.01c-.48 1.47-.9 3.21-1.03 5.01M12 20c-.9 0-2.12-1.65-2.84-7h5.68c-.72 5.35-1.94 7-2.84 7m3.56-1.99c.48-1.47.9-3.21 1.03-5.01h3.17a8.03 8.03 0 01-4.2 5.01"
          />
        </svg>
      );

    case "webControl":
      return (
        <svg aria-hidden="true" viewBox="0 0 24 24" className={cls}>
          <path
            fill="currentColor"
            d="M4 5h16v2H4V5zm0 6h10v2H4v-2zm0 6h16v2H4v-2zm12-5l4-4 1.4 1.4-4 4L16 12z"
          />
        </svg>
      );

    case "marketing":
      return (
        <svg aria-hidden="true" viewBox="0 0 24 24" className={cls}>
          <path
            fill="currentColor"
            d="M3 11v2h2l9 4V7L5 11H3zm15.5 1a2.5 2.5 0 01-1.5 2.29V9.71A2.5 2.5 0 0118.5 12zM7 18a2 2 0 002 2h1v-2H9l-2-4H5l2 4z"
          />
        </svg>
      );

    case "settings":
      return (
        <svg aria-hidden="true" viewBox="0 0 24 24" className={cls}>
          <path
            fill="currentColor"
            d="M19.14 12.94c.04-.31.06-.63.06-.94s-.02-.63-.06-.94l2.03-1.58a.5.5 0 00.12-.64l-1.92-3.32a.5.5 0 00-.6-.22l-2.39.96a7.1 7.1 0 00-1.63-.94l-.36-2.54A.5.5 0 0013.9 1h-3.8a.5.5 0 00-.49.42l-.36 2.54c-.58.23-1.12.54-1.63.94l-2.39-.96a.5.5 0 00-.6.22L2.71 7.48a.5.5 0 00.12.64l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94L2.83 14.5a.5.5 0 00-.12.64l1.92 3.32a.5.5 0 00.6.22l2.39-.96c.51.4 1.05.71 1.63.94l.36 2.54a.5.5 0 00.49.42h3.8a.5.5 0 00.49-.42l.36-2.54c.58-.23 1.12-.54 1.63-.94l2.39.96a.5.5 0 00.6-.22l1.92-3.32a.5.5 0 00-.12-.64l-2.03-1.56zM12 15.5A3.5 3.5 0 1112 8a3.5 3.5 0 010 7.5z"
          />
        </svg>
      );

    case "panel":
      return (
        <svg aria-hidden="true" viewBox="0 0 24 24" className={cls}>
          <rect x="4" y="5" width="16" height="14" rx="2" fill="none" stroke={stroke} strokeWidth="2" />
          <path d="M8 9h8" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
          <path d="M8 13h5" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case "hero":
      return (
        <svg aria-hidden="true" viewBox="0 0 24 24" className={cls}>
          <path d="M4 7h16v10H4z" fill="none" stroke={stroke} strokeWidth="2" />
          <path d="M7 14l3-3 3 3 2-2 2 2" fill="none" stroke={stroke} strokeWidth="2" strokeLinejoin="round" />
          <circle cx="9" cy="10" r="1.2" fill={stroke} />
        </svg>
      );

    case "services":
      return (
        <svg aria-hidden="true" viewBox="0 0 24 24" className={cls}>
          <path d="M7 7h10M7 12h10M7 17h10" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
          <circle cx="5" cy="7" r="1" fill={stroke} />
          <circle cx="5" cy="12" r="1" fill={stroke} />
          <circle cx="5" cy="17" r="1" fill={stroke} />
        </svg>
      );

    case "offers":
      return (
        <svg aria-hidden="true" viewBox="0 0 24 24" className={cls}>
          <path
            d="M20 13l-7 7-9-9V4h7l9 9z"
            fill="none"
            stroke={stroke}
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <circle cx="7.5" cy="7.5" r="1.3" fill="none" stroke={stroke} strokeWidth="2" />
        </svg>
      );

    case "testimonials":
      return (
        <svg aria-hidden="true" viewBox="0 0 24 24" className={cls}>
          <path
            d="M5 6h14v9H8l-3 3V6z"
            fill="none"
            stroke={stroke}
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path d="M8 9h8M8 12h6" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case "hours":
      return (
        <svg aria-hidden="true" viewBox="0 0 24 24" className={cls}>
          <circle cx="12" cy="12" r="8" fill="none" stroke={stroke} strokeWidth="2" />
          <path d="M12 8v5l3 2" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case "location":
      return (
        <svg aria-hidden="true" viewBox="0 0 24 24" className={cls}>
          <path
            d="M12 21s6-5.2 6-10a6 6 0 10-12 0c0 4.8 6 10 6 10z"
            fill="none"
            stroke={stroke}
            strokeWidth="2"
          />
          <circle cx="12" cy="11" r="2" fill="none" stroke={stroke} strokeWidth="2" />
        </svg>
      );

    case "brand":
      return (
        <svg aria-hidden="true" viewBox="0 0 24 24" className={cls}>
          <path d="M4 18h16" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
          <path
            d="M7 17c2-6 8-10 10-11 0 0-1 8-7 12"
            fill="none"
            stroke={stroke}
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path d="M8 16l-2 2" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case "key":
      return (
        <svg aria-hidden="true" viewBox="0 0 24 24" className={cls}>
          <path
            fill="currentColor"
            d="M7 14a5 5 0 115-5 5 5 0 01-5 5zm0-8a3 3 0 103 3 3 3 0 00-3-3zm6 3h9v3h-2v2h-3v-2h-4z"
          />
        </svg>
      );

    case "chev":
      return (
        <svg aria-hidden="true" viewBox="0 0 24 24" className={cls}>
          <path fill="currentColor" d="M9 18l6-6-6-6-1.4 1.4L12.2 12l-4.6 4.6L9 18z" />
        </svg>
      );
  }
}

function groupIcon(label: string) {
  if (label === "Web Control") return "webControl";
  if (label === "Marketing") return "marketing";
  if (label === "Ajustes") return "settings";
  return "settings";
}

function childIcon(group: string, label: string) {
  if (group === "Web Control") {
    if (label === "Panel") return "panel";
    if (label === "Hero") return "hero";
    if (label === "Servicios") return "services";
    if (label === "Ofertas") return "offers";
    if (label === "Testimonios") return "testimonials";
    if (label === "Horario") return "hours";
    if (label === "Ubicación") return "location";
    return "brand";
  }

  if (group === "Ajustes") {
    if (label.startsWith("Panel")) return "panel";
    if (label.startsWith("Apariencia")) return "brand";
    return "key";
  }

  return "panel";
}

export default function Sidebar({
  onNavigate,
  isAdmin = false,
  capabilities = [],
}: {
  onNavigate?: () => void;
  isAdmin?: boolean;
  capabilities?: Capability[];
}) {
  const pathname = usePathname();

  const capSet = useMemo(() => new Set<Capability>(capabilities), [capabilities]);

  const canSee = (required?: Capability) => {
    if (!required) return true;
    if (isAdmin) return true;
    return capSet.has(required);
  };

  const defaultOpenGroups = useMemo(() => {
    const open = new Set<string>();

    for (const item of NAV) {
      if (item.type !== "group") continue;

      // Si el grupo no es visible, no lo abrimos
      if (!canSee(item.capability)) continue;

      const visibleChildren = item.items.filter((x: NavChildItem) => canSee(x.capability));
      const hasActiveChild = visibleChildren.some((x: NavChildItem) =>
        isActivePath(pathname, x.href)
      );

      if (hasActiveChild) open.add(item.label);
    }

    return open;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, isAdmin, capabilities]);

  const [openGroups, setOpenGroups] = useState<Set<string>>(defaultOpenGroups);
  const [activeSlug, setActiveSlug] = useState<string>("");

  useEffect(() => {
    const fromEnv =
      typeof process.env.NEXT_PUBLIC_DEMO_BUSINESS_SLUG === "string"
        ? process.env.NEXT_PUBLIC_DEMO_BUSINESS_SLUG
        : "";

    const read = () => {
      try {
        const fromLS = window.localStorage.getItem("bcc:activeBusinessSlug") || "";
        setActiveSlug(fromLS || fromEnv);
      } catch {
        setActiveSlug(fromEnv);
      }
    };

    read();
    const onStorage = () => read();
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const publicHref = getPublicHrefFromSlug(activeSlug);

  return (
    <aside className="flex h-full w-64 flex-col border-r border-border bg-background p-4">
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-muted ring-1 ring-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/logo-mark.svg"
              alt="Business Control Center"
              className="h-10 w-10"
              draggable={false}
            />
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold tracking-tight text-foreground">
              Business Control Center
            </div>
            <div className="text-xs text-muted-foreground">
              {isAdmin ? "Taller (Admin)" : "Panel cliente"}
            </div>
          </div>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto bcc-scrollbar">
        {NAV.map((item: NavItem) => {
          if (item.type === "link") {
            if (!canSee(item.capability)) return null;

            const active = isActivePath(pathname, item.href);
            const disabled = item.disabled === true;

            if (disabled) {
              return (
                <div
                  key={item.href}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground/70"
                >
                  <Icon name="panel" />
                  {item.label} <span className="ml-2 text-xs">(pronto)</span>
                </div>
              );
            }

            const iconName = item.label === "Web pública" ? "web" : "dashboard";

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={[
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-muted text-foreground font-medium ring-1 ring-border"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                ].join(" ")}
              >
                <Icon name={iconName} />
                {item.label}
              </Link>
            );
          }

          // group
          if (!canSee(item.capability)) return null;

          const visibleChildren = item.items.filter((child: NavChildItem) => canSee(child.capability));
          if (visibleChildren.length === 0) return null;

          const isOpen = openGroups.has(item.label) === true;
          const groupHasActive = visibleChildren.some((x: NavChildItem) =>
            isActivePath(pathname, x.href)
          );
          const groupDisabled = item.disabled === true;

          return (
            <div key={item.label} className="mt-2">
              <button
                type="button"
                onClick={() => {
                  if (groupDisabled) return;
                  setOpenGroups((prev) => {
                    const next = new Set(prev);
                    if (next.has(item.label)) next.delete(item.label);
                    else next.add(item.label);
                    return next;
                  });
                }}
                className={[
                  "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors",
                  groupDisabled
                    ? "text-muted-foreground/70 cursor-not-allowed"
                    : groupHasActive
                      ? "text-foreground font-medium"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                ].join(" ")}
                data-open={isOpen ? "true" : "false"}
              >
                <span className="flex items-center gap-2">
                  <Icon name={groupIcon(item.label)} />
                  {item.label}
                </span>
                <span className={["transition-transform", isOpen ? "rotate-90" : ""].join(" ")}>
                  <Icon name="chev" />
                </span>
              </button>

              <div
                className={[
                  "grid overflow-hidden transition-[grid-template-rows] duration-200 ease-out",
                  isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                ].join(" ")}
              >
                <div className="min-h-0">
                  <div className="ml-3 mt-1 border-l border-border pl-3">
                    {visibleChildren.map((child: NavChildItem) => {
                      const active = isActivePath(pathname, child.href);
                      const disabled = child.disabled === true;

                      if (disabled) {
                        return (
                          <div
                            key={child.href}
                            className="mt-1 flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground/70"
                          >
                            <Icon name={childIcon(item.label, child.label)} />
                            {child.label} <span className="ml-2 text-xs">(pronto)</span>
                          </div>
                        );
                      }

                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={onNavigate}
                          className={[
                            "mt-1 flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                            active
                              ? "bg-muted text-foreground font-medium ring-1 ring-border"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground",
                          ].join(" ")}
                        >
                          <Icon name={childIcon(item.label, child.label)} />
                          {child.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </nav>

      <div className="mt-auto pt-4">
        <div className="border-t border-border pt-4">
          <div className="px-1 text-xs font-medium text-muted-foreground">Accesos</div>
          <div className="mt-2 grid gap-2">
            <a
              id="sidebar-access-public"
              href={publicHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-full items-center justify-center rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:opacity-90"
              title={activeSlug ? `Abrir /${activeSlug}` : "Abrir web pública (falta slug)"}
            >
              Ver web pública ↗
            </a>

            {canSee("CAN_EDIT_WEB") ? (
              <Link
                id="sidebar-access-edit-web"
                href="/panel/web-control/hero"
                onClick={onNavigate}
                className="inline-flex w-full items-center justify-center rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium text-foreground hover:bg-muted"
              >
                Editar web pública
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </aside>
  );
}