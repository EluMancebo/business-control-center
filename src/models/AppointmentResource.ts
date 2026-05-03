// src/models/AppointmentResource.ts

import { Schema, models, model } from "mongoose";

const RESOURCE_TYPES = [
  "staff",
  "room",
  "chair",
  "machine",
  "vehicle-bay",
  "generic",
] as const;

const AppointmentResourceSchema = new Schema(
  {
    businessId: { type: Schema.Types.ObjectId, ref: "Business", required: true },
    type: { type: String, enum: [...RESOURCE_TYPES], required: true },
    name: { type: String, required: true, trim: true },
    active: { type: Boolean, default: true },
    serviceIds: { type: [Schema.Types.ObjectId], ref: "AppointmentService", default: [] },
    color: { type: String, default: "" },
  },
  { timestamps: true }
);

AppointmentResourceSchema.index({ businessId: 1, active: 1 });

export const AppointmentResource =
  models.AppointmentResource || model("AppointmentResource", AppointmentResourceSchema);
