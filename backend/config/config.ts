import { load } from "../deps.ts";

const loadConfig = await load();

export default {
  MONGO_URI: (loadConfig.MONGO_URI ||
    "mongodb://localhost:27017/cuentas") as unknown as string,
  PORT: (loadConfig.MONGO_URI || 8000) as unknown as number,
};
