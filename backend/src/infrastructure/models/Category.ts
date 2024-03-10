import { model, Schema } from "../../../deps.ts";

export interface Category {
  _id: string;
  name: string;
  icon: string;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema({
  name: { type: String, unique: [true, "La categoría ya existe"] },
  icon: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default model<Category>("Category", categorySchema);
