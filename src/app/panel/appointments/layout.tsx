import PageHeader from "@/components/panel/PageHeader";

export default function LeadsPage() {
  return (
    <>
      <PageHeader
        title="Leads"
        description="Vista operativa (placeholder): Staff verá leads asignados. Marketing/Owner verán más."
      />
      <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
        Próximamente: listado de leads, estados, notas e histórico.
      </div>
    </>
  );
}    