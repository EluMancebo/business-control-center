"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import PageHeader from "@/components/panel/PageHeader";

// ── Types ──────────────────────────────────────────────────────────────────────

type AppointmentStatus =
  | "requested"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "no-show";

type AppointmentSource =
  | "web"
  | "landing"
  | "campaign"
  | "manual"
  | "whatsapp";

interface PopulatedService {
  _id: string;
  name: string;
  durationMinutes: number;
  color?: string;
}

interface PopulatedResource {
  _id: string;
  name: string;
  color?: string;
  type: string;
}

interface Appointment {
  _id: string;
  serviceId: PopulatedService | null;
  resourceId: PopulatedResource | null;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  date: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  source: AppointmentSource;
  notes?: string;
  isPrivate: boolean;
}

type ViewMode = "day" | "week";

interface ServiceOption {
  _id: string;
  name: string;
  durationMinutes: number;
}

interface ResourceOption {
  _id: string;
  name: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}


function formatDateLabel(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  const s = d.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function formatWeekLabel(ws: string): string {
  const start = new Date(ws + "T00:00:00");
  const end = addDays(start, 6);
  if (start.getMonth() === end.getMonth()) {
    const endStr = end.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    return `${start.getDate()} – ${endStr}`;
  }
  const fmt = (d: Date) =>
    d.toLocaleDateString("es-ES", { day: "numeric", month: "short" }).replace(/\./g, "");
  return `${fmt(start)} – ${fmt(end)} ${end.getFullYear()}`;
}

function formatShortDate(d: string | Date): string {
  const date = typeof d === "string" ? new Date(d + "T00:00:00") : d;
  return date.toLocaleDateString("es-ES", { weekday: "short", day: "numeric" });
}

// ── Status badge ───────────────────────────────────────────────────────────────

const STATUS_MAP: Record<
  AppointmentStatus,
  { label: string; bg: string; fg: string }
> = {
  requested: {
    label: "Solicitada",
    bg: "var(--warning-soft)",
    fg: "var(--warning-foreground)",
  },
  confirmed: {
    label: "Confirmada",
    bg: "var(--processing-soft)",
    fg: "var(--processing-foreground)",
  },
  completed: {
    label: "Completada",
    bg: "var(--success-soft)",
    fg: "var(--success-foreground)",
  },
  cancelled: {
    label: "Cancelada",
    bg: "var(--panel-badge-muted-bg)",
    fg: "var(--panel-badge-muted-fg)",
  },
  "no-show": {
    label: "No presentado",
    bg: "var(--danger-soft)",
    fg: "var(--danger-foreground)",
  },
};

function StatusBadge({ status }: { status: AppointmentStatus }) {
  const s = STATUS_MAP[status];
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
      style={{ background: s.bg, color: s.fg }}
    >
      {s.label}
    </span>
  );
}

// ── Appointment card ───────────────────────────────────────────────────────────

