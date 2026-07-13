import { Schema, Types, model } from "mongoose";

const accountSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true },
    type: { type: String, enum: ["bank", "credit"], required: true },
    openingBalance: { type: Number, default: 0 },
    cutoffDay: { type: Number, min: 1, max: 31 },
    dueDay: { type: Number, min: 1, max: 31 },
  },
  { timestamps: true },
);

accountSchema.index({ userId: 1, name: 1 }, { unique: true });

export default model("Account", accountSchema);
