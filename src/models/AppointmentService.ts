// src/models/AppointmentService.ts

import { Schema, models, model } from "mongoose";

const AppointmentServiceSchema = new Schema(
  {
    businessId: { type: Schema.Types.ObjectId, ref: "Business", required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    category: { type: String, default: "" },
    durationMinutes: { type: Number, required: true },
    priceText: { type: String, default: "" },
    visibleOnWeb: { type: Boolean, default: true },
    requiresConfirmation: { type: Boolean, default: false },
    allowedResourceIds: { type: [Schema.Types.ObjectId], default: [] },
    bufferBeforeMinutes: { type: Number, default: 0 },
    bufferAfterMinutes: { type: Number, default: 0 },
    sectorTags: { type: [String], default: [] },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

AppointmentServiceSchema.index({ businessId: 1, isActive: 1 });

export const AppointmentService =
  models.AppointmentService || model("AppointmentService", AppointmentServiceSchema);
