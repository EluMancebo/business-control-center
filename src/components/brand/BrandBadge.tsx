"use client";

import { useEffect, useState } from "react";
import { DEFAULT_BRAND } from "@/lib/brand/storage";

function safeBrandName(value: string) {
  const v = value?.trim();
  return v && v.length > 0 ? v : DEFAULT_BRAND.brandName;
}

type View = {
  mounted: boolean;
  palette: string;
  mode: string;
  brandName: string;
};

function readBrandFromDom(): Omit<View, "mounted"> {
  const el = document.documentElement;
  const palette = el.getAttribute("data-brand-palette") ?? "—";
  const mode = el.getAttribute("data-brand-mode") ?? "—";
  const brandName = el.getAttribute("data-brand-name") ?? DEFAULT_BRAND.brandName;
  return { palette, mode, brandName };
}

function defer(fn: () => void) {
  const q = typeof queueMicrotask === "function"
    ? queueMicrotask
    : (cb: () => void) => Promise.resolve().then(cb);
  q(fn);
}

export default function BrandBadge() {
  const [view, setView] = useState<View>({
    mounted: false,
    palette: "—",
    mode: "—",
    brandName: DEFAULT_BRAND.brandName,
  });

  useEffect(() => {
    const el = document.documentElement;

    const apply = () => {
      const next = readBrandFromDom();
      // ✅ Evita "setState sync dentro de effect"
      defer(() => {
        setView({
          mounted: true,
          palette: next.palette,
          mode: next.mode,
          brandName: next.brandName,
        });
      });
    };

    apply();

    const obs = new MutationObserver(() => apply());
    obs.observe(el, {
      attributes: true,
      attributeFilter: ["data-brand-palette", "data-brand-mode", "data-brand-name"],
    });

    return () => obs.disconnect();
  }, []);

  return (
    <div
      className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-sm text-card-foreground shadow-sm"
      suppressHydrationWarning
    >
      <span className="h-2 w-2 rounded-full bg-primary" />

      <span className="font-medium" suppressHydrationWarning>
        {view.mounted ? safeBrandName(view.brandName) : ""}
      </span>

      <span className="text-muted-foreground" suppressHydrationWarning>
        {view.mounted ? `${view.palette}/${view.mode}` : ""}
      </span>
    </div>
  );
}  