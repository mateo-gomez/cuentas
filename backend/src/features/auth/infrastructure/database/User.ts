import { model, Schema } from "../../../../../deps";

interface User {
  _id: string;
  email: string;
  password: string;
  name: string;
  surename: string;
  lastname: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<User>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  surename: { type: String, required: true },
  lastname: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const UserModel = model<User>("User", UserSchema);
