import { mongoose, resolveMongoDNS } from "../../../deps.ts";

export interface DB {
  connect: Promise<DB>;
}

export class DBMongo {
  constructor(private readonly uri: string) {}

  async connect() {
    if (!this.uri) {
      throw new Error(`MONGO_URI not provided`);
    }

    const resolvedURI = await resolveMongoDNS(this.uri);

    await mongoose.connect(resolvedURI);

    console.log("database connected!");

    return this;
  }
}