function AppointmentCard({
  appt,
  selected,
  onClick,
}: {
  appt: Appointment;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left rounded-lg border px-3 py-2 text-sm transition-colors"
      style={{
        background: selected
          ? "var(--processing-soft)"
          : "var(--panel-surface-2)",
        borderColor: selected ? "var(--processing)" : "var(--panel-border)",
        color: "var(--foreground)",
        boxShadow: "var(--elevation-base)",
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium truncate">{appt.customerName}</span>
        <span
          className="shrink-0 text-xs"
          style={{ color: "var(--muted-foreground)" }}
        >
          {appt.startTime} – {appt.endTime}
        </span>
      </div>
      <div
        className="mt-1 flex items-center gap-2"
        style={{ color: "var(--muted-foreground)" }}
      >
        <span className="truncate">
          {appt.serviceId?.name ?? "Servicio eliminado"}
        </span>
        {appt.resourceId && (
          <>
            <span>·</span>
            <span className="truncate">{appt.resourceId.name}</span>
          </>
        )}
      </div>
      <div className="mt-1.5">
        <StatusBadge status={appt.status} />
      </div>
    </button>
  );
}

// ── Appointment detail ─────────────────────────────────────────────────────────

function AppointmentDetail({
  id,
  onClose,
  onDeleted,
  onStatusChanged,
}: {
  id: string;
  onClose: () => void;
  onDeleted: () => void;
  onStatusChanged: () => void;
}) {
  const [appt, setAppt] = useState<Appointment | null>(null);
  const [loadingAppt, setLoadingAppt] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [changingStatus, setChangingStatus] = useState(false);

  useEffect(() => {
    setLoadingAppt(true);
    fetch(`/api/appointments/${id}`)
      .then((r) => r.json())
      .then((data) => setAppt(data.appointment ?? null))
      .finally(() => setLoadingAppt(false));
  }, [id]);

  async function handleDelete() {
    if (!confirm("¿Eliminar esta cita?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/appointments/${id}`, { method: "DELETE" });
      if (res.ok) {
        onDeleted();
        onClose();
      }
    } finally {
      setDeleting(false);
    }
  }

  async function handleStatusChange(newStatus: AppointmentStatus) {
    setChangingStatus(true);
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const data = await res.json();
        setAppt(data.appointment ?? null);
        onStatusChanged();
      }
    } finally {
      setChangingStatus(false);
    }
  }

  if (loadingAppt || !appt) {
    return (
      <aside className="w-72 shrink-0 rounded-xl border border-border p-4 shadow-elevation-interactive [background:var(--panel-card)]">
        <p className="text-sm text-muted-foreground">
          {loadingAppt ? "Cargando…" : "No encontrada."}
        </p>
      </aside>
    );
  }

  const rows: { label: string; value: string }[] = [
    { label: "Servicio", value: appt.serviceId?.name ?? "—" },
    { label: "Recurso", value: appt.resourceId?.name ?? "—" },
    { label: "Fecha", value: formatDateLabel(appt.date) },
    { label: "Horario", value: `${appt.startTime} – ${appt.endTime}` },
    { label: "Teléfono", value: appt.customerPhone || "—" },
    { label: "Email", value: appt.customerEmail || "—" },
    { label: "Canal", value: appt.source },
    { label: "Notas", value: appt.notes || "—" },
  ];

  const canChange = !["completed", "cancelled", "no-show"].includes(appt.status);

  return (
    <aside className="w-72 shrink-0 flex flex-col gap-4 rounded-xl border border-border p-4 shadow-elevation-interactive [background:var(--panel-card)]">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-base text-foreground">{appt.customerName}</p>
          <div className="mt-1">
            <StatusBadge status={appt.status} />
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded p-1 text-xs text-muted-foreground"
          aria-label="Cerrar"
        >
          ✕
        </button>
      </div>

      <div className="flex flex-col gap-1.5">
        {rows.map(({ label, value }) => (
          <div key={label} className="flex gap-2 text-sm">
            <span className="w-20 shrink-0 text-muted-foreground">{label}</span>
            <span className="text-foreground truncate">{value}</span>
          </div>
        ))}
      </div>

      {canChange && (
        <div className="flex flex-wrap gap-2">
          {appt.status === "requested" && (
            <button
              type="button"
              onClick={() => handleStatusChange("confirmed")}
              disabled={changingStatus}
              className="rounded-lg px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50 bg-processing-soft text-processing-foreground"
            >
              Confirmar
            </button>
          )}
          {appt.status === "confirmed" && (
            <button
              type="button"
              onClick={() => handleStatusChange("completed")}
              disabled={changingStatus}
              className="rounded-lg px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50 bg-success-soft text-success-foreground"
            >
              Completar
            </button>
          )}
          {(appt.status === "requested" || appt.status === "confirmed") && (
            <button
              type="button"
              onClick={() => handleStatusChange("cancelled")}
              disabled={changingStatus}
              className="rounded-lg px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50 bg-danger-soft text-danger-foreground"
            >
              Cancelar
            </button>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={handleDelete}
        disabled={deleting}
        className="mt-auto rounded-lg border border-danger px-3 py-1.5 text-sm font-medium text-danger transition-opacity disabled:opacity-50"
      >
        {deleting ? "Eliminando…" : "Eliminar cita"}
      </button>
    </aside>
  );
}

// ── New appointment form ───────────────────────────────────────────────────────

function NewAppointmentForm({
  defaultDate,
  onClose,
  onCreated,
}: {
  defaultDate: string;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [services, setServices] = useState<ServiceOption[]>([]);
  const [resources, setResources] = useState<ResourceOption[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    serviceId: "",
    resourceId: "",
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    date: defaultDate,
    startTime: "09:00",
    notes: "",
    source: "manual",
    isPrivate: false,
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/appointments/services").then((r) => r.json()),
      fetch("/api/appointments/resources").then((r) => r.json()),
    ]).then(([sData, rData]) => {
      setServices(sData.services ?? []);
      setResources(rData.resources ?? []);
    });
  }, []);

  function patchForm(patch: Partial<typeof form>) {
    setForm((prev) => ({ ...prev, ...patch }));
  }

  async function handleSave() {
    if (!form.serviceId || !form.customerName || !form.date || !form.startTime) {
      setError("Completa los campos obligatorios (*).");
      return;
    }
    const service = services.find((s) => s._id === form.serviceId);
    if (!service) {
      setError("Servicio no encontrado.");
      return;
    }
    const [h, m] = form.startTime.split(":").map(Number);
    const total = h * 60 + m + service.durationMinutes;
    const endTime = `${String(Math.floor(total / 60) % 24).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;

    setSaving(true);
    setError(null);
    try {
      const body: Record<string, unknown> = {
        serviceId: form.serviceId,
        customerName: form.customerName,
        date: form.date,
        startTime: form.startTime,
        endTime,
        source: form.source,
        isPrivate: form.isPrivate,
      };
      if (form.resourceId) body.resourceId = form.resourceId;
      if (form.customerPhone) body.customerPhone = form.customerPhone;
      if (form.customerEmail) body.customerEmail = form.customerEmail;
      if (form.notes) body.notes = form.notes;

      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        onCreated();
      } else {
        const data = await res.json();
        setError(data.error ?? "Error al guardar.");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <aside className="w-full md:w-80 lg:w-96 shrink-0 flex flex-col gap-3 rounded-xl border border-border p-4 [background:var(--panel-card)] max-h-[calc(100vh-12rem)] overflow-hidden">
      <div className="flex items-center justify-between gap-2">
        <p className="font-semibold text-base text-foreground">Nueva cita</p>
        <button
          type="button"
          onClick={onClose}
          className="rounded p-1 text-xs text-muted-foreground"
          aria-label="Cerrar"
        >
          ✕
        </button>
      </div>

      <div className="flex flex-col gap-3 overflow-y-auto">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">Servicio *</label>
          <select
            value={form.serviceId}
            onChange={(e) => patchForm({ serviceId: e.target.value })}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm bg-card text-foreground"
          >
            <option value="">Selecciona un servicio</option>
            {services.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name} ({s.durationMinutes} min)
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">Recurso / Operario</label>
          <select
            value={form.resourceId}
            onChange={(e) => patchForm({ resourceId: e.target.value })}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm bg-card text-foreground"
          >
            <option value="">Sin asignar</option>
            {resources.map((r) => (
              <option key={r._id} value={r._id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">Fecha *</label>
          <input
            type="date"
            value={form.date}
            onChange={(e) => patchForm({ date: e.target.value })}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm bg-card text-foreground"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">Hora de inicio *</label>
          <input
            type="time"
            value={form.startTime}
            onChange={(e) => patchForm({ startTime: e.target.value })}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm bg-card text-foreground"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">Nombre cliente *</label>
          <input
            type="text"
            value={form.customerName}
            onChange={(e) => patchForm({ customerName: e.target.value })}
            placeholder="Nombre y apellido"
            className="w-full rounded-lg border border-border px-3 py-2 text-sm bg-card text-foreground"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">Teléfono</label>
          <input
            type="tel"
            value={form.customerPhone}
            onChange={(e) => patchForm({ customerPhone: e.target.value })}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm bg-card text-foreground"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">Email</label>
          <input
            type="email"
            value={form.customerEmail}
            onChange={(e) => patchForm({ customerEmail: e.target.value })}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm bg-card text-foreground"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">Notas</label>
          <textarea
            value={form.notes}
            onChange={(e) => patchForm({ notes: e.target.value })}
            rows={2}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm bg-card text-foreground resize-none"
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
          <input
            type="checkbox"
            checked={form.isPrivate}
            onChange={(e) => patchForm({ isPrivate: e.target.checked })}
            className="rounded"
          />
          Cita privada (comodín)
        </label>
      </div>

      {error && <p className="text-xs text-danger">{error}</p>}

      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors disabled:opacity-50 [background:var(--primary)] [color:var(--primary-foreground)]"
        >
          {saving ? "Guardando…" : "Guardar"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="flex-1 rounded-lg border border-border px-3 py-2 text-sm font-medium transition-colors text-foreground bg-card"
        >
          Cancelar
        </button>
      </div>
    </aside>
  );
}

// ── Day view ───────────────────────────────────────────────────────────────────

function DayView({
  date,
  appointments,
  selectedId,
  onSelect,
}: {
  date: string;
  appointments: Appointment[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const dayAppts = appointments
    .filter((a) => a.date === date)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <div className="flex flex-col gap-2">
      <p
        className="text-sm font-medium"
        style={{ color: "var(--muted-foreground)" }}
      >
        {formatDateLabel(date)}
      </p>
      {dayAppts.length === 0 ? (
        <p
          className="rounded-lg border px-4 py-6 text-center text-sm"
          style={{
            borderColor: "var(--panel-border)",
            color: "var(--muted-foreground)",
          }}
        >
          Sin citas para este día.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {dayAppts.map((a) => (
            <AppointmentCard
              key={a._id}
              appt={a}
              selected={selectedId === a._id}
              onClick={() => onSelect(a._id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Week view ──────────────────────────────────────────────────────────────────

function WeekView({
  weekStart,
  appointments,
  selectedId,
  onSelect,
}: {
  weekStart: string;
  appointments: Appointment[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const days = Array.from({ length: 7 }, (_, i) => addDays(new Date(weekStart), i));

  return (
    <div className="grid grid-cols-7 gap-2">
      {days.map((d) => {
        const iso = toISODate(d);
        const dayAppts = appointments
          .filter((a) => a.date === iso)
          .sort((a, b) => a.startTime.localeCompare(b.startTime));

        return (
          <div key={iso} className="flex flex-col gap-1.5">
            <p
              className="text-xs font-medium text-center capitalize pb-1 border-b"
              style={{
                color: "var(--muted-foreground)",
                borderColor: "var(--panel-border)",
              }}
            >
              {formatShortDate(d)}
            </p>
            {dayAppts.length === 0 ? (
              <p
                className="text-center text-xs py-4"
                style={{ color: "var(--muted-foreground)" }}
              >
                —
              </p>
            ) : (
              dayAppts.map((a) => (
                <button
                  key={a._id}
                  type="button"
                  onClick={() => onSelect(a._id)}
                  className="w-full text-left rounded px-2 py-1.5 text-xs transition-colors"
                  style={{
                    background:
                      selectedId === a._id
                        ? "var(--processing-soft)"
                        : "var(--panel-surface-2)",
                    borderWidth: 1,
                    borderStyle: "solid",
                    borderColor:
                      selectedId === a._id
                        ? "var(--processing)"
                        : "var(--panel-border)",
                    color: "var(--foreground)",
                  }}
                >
                  <span className="font-medium block truncate">
                    {a.startTime} {a.customerName}
                  </span>
                  <span
                    className="block truncate"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    {a.serviceId?.name ?? "—"}
                  </span>
                </button>
              ))
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function AppointmentsPage() {
  const today = toISODate(new Date());

  const [view, setView] = useState<ViewMode>("day");
  const [currentDate, setCurrentDate] = useState<string>(today);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const weekStart = useMemo(() => {
    const d = new Date(currentDate);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    return d.toISOString().split("T")[0];
  }, [currentDate]);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const url =
        view === "day"
          ? `/api/appointments?date=${currentDate}`
          : `/api/appointments`;
      const res = await fetch(url);
      if (!res.ok) return;
      const data = await res.json();
      let list: Appointment[] = data.appointments ?? [];

      if (view === "week") {
        const end = toISODate(addDays(new Date(weekStart), 6));
        list = list.filter((a) => a.date >= weekStart && a.date <= end);
      }

      setAppointments(list);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, currentDate]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  function handlePrev() {
    if (view === "day") {
      setCurrentDate(toISODate(addDays(new Date(currentDate + "T00:00:00"), -1)));
    } else {
      setCurrentDate(toISODate(addDays(new Date(weekStart), -7)));
    }
    setSelectedId(null);
  }

  function handleNext() {
    if (view === "day") {
      setCurrentDate(toISODate(addDays(new Date(currentDate + "T00:00:00"), 1)));
    } else {
      setCurrentDate(toISODate(addDays(new Date(weekStart), 7)));
    }
    setSelectedId(null);
  }

  function handleToday() {
    setCurrentDate(today);
    setSelectedId(null);
  }

  const navLabel =
    view === "day"
      ? formatDateLabel(currentDate)
      : formatWeekLabel(weekStart);

  return (
    <>
      <PageHeader
        title="Citas"
        description="Vista operativa: gestión de citas del negocio."
        actions={
          <button
            type="button"
            onClick={() => {
              setShowForm(true);
              setSelectedId(null);
            }}
            className="rounded-lg px-4 py-2 text-sm font-medium transition-colors [background:var(--primary)] [color:var(--primary-foreground)]"
          >
            + Nueva cita
          </button>
        }
      />

      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {/* View toggle */}
        <div
          className="flex rounded-lg border overflow-hidden"
          style={{ borderColor: "var(--panel-border)" }}
        >
          {(["day", "week"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => { setView(v); setSelectedId(null); }}
              className="px-3 py-1.5 text-sm font-medium transition-colors"
              style={{
                background:
                  view === v
                    ? "var(--primary)"
                    : "var(--panel-surface-2)",
                color:
                  view === v
                    ? "var(--primary-foreground)"
                    : "var(--foreground)",
              }}
            >
              {v === "day" ? "Día" : "Semana"}
            </button>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handlePrev}
            className="rounded-lg border px-2.5 py-1.5 text-sm transition-colors"
            style={{
              borderColor: "var(--panel-border)",
              background: "var(--panel-surface-2)",
              color: "var(--foreground)",
            }}
            aria-label="Anterior"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={handleToday}
            className="rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors"
            style={{
              borderColor: "var(--panel-border)",
              background: "var(--panel-surface-2)",
              color: "var(--foreground)",
            }}
          >
            Hoy
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="rounded-lg border px-2.5 py-1.5 text-sm transition-colors"
            style={{
              borderColor: "var(--panel-border)",
              background: "var(--panel-surface-2)",
              color: "var(--foreground)",
            }}
            aria-label="Siguiente"
          >
            ›
          </button>
        </div>

        {/* Date label */}
        <span
          className="text-sm font-medium"
          style={{ color: "var(--muted-foreground)" }}
        >
          {navLabel}
        </span>

        {/* Loading indicator */}
        {loading && (
          <span
            className="ml-auto text-xs"
            style={{ color: "var(--muted-foreground)" }}
          >
            Cargando…
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex gap-4 items-start">
        {/* Main calendar area */}
        <div className="min-w-0 flex-1">
          {view === "day" ? (
            <DayView
              date={currentDate}
              appointments={appointments}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          ) : (
            <WeekView
              weekStart={weekStart}
              appointments={appointments}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          )}
        </div>

        {/* Detail / Form panel */}
        {showForm && (
          <NewAppointmentForm
            defaultDate={currentDate}
            onClose={() => setShowForm(false)}
            onCreated={() => {
              setShowForm(false);
              fetchAppointments();
            }}
          />
        )}
        {!showForm && selectedId && (
          <AppointmentDetail
            id={selectedId}
            onClose={() => setSelectedId(null)}
            onDeleted={() => {
              setSelectedId(null);
              fetchAppointments();
            }}
            onStatusChanged={() => fetchAppointments()}
          />
        )}
      </div>
    </>
  );
}
