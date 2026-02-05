"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type LoginResponse = { ok: true } | { error: string };

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();

  const [email, setEmail] = useState("emango0298@gmail.com");
  const [password, setPassword] = useState("");
  const [nextPath, setNextPath] = useState("/panel/dashboard");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const n = params.get("next");
    if (n) setNextPath(n);
  }, [params]);

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
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-md">
        <h1 className="text-2xl font-bold mb-1">Entrar al panel</h1>
        <p className="text-sm text-gray-500 mb-6">
          Acceso a <span className="font-medium">{nextPath}</span>
        </p>
<form onSubmit={handleSubmit} className="space-y-4">
  <div>
    <label htmlFor="email" className="block text-sm font-medium mb-1">
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
      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
    />
  </div>

  <div>
    <label htmlFor="password" className="block text-sm font-medium mb-1">
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
      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
    />
  </div>

  <button
    type="submit"
    disabled={loading}
    className="w-full rounded-xl bg-black py-2 font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
  >
    {loading ? "Entrando..." : "Entrar"}
  </button>

  {error && <div className="text-sm font-medium text-red-600">{error}</div>}
</form>

        
      </div>
    </main>
  );
}
