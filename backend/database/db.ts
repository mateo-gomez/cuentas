import { loadConfig } from "../config/config.ts";
import { mongoose } from "../deps.ts";

const uri = loadConfig.MONGO_URI as unknown as string;

await mongoose.connect(uri);

console.log("database connected!");

export default mongoose;
