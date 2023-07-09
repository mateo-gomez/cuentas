import { model, Schema } from "../deps.ts";

const categorySchema = new Schema({
  name: { type: String, unique: [true, "La categoría ya existe"] },
  icon: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default model("Category", categorySchema);
