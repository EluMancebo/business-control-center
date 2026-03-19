import PageHeader from "@/components/panel/PageHeader";
import PanelCard from "@/components/panel/ui/PanelCard";
import PanelButton from "@/components/panel/ui/PanelButton";

export default function WebControlServicesPage() {
  return (
    <>
      <PageHeader
        title="Web Control · Servicios"
        description="Gestiona el catálogo de servicios que se muestra en la web."
        actions={
          <PanelButton href="/panel/web-control" variant="ghost">
            Volver al panel
          </PanelButton>
        }
      />

      <PanelCard>
        <div className="text-sm font-semibold text-foreground">Servicios</div>
        <div className="mt-1 text-sm text-muted-foreground">
          CRUD de servicios: nombre, descripción, precio “desde”, duración (si citas), visible, orden.
        </div>

        <div className="mt-4 rounded-lg border border-border bg-background p-4 text-sm text-muted-foreground">
          Próximamente: tabla + filtros + ordenación + editor seguro.
        </div>
      </PanelCard>
    </>
  );
}
