import { mongoose } from "../../../../deps";

export const isIdValid = (id: string) => {
  return mongoose.Types.ObjectId.isValid(id);
};
