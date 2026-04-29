import PanelButton from "@/components/panel/ui/PanelButton";
import type { LabPiece } from "@/lib/content-lab/types";

type LabPiecePreviewProps = {
  piece: LabPiece;
};

function getSlotValue(piece: LabPiece, key: string): string {
  const slots = piece.editableSlots ?? [];
  const slot = slots.find((item) => item.key === key);
  return (slot?.value ?? "").trim();
}

function HeroPreview({ piece }: { piece: LabPiece }) {
  const headline = getSlotValue(piece, "headline") || "Titular pendiente";
  const subheadline = getSlotValue(piece, "subheadline") || "Subtitular pendiente";
  const cta = getSlotValue(piece, "cta") || "CTA pendiente";
  const isCtaEmpty = getSlotValue(piece, "cta") === "";

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card text-foreground">
      <div className="aspect-video p-4 sm:p-5">
        <div className="flex h-full flex-col justify-between rounded-lg border border-border [background:var(--surface-1,var(--background))] p-4">
          <div>
            <h4 className="text-base font-semibold text-foreground sm:text-lg">{headline}</h4>
            <p className="mt-2 text-sm [color:var(--text-subtle,var(--muted-foreground))]">
              {subheadline}
            </p>
          </div>

          <div className="pt-3">
            <PanelButton variant="secondary" disabled={isCtaEmpty}>
              {cta}
            </PanelButton>
          </div>
        </div>
      </div>
    </div>
  );
}

function BannerPreview({ piece }: { piece: LabPiece }) {
  const headline = getSlotValue(piece, "headline") || "Titular pendiente";
  const cta = getSlotValue(piece, "cta") || "CTA pendiente";
  const accent = getSlotValue(piece, "accent");
  const isCtaEmpty = getSlotValue(piece, "cta") === "";

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card text-foreground p-4 sm:p-5">
      <div className="flex flex-col gap-3 rounded-lg border border-border [background:var(--surface-1,var(--background))] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          {accent ? (
            <div className="mb-1 text-xs font-medium [color:var(--text-subtle,var(--muted-foreground))]">
              {accent}
            </div>
          ) : null}
          <h4 className="truncate text-sm font-semibold text-foreground sm:text-base">{headline}</h4>
        </div>

        <PanelButton variant="secondary" disabled={isCtaEmpty}>
          {cta}
        </PanelButton>
      </div>
    </div>
  );
}

export default function LabPiecePreview({ piece }: LabPiecePreviewProps) {
  if (piece.type === "banner") {
    return <BannerPreview piece={piece} />;
  }

  return <HeroPreview piece={piece} />;
}
