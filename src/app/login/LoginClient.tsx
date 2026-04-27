// src/app/login/LoginClient.tsx
"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type LoginResponse = { ok: true } | { error: string };

export default function LoginClient() {
  const router = useRouter();
  const params = useSearchParams();

  const nextPath = useMemo(() => {
    const n = params.get("next");
    const requestedPath = n && n.trim().length ? n : null;

    return requestedPath || "/panel/taller";
  }, [params]);

  const [email, setEmail] = useState("emango0298@gmail.com");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = (await res.json()) as LoginResponse;

      if (!res.ok) {
        setError("error" in data ? data.error : "Error de login");
        return;
      }

      router.push(nextPath);
      router.refresh();
    } catch {
      setError("Error de red");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-6 py-10">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-card-foreground shadow-sm">
          <div className="mb-6 flex items-center gap-3">
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
              <div className="truncate text-sm font-semibold tracking-tight">
                Business Control Center
              </div>
              <div className="text-xs text-muted-foreground">Acceso al panel</div>
            </div>
          </div>

          <h1 className="mb-1 text-2xl font-bold">Entrar al panel</h1>
          <p className="mb-6 text-sm text-muted-foreground">
            Acceso a <span className="font-medium text-foreground">{nextPath}</span>
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                name="email"
                title="Email"
                placeholder="tu@email.com"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground/70 focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-medium">
                Password
              </label>
              <input
                id="password"
                name="password"
                title="Password"
                placeholder="Tu contraseña"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground/70 focus:ring-2 focus:ring-ring"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full cursor-pointer rounded-xl bg-primary py-2 font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>

            {error && (
              <div className="rounded-lg border border-border bg-muted px-3 py-2 text-sm font-medium text-red-500">
                {error}
              </div>
            )}
          </form>

          <div className="mt-6 text-xs text-muted-foreground">
            Tip: si entras desde un enlace protegido, volverás automáticamente a{" "}
            <span className="font-medium text-foreground">{nextPath}</span>.
          </div>
        </div>
      </div>
    </main>
  );
}

