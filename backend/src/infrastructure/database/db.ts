import mongoose from "mongoose";
import { createLogger } from "../../lib/logger";

const logger = createLogger("DBMongo");

export interface DB {
	connect: Promise<DB>;
}

export class DBMongo {
	constructor(private readonly uri: string) {}

	async connect() {
		if (!this.uri) {
			throw new Error(`MONGO_URI not provided`);
		}

		const resolvedURI = this.uri;

		await mongoose.connect(resolvedURI);

		logger.info("Database connected");

		return this;
	}
}
