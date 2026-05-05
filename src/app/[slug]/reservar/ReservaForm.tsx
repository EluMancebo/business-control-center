"use client";

import { useState } from "react";
import Link from "next/link";

// ── Types ────────────────────────────────
type Service = {
  _id: string;
  name: string;
  description?: string;
  durationMinutes: number;
  priceText?: string;
};

type FormData = {
  serviceId: string;
  date: string;
  startTime: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
};

type Step = "service" | "date" | "time" | "customer" | "success";

// ── Component ────────────────────────────
export default function ReservaForm({
  businessId,
  businessSlug,
  services,
}: {
  businessId: string;
  businessSlug: string;
  services: Service[];
}) {
  const [step, setStep] = useState<Step>("service");
  const [form, setForm] = useState<FormData>({
    serviceId: "",
    date: "",
    startTime: "",
    customerName: "",
    customerPhone: "",
    customerEmail: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedService = services.find((s) => s._id === form.serviceId);

  function patchForm(patch: Partial<FormData>) {
    setForm((prev) => ({ ...prev, ...patch }));
  }

  async function handleSubmit() {
    if (!form.customerName || !form.customerPhone) {
      setError("Nombre y teléfono son obligatorios.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const [h, m] = form.startTime.split(":").map(Number);
      const totalMinutes = h * 60 + m + (selectedService?.durationMinutes || 0);
      const endTime = `${String(Math.floor(totalMinutes / 60) % 24).padStart(2, "0")}:${String(totalMinutes % 60).padStart(2, "0")}`;

      const body = {
        serviceId: form.serviceId,
        customerName: form.customerName,
        customerPhone: form.customerPhone,
        customerEmail: form.customerEmail || undefined,
        date: form.date,
        startTime: form.startTime,
        endTime,
        source: "web",
        isPrivate: false,
      };

      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setStep("success");
      } else {
        const data = await res.json();
        setError(data.error || "Error al crear la cita.");
      }
    } catch {
      setError("Error de conexión. Inténtalo de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  // ── Render por step ──────────────────────
  if (step === "success") {
    return (
      <div
        className="rounded-xl border p-8 text-center"
        style={{
          borderColor: "var(--border)",
          background: "var(--card)",
        }}
      >
        <div
          className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full text-3xl"
          style={{ background: "var(--success-soft)" }}
        >
          ✓
        </div>
        <h2
          className="text-xl font-bold"
          style={{ color: "var(--foreground)" }}
        >
          ¡Reserva confirmada!
        </h2>
        <p
          className="mt-2 text-sm"
          style={{ color: "var(--muted-foreground)" }}
        >
          Hemos recibido tu solicitud. Recibirás una confirmación en breve.
        </p>
        <div className="mt-6 space-y-2 text-sm">
          <p><strong>Servicio:</strong> {selectedService?.name}</p>
          <p><strong>Fecha:</strong> {new Date(form.date + "T00:00:00").toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}</p>
          <p><strong>Hora:</strong> {form.startTime}</p>
        </div>
        <Link
          href={`/${businessSlug}`}
          className="mt-6 inline-block rounded-lg px-4 py-2 text-sm font-medium"
          style={{
            background: "var(--primary)",
            color: "var(--primary-foreground)",
          }}
        >
          Volver al inicio
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div className="flex items-center gap-2">
        {["service", "date", "time", "customer"].map((s, i) => (
          <div
            key={s}
            className="h-1 flex-1 rounded-full transition-colors"
            style={{
              background:
                ["service", "date", "time", "customer"].indexOf(step) >= i
                  ? "var(--primary)"
                  : "var(--muted)",
            }}
          />
        ))}
      </div>

      {/* Step: Servicio */}
      {step === "service" && (
        <div className="space-y-4">
          <h2
            className="text-lg font-semibold"
            style={{ color: "var(--foreground)" }}
          >
            Elige el servicio
          </h2>
          {services.map((service) => (
            <button
              key={service._id}
              type="button"
              onClick={() => {
                patchForm({ serviceId: service._id });
                setStep("date");
              }}
              className="w-full rounded-xl border p-4 text-left transition-all hover:shadow-md sm:p-6"
              style={{
                borderColor: form.serviceId === service._id ? "var(--primary)" : "var(--border)",
                background: "var(--card)",
              }}
            >
              <h3
                className="text-lg font-semibold"
                style={{ color: "var(--foreground)" }}
              >
                {service.name}
              </h3>
              {service.description && (
                <p
                  className="mt-1 text-sm"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  {service.description}
                </p>
              )}
              <div className="mt-3 flex flex-wrap gap-4 text-sm" style={{ color: "var(--muted-foreground)" }}>
                <span>⏱️ {service.durationMinutes} min</span>
                {service.priceText && <span>💰 {service.priceText}</span>}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Step: Fecha */}
      {step === "date" && (
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => setStep("service")}
            className="text-sm"
            style={{ color: "var(--muted-foreground)" }}
          >
            ← Cambiar servicio
          </button>
          <h2 className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>
            Elige la fecha
          </h2>
          <input
            type="date"
            value={form.date}
            onChange={(e) => patchForm({ date: e.target.value })}
            min={new Date().toISOString().split("T")[0]}
            className="w-full rounded-lg border px-4 py-3 text-base"
            style={{
              borderColor: "var(--border)",
              background: "var(--card)",
              color: "var(--foreground)",
            }}
          />
          <button
            type="button"
            onClick={() => form.date && setStep("time")}
            disabled={!form.date}
            className="w-full rounded-lg px-4 py-3 font-medium disabled:opacity-50"
            style={{
              background: "var(--primary)",
              color: "var(--primary-foreground)",
            }}
          >
            Continuar
          </button>
        </div>
      )}

      {/* Step: Hora */}
      {step === "time" && (
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => setStep("date")}
            className="text-sm"
            style={{ color: "var(--muted-foreground)" }}
          >
            ← Cambiar fecha
          </button>
          <h2 className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>
            Elige la hora
          </h2>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {["09:00", "10:00", "11:00", "12:00", "16:00", "17:00", "18:00", "19:00"].map((time) => (
              <button
                key={time}
                type="button"
                onClick={() => {
                  patchForm({ startTime: time });
                  setStep("customer");
                }}
                className="rounded-lg border px-3 py-2 text-sm font-medium transition-all hover:shadow"
                style={{
                  borderColor: form.startTime === time ? "var(--primary)" : "var(--border)",
                  /* --primary-soft no existe en el contrato; fallback a --muted */
                  background: form.startTime === time ? "var(--primary-soft, var(--muted))" : "var(--card)",
                  color: "var(--foreground)",
                }}
              >
                {time}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step: Datos cliente */}
      {step === "customer" && (
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => setStep("time")}
            className="text-sm"
            style={{ color: "var(--muted-foreground)" }}
          >
            ← Cambiar hora
          </button>
          <h2 className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>
            Tus datos
          </h2>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Nombre completo *"
              value={form.customerName}
              onChange={(e) => patchForm({ customerName: e.target.value })}
              className="w-full rounded-lg border px-4 py-3"
              style={{
                borderColor: "var(--border)",
                background: "var(--card)",
                color: "var(--foreground)",
              }}
            />
            <input
              type="tel"
              placeholder="Teléfono *"
              value={form.customerPhone}
              onChange={(e) => patchForm({ customerPhone: e.target.value })}
              className="w-full rounded-lg border px-4 py-3"
              style={{
                borderColor: "var(--border)",
                background: "var(--card)",
                color: "var(--foreground)",
              }}
            />
            <input
              type="email"
              placeholder="Email (opcional)"
              value={form.customerEmail}
              onChange={(e) => patchForm({ customerEmail: e.target.value })}
              className="w-full rounded-lg border px-4 py-3"
              style={{
                borderColor: "var(--border)",
                background: "var(--card)",
                color: "var(--foreground)",
              }}
            />
          </div>
          {error && (
            <p className="text-sm" style={{ color: "var(--danger)" }}>
              {error}
            </p>
          )}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="w-full rounded-lg px-4 py-3 font-medium disabled:opacity-50"
            style={{
              background: "var(--primary)",
              color: "var(--primary-foreground)",
            }}
          >
            {saving ? "Confirmando..." : "Confirmar reserva"}
          </button>
        </div>
      )}
    </div>
  );
}
