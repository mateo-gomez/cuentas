import { mongoose, resolveMongoDNS } from "../../../deps.ts";

const uri = Deno.env.get("MONGO_URI");
if (!uri) {
  throw new Error(`MONGO_URI not provided`);
}

const resolvedURI = await resolveMongoDNS(uri);

await mongoose.connect(resolvedURI);

console.log("database connected!");

export default mongoose;
