"use client";

import { useMemo, useState } from "react";
import PanelBadge from "@/components/panel/ui/PanelBadge";
import PanelButton from "@/components/panel/ui/PanelButton";
import PanelCard from "@/components/panel/ui/PanelCard";
import LabPiecePreview from "@/components/content-lab/preview/LabPiecePreview";
import type { LabPiece, LabPieceStatus } from "@/lib/content-lab/types";
import { validateLabPiece } from "@/lib/content-lab/validation";
import { transitionLabPiece } from "@/lib/content-lab/workflow";

const STATUS_UI: Record<LabPieceStatus, { label: string; tone: "neutral" | "processing" | "success" | "warning" | "danger" }> =
  {
    draft: { label: "Borrador", tone: "neutral" },
    candidate: { label: "Candidata", tone: "processing" },
    approved: { label: "Aprobada", tone: "success" },
    blocked: { label: "Bloqueada", tone: "danger" },
    obsolete: { label: "Obsoleta", tone: "warning" },
  };

const INITIAL_PIECES: LabPiece[] = [
  {
    id: "lab-piece-hero-draft",
    type: "hero",
    title: "Hero Principal · Primavera",
    status: "draft",
    summary: "Pieza en borrador para campaña estacional.",
    editableSlots: [
      { key: "headline", label: "Titular", type: "text", required: true, maxLength: 80, value: "Cortes de primavera con acabado premium" },
      { key: "subheadline", label: "Subtitular", type: "textarea", required: true, maxLength: 140, value: "Reserva en menos de un minuto y elige tu estilista ideal." },
      { key: "cta", label: "CTA principal", type: "cta", required: true, maxLength: 28, value: "" },
    ],
  },
  {
    id: "lab-piece-banner-candidate",
    type: "banner",
    title: "Banner Promos · Semana VIP",
    status: "candidate",
    summary: "Lista para revisión de aprobación.",
    editableSlots: [
      { key: "headline", label: "Titular", type: "text", required: true, maxLength: 70, value: "Semana VIP: pack corte + barba" },
      { key: "cta", label: "CTA principal", type: "cta", required: true, maxLength: 24, value: "Reservar ahora" },
      { key: "accent", label: "Etiqueta destacada", type: "accent", required: false, maxLength: 20, value: "Cupos limitados" },
    ],
  },
  {
    id: "lab-piece-hero-approved",
    type: "hero",
    title: "Hero Marca · Clasico",
    status: "approved",
    summary: "Plantilla base aprobada para uso editorial.",
    editableSlots: [
      { key: "headline", label: "Titular", type: "text", required: true, maxLength: 70, value: "Tradicion barber con precision moderna" },
      { key: "subheadline", label: "Subtitular", type: "textarea", required: true, maxLength: 128, value: "Servicio premium con ritual completo de cuidado masculino." },
      { key: "cta", label: "CTA principal", type: "cta", required: true, maxLength: 24, value: "Ver servicios" },
    ],
  },
];

function getActionsForStatus(status: LabPieceStatus): Array<{ label: string; nextStatus: LabPieceStatus; variant: "primary" | "secondary" | "ghost" }> {
  if (status === "draft") {
    return [{ label: "Enviar a revisión", nextStatus: "candidate", variant: "primary" }];
  }

  if (status === "candidate") {
    return [
      { label: "Aprobar", nextStatus: "approved", variant: "primary" },
      { label: "Bloquear", nextStatus: "blocked", variant: "secondary" },
      { label: "Devolver a borrador", nextStatus: "draft", variant: "ghost" },
    ];
  }

  if (status === "approved") {
    return [{ label: "Marcar como obsoleta", nextStatus: "obsolete", variant: "secondary" }];
  }

  if (status === "blocked") {
    return [{ label: "Devolver a borrador", nextStatus: "draft", variant: "ghost" }];
  }

  return [];
}

export default function ContentLabCandidateFlow() {
  const [pieces, setPieces] = useState<LabPiece[]>(INITIAL_PIECES);

  const piecesWithValidation = useMemo(
    () =>
      pieces.map((piece) => ({
        ...piece,
        validationSummary: validateLabPiece(piece),
      })),
    [pieces]
  );

  function handleTransition(pieceId: string, nextStatus: LabPieceStatus) {
    setPieces((current) =>
      current.map((piece) => (piece.id === pieceId ? transitionLabPiece(piece, nextStatus) : piece))
    );
  }

  return (
    <PanelCard variant="task" className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">Content-Lab</h2>
          <p className="mt-1 text-sm [color:var(--text-subtle,var(--muted-foreground))]">
            Piezas candidatas
          </p>
        </div>
        <PanelBadge tone="processing" size="md">
          Hero / Banner Candidate Flow
        </PanelBadge>
      </div>

      <div className="grid gap-3">
        {piecesWithValidation.map((piece) => {
          const validation = piece.validationSummary ?? validateLabPiece(piece);
          const actions = getActionsForStatus(piece.status);
          const statusMeta = STATUS_UI[piece.status];

          return (
            <PanelCard key={piece.id} className="p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-foreground sm:text-base">{piece.title}</h3>
                  <p className="mt-1 text-sm [color:var(--text-subtle,var(--muted-foreground))]">
                    {piece.summary}
                  </p>
                </div>
                <PanelBadge tone={statusMeta.tone}>{statusMeta.label}</PanelBadge>
              </div>

              <div className="mt-3">
                <LabPiecePreview piece={piece} />
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs [color:var(--text-subtle,var(--muted-foreground))]">
                <span className="rounded-md border border-border px-2 py-1">Score: {validation.score}</span>
                <span className="rounded-md border border-border px-2 py-1">
                  Avisos: {validation.warnings.length}
                </span>
                <span className="rounded-md border border-border px-2 py-1">
                  Bloqueos: {validation.blockers.length}
                </span>
              </div>

              {validation.missingRequired.length > 0 ? (
                <p className="mt-2 text-xs text-foreground">
                  Falta completar: {validation.missingRequired.join(", ")}
                </p>
              ) : null}

              {validation.warnings.length > 0 ? (
                <p className="mt-1 text-xs [color:var(--text-subtle,var(--muted-foreground))]">
                  {validation.warnings.join(" · ")}
                </p>
              ) : null}

              {validation.blockers.length > 0 ? (
                <p className="mt-1 text-xs text-foreground">
                  {validation.blockers.join(" · ")}
                </p>
              ) : null}

              {actions.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {actions.map((action) => (
                    <PanelButton
                      key={`${piece.id}-${action.nextStatus}-${action.label}`}
                      variant={action.variant}
                      onClick={() => handleTransition(piece.id, action.nextStatus)}
                    >
                      {action.label}
                    </PanelButton>
                  ))}
                </div>
              ) : null}
            </PanelCard>
          );
        })}
      </div>
    </PanelCard>
  );
}
