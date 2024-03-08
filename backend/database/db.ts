import config from "../config/config.ts";
import { mongoose } from "../deps.ts";

const uri = config.MONGO_URI;

await mongoose.connect(uri);

console.log("database connected!");

export default mongoose;
