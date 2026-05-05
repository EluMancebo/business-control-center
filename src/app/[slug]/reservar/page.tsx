import Link from "next/link";
import { notFound } from "next/navigation";
import ReservaForm from "./ReservaForm";

// ── Types ────────────────────────────────
type Business = {
  _id: string;
  name: string;
  slug: string;
};

type Service = {
  _id: string;
  name: string;
  description?: string;
  durationMinutes: number;
  priceText?: string;
  visibleOnWeb: boolean;
};

// ── Data fetch ───────────────────────────
async function getBusinessBySlug(slug: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/web/public/business?slug=${slug}`,
    { cache: "no-store" }
  );
  if (!res.ok) return null;
  const data = await res.json();
  return data.business as Business | null;
}

async function getServices(businessId: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/appointments/services`,
    { cache: "no-store" }
  );
  if (!res.ok) return [];
  const data = await res.json();
  return (data.services || []) as Service[];
}

// ── Page component ───────────────────────
export default async function ReservarPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Fetch business
  const business = await getBusinessBySlug(slug);
  if (!business) {
    notFound();
  }

  // Fetch services
  const allServices = await getServices(business._id);
  const services = allServices.filter((s) => s.visibleOnWeb);

  return (
    <div
      className="min-h-screen px-4 py-8 sm:px-6 lg:px-8"
      style={{
        background: "var(--background)",
        color: "var(--foreground)",
      }}
    >
      {/* Container */}
      <div className="mx-auto max-w-2xl">

        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-sm">
          <Link
            href={`/${slug}`}
            className="transition-colors hover:underline"
            style={{ color: "var(--muted-foreground)" }}
          >
            {business.name}
          </Link>
          <span style={{ color: "var(--muted-foreground)" }}>
            /
          </span>
          <span style={{ color: "var(--foreground)" }}>
            Reservar cita
          </span>
        </nav>

        {/* Header */}
        <header className="mb-8">
          <h1
            className="text-2xl font-bold sm:text-3xl"
            style={{ color: "var(--foreground)" }}
          >
            Reserva tu cita
          </h1>
          <p
            className="mt-2 text-sm sm:text-base"
            style={{ color: "var(--muted-foreground)" }}
          >
            Elige el servicio, fecha y hora que mejor te convengan.
          </p>
        </header>

        {services.length === 0 ? (
          <div
            className="rounded-xl border p-8 text-center"
            style={{
              borderColor: "var(--border)",
              background: "var(--card)",
            }}
          >
            <p style={{ color: "var(--muted-foreground)" }}>
              No hay servicios disponibles para reserva.
            </p>
            <Link
              href={`/${slug}`}
              className="mt-4 inline-block rounded-lg px-4 py-2 text-sm font-medium"
              style={{
                background: "var(--primary)",
                color: "var(--primary-foreground)",
              }}
            >
              Volver al inicio
            </Link>
          </div>
        ) : (
          <ReservaForm
            businessId={business._id}
            businessSlug={slug}
            services={services}
          />
        )}
      </div>
    </div>
  );
}
