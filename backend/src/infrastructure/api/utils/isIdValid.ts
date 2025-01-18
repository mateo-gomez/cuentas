import mongoose from "mongoose";

export const isIdValid = (id: string) => {
	return mongoose.Types.ObjectId.isValid(id);
};
