// src/components/brand/BrandPreview.tsx
"use client";

import { useEffect, useState } from "react";

function buildPreviewUrl() {
  const u = new URL("/", window.location.origin);
  u.searchParams.set("_preview", "1");
  u.searchParams.set("_ts", String(Date.now()));
  return u.toString();
}

export default function BrandPreview() {
  const [src, setSrc] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    return buildPreviewUrl();
  });

  useEffect(() => {
    function refresh() {
      setSrc(buildPreviewUrl());
    }

    function onBrandEvent() {
      refresh();
    }

    function onStorage(e: StorageEvent) {
      if (e.storageArea === localStorage) refresh();
    }

    window.addEventListener("bcc:brand", onBrandEvent as EventListener);
    window.addEventListener("storage", onStorage);

    let bc: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== "undefined") {
      bc = new BroadcastChannel("bcc:brand");
      bc.onmessage = () => refresh();
    }

    return () => {
      window.removeEventListener("bcc:brand", onBrandEvent as EventListener);
      window.removeEventListener("storage", onStorage);
      if (bc) bc.close();
    };
  }, []);

  return (
    <div className="rounded-2xl border border-(--border) bg-(--card) shadow-sm">
      <div className="flex items-center justify-between border-b border-(--border) px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-(--card-foreground)">
            Preview web pública
          </p>
          <p className="text-xs text-(--muted-foreground)">
            Se refresca automáticamente al cambiar el Brand.
          </p>
        </div>

        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="rounded-lg border border-(--border) bg-background px-3 py-2 text-xs font-medium text-foreground hover:bg-(--muted)"
        >
          Abrir ↗
        </a>
      </div>

      <div className="aspect-16/10 w-full">
        <iframe
          title="Preview web pública"
          src={src}
          className="h-full w-full rounded-b-2xl"
        />
      </div>
    </div>
  );
}
