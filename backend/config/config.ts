const envvars = Deno.env.toObject();

export default {
  MONGO_URI: envvars.MONGO_URI,
  PORT: envvars.PORT as unknown as number,
};
