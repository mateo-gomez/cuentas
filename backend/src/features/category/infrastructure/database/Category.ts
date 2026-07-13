import { model, Schema, Types } from "mongoose";

export interface Category {
	_id: string;
	userId?: string;
	name: string;
	icon: string;
	createdAt: Date;
	updatedAt: Date;
}

const categorySchema = new Schema({
	userId: { type: Types.ObjectId, ref: "User", index: true },
	name: { type: String },
	icon: { type: String },
	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, default: Date.now },
});

// Per-user name uniqueness (replaces the old global-unique name index).
// `sparse: true` keeps legacy, not-yet-migrated documents with no `userId`
// from colliding with each other under this index.
categorySchema.index({ userId: 1, name: 1 }, { unique: true, sparse: true });

export default model<Category>("Category", categorySchema);
