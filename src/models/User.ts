import  { Schema, models, model } from "mongoose";

const UserSchema = new Schema(
  {
    businessId: { type: Schema.Types.ObjectId, ref: "Business", required: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, unique: true },
    passwordHash: { type: String, required: true },

    role: {
      type: String,
      enum: ["owner", "marketing", "staff", "admin"],
      default: "owner",
      required: true,
    },
  },
  { timestamps: true }
);

export const User = models.User || model("User", UserSchema);
