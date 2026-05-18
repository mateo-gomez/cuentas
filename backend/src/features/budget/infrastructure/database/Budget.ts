import { Schema, Types, model } from "mongoose";

const budgetCategorySchema = new Schema(
  {
    categoryId: { type: Types.ObjectId, ref: "Category", required: true },
    allocated: { type: Number, required: true, default: 0 },
  },
  { _id: false },
);

const budgetSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", required: true },
    year: { type: Number, required: true },
    month: { type: Number, required: true, min: 1, max: 12 },
    total: { type: Number, required: true, default: 0 },
    categories: { type: [budgetCategorySchema], default: [] },
  },
  { timestamps: true },
);

budgetSchema.index({ userId: 1, year: 1, month: 1 }, { unique: true });

export default model("Budget", budgetSchema);
