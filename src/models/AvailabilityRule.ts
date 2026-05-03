// src/models/AvailabilityRule.ts

import { Schema, models, model } from "mongoose";

const AvailabilityRuleSchema = new Schema(
  {
    businessId: { type: Schema.Types.ObjectId, ref: "Business", required: true },
    resourceId: { type: Schema.Types.ObjectId, ref: "AppointmentResource", default: null },
    // 0 = domingo … 6 = sábado
    weekday: { type: Number, required: true, min: 0, max: 6 },
    startTime: { type: String, required: true }, // "09:00"
    endTime: { type: String, required: true },   // "18:00"
    slotStepMinutes: { type: Number, default: 30 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

AvailabilityRuleSchema.index({ businessId: 1, weekday: 1 });
AvailabilityRuleSchema.index({ businessId: 1, resourceId: 1 });

export const AvailabilityRule =
  models.AvailabilityRule || model("AvailabilityRule", AvailabilityRuleSchema);
