import { mongoose } from "../deps.ts";

const uri = Deno.env.get("MONGO_URI");

if (!uri) {
  throw new Error(`MONGO_URI not provided`);
}

await mongoose.connect(uri);
console.log("database connected!");

export default mongoose;
