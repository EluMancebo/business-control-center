import { BLOCK_DEFINITIONS } from "@/lib/content-lab/blockCapabilities";
import type {
  LabPiece,
  ValidationDimensions,
  ValidationSummary,
} from "@/lib/content-lab/types";

function normalizeValue(value?: string) {
  return typeof value === "string" ? value.trim() : "";
}

type ResolvedSlot = {
  key: string;
  label: string;
  type: "text" | "textarea" | "cta" | "media" | "accent";
  required: boolean;
  maxLength?: number;
  value: string;
};

type ValidationContext = {
  slots: ResolvedSlot[];
  missingRequired: string[];
  warnings: string[];
  blockers: string[];
};

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function resolveSlots(piece: LabPiece): ResolvedSlot[] {
  const editableSlots = piece.editableSlots ?? [];
  const slotsByKey = new Map(editableSlots.map((slot) => [slot.key, slot]));
  const blockDefinition = piece.blockType ? BLOCK_DEFINITIONS[piece.blockType] : undefined;

  if (blockDefinition) {
    return blockDefinition.slots.map((slot) => ({
      key: slot.key,
      label: slot.label,
      type: slot.type,
      required: slot.required,
      maxLength: slot.maxLength,
      value: normalizeValue(slotsByKey.get(slot.key)?.value),
    }));
  }

  return editableSlots.map((slot) => ({
    key: slot.key,
    label: slot.label,
    type: slot.type,
    required: slot.required,
    maxLength: slot.maxLength,
    value: normalizeValue(slot.value),
  }));
}

function buildValidationContext(piece: LabPiece): ValidationContext {
  const slots = resolveSlots(piece);

  const missingRequired = slots
    .filter((slot) => slot.required && slot.value === "")
    .map((slot) => slot.label);

  const warnings = slots
    .filter((slot) => typeof slot.maxLength === "number" && slot.value.length > slot.maxLength)
    .map((slot) => `${slot.label}: supera la longitud recomendada`);

  const blockers: string[] = [];

  if (missingRequired.length > 0) {
    blockers.push(`Faltan campos requeridos: ${missingRequired.join(", ")}`);
  }

  return {
    slots,
    missingRequired,
    warnings,
    blockers,
  };
}

function evaluateDimensions(piece: LabPiece): ValidationDimensions {
  const { slots, missingRequired, warnings, blockers } = buildValidationContext(piece);

  const headlineSlot = slots.find((slot) => slot.key === "headline");
  const hasMissingHeadline = !headlineSlot || headlineSlot.value === "";
  const hasShortHeadline = !!headlineSlot && headlineSlot.value.length > 0 && headlineSlot.value.length < 8;
  const hasMissingRequiredCta = slots.some(
    (slot) =>
      slot.required &&
      (slot.type === "cta" || slot.key.toLowerCase().includes("cta")) &&
      slot.value === ""
  );
  const hasExcessiveLength = warnings.length > 0;
  const hasMissingKeyFields = slots.some(
    (slot) => slot.required && (slot.key === "headline" || slot.type === "cta") && slot.value === ""
  );
  const hasTooManyWarnings = warnings.length >= 2;
  const hasMissingSecondary = slots.some((slot) => !slot.required && slot.value === "");
  const hasEmptyText = slots.some(
    (slot) => (slot.type === "text" || slot.type === "textarea") && slot.value === ""
  );

  let conversion = 85;
  if (hasMissingRequiredCta) conversion -= 30;
  if (hasShortHeadline) conversion -= 10;

  let communication = 85;
  if (hasMissingHeadline) communication -= 20;
  if (hasExcessiveLength) communication -= 10;

  let design = 85;
  if (hasMissingKeyFields || missingRequired.length > 0) design -= 10;
  if (hasTooManyWarnings) design -= 10;

  let ux = 85;
  if (blockers.length > 0) ux -= 10;
  if (hasMissingSecondary) ux -= 5;

  const responsive = 85;

  let seoA11yPerformance = 85;
  if (hasMissingHeadline) seoA11yPerformance -= 10;
  if (hasEmptyText) seoA11yPerformance -= 10;

  return {
    conversion: clampScore(conversion),
    communication: clampScore(communication),
    design: clampScore(design),
    ux: clampScore(ux),
    responsive: clampScore(responsive),
    seoA11yPerformance: clampScore(seoA11yPerformance),
  };
}

export function validateLabPiece(piece: LabPiece): ValidationSummary {
  const { missingRequired, warnings, blockers } = buildValidationContext(piece);
  const dimensions = evaluateDimensions(piece);

  let score =
    dimensions.conversion * 0.25 +
    dimensions.communication * 0.2 +
    dimensions.design * 0.2 +
    dimensions.ux * 0.15 +
    dimensions.responsive * 0.1 +
    dimensions.seoA11yPerformance * 0.1;

  if (blockers.length > 0) {
    score -= 10;
  }

  score = clampScore(score);

  const candidateViable = blockers.length === 0 && score >= 70;
  const approvedViable = blockers.length === 0 && score >= 82;

  if (piece.status === "candidate" && !candidateViable) {
    blockers.push("La pieza candidata no cumple el minimo de calidad.");
  }

  if (piece.status === "approved" && !approvedViable) {
    blockers.push("La pieza aprobada no cumple el minimo de aprobacion.");
  }

  if (blockers.length > 0) {
    score = Math.min(score, 55);
  }

  return {
    score,
    dimensions,
    missingRequired,
    warnings,
    blockers,
  };
}
