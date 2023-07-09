import { mongoose } from "../deps.ts";

export const isIdValid = (id: string) => {
  return mongoose.Types.ObjectId.isValid(id);
};
