import { Schema, models, model } from "mongoose";

const BusinessSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, unique: true },
  },
  { timestamps: true }
);

export const Business = models.Business || model("Business", BusinessSchema);
