import { mongoose } from "../deps.ts";

const uri = Deno.env.get("MONGO_URI");

if (!uri) {
  throw new Error(`MONGO_URI not provided`);
}

try {
  await mongoose.connect(uri);
  console.log("database connected!");
} catch (error) {
  console.error("Error connecting db: ", error);
}

export default mongoose;
