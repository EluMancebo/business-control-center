import { Schema, models, model } from "mongoose";

const CampaignSchema = new Schema(
  {
    businessId: { type: Schema.Types.ObjectId, ref: "Business", required: true },

    name: { type: String, required: true, trim: true },

    objective: {
      type: String,
      enum: ["captacion", "oferta", "evento", "fidelizacion"],
      required: true,
    },

    channels: {
      type: [String],
      enum: ["web", "landing", "whatsapp", "rrss", "e-mail"],
      default: ["web"],
    },

    status: {
      type: String,
      enum: ["draft", "active", "paused", "ended"],
      default: "draft",
    },

    startAt: { type: Date, required: true },
    endAt: { type: Date, required: true },
  },
  { timestamps: true }
);

export const Campaign = models.Campaign || model("Campaign", CampaignSchema);
