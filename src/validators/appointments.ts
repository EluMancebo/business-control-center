import { z } from "zod";

// ── AppointmentService ──────────────────────────────────────────────────────

export const AppointmentServiceSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  category: z.string().optional(),
  durationMinutes: z.number().int().positive(),
  priceText: z.string().optional(),
  visibleOnWeb: z.boolean().optional(),
  requiresConfirmation: z.boolean().optional(),
  allowedResourceIds: z.array(z.string()).optional(),
  bufferBeforeMinutes: z.number().int().min(0).optional(),
  bufferAfterMinutes: z.number().int().min(0).optional(),
  sectorTags: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});

export const AppointmentServiceUpdateSchema = AppointmentServiceSchema.partial();

export type AppointmentServiceInput = z.infer<typeof AppointmentServiceSchema>;

// ── AppointmentResource ─────────────────────────────────────────────────────

export const AppointmentResourceSchema = z.object({
  type: z.enum(["staff", "room", "chair", "machine", "vehicle-bay", "generic"]),
  name: z.string().min(1),
  active: z.boolean().optional(),
  serviceIds: z.array(z.string()).optional(),
  color: z.string().optional(),
});

export const AppointmentResourceUpdateSchema = AppointmentResourceSchema.partial();

export type AppointmentResourceInput = z.infer<typeof AppointmentResourceSchema>;

// ── AvailabilityRule ────────────────────────────────────────────────────────

const timeRegex = /^\d{2}:\d{2}$/;

export const AvailabilityRuleSchema = z.object({
  resourceId: z.string().optional(),
  weekday: z.number().int().min(0).max(6),
  startTime: z.string().regex(timeRegex, "Formato HH:MM requerido"),
  endTime: z.string().regex(timeRegex, "Formato HH:MM requerido"),
  slotStepMinutes: z.number().int().positive().optional(),
  active: z.boolean().optional(),
});

export const AvailabilityRuleUpdateSchema = AvailabilityRuleSchema.partial();

export type AvailabilityRuleInput = z.infer<typeof AvailabilityRuleSchema>;

// ── Appointment ─────────────────────────────────────────────────────────────

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const AppointmentSchema = z.object({
  serviceId: z.string().min(1),
  resourceId: z.string().optional(),
  campaignId: z.string().optional(),
  leadId: z.string().optional(),
  customerName: z.string().min(2),
  customerPhone: z.string().optional(),
  customerEmail: z.string().email().optional(),
  date: z.string().regex(dateRegex, "Formato YYYY-MM-DD requerido"),
  startTime: z.string().regex(timeRegex, "Formato HH:MM requerido"),
  endTime: z.string().regex(timeRegex, "Formato HH:MM requerido"),
  status: z
    .enum(["requested", "confirmed", "cancelled", "completed", "no-show"])
    .optional(),
  source: z
    .enum(["web", "landing", "campaign", "manual", "whatsapp"])
    .optional(),
  notes: z.string().optional(),
  isPrivate: z.boolean().optional(),
});

export const AppointmentUpdateSchema = AppointmentSchema.partial();

export type AppointmentInput = z.infer<typeof AppointmentSchema>;
