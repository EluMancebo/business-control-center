import PageHeader from "@/components/panel/PageHeader";

export default function AppointmentsPage() {
  return (
    <>
      <PageHeader
        title="Citas"
        description="Vista operativa (placeholder): gestión de citas para staff/owner."
      />
      <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
        Próximamente: calendario, estados, recordatorios y confirmaciones.
      </div>
    </>
  );
}    