"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type RoleKey = "owner" | "marketing" | "web";

type RoleItem = {
  key: RoleKey;
  label: string;
  description: string;
};

const ROLES: RoleItem[] = [
  { key: "owner", label: "Propietario", description: "Control total del negocio y de los accesos." },
  { key: "marketing", label: "Marketing", description: "Campañas, ofertas y comunicaciones." },
  { key: "web", label: "Web Control", description: "Contenido web pública: hero, secciones y apariencia." },
];

function storageKey(role: RoleKey) {
  return `bcc:access:${role}:password`;
}

function generatePassword(length: number) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
  const bytes = new Uint8Array(length);
  window.crypto.getRandomValues(bytes);
  let out = "";
  for (let i = 0; i < bytes.length; i++) out += chars[bytes[i] % chars.length];
  return out;
}

function loadPasswords(): Record<RoleKey, string> {
  const next: Record<RoleKey, string> = { owner: "", marketing: "", web: "" };
  try {
    for (const r of ROLES) next[r.key] = window.localStorage.getItem(storageKey(r.key)) || "";
  } catch {}
  return next;
}

export default function AccessSettingsPage() {
  const [passwords, setPasswords] = useState<Record<RoleKey, string>>(() => loadPasswords());
  const [visible, setVisible] = useState<Record<RoleKey, boolean>>({
    owner: false,
    marketing: false,
    web: false,
  });

  const hasOwnerPassword = useMemo(() => Boolean(passwords.owner), [passwords.owner]);

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-8">
      <header className="mb-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Contraseñas y accesos</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Gestión de claves por área (v0 demo). Solo visible/gestionable por Propietario.
            </p>
          </div>

          <Link
            id="access-back"
            href="/panel/settings"
            className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium hover:bg-muted"
          >
            ← Volver
          </Link>
        </div>

        {!hasOwnerPassword ? (
          <div className="mt-4 rounded-xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
            Recomendación: genera primero la contraseña de{" "}
            <span className="font-medium text-foreground">Propietario</span>.
          </div>
        ) : null}
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        {ROLES.map((r) => {
          const value = passwords[r.key];
          const show = visible[r.key] === true;

          return (
            <div key={r.key} className="rounded-2xl border border-border bg-card p-6">
              <h2 className="text-base font-semibold">{r.label}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{r.description}</p>

              <div className="mt-4 grid gap-2">
                <div className="rounded-lg border border-border bg-background px-3 py-2 text-sm">
                  <span className="text-muted-foreground">Clave:</span>{" "}
                  <span className="font-medium">{value ? (show ? value : "••••••••••") : "—"}</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium hover:bg-muted"
                    onClick={() => {
                      const nextPwd = generatePassword(14);
                      try { window.localStorage.setItem(storageKey(r.key), nextPwd); } catch {}
                      setPasswords((prev) => ({ ...prev, [r.key]: nextPwd }));
                    }}
                  >
                    Generar
                  </button>

                  <button
                    type="button"
                    className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium hover:bg-muted"
                    onClick={() => setVisible((prev) => ({ ...prev, [r.key]: !prev[r.key] }))}
                    disabled={!value}
                  >
                    {show ? "Ocultar" : "Mostrar"}
                  </button>

                  <button
                    type="button"
                    className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium hover:bg-muted"
                    onClick={() => {
                      try { window.localStorage.removeItem(storageKey(r.key)); } catch {}
                      setPasswords((prev) => ({ ...prev, [r.key]: "" }));
                      setVisible((prev) => ({ ...prev, [r.key]: false }));
                    }}
                    disabled={!value}
                  >
                    Reset
                  </button>
                </div>

                <p className="text-xs text-muted-foreground">
                  Nota (v0): mañana lo conectamos con roles reales (owner/marketing/web) y permisos.
                </p>
              </div>
            </div>
          );
        })}
      </section>
    </main>
  );
}  
