// src/components/panel/settings/PanelThemeCard.tsx
"use client";

import { useEffect, useState } from "react";

type PanelMode = "light" | "dark";
type PanelAccent = "ocean" | "sunset" | "slate";

const ACCENTS: { key: PanelAccent; label: string }[] = [
  { key: "ocean", label: "Ocean" },
  { key: "sunset", label: "Sunset" },
  { key: "slate", label: "Slate" },
];

function applyMode(mode: PanelMode) {
  document.documentElement.classList.toggle("dark", mode === "dark");
}

function applyAccent(accent: PanelAccent) {
  document.documentElement.setAttribute("data-panel-accent", accent);
}

function parseMode(value: string | null): PanelMode {
  return value === "dark" ? "dark" : "light";
}

function parseAccent(value: string | null): PanelAccent {
  if (value === "sunset") return "sunset";
  if (value === "slate") return "slate";
  return "ocean";
}

export default function PanelThemeCard() {
  const [mode, setMode] = useState<PanelMode>("light");
  const [accent, setAccent] = useState<PanelAccent>("ocean");

  // Leer preferencias (sin setState sync dentro del effect)
  useEffect(() => {
    const storedMode = window.localStorage.getItem("bcc:panelMode");
    const storedAccent = window.localStorage.getItem("bcc:panelAccent");

    const nextMode = parseMode(storedMode);
    const nextAccent = parseAccent(storedAccent);

    applyMode(nextMode);
    applyAccent(nextAccent);

    const defer = typeof queueMicrotask === "function"
      ? queueMicrotask
      : (fn: () => void) => Promise.resolve().then(fn);

    defer(() => {
      setMode(nextMode);
      setAccent(nextAccent);
    });
  }, []);

  // Persistir y aplicar cuando el usuario cambie
  useEffect(() => {
    window.localStorage.setItem("bcc:panelMode", mode);
    applyMode(mode);
  }, [mode]);

  useEffect(() => {
    window.localStorage.setItem("bcc:panelAccent", accent);
    applyAccent(accent);
  }, [accent]);

  return (
    <div id="panel-theme-card" className="rounded-2xl border border-border bg-card p-6">
      <h2 id="panel-theme-title" className="text-base font-semibold">
        Apariencia del panel
      </h2>
      <p id="panel-theme-text" className="mt-2 text-sm text-muted-foreground">
        Modo claro/oscuro y acento del panel (v0). Se guarda en localStorage.
      </p>

      <div id="panel-theme-controls" className="mt-4 grid gap-3">
        <label id="panel-theme-mode-label" className="grid gap-1 text-sm">
          <span className="text-muted-foreground">Modo</span>
          <select
            id="panel-theme-mode"
            value={mode}
            onChange={(e) => setMode(e.target.value === "dark" ? "dark" : "light")}
            className="h-10 rounded-lg border border-border bg-background px-3 text-sm"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </label>

        <label id="panel-theme-accent-label" className="grid gap-1 text-sm">
          <span className="text-muted-foreground">Acento</span>
          <select
            id="panel-theme-accent"
            value={accent}
            onChange={(e) => {
              const v = e.target.value;
              const next: PanelAccent = v === "sunset" ? "sunset" : v === "slate" ? "slate" : "ocean";
              setAccent(next);
            }}
            className="h-10 rounded-lg border border-border bg-background px-3 text-sm"
          >
            {ACCENTS.map((a) => (
              <option key={a.key} value={a.key}>
                {a.label}
              </option>
            ))}
          </select>
        </label>

        <div id="panel-theme-applied" className="text-xs text-muted-foreground">
          Aplicado: <span className="font-medium text-foreground">{accent}</span> /{" "}
          <span className="font-medium text-foreground">{mode}</span>
        </div>
      </div>
    </div>
  );
}    