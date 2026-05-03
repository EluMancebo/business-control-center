"use client";

import { useEffect, useState, useCallback } from "react";
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

// ── Helpers ────────────────────────────────────────────────────────────────────

function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function getWeekStart(d: Date): Date {
  const r = new Date(d);
  const day = r.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  r.setDate(r.getDate() + diff);
  return r;
}

function formatDateLabel(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function formatShortDate(d: Date): string {
  return d.toLocaleDateString("es-ES", { weekday: "short", day: "numeric" });
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
  appt,
  onClose,
  onDeleted,
}: {
  appt: Appointment;
  onClose: () => void;
  onDeleted: (id: string) => void;
}) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm("¿Eliminar esta cita?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/appointments/${appt._id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        onDeleted(appt._id);
        onClose();
      }
    } finally {
      setDeleting(false);
    }
  }

  const rows: { label: string; value: string | undefined }[] = [
    { label: "Servicio", value: appt.serviceId?.name ?? "—" },
    { label: "Recurso", value: appt.resourceId?.name ?? "—" },
    { label: "Fecha", value: formatDateLabel(appt.date) },
    { label: "Horario", value: `${appt.startTime} – ${appt.endTime}` },
    { label: "Teléfono", value: appt.customerPhone || "—" },
    { label: "Email", value: appt.customerEmail || "—" },
    { label: "Canal", value: appt.source },
    { label: "Notas", value: appt.notes || "—" },
  ];

  return (
    <aside
      className="flex flex-col gap-4 rounded-xl border p-4"
      style={{
        background: "var(--panel-surface-2)",
        borderColor: "var(--panel-border)",
        boxShadow: "var(--elevation-interactive)",
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-base">{appt.customerName}</p>
          <div className="mt-1">
            <StatusBadge status={appt.status} />
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded p-1 text-xs"
          style={{ color: "var(--muted-foreground)" }}
          aria-label="Cerrar"
        >
          ✕
        </button>
      </div>

      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
        {rows.map(({ label, value }) => (
          <>
            <dt
              key={`dt-${label}`}
              style={{ color: "var(--muted-foreground)" }}
            >
              {label}
            </dt>
            <dd
              key={`dd-${label}`}
              style={{ color: "var(--foreground)" }}
              className="truncate"
            >
              {value}
            </dd>
          </>
        ))}
      </dl>

      <button
        type="button"
        onClick={handleDelete}
        disabled={deleting}
        className="mt-auto rounded-lg border px-3 py-1.5 text-sm font-medium transition-opacity disabled:opacity-50"
        style={{
          borderColor: "var(--danger)",
          color: "var(--danger)",
          background: "transparent",
        }}
      >
        {deleting ? "Eliminando…" : "Eliminar cita"}
      </button>
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
        className="text-sm font-medium capitalize"
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
  weekStart: Date;
  appointments: Appointment[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

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

  const weekStart = getWeekStart(new Date(currentDate + "T00:00:00"));

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
        const end = toISODate(addDays(weekStart, 6));
        const ws = toISODate(weekStart);
        list = list.filter((a) => a.date >= ws && a.date <= end);
      }

      setAppointments(list);
    } finally {
      setLoading(false);
    }
  }, [view, currentDate, weekStart]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const selectedAppt = appointments.find((a) => a._id === selectedId) ?? null;

  function handlePrev() {
    if (view === "day") {
      setCurrentDate(toISODate(addDays(new Date(currentDate + "T00:00:00"), -1)));
    } else {
      setCurrentDate(toISODate(addDays(weekStart, -7)));
    }
    setSelectedId(null);
  }

  function handleNext() {
    if (view === "day") {
      setCurrentDate(toISODate(addDays(new Date(currentDate + "T00:00:00"), 1)));
    } else {
      setCurrentDate(toISODate(addDays(weekStart, 7)));
    }
    setSelectedId(null);
  }

  function handleToday() {
    setCurrentDate(today);
    setSelectedId(null);
  }

  function handleDeleted(id: string) {
    setAppointments((prev) => prev.filter((a) => a._id !== id));
    if (selectedId === id) setSelectedId(null);
  }

  const navLabel =
    view === "day"
      ? formatDateLabel(currentDate)
      : `${formatShortDate(weekStart)} – ${formatShortDate(addDays(weekStart, 6))}`;

  return (
    <>
      <PageHeader
        title="Citas"
        description="Vista operativa: gestión de citas del negocio."
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
          className="text-sm font-medium capitalize"
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
      <div className="flex gap-4">
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

        {/* Detail panel */}
        {selectedAppt && (
          <div className="w-72 shrink-0">
            <AppointmentDetail
              appt={selectedAppt}
              onClose={() => setSelectedId(null)}
              onDeleted={handleDeleted}
            />
          </div>
        )}
      </div>
    </>
  );
}
