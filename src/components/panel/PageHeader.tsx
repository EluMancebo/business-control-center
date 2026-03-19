// src/components/panel/PageHeader.tsx
import PanelActionBar from "@/components/panel/ui/PanelActionBar";

type PageHeaderProps = {
  title: string;
  description?: string;
  actions?: React.ReactNode;
};

export default function PageHeader({
  title,
  description,
  actions,
}: PageHeaderProps) {
  return (
    <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <h1 className="truncate text-xl font-semibold text-foreground">{title}</h1>

        {description ? (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>

      {actions ? (
        <PanelActionBar className="shrink-0 sm:self-start">{actions}</PanelActionBar>
      ) : null}
    </header>
  );
}

