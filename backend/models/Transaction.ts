import { model, Schema, Types } from "../deps.ts";

export enum TransactionType {
	expenses,
	income,
}

const transactionSchema = new Schema({
	date: { type: Date },
	value: { type: Number, default: 0 },
	account: { type: String },
	category: { type: Types.ObjectId, ref: "Category" },
	type: { type: Number, TransactionType },
	description: String,
	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, default: Date.now },
});

export default model("Transaction", transactionSchema);
