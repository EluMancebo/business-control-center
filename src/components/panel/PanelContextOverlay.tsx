// src/components/panel/PanelContextOverlay.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

type Ctx = "TALLER" | "PANEL" | "WEB";

function getCtx(pathname: string): Ctx {
  if (pathname.startsWith("/panel/taller")) return "TALLER";
  if (pathname.startsWith("/panel/web-control")) return "WEB";
  return "PANEL";
}

function readDomBrand() {
  const el = document.documentElement;
  return {
    palette: el.getAttribute("data-brand-palette") || "—",
    mode: el.getAttribute("data-brand-mode") || "—",
  };
}

function readActiveSlug(): string {
  return window.localStorage.getItem("bcc:activeBusinessSlug")?.trim() || "";
}

function defer(fn: () => void) {
  const q =
    typeof queueMicrotask === "function"
      ? queueMicrotask
      : (cb: () => void) => Promise.resolve().then(cb);
  q(fn);
}

export default function PanelContextOverlay() {
  const pathname = usePathname();

  const ctx = useMemo(() => getCtx(pathname), [pathname]);

  const [mounted, setMounted] = useState(false);
  const [palette, setPalette] = useState("—");
  const [mode, setMode] = useState("—");
  const [bizName, setBizName] = useState<string>("—");

  useEffect(() => {
    defer(() => {
      setMounted(true);
      const b = readDomBrand();
      setPalette(b.palette);
      setMode(b.mode);
    });

    const el = document.documentElement;
    const obs = new MutationObserver(() => {
      const b = readDomBrand();
      setPalette(b.palette);
      setMode(b.mode);
    });

    obs.observe(el, {
      attributes: true,
      attributeFilter: ["data-brand-palette", "data-brand-mode"],
    });

    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (ctx === "TALLER") {
      setBizName("BCC");
      return;
    }

    const slug = readActiveSlug();
    if (!slug) {
      setBizName("—");
      return;
    }

    let alive = true;

    (async () => {
      try {
        const res = await fetch(`/api/web/public/business?slug=${encodeURIComponent(slug)}`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error("bad");
        const json = (await res.json()) as { business?: { name?: string } };
        const name = json?.business?.name?.trim() || slug;
        if (alive) setBizName(name);
      } catch {
        if (alive) setBizName(slug);
      }
    })();

    return () => {
      alive = false;
    };
  }, [mounted, ctx, pathname]);

  const icon = ctx === "TALLER" ? "🛠️" : ctx === "WEB" ? "🌍" : "🧩";

  return (
    <div
      className="pointer-events-none fixed left-1/2 top-2 z-50 -translate-x-1/2"
      suppressHydrationWarning
    >
      <div className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-border bg-card/90 px-3 py-1 text-xs text-card-foreground shadow-sm backdrop-blur">
        <span aria-hidden="true">{icon}</span>
        <span className="font-semibold">{ctx}</span>
        <span className="text-muted-foreground">{bizName}</span>
        <span className="text-muted-foreground">
          {palette}/{mode}
        </span>
      </div>
    </div>
  );
}    