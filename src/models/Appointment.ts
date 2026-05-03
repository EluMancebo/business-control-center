// src/models/Appointment.ts

import { Schema, models, model } from "mongoose";

const AppointmentSchema = new Schema(
  {
    businessId: { type: Schema.Types.ObjectId, ref: "Business", required: true },
    serviceId: { type: Schema.Types.ObjectId, ref: "AppointmentService", required: true },
    resourceId: { type: Schema.Types.ObjectId, ref: "AppointmentResource", default: null },
    campaignId: { type: Schema.Types.ObjectId, ref: "Campaign", default: null },
    leadId: { type: Schema.Types.ObjectId, default: null }, // futuro CRM
    customerName: { type: String, required: true, trim: true },
    customerPhone: { type: String, default: "" },
    customerEmail: { type: String, default: "" },
    date: { type: String, required: true },      // "2025-05-10"
    startTime: { type: String, required: true }, // "10:00"
    endTime: { type: String, required: true },   // "10:30"
    status: {
      type: String,
      enum: ["requested", "confirmed", "cancelled", "completed", "no-show"],
      default: "requested",
    },
    source: {
      type: String,
      enum: ["web", "landing", "campaign", "manual", "whatsapp"],
      default: "manual",
    },
    notes: { type: String, default: "" },
    // Cita comodín: no visible en web pública
    isPrivate: { type: Boolean, default: false },
  },
  { timestamps: true }
);

AppointmentSchema.index({ businessId: 1, date: 1 });
AppointmentSchema.index({ businessId: 1, status: 1 });
AppointmentSchema.index({ businessId: 1, serviceId: 1 });

export const Appointment = models.Appointment || model("Appointment", AppointmentSchema);
